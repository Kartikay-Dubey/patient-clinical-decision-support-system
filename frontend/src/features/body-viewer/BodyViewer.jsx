import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Eye, Focus, RotateCcw, Layers, Compass, Loader2, Sparkles, Check } from 'lucide-react';
import { decodeModelResponse } from './modelLoader';
import {
  SYSTEMS,
  LAYER_DEFINITIONS,
  REGIONS,
  classifyPartRegion,
  REGION_CAMERA_CONFIGS,
} from './anatomyAtlas';

const ATLAS_JSON_PATH = '/models/atlas.json';

export default function BodyViewer({
  activeRegion = 'All',
  onSelectRegion,
  className = '',
}) {
  const containerRef = useRef(null);
  const [internalRegion, setInternalRegion] = useState('All');
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

  const handleRegionClick = useCallback(
    (region) => {
      setInternalRegion(region);
      if (onSelectRegion) onSelectRegion(region);

      // Trigger smooth camera transition
      const cfg = REGION_CAMERA_CONFIGS[region] || REGION_CAMERA_CONFIGS.All;
      if (cameraRef.current && controlsRef.current) {
        const ss = sceneStateRef.current;
        ss.cameraStartPos.copy(cameraRef.current.position);
        ss.cameraEndPos.set(...cfg.camPos);
        ss.targetStartPos.copy(controlsRef.current.target);
        ss.targetEndPos.set(...cfg.target);
        ss.camTransitionT = 0;
        ss.transitioningCamera = true;
        ss.dirty = true;
      }
    },
    [onSelectRegion]
  );

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
    renderer.domElement.style.touchAction = 'pan-y'; // Allow smooth page scrolling on vertical swipe
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

    // Center model view
    const initialConfig = REGION_CAMERA_CONFIGS.All;
    camera.position.set(...initialConfig.camPos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.target.set(...initialConfig.target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.3;
    controls.maxDistance = 6.0;
    controls.minPolarAngle = Math.PI / 16;
    controls.maxPolarAngle = Math.PI - Math.PI / 16;
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
        transparent: isSkin,
        opacity: isSkin ? 0.12 : 1.0,
        depthWrite: !isSkin,
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
            'if (partVisible < 0.5) discard;'
        );

        // Mix clinical coral accent (#C84B31) on selected/highlighted parts
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <color_fragment>',
          '#include <color_fragment>\n' +
            'diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.784, 0.294, 0.192), partSelected * 0.85);'
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

    const handlePointerClick = (e) => {
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
        const reg = partRegions[foundIndex];
        if (reg) handleRegionClick(reg);
      }
    };

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
        ss.camTransitionT += dt * 3.5;
        const t = Math.min(ss.camTransitionT, 1.0);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        camera.position.lerpVectors(ss.cameraStartPos, ss.cameraEndPos, ease);
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

          // Selection / Highlighting: is part in active clinical region?
          const isSelected =
            curRegion !== 'All' &&
            curRegion !== 'Full Body' &&
            partReg === curRegion;

          selectionData[i * 4] = isSelected ? 255 : 0;
        }

        partTexture.needsUpdate = true;
        selectionTexture.needsUpdate = true;

        lastRenderedRegion = curRegion;
        lastRenderedLayers = { ...curLayers };
        ss.dirty = true;
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
      className={`flex flex-col h-full w-full relative select-none ${className}`}
    >
      {/* ── Top Floating Bar: Layer Toggles & View Orientation ──────────── */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between flex-wrap gap-2 pointer-events-none">
        
        {/* Layer Visibility Pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-[#EAE3D9] shadow-sm">
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#8E8078] px-1 font-display">
            <Layers className="h-3 w-3 text-[#D97757]" />
            <span>Layers</span>
          </div>

          {LAYER_DEFINITIONS.map(({ id, label, color }) => {
            const isActive = activeLayers[id];
            return (
              <button
                key={id}
                onClick={() => toggleLayer(id)}
                className={`text-[10px] px-2.5 py-1 rounded-full transition-all cursor-pointer font-semibold flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#2D2623] text-white shadow-xs'
                    : 'bg-[#F5F1EB] text-[#8E8078] hover:text-[#2D2623] opacity-60'
                }`}
                title={`Toggle ${label} visibility`}
              >
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: isActive ? color : '#C0B8AD',
                    boxShadow: isActive ? `0 0 6px ${color}88` : 'none',
                  }}
                />
                <span>{label}</span>
                {isActive && <Check className="h-2.5 w-2.5 ml-0.5 opacity-80" />}
              </button>
            );
          })}
        </div>

        {/* View Presets (Front / Back / Side / 3/4) */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-full border border-[#EAE3D9] shadow-sm">
          <Compass className="h-3 w-3 text-[#8E8078] ml-1 mr-0.5" />
          {[
            { id: 'front', label: 'Front' },
            { id: 'three-quarter', label: '3/4' },
            { id: 'side', label: 'Side' },
            { id: 'back', label: 'Back' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleViewChange(id)}
              className={`text-[10px] px-2 py-0.5 rounded-full transition-all cursor-pointer font-semibold ${
                currentView === id
                  ? 'bg-[#C84B31] text-white shadow-xs'
                  : 'text-[#5E524C] hover:text-[#2D2623] hover:bg-[#F5F1EB]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3D Canvas Container ───────────────────────────────────────────── */}
      <div
        className="w-full flex-1 relative rounded-2xl overflow-hidden border border-[#EAE3D9]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, #F5F1EB 0%, #EDE6DC 65%, #E3D9CC 100%)',
          minHeight: '320px',
        }}
      >
        {/* Three.js Container */}
        <div ref={containerRef} className="w-full h-full body-viewer-canvas" />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#EDE6DC]/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-20">
            <div className="relative">
              <Loader2 className="h-8 w-8 text-[#C84B31] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-[#D97757]" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-xs font-bold text-[#2D2623] font-display">
                Assembling Clinical Human Atlas...
              </span>
              <div className="w-48 bg-[#DCD4C8] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#C84B31] h-full transition-all duration-200 rounded-full"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-[#8E8078]">
                {loadingProgress}% • 2,234 anatomical structures
              </span>
            </div>
          </div>
        )}

        {/* Load Error Alert */}
        {loadError && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="text-sm font-bold text-[#C84B31] mb-1">
              Viewer Initialization Notice
            </div>
            <p className="text-xs text-[#5E524C] max-w-sm mb-3">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-semibold px-4 py-1.5 rounded-full bg-[#2D2623] text-white"
            >
              Reload Viewer
            </button>
          </div>
        )}

        {/* Hovered Anatomical Structure Badge */}
        {hoveredPart && !isLoading && (
          <div className="absolute top-14 left-3 pointer-events-none z-10 animate-in fade-in duration-150">
            <div className="bg-[#2D2623]/92 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/10 shadow-lg flex flex-col gap-0.5 max-w-xs">
              <span className="text-[11px] font-bold tracking-tight text-white line-clamp-1">
                {hoveredPart.name}
              </span>
              <div className="flex items-center gap-2 text-[9px] text-[#D8CFBC]">
                <span className="font-semibold text-[#F7A072]">
                  {hoveredPart.system}
                </span>
                <span>•</span>
                <span>{hoveredPart.region} Region</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Bottom Bar: Region Pills & Navigation ────────────────────── */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between flex-wrap gap-2 pointer-events-none z-10">
          
          {/* Interaction Help Pill */}
          <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#EAE3D9] shadow-sm text-[11px] text-[#5E524C]">
            <span className="flex items-center gap-1 font-medium">
              <Eye className="h-3.5 w-3.5 text-[#8E8078]" /> Drag · Scroll
            </span>
            <span className="text-[#DDD4C7]">·</span>
            <span className="flex items-center gap-1 text-[#C84B31] font-semibold">
              <Focus className="h-3.5 w-3.5" /> Auto-Focus
            </span>
          </div>

          {/* Region Selection Pills */}
          <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-full border border-[#EAE3D9] shadow-sm flex-wrap">
            <button
              onClick={() => handleRegionClick('All')}
              className={`text-[10px] px-2.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1 font-semibold ${
                selectedRegion === 'All' || selectedRegion === 'Full Body'
                  ? 'bg-[#C84B31] text-white shadow-xs'
                  : 'text-[#5E524C] hover:text-[#2D2623] hover:bg-[#F5F1EB]'
              }`}
            >
              <RotateCcw className="h-2.5 w-2.5" /> Full Body
            </button>

            {['Head', 'Thorax', 'Abdomen', 'Pelvis', 'Upper Limb', 'Lower Limb'].map(
              (reg) => {
                const isSelected = selectedRegion === reg;
                return (
                  <button
                    key={reg}
                    onClick={() => handleRegionClick(reg)}
                    className={`text-[10px] px-2.5 py-1.5 rounded-full transition-all cursor-pointer font-semibold ${
                      isSelected
                        ? 'bg-[#C84B31] text-white shadow-xs'
                        : 'text-[#5E524C] hover:text-[#2D2623] hover:bg-[#F5F1EB]'
                    }`}
                  >
                    {reg}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
