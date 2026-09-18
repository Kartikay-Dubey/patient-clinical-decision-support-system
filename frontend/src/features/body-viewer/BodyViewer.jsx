import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Eye, Focus, RotateCcw, Layers, Compass, Loader2, Sparkles, Check, Maximize2, Minimize2, ChevronDown, ChevronUp } from 'lucide-react';
import { decodeModelResponse } from './modelLoader';
import {
  SYSTEMS,
  LAYER_DEFINITIONS,
  REGIONS,
  classifyPartRegion,
  REGION_CAMERA_CONFIGS,
  REGION_ANCHORS,
} from './anatomyAtlas';
import AnatomyHUDCallout from './AnatomyHUDCallout';

const ATLAS_JSON_PATH = '/models/atlas.json';

// Vertical exploration bounds in 3D world space (Head down to Lower Extremities)
const MIN_ELEVATION_Y = 0.42; // Lower extremity / Femoral level
const MAX_ELEVATION_Y = 1.58; // Cranial / Cephalic level

export default function BodyViewer({
  activeRegion = 'All',
  onSelectRegion,
  className = '',
  isScanning = false,
  showControls = true,
  bodyLocalization = null,
  conditionName = null,
  icd10Code = null,
  modelScore = null,
  confidenceCategory = null,
}) {
  const containerRef = useRef(null);
  const viewerWrapperRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [internalRegion, setInternalRegion] = useState('All');
  const [mobileLayersOpen, setMobileLayersOpen] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    Muscles: true,
    Skeleton: true,
    Organs: true,
  });
  const [currentView, setCurrentView] = useState('front');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [target2D, setTarget2D] = useState(null);
  const target2DRef = useRef(null);

  // Vertical exploration scrollbar refs
  const verticalTrackRef = useRef(null);
  const verticalThumbRef = useRef(null);
  const isDraggingElevationRef = useRef(false);

  // Smooth vertical exploration controller
  const applyVerticalElevation = useCallback((ratio) => {
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const targetY = MIN_ELEVATION_Y + clampedRatio * (MAX_ELEVATION_Y - MIN_ELEVATION_Y);

    if (controlsRef.current && cameraRef.current) {
      const deltaY = targetY - controlsRef.current.target.y;
      controlsRef.current.target.y = targetY;
      cameraRef.current.position.y += deltaY;
      controlsRef.current.update();
      sceneStateRef.current.dirty = true;
    }

    if (verticalThumbRef.current) {
      verticalThumbRef.current.style.bottom = `${clampedRatio * 100}%`;
    }
  }, []);

  const handleVerticalTrackPointerDown = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      isDraggingElevationRef.current = true;

      const track = verticalTrackRef.current;
      if (!track) return;

      if (e.target?.setPointerCapture && e.pointerId !== undefined) {
        try {
          e.target.setPointerCapture(e.pointerId);
        } catch (_) {}
      }

      const updateFromPointer = (clientY) => {
        const rect = track.getBoundingClientRect();
        if (rect.height <= 0) return;
        // Top of track is Head (ratio 1.0), bottom of track is Legs (ratio 0.0)
        const ratio = 1 - (clientY - rect.top) / rect.height;
        applyVerticalElevation(ratio);
      };

      updateFromPointer(e.clientY);

      const onPointerMove = (ev) => {
        if (isDraggingElevationRef.current) {
          updateFromPointer(ev.clientY);
        }
      };

      const onPointerUp = (ev) => {
        isDraggingElevationRef.current = false;
        if (ev.target?.releasePointerCapture && ev.pointerId !== undefined) {
          try {
            ev.target.releasePointerCapture(ev.pointerId);
          } catch (_) {}
        }
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    },
    [applyVerticalElevation]
  );

  const stepVerticalCamera = useCallback(
    (step) => {
      if (!controlsRef.current) return;
      const currentY = controlsRef.current.target.y;
      const currentRatio = (currentY - MIN_ELEVATION_Y) / (MAX_ELEVATION_Y - MIN_ELEVATION_Y);
      applyVerticalElevation(currentRatio + step);
    },
    [applyVerticalElevation]
  );

  // Fullscreen toggle handler with mobile device fallback
  const toggleFullscreen = useCallback(() => {
    if (!viewerWrapperRef.current) return;
    if (!isFullscreen) {
      if (viewerWrapperRef.current.requestFullscreen) {
        viewerWrapperRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (document.fullscreenElement) {
        setIsFullscreen(true);
      } else if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [isFullscreen]);

  const selectedRegion = activeRegion !== undefined ? activeRegion : internalRegion;

  // Scene state refs to pass into render loop
  const sceneStateRef = useRef({
    selectedRegion,
    activeLayers,
    currentView,
    atlas: null,
    partRegions: [],
    dirty: true,
    transitioningCamera: false,
    cameraStartPos: new THREE.Vector3(),
    cameraEndPos: new THREE.Vector3(),
    targetStartPos: new THREE.Vector3(),
    targetEndPos: new THREE.Vector3(),
    camTransitionT: 1.0,
  });

  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const partTextureRef = useRef(null);
  const selectionTextureRef = useRef(null);
  const partDataRef = useRef(null);
  const selectionDataRef = useRef(null);

  // Sync state into ref
  useEffect(() => {
    sceneStateRef.current.selectedRegion = selectedRegion;
    sceneStateRef.current.activeLayers = activeLayers;
    sceneStateRef.current.currentView = currentView;
    sceneStateRef.current.dirty = true;
  }, [selectedRegion, activeLayers, currentView]);

  // Smooth camera zoom and focus — computes target + camPos from bodyLocalization
  // spatialCoordinates, falling back to REGION_CAMERA_CONFIGS defaults.
  const triggerCameraTransition = useCallback(
    (region, customTarget = null) => {
      let target = null;
      let camPos = null;

      if (customTarget && Array.isArray(customTarget)) {
        // Explicit 3D target passed in (manual click)
        target = customTarget;
        camPos = [customTarget[0], customTarget[1], 0.55];
      } else if (
        // Only use bodyLocalization.spatialCoordinates when focusing on the clinical primary region
        // (or when auto-focusing with no region specified). All other region button clicks
        // will properly navigate to their respective REGION_CAMERA_CONFIGS!
        bodyLocalization?.spatialCoordinates &&
        (region === bodyLocalization?.primaryRegion || !region)
      ) {
        const { x, y, z } = bodyLocalization.spatialCoordinates;
        const cx = x ?? 0.0;
        const cy = y ?? 1.2;
        const cz = z ?? 0.0;

        const organLower = (bodyLocalization?.targetOrgan || '').toLowerCase();
        const isPosterior =
          cz < -0.04 ||
          organLower.includes('spine') ||
          organLower.includes('spinal') ||
          organLower.includes('vertebra') ||
          organLower.includes('back') ||
          organLower.includes('lumbar') ||
          organLower.includes('cord');

        if (isPosterior) {
          const backDist = 0.65;
          target = [cx, cy, cz];
          camPos = [cx, cy, cz - backDist];
          setCurrentView('back');
        } else if (region === 'Upper Limb' || region === 'Lower Limb') {
          const zoomDist = region === 'Upper Limb' ? 0.50 : 0.65;
          target = [cx, cy, cz];
          camPos = [cx, cy, Math.abs(cz) + zoomDist];
          setCurrentView('front');
        } else if (region === 'Head') {
          target = [cx, cy, cz];
          camPos = [cx, cy, cz + 0.44];
          setCurrentView('front');
        } else {
          // Anterior target (Thorax, Abdomen, Pelvis)
          target = [cx, cy, cz];
          camPos = [cx, cy, cz + 0.52];
          setCurrentView('front');
        }
      } else {
        // Generic region selected without clinical spatial data — use REGION_CAMERA_CONFIGS
        const cfg = REGION_CAMERA_CONFIGS[region] || REGION_CAMERA_CONFIGS.All;
        target = cfg.target;
        camPos = cfg.camPos;
        setCurrentView('front');
      }


      if (cameraRef.current && controlsRef.current) {
        const ss = sceneStateRef.current;
        ss.cameraStartPos.copy(cameraRef.current.position);
        ss.cameraEndPos.set(...camPos);
        ss.targetStartPos.copy(controlsRef.current.target);
        ss.targetEndPos.set(...target);
        ss.camTransitionT = 0;
        ss.transitioningCamera = true;
        ss.dirty = true;
      }
    },
    [bodyLocalization]
  );

  // Region selection click handler for bottom pills and external calls
  const handleRegionClick = useCallback(
    (reg) => {
      setInternalRegion(reg);
      if (onSelectRegion) {
        onSelectRegion(reg);
      }
      triggerCameraTransition(reg);
    },
    [onSelectRegion, triggerCameraTransition]
  );

  // Automatically configure smart layer visibility based on clinical system / target organ
  useEffect(() => {
    if (!selectedRegion || selectedRegion === 'All' || selectedRegion === 'Full Body') {
      setActiveLayers({ Muscles: true, Skeleton: true, Organs: true });
      return;
    }

    const sys = (bodyLocalization?.bodySystem || '').toLowerCase();
    const organ = (bodyLocalization?.targetOrgan || '').toLowerCase();

    // 1. Spine / Spinal Cord / Vertebral Column:
    // HIDE muscles and organs completely so the spinal column and vertebrae are crystal clear!
    const isSpinal =
      organ.includes('spine') ||
      organ.includes('spinal') ||
      organ.includes('vertebra') ||
      organ.includes('cord') ||
      sys.includes('spine');

    // 2. Esophagus / GI Junction:
    // Hide muscular and skeletal layers to place esophagus directly in focus
    const isEsophagus =
      organ.includes('esophag') ||
      organ.includes('reflux') ||
      organ.includes('heartburn') ||
      organ.includes('boerhaave');

    // 3. Internal Visceral Organs (GI, Heart, Lungs, Kidneys):
    // Hide outer opaque muscle layer to reveal internal organ
    const isVisceral =
      sys.includes('gastro') ||
      sys.includes('digest') ||
      sys.includes('cardio') ||
      sys.includes('heart') ||
      sys.includes('respir') ||
      sys.includes('lung') ||
      sys.includes('urin') ||
      sys.includes('kidney') ||
      sys.includes('endocr') ||
      sys.includes('lymph') ||
      organ.includes('stomach') ||
      organ.includes('append') ||
      organ.includes('heart') ||
      organ.includes('lung') ||
      organ.includes('colon') ||
      organ.includes('liver') ||
      organ.includes('pancreas') ||
      organ.includes('trachea');

    // 4. Cranial / Headache / Neurological:
    // Hide facial/scalp muscles to reveal brain & cranial vessels
    const isCranial =
      selectedRegion === 'Head' &&
      (sys.includes('cranial') ||
        sys.includes('neuro') ||
        organ.includes('cranial') ||
        organ.includes('brain') ||
        organ.includes('cephalic'));

    // 5. Musculoskeletal Limbs & Joints (Shoulder, Knee, Elbow, Ankle):
    const isLimbJoint =
      selectedRegion === 'Upper Limb' ||
      selectedRegion === 'Lower Limb' ||
      organ.includes('shoulder') ||
      organ.includes('knee') ||
      organ.includes('elbow') ||
      organ.includes('wrist') ||
      organ.includes('ankle') ||
      organ.includes('deltoid') ||
      organ.includes('patellar') ||
      organ.includes('hip');

    if (isSpinal) {
      // Isolate the spinal cord and vertebral column — hide muscles & organs
      setActiveLayers({ Muscles: false, Skeleton: true, Organs: false });
    } else if (isEsophagus) {
      // Isolate esophagus — hide muscles, keep organs
      setActiveLayers({ Muscles: false, Skeleton: false, Organs: true });
    } else if (isVisceral || isCranial) {
      // Reveal internal organ without opaque muscle wall
      setActiveLayers({ Muscles: false, Skeleton: true, Organs: true });
    } else if (isLimbJoint) {
      // Musculoskeletal joint/limb — muscles + skeleton, hide organs
      setActiveLayers({ Muscles: true, Skeleton: true, Organs: false });
    } else {
      setActiveLayers({ Muscles: true, Skeleton: true, Organs: true });
    }
  }, [selectedRegion, bodyLocalization]);

  // Auto-focus camera whenever region OR bodyLocalization changes.
  useEffect(() => {
    if (!selectedRegion || selectedRegion === 'All' || selectedRegion === 'Full Body') return;
    triggerCameraTransition(selectedRegion);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegion, bodyLocalization]);

  const toggleLayer = useCallback((layerId) => {
    setActiveLayers((prev) => {
      const next = { ...prev, [layerId]: !prev[layerId] };
      // Ensure at least one layer is active
      if (!next.Muscles && !next.Skeleton && !next.Organs) {
        return prev;
      }
      return next;
    });
  }, []);

  const handleViewChange = useCallback((view) => {
    setCurrentView(view);
    if (!cameraRef.current || !controlsRef.current) return;
    const target = controlsRef.current.target;
    const dist = cameraRef.current.position.distanceTo(target);

    let offset = new THREE.Vector3(0, 0, dist);
    if (view === 'front') offset.set(0, 0, dist);
    else if (view === 'back') offset.set(0, 0, -dist);
    else if (view === 'side') offset.set(dist, 0, 0);
    else if (view === 'three-quarter') offset.set(dist * 0.7, 0, dist * 0.7);

    const ss = sceneStateRef.current;
    ss.cameraStartPos.copy(cameraRef.current.position);
    ss.cameraEndPos.copy(target).add(offset);
    ss.targetStartPos.copy(target);
    ss.targetEndPos.copy(target);
    ss.camTransitionT = 0;
    ss.transitioningCamera = true;
    ss.dirty = true;
  }, []);

  // Main Three.js setup effect
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let disposed = false;
    let animationFrameId = null;
    const abortController = new AbortController();

    // 1. WebGL Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      setLoadError('WebGL is not supported or disabled on this device.');
      setIsLoading(false);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0xEDE6DC, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none'; // Critical for mobile touch: allows OrbitControls to rotate and pinch-zoom without browser cancellation
    el.appendChild(renderer.domElement);

    // 2. Scene, Camera, Controls
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38,
      el.clientWidth / el.clientHeight,
      0.01,
      50
    );
    cameraRef.current = camera;

    // Center model view (frame selectedRegion / bodyLocalization if provided, otherwise Full Body)
    const initialConfig =
      selectedRegion && selectedRegion !== 'All' && selectedRegion !== 'Full Body'
        ? REGION_CAMERA_CONFIGS[selectedRegion] || REGION_CAMERA_CONFIGS.All
        : REGION_CAMERA_CONFIGS.All;

    let initTarget = initialConfig.target;
    let initCamPos = initialConfig.camPos;

    if (
      bodyLocalization?.spatialCoordinates &&
      selectedRegion &&
      selectedRegion !== 'All' &&
      selectedRegion !== 'Full Body' &&
      (selectedRegion === bodyLocalization?.primaryRegion || !selectedRegion)
    ) {
      const { x, y, z } = bodyLocalization.spatialCoordinates;
      const cx = x ?? 0.0;
      const cy = y ?? 1.2;
      const cz = z ?? 0.0;
      const organLower = (bodyLocalization?.targetOrgan || '').toLowerCase();
      const isPosterior =
        cz < -0.04 ||
        organLower.includes('spine') ||
        organLower.includes('spinal') ||
        organLower.includes('vertebra') ||
        organLower.includes('back') ||
        organLower.includes('lumbar') ||
        organLower.includes('cord');

      if (isPosterior) {
        initTarget = [cx, cy, cz];
        initCamPos = [cx, cy, cz - 0.65];
      } else if (selectedRegion === 'Upper Limb' || selectedRegion === 'Lower Limb') {
        const zoomDist = selectedRegion === 'Upper Limb' ? 0.50 : 0.65;
        initTarget = [cx, cy, cz];
        initCamPos = [cx, cy, Math.abs(cz) + zoomDist];
      } else if (selectedRegion === 'Head') {
        initTarget = [cx, cy, cz];
        initCamPos = [cx, cy, cz + 0.44];
      } else {
        initTarget = [cx, cy, cz];
        initCamPos = [cx, cy, cz + 0.52];
      }
    }

    camera.position.set(...initCamPos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.target.set(...initTarget);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.3;
    controls.maxDistance = 6.0;
    controls.minPolarAngle = Math.PI / 16;
    controls.maxPolarAngle = Math.PI - Math.PI / 16;
    // Native mobile touch gestures: 1 finger rotate, 2 finger zoom/pan
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.addEventListener('change', () => {
      sceneStateRef.current.dirty = true;
    });

    // 3. Environment & Studio Lighting
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envTexture = pmrem.fromScene(room, 0.04).texture;
    scene.environment = envTexture;
    room.dispose();
    pmrem.dispose();

    scene.add(new THREE.HemisphereLight(0xfff8f2, 0xd0c8be, 1.1));
    const keyLight = new THREE.DirectionalLight(0xfff6ea, 2.2);
    keyLight.position.set(2.5, 4.0, 3.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe8f0f8, 1.4);
    rimLight.position.set(-2.5, 2.0, -3.0);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xf5ebe0, 0.8);
    fillLight.position.set(0, -2.0, 2.5);
    scene.add(fillLight);

    // Subtle anatomical ground platform
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(0.85, 64),
      new THREE.MeshStandardMaterial({
        color: 0xded6cb,
        roughness: 0.9,
        metalness: 0.05,
        transparent: true,
        opacity: 0.7,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.002;
    scene.add(ground);

    const platformRing = new THREE.Mesh(
      new THREE.RingGeometry(0.78, 0.80, 64),
      new THREE.MeshBasicMaterial({
        color: 0xcdbeaf,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      })
    );
    platformRing.rotation.x = -Math.PI / 2;
    platformRing.position.y = 0.001;
    scene.add(platformRing);

    // 4. Data Textures for GPU-accelerated visibility and highlighting
    let atlasData = null;
    let partsCount = 0;
    let width = 1;
    let partTexture = null;
    let selectionTexture = null;
    let partData = null;
    let selectionData = null;
    const materials = [];
    const geometries = [];
    const partPickers = [];
    const partBounds = [];
    const partRegions = [];

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const hitBox = new THREE.Box3();
    const hitPoint = new THREE.Vector3();

    // System Materials with custom onBeforeCompile shader
    const systemMaterialMap = new Map();

    const createSystemMaterial = (sys) => {
      const isSkin = sys.id === 'integumentary';
      const m = new THREE.MeshStandardMaterial({
        color: sys.color,
        metalness: 0.08,
        roughness: 0.52,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isSkin ? 0.12 : 1.0,
        depthWrite: true,
      });

      m.onBeforeCompile = (shader) => {
        shader.uniforms.partState = { value: partTexture };
        shader.uniforms.selectionState = { value: selectionTexture };
        shader.uniforms.stateWidth = { value: width };

        shader.vertexShader =
          'attribute float partIndex;\n' +
          'uniform sampler2D partState;\n' +
          'uniform sampler2D selectionState;\n' +
          'uniform float stateWidth;\n' +
          'varying float partVisible;\n' +
          'varying float partSelected;\n' +
          shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\n' +
            'vec2 stateUv = vec2((partIndex + 0.5) / stateWidth, 0.5);\n' +
            'vec4 state = texture2D(partState, stateUv);\n' +
            'partVisible = state.w;\n' +
            'partSelected = texture2D(selectionState, stateUv).r;'
        );

        shader.fragmentShader =
          'varying float partVisible;\n' +
          'varying float partSelected;\n' +
          shader.fragmentShader;

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <clipping_planes_fragment>',
          '#include <clipping_planes_fragment>\n' +
            'if (partVisible < 0.05) discard;'
        );

        // Affected region fully highlighted; all other regions retain natural opacity (no ghosting)
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <color_fragment>',
          '#include <color_fragment>\n' +
            'if (partSelected > 0.8) {\n' +
            '  // PRIMARY affected region: fully opaque with a warm anatomical accent\n' +
            '  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.82, 0.30, 0.20), 0.18);\n' +
            '  diffuseColor.a = 1.0;\n' +
            '} else if (partSelected > 0.4) {\n' +
            '  // Full-body mode or secondary region: full natural opacity\n' +
            '  diffuseColor.a = 0.95;\n' +
            '} else {\n' +
            '  // Non-affected context: full natural opacity (no ghosting/transparency)\n' +
            '  diffuseColor.a = 0.95;\n' +
            '}'
        );
      };

      materials.push(m);
      return m;
    };

    SYSTEMS.forEach((sys) => {
      systemMaterialMap.set(sys.id, createSystemMaterial(sys));
    });

    // 5. Load Atlas manifest and Binary chunks
    const loadAtlasAndChunks = async () => {
      try {
        const manifestRes = await fetch(ATLAS_JSON_PATH, {
          signal: abortController.signal,
        });
        if (!manifestRes.ok) {
          throw new Error('Failed to load anatomy atlas metadata.');
        }

        atlasData = await manifestRes.json();
        if (disposed) return;

        partsCount = atlasData.parts.length;
        width = THREE.MathUtils.ceilPowerOfTwo(partsCount);

        partData = new Float32Array(width * 4);
        selectionData = new Uint8Array(width * 4);
        partTexture = new THREE.DataTexture(
          partData,
          width,
          1,
          THREE.RGBAFormat,
          THREE.FloatType
        );
        selectionTexture = new THREE.DataTexture(selectionData, width, 1);

        partTextureRef.current = partTexture;
        selectionTextureRef.current = selectionTexture;
        partDataRef.current = partData;
        selectionDataRef.current = selectionData;

        // Populate part regions & bounds
        atlasData.parts.forEach((p, idx) => {
          const reg = classifyPartRegion(p);
          partRegions[idx] = reg;
          const box = new THREE.Box3(
            new THREE.Vector3(...p.bounds[0]),
            new THREE.Vector3(...p.bounds[1])
          );
          partBounds[idx] = box;
        });

        sceneStateRef.current.atlas = atlasData;
        sceneStateRef.current.partRegions = partRegions;

        // Initialize textures (all visible, none selected initially)
        for (let i = 0; i < partsCount; i++) {
          partData[i * 4 + 0] = 0; // dx
          partData[i * 4 + 1] = 0; // dy
          partData[i * 4 + 2] = 0; // dz
          partData[i * 4 + 3] = 1.0; // visible
          selectionData[i * 4] = 0; // selected
        }
        partTexture.needsUpdate = true;
        selectionTexture.needsUpdate = true;

        // Load chunks with concurrency
        let loadedChunks = 0;
        const totalChunks = atlasData.chunks.length;

        const loadSingleChunk = async (chunkIndex) => {
          const chunkInfo = atlasData.chunks[chunkIndex];
          const hasGzip =
            !!chunkInfo.gzip && typeof DecompressionStream !== 'undefined';
          const chunkUrl = hasGzip ? chunkInfo.gzip : chunkInfo.url;

          const res = await fetch(chunkUrl, {
            signal: abortController.signal,
          });
          const rawBuffer = await decodeModelResponse(
            res,
            chunkInfo.bytes,
            hasGzip
          );
          if (disposed) return;

          const groups = new Map();

          atlasData.parts.forEach((p, i) => {
            if (p.chunk !== chunkIndex) return;

            const geo = new THREE.BufferGeometry();
            geo.setAttribute(
              'position',
              new THREE.BufferAttribute(
                new Float32Array(rawBuffer, p.positions, p.vertexCount * 3),
                3
              )
            );
            geo.setAttribute(
              'normal',
              new THREE.BufferAttribute(
                new Int16Array(rawBuffer, p.normals, p.vertexCount * 3),
                3,
                true
              )
            );
            geo.setIndex(
              new THREE.BufferAttribute(
                new Uint32Array(rawBuffer, p.indices, p.indexCount),
                1
              )
            );

            geo.boundingBox = partBounds[i].clone();
            geo.computeBoundingSphere();

            const pickMesh = new THREE.Mesh(geo);
            pickMesh.matrixAutoUpdate = false;
            partPickers[i] = pickMesh;
            geometries.push(geo);

            geo.setAttribute(
              'partIndex',
              new THREE.BufferAttribute(new Float32Array(p.vertexCount).fill(i), 1)
            );

            const list = groups.get(p.system) || [];
            list.push(geo);
            groups.set(p.system, list);
          });

          groups.forEach((geos, systemId) => {
            const merged = mergeGeometries(geos, false);
            if (!merged) return;
            geometries.push(merged);
            const mesh = new THREE.Mesh(
              merged,
              systemMaterialMap.get(systemId)
            );
            mesh.frustumCulled = false;
            scene.add(mesh);
          });

          loadedChunks++;
          setLoadingProgress(Math.round((loadedChunks / totalChunks) * 100));
          sceneStateRef.current.dirty = true;
        };

        // Load 3 chunks concurrently
        let cursor = 0;
        await Promise.all(
          Array.from({ length: 3 }, async () => {
            while (cursor < totalChunks) {
              const idx = cursor++;
              await loadSingleChunk(idx);
            }
          })
        );

        if (!disposed) {
          setIsLoading(false);
          triggerCameraTransition(selectedRegion);
          sceneStateRef.current.dirty = true;
        }
      } catch (err) {
        if (!disposed) {
          console.error('Anatomy loader error:', err);
          setLoadError(err.message || 'Failed to load anatomy model.');
          setIsLoading(false);
        }
      }
    };

    loadAtlasAndChunks();

    // 6. Resize Observer
    const handleResize = () => {
      if (!el || !renderer || !camera) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      sceneStateRef.current.dirty = true;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(el);

    // 7. Interactive Pointer & Hover Handling
    const handlePointerMove = (e) => {
      if (isLoading || !atlasData) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      let nearestDist = Infinity;
      let foundIndex = -1;

      for (let i = 0; i < partPickers.length; i++) {
        const mesh = partPickers[i];
        if (!mesh || !partData || partData[i * 4 + 3] < 0.5) continue;
        if (atlasData.parts[i]?.system === 'integumentary') continue;

        hitBox.copy(partBounds[i]);
        if (!raycaster.ray.intersectBox(hitBox, hitPoint)) continue;

        const hits = raycaster.intersectObject(mesh, false);
        if (hits[0] && hits[0].distance < nearestDist) {
          nearestDist = hits[0].distance;
          foundIndex = i;
        }
      }

      if (foundIndex >= 0) {
        const part = atlasData.parts[foundIndex];
        const sys = SYSTEMS.find((s) => s.id === part.system);
        setHoveredPart({
          name: part.name,
          system: sys?.name || part.system,
          region: partRegions[foundIndex],
        });
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredPart(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };

    // Differentiate drag from click so rotating on mobile phones doesn't accidentally trigger part selection
    let pointerDownPos = { x: 0, y: 0 };
    let isDragGesture = false;

    const handlePointerDown = (e) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      isDragGesture = false;
    };

    const handlePointerUp = (e) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.hypot(dx, dy) > 8) {
        isDragGesture = true;
      }
    };

    const handlePointerClick = (e) => {
      if (isLoading || !atlasData || isDragGesture) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      let nearestDist = Infinity;
      let foundIndex = -1;

      for (let i = 0; i < partPickers.length; i++) {
        const mesh = partPickers[i];
        if (!mesh || !partData || partData[i * 4 + 3] < 0.5) continue;
        if (atlasData.parts[i]?.system === 'integumentary') continue;

        hitBox.copy(partBounds[i]);
        if (!raycaster.ray.intersectBox(hitBox, hitPoint)) continue;

        const hits = raycaster.intersectObject(mesh, false);
        if (hits[0] && hits[0].distance < nearestDist) {
          nearestDist = hits[0].distance;
          foundIndex = i;
        }
      }

      if (foundIndex >= 0) {
        const reg = partRegions[foundIndex];
        if (reg) handleRegionClick(reg);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('click', handlePointerClick);

    // 8. Animation & Render Loop
    const clock = new THREE.Clock();
    let lastRenderedRegion = null;
    let lastRenderedLayers = null;

    const animate = () => {
      if (disposed) return;
      animationFrameId = requestAnimationFrame(animate);

      const dt = Math.min(clock.getDelta(), 0.05);
      const ss = sceneStateRef.current;

      // Handle Smooth Camera Transitions
      if (ss.transitioningCamera) {
        ss.camTransitionT += dt * 3.0;
        const t = Math.min(ss.camTransitionT, 1.0);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        camera.position.lerpVectors(ss.cameraStartPos, ss.cameraEndPos, ease);

        // Orbital arc around body if crossing front-to-back or back-to-front
        if (ss.cameraStartPos.z * ss.cameraEndPos.z < 0) {
          const arc = Math.sin(t * Math.PI) * 0.75;
          camera.position.x += arc;
        }

        controls.target.lerpVectors(ss.targetStartPos, ss.targetEndPos, ease);
        controls.update();

        if (t >= 1.0) {
          camera.position.copy(ss.cameraEndPos);
          controls.target.copy(ss.targetEndPos);
          ss.transitioningCamera = false;
        }
        ss.dirty = true;
      }

      // Update Layer Visibility & Region Highlighting in GPU textures
      const regionChanged = ss.selectedRegion !== lastRenderedRegion;
      const layersChanged =
        !lastRenderedLayers ||
        ss.activeLayers.Muscles !== lastRenderedLayers.Muscles ||
        ss.activeLayers.Skeleton !== lastRenderedLayers.Skeleton ||
        ss.activeLayers.Organs !== lastRenderedLayers.Organs;

      if (
        (regionChanged || layersChanged) &&
        partData &&
        selectionData &&
        atlasData
      ) {
        const curRegion = ss.selectedRegion;
        const curLayers = ss.activeLayers;

        // Build active systems set based on layer toggles
        const activeSystems = new Set();
        if (curLayers.Muscles) activeSystems.add('muscular');
        if (curLayers.Skeleton) {
          activeSystems.add('skeletal');
          activeSystems.add('connective');
        }
        if (curLayers.Organs) {
          activeSystems.add('cardiac');
          activeSystems.add('respiratory');
          activeSystems.add('digestive');
          activeSystems.add('urinary');
          activeSystems.add('nervous');
          activeSystems.add('endocrine');
          activeSystems.add('sensory');
          activeSystems.add('arterial');
          activeSystems.add('venous');
          activeSystems.add('lymphatic');
          activeSystems.add('reproductive');
        }

        for (let i = 0; i < partsCount; i++) {
          const part = atlasData.parts[i];
          const partReg = partRegions[i];
          const sysAllowed = activeSystems.has(part.system);

          // Visibility: is system active in layers?
          partData[i * 4 + 3] = sysAllowed ? 1.0 : 0.0;

          // Selection / Highlighting & Regional Focus Opacity:
          let selValue = 0;
          if (curRegion === 'All' || curRegion === 'Full Body') {
            selValue = 128; // Full body mode -> 0.5 (95% natural opacity)
          } else if (partReg === curRegion) {
            selValue = 255; // Primary affected region -> 1.0 (100% OPAQUE & ILLUMINATED)
          } else if (bodyLocalization?.secondaryRegions?.includes(partReg)) {
            selValue = 128; // Secondary region -> 0.5 (semi-opaque)
          } else {
            selValue = 0;   // Unaffected context -> 0.0 (22% translucent ghosting)
          }

          selectionData[i * 4] = selValue;
        }

        partTexture.needsUpdate = true;
        selectionTexture.needsUpdate = true;

        lastRenderedRegion = curRegion;
        lastRenderedLayers = { ...curLayers };
        ss.dirty = true;
      }

      // Compute 3D-to-2D projected screen coordinates for HUD Reticle
      const clinicalRegion = bodyLocalization?.primaryRegion || ss.selectedRegion;
      const isViewingClinicalFocus =
        !ss.selectedRegion ||
        ss.selectedRegion === 'All' ||
        ss.selectedRegion === 'Full Body' ||
        ss.selectedRegion === clinicalRegion;

      if (
        isViewingClinicalFocus &&
        (bodyLocalization?.spatialCoordinates ||
          (ss.selectedRegion && ss.selectedRegion !== 'All' && ss.selectedRegion !== 'Full Body'))
      ) {
        // Always prefer clinical spatial coordinates when available;
        // fall back to static REGION_ANCHORS only if no clinical data.
        let anchorPos = REGION_ANCHORS[clinicalRegion] || REGION_ANCHORS.Thorax;
        if (bodyLocalization?.spatialCoordinates) {
          // Use clinical spatial coordinates with deep Z blended from atlas anchor
          // (clinical z is often near-surface; atlas anchor z is deeper inside the body).
          anchorPos = {
            x: bodyLocalization.spatialCoordinates.x ?? anchorPos.x,
            y: bodyLocalization.spatialCoordinates.y ?? anchorPos.y,
            z: Math.max(
              anchorPos.z,
              (bodyLocalization.spatialCoordinates.z ?? 0) * 0.4 + anchorPos.z * 0.6
            ),
          };
        }

        const v = new THREE.Vector3(anchorPos.x, anchorPos.y, anchorPos.z);
        v.project(camera);

        const w = el.clientWidth;
        const h = el.clientHeight;
        const rawX = ((v.x + 1) / 2) * w;
        const rawY = ((-v.y + 1) / 2) * h;

        // Body-silhouette clamping: keep beacon within the body column on screen
        const bodyLeft   = w * 0.18;
        const bodyRight  = w * 0.82;
        const bodyTop    = h * 0.03;
        const bodyBottom = h * 0.96;

        const clampedX = Math.max(bodyLeft,  Math.min(bodyRight,  rawX));
        const clampedY = Math.max(bodyTop,   Math.min(bodyBottom, rawY));

        const rawInBounds =
          v.z < 1.0 &&
          rawX >= -w * 0.4 && rawX <= w * 1.4 &&
          rawY >= -h * 0.3 && rawY <= h * 1.3;

        const isVisible = rawInBounds;

        const roundedX = Math.round(clampedX);
        const roundedY = Math.round(clampedY);

        if (
          !target2DRef.current ||
          Math.abs(target2DRef.current.x - roundedX) > 0.5 ||
          Math.abs(target2DRef.current.y - roundedY) > 0.5 ||
          target2DRef.current.visible !== isVisible
        ) {
          const nextT2D = { x: roundedX, y: roundedY, visible: isVisible };
          target2DRef.current = nextT2D;
          setTarget2D(nextT2D);
        }
      } else {
        if (target2DRef.current !== null) {
          target2DRef.current = null;
          setTarget2D(null);
        }
      }

      // Keep vertical elevation scroll thumb in sync during OrbitControls / Camera transitions
      if (!isDraggingElevationRef.current && verticalThumbRef.current && controls) {
        const curRatio = Math.max(
          0,
          Math.min(1, (controls.target.y - MIN_ELEVATION_Y) / (MAX_ELEVATION_Y - MIN_ELEVATION_Y))
        );
        verticalThumbRef.current.style.bottom = `${curRatio * 100}%`;
      }

      controls.update();

      if (ss.dirty) {
        renderer.render(scene, camera);
        ss.dirty = false;
      }
    };

    animate();

    // 9. Cleanup
    return () => {
      disposed = true;
      abortController.abort();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handlePointerClick);
      controls.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
            else o.material.dispose();
          }
        }
      });
      if (partTexture) partTexture.dispose();
      if (selectionTexture) selectionTexture.dispose();
      envTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.remove();
      }
    };
  }, [handleRegionClick]);

  return (
    <div
      ref={viewerWrapperRef}
      className={`flex flex-col h-full w-full relative select-none ${isFullscreen ? 'fixed inset-0 z-[9999] bg-[#FAFCFB] p-4' : ''} ${className}`}
    >
      {/* ── Top Floating Bar: Vertical Layers (Left) & View Orientation + Fullscreen (Right) ──────────── */}
      {showControls && !isScanning && !isLoading && (
        <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-start justify-between gap-2 pointer-events-none animate-in fade-in duration-200">
          
          {/* Desktop: Vertical Layer Visibility Stack */}
          <div className="pointer-events-auto hidden sm:flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-border shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground px-1 pb-0.5 border-b border-border/60 font-display">
              <Layers className="h-3 w-3 text-primary" />
              <span>Layers</span>
            </div>

            <div className="flex flex-col gap-1">
              {LAYER_DEFINITIONS.map(({ id, label, color }) => {
                const isActive = activeLayers[id];
                return (
                  <button
                    key={id}
                    onClick={() => toggleLayer(id)}
                    className={`text-[10px] px-2.5 py-1.5 rounded-xl transition-all cursor-pointer font-semibold flex items-center justify-between gap-2 border ${
                      isActive
                        ? 'bg-accent text-foreground border-primary/25 shadow-subtle'
                        : 'bg-white text-muted-foreground border-border hover:text-foreground hover:bg-muted/60'
                    }`}
                    title={`Toggle ${label} visibility`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: isActive ? color : '#94A3B8',
                          boxShadow: isActive ? `0 0 6px ${color}88` : 'none',
                        }}
                      />
                      <span>{label}</span>
                    </div>
                    {isActive && <Check className="h-2.5 w-2.5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile: Compact Collapsible Layer Dropdown Pill */}
          <div className="pointer-events-auto sm:hidden relative">
            <button
              onClick={() => setMobileLayersOpen((v) => !v)}
              className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-full border shadow-xs backdrop-blur-md transition-all cursor-pointer ${
                mobileLayersOpen
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-white/95 text-foreground border-border'
              }`}
              title="Toggle Layer Filters"
            >
              <Layers className="h-3 w-3" />
              <span>Layers ({Object.values(activeLayers).filter(Boolean).length})</span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${mobileLayersOpen ? 'rotate-180' : ''}`} />
            </button>

            {mobileLayersOpen && (
              <div className="absolute top-full left-0 mt-1.5 flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-border shadow-lg min-w-[135px] z-30 animate-in fade-in zoom-in-95">
                {LAYER_DEFINITIONS.map(({ id, label, color }) => {
                  const isActive = activeLayers[id];
                  return (
                    <button
                      key={id}
                      onClick={() => toggleLayer(id)}
                      className={`text-[10px] px-2 py-1.5 rounded-xl transition-all cursor-pointer font-semibold flex items-center justify-between gap-2 border ${
                        isActive
                          ? 'bg-accent text-foreground border-primary/25'
                          : 'bg-white text-muted-foreground border-border hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: isActive ? color : '#94A3B8',
                            boxShadow: isActive ? `0 0 6px ${color}88` : 'none',
                          }}
                        />
                        <span>{label}</span>
                      </div>
                      {isActive && <Check className="h-2.5 w-2.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Controls: View Presets (Front / Back / Side / 3/4) & Fullscreen Button */}
          <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-border shadow-xs">
            <Compass className="h-3 w-3 text-muted-foreground ml-0.5 sm:ml-1 mr-0.5 hidden xs:inline-block" />
            {[
              { id: 'front', label: 'Front' },
              { id: 'three-quarter', label: '3/4' },
              { id: 'side', label: 'Side' },
              { id: 'back', label: 'Back' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => handleViewChange(id)}
                className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-all cursor-pointer font-semibold ${
                  currentView === id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {label}
              </button>
            ))}

            <div className="h-3.5 sm:h-4 w-px bg-border mx-0.5" />

            {/* Fullscreen Toggle Button */}
            <button
              onClick={toggleFullscreen}
              className={`p-1 sm:p-1.5 rounded-full transition-all cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted ${
                isFullscreen ? 'bg-accent text-primary' : ''
              }`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Full Screen Anatomy Exploration'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-primary" />
              ) : (
                <Maximize2 className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── 3D Canvas Container ───────────────────────────────────────────── */}
      <div
        className="w-full flex-1 relative rounded-2xl overflow-hidden border border-border"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, #FAFCFB 0%, #F0F7F4 65%, #E2EFE9 100%)',
          minHeight: '280px',
        }}
      >
        {/* Three.js Container */}
        <div ref={containerRef} className="w-full h-full min-h-[280px] sm:min-h-[320px] body-viewer-canvas" />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-20">
            <div className="relative">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-xs font-bold text-foreground font-display">
                Assembling Clinical Human Atlas...
              </span>
              <div className="w-48 bg-muted h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-200 rounded-full"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">
                {loadingProgress}% • 2,234 anatomical structures
              </span>
            </div>
          </div>
        )}

        {/* Load Error Alert */}
        {loadError && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="text-sm font-bold text-destructive mb-1">
              Viewer Initialization Notice
            </div>
            <p className="text-xs text-muted-foreground max-w-sm mb-3">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-semibold px-4 py-1.5 rounded-full bg-foreground text-background"
            >
              Reload Viewer
            </button>
          </div>
        )}

        {/* Hovered Anatomical Structure Badge */}
        {hoveredPart && !isLoading && showControls && !isScanning && (
          <div className="absolute top-14 left-3 pointer-events-none z-10 animate-in fade-in duration-150">
            <div className="bg-foreground/95 backdrop-blur-md text-background px-3 py-1.5 rounded-xl border border-white/10 shadow-lg flex flex-col gap-0.5 max-w-xs">
              <span className="text-[11px] font-bold tracking-tight text-white line-clamp-1">
                {hoveredPart.name}
              </span>
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                <span className="font-semibold text-primary">
                  {hoveredPart.system}
                </span>
                <span>•</span>
                <span>{hoveredPart.region} Region</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Vertical Anatomy Exploration Scroll Bar ────────────────────────── */}
        {!isLoading && !loadError && showControls && (
          <div
            className="absolute right-2 sm:right-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-auto flex flex-col items-center select-none animate-in fade-in duration-300"
            title="Vertical Anatomical Explorer — Drag or click to explore upper and lower body"
          >
            <div className="bg-white/92 backdrop-blur-md border border-border/80 shadow-md rounded-full py-2 px-1 sm:px-1.5 flex flex-col items-center gap-1.5">
              {/* Up Button (Head) */}
              <button
                type="button"
                onClick={() => stepVerticalCamera(0.12)}
                className="p-1 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/60 transition-colors cursor-pointer"
                title="Explore Upper Body (Head)"
              >
                <ChevronUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>

              {/* Interactive Vertical Slider Track */}
              <div
                ref={verticalTrackRef}
                onPointerDown={handleVerticalTrackPointerDown}
                className="relative w-2 sm:w-2.5 h-32 sm:h-40 bg-muted/90 hover:bg-muted rounded-full cursor-pointer touch-none flex flex-col justify-between py-1 items-center"
              >
                {/* Anatomical Level Ticks */}
                {[
                  { label: 'Head', yRatio: 0.95 },
                  { label: 'Thorax', yRatio: 0.70 },
                  { label: 'Abdomen', yRatio: 0.48 },
                  { label: 'Pelvis', yRatio: 0.30 },
                  { label: 'Lower Limb', yRatio: 0.05 },
                ].map((tick) => (
                  <div
                    key={tick.label}
                    className="absolute w-1.5 h-0.5 bg-slate-400/60 rounded-full pointer-events-none"
                    style={{
                      bottom: `${tick.yRatio * 100}%`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                    title={tick.label}
                  />
                ))}

                {/* Draggable Slider Thumb */}
                <div
                  ref={verticalThumbRef}
                  className="absolute left-1/2 -translate-x-1/2 w-4 h-5 sm:w-4.5 sm:h-6 rounded-full bg-primary shadow-xs border border-white/80 flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform hover:scale-105"
                  style={{ bottom: '50%', transform: 'translate(-50%, 50%)' }}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="w-2 h-0.5 bg-white/80 rounded-full" />
                    <div className="w-2 h-0.5 bg-white/80 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Down Button (Lower Limb) */}
              <button
                type="button"
                onClick={() => stepVerticalCamera(-0.12)}
                className="p-1 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/60 transition-colors cursor-pointer"
                title="Explore Lower Body (Legs)"
              >
                <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Holographic 3D Anatomical Callout & Arrow */}
        {showControls && !isLoading && !isScanning && (
          <AnatomyHUDCallout
            target2D={target2D}
            region={selectedRegion}
            bodyLocalization={bodyLocalization}
            conditionName={conditionName}
            icd10Code={icd10Code}
            modelScore={modelScore}
            onFocusRegion={() => handleRegionClick(bodyLocalization?.primaryRegion || selectedRegion)}
            isHoveringPart={Boolean(hoveredPart)}
          />
        )}

        {/* ── Bottom Bar: Region Pills & Navigation ────────────────────── */}
        {showControls && !isScanning && !isLoading && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none z-10 animate-in fade-in duration-200">
            
            {/* Interaction Help Pill (Hidden on mobile/tablet to save space) */}
            <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-border shadow-xs text-[11px] text-muted-foreground flex-shrink-0">
              <span className="flex items-center gap-1 font-medium">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" /> Drag · Scroll
              </span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1 text-primary font-semibold">
                <Focus className="h-3.5 w-3.5 text-primary" /> Auto-Focus
              </span>
            </div>

            {/* Region Selection Pills - Horizontal scrolling strip on mobile */}
            <div
              className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-full border border-border shadow-xs overflow-x-auto no-scrollbar max-w-full flex-nowrap w-full md:w-auto justify-start md:justify-end"
              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
            >
              <button
                onClick={() => handleRegionClick('All')}
                className={`text-[10px] px-2.5 py-1 sm:py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1 font-semibold flex-shrink-0 whitespace-nowrap ${
                  selectedRegion === 'All' || selectedRegion === 'Full Body'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <RotateCcw className="h-2.5 w-2.5 flex-shrink-0" /> Full Body
              </button>

              {['Head', 'Thorax', 'Abdomen', 'Pelvis', 'Upper Limb', 'Lower Limb'].map(
                (reg) => {
                  const isSelected = selectedRegion === reg;
                  const isClinicalFocus = bodyLocalization?.primaryRegion === reg;
                  return (
                    <button
                      key={reg}
                      onClick={() => handleRegionClick(reg)}
                      className={`text-[10px] px-2.5 py-1 sm:py-1.5 rounded-full transition-all cursor-pointer font-semibold flex-shrink-0 whitespace-nowrap flex items-center gap-1 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {isClinicalFocus && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white animate-pulse' : 'bg-primary'
                          }`}
                        />
                      )}
                      {reg}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
