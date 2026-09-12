/**
 * Anatomical Systems and Region Taxonomy for BodyParts3D Integration.
 */

export const SYSTEMS = [
  {
    id: 'skeletal',
    name: 'Skeleton',
    layer: 'Skeleton',
    color: '#D8CFBC',
    activeColor: '#E6DCB8',
    description: 'Bony framework protecting vital organs and providing muscular leverage.',
  },
  {
    id: 'muscular',
    name: 'Muscles',
    layer: 'Muscles',
    color: '#B56352',
    activeColor: '#C84B31',
    description: 'Skeletal musculature producing movement, maintaining posture, and stabilizing joints.',
  },
  {
    id: 'cardiac',
    name: 'Heart & Cardiovasculature',
    layer: 'Organs',
    color: '#C04A42',
    activeColor: '#E63946',
    description: 'Four-chambered muscular pump driving systemic and pulmonary circulation.',
  },
  {
    id: 'respiratory',
    name: 'Respiratory System',
    layer: 'Organs',
    color: '#8CAFB8',
    activeColor: '#5EA8B6',
    description: 'Airways and lungs facilitating gas exchange between oxygen and carbon dioxide.',
  },
  {
    id: 'digestive',
    name: 'Digestive System',
    layer: 'Organs',
    color: '#C49464',
    activeColor: '#D97757',
    description: 'Gastrointestinal tract and metabolic accessory organs (liver, pancreas, stomach).',
  },
  {
    id: 'urinary',
    name: 'Urinary System',
    layer: 'Organs',
    color: '#B87B67',
    activeColor: '#D46A43',
    description: 'Kidneys, ureters, and bladder regulating fluid balance and electrolyte clearance.',
  },
  {
    id: 'nervous',
    name: 'Nervous System',
    layer: 'Organs',
    color: '#D4B35D',
    activeColor: '#E09F3E',
    description: 'Brain, spinal cord, and peripheral pathways coordinating sensory and motor signals.',
  },
  {
    id: 'endocrine',
    name: 'Endocrine Glands',
    layer: 'Organs',
    color: '#C29891',
    activeColor: '#B06D61',
    description: 'Hormone-secreting organs regulating metabolism, stress response, and growth.',
  },
  {
    id: 'sensory',
    name: 'Sensory Organs',
    layer: 'Organs',
    color: '#9DBBC5',
    activeColor: '#457B9D',
    description: 'Specialized tissues for vision, audition, equilibrium, and sensory detection.',
  },
  {
    id: 'arterial',
    name: 'Arterial Vasculature',
    layer: 'Organs',
    color: '#C53D32',
    activeColor: '#E63946',
    description: 'High-pressure vascular distribution network carrying oxygenated blood.',
  },
  {
    id: 'venous',
    name: 'Venous Vasculature',
    layer: 'Organs',
    color: '#4B7399',
    activeColor: '#2A9D8F',
    description: 'Low-pressure venous return channels conveying deoxygenated blood to the heart.',
  },
  {
    id: 'lymphatic',
    name: 'Lymphatic & Immune',
    layer: 'Organs',
    color: '#7F9975',
    activeColor: '#52B788',
    description: 'Lymphoid tissues and nodal network governing immune surveillance and interstitial drainage.',
  },
  {
    id: 'reproductive',
    name: 'Reproductive System',
    layer: 'Organs',
    color: '#B8978E',
    activeColor: '#9C6644',
    description: 'Genital structures and reproductive anatomy.',
  },
  {
    id: 'connective',
    name: 'Connective & Cartilage',
    layer: 'Skeleton',
    color: '#ADC2BA',
    activeColor: '#A3B18A',
    description: 'Articular cartilage, ligaments, and fibrous sheets binding anatomical structures.',
  },
  {
    id: 'integumentary',
    name: 'Body Surface Reference',
    layer: 'Skin',
    color: '#BA9B7D',
    activeColor: '#DDA15E',
    description: 'Outer anatomical surface providing protective barrier and reference envelope.',
  },
];

export const LAYER_DEFINITIONS = [
  {
    id: 'Muscles',
    label: 'Muscles',
    color: '#B56352',
    systems: ['muscular'],
    description: 'Skeletal musculature & tendons',
  },
  {
    id: 'Skeleton',
    label: 'Skeleton',
    color: '#D8CFBC',
    systems: ['skeletal', 'connective'],
    description: 'Bones, joints & cartilage',
  },
  {
    id: 'Organs',
    label: 'Organs',
    color: '#8AAEA1',
    systems: [
      'cardiac',
      'respiratory',
      'digestive',
      'urinary',
      'nervous',
      'endocrine',
      'sensory',
      'arterial',
      'venous',
      'lymphatic',
      'reproductive',
    ],
    description: 'Internal visceral & vascular systems',
  },
];

export const REGIONS = [
  'All',
  'Head',
  'Thorax',
  'Abdomen',
  'Pelvis',
  'Upper Limb',
  'Lower Limb',
];

/**
 * Classifies a BodyParts3D part into one of the 6 CDSS regions.
 */
export function classifyPartRegion(part) {
  if (!part) return 'All';
  const name = (part.name || '').toLowerCase();
  const min_y = part.bounds?.[0]?.[1] ?? 0;
  const max_y = part.bounds?.[1]?.[1] ?? 0;
  const mid_y = (min_y + max_y) / 2;
  const min_x = part.bounds?.[0]?.[0] ?? 0;
  const max_x = part.bounds?.[1]?.[0] ?? 0;
  const mid_x = Math.abs((min_x + max_x) / 2);

  // Height-bracket anchors
  if (mid_y >= 1.42) return 'Head';
  if (mid_y < 0.70) return 'Lower Limb';

  // Upper limb lateral / limb keywords
  if (
    (name.includes('hand') ||
      name.includes('finger') ||
      name.includes('palmar') ||
      name.includes('wrist') ||
      name.includes('radius') ||
      name.includes('radial') ||
      name.includes('ulna') ||
      name.includes('ulnar') ||
      name.includes('brachi') ||
      name.includes('humerus') ||
      name.includes('forearm') ||
      name.includes('biceps brachii') ||
      name.includes('triceps brachii') ||
      name.includes('deltoid') ||
      name.includes('axillary') ||
      name.includes('scapula')) &&
    !name.includes('foot') &&
    !name.includes('leg')
  ) {
    return 'Upper Limb';
  }

  if (
    mid_y >= 1.15 &&
    mid_x > 0.175 &&
    (name.includes('muscle') ||
      name.includes('bone') ||
      name.includes('artery') ||
      name.includes('vein') ||
      name.includes('nerve') ||
      name.includes('tendon') ||
      name.includes('ligament')) &&
    !name.includes('intercostal') &&
    !name.includes('rib') &&
    !name.includes('sternum') &&
    !name.includes('lung') &&
    !name.includes('heart')
  ) {
    return 'Upper Limb';
  }

  // Head & Neck
  if (
    (name.includes('cervical') ||
      name.includes('larynx') ||
      name.includes('thyroid') ||
      name.includes('hyoid') ||
      name.includes('pharynx') ||
      name.includes('vocal') ||
      name.includes('jugular') ||
      name.includes('carotid') ||
      name.includes('neck') ||
      name.includes('submandibular')) &&
    mid_y >= 1.32
  ) {
    return 'Head';
  }

  // Pelvis
  if (
    (name.includes('pelvi') ||
      name.includes('ilium') ||
      name.includes('ischium') ||
      name.includes('pubis') ||
      name.includes('pubic') ||
      name.includes('sacrum') ||
      name.includes('sacral') ||
      name.includes('coccyx') ||
      name.includes('bladder') ||
      name.includes('prostate') ||
      name.includes('seminal') ||
      name.includes('testis') ||
      name.includes('epididymis') ||
      name.includes('penis') ||
      name.includes('scrotum') ||
      name.includes('urethra') ||
      name.includes('rectum') ||
      name.includes('anal') ||
      name.includes('anus') ||
      name.includes('perine') ||
      name.includes('pudendal') ||
      name.includes('iliac') ||
      name.includes('obturator') ||
      name.includes('levator ani') ||
      name.includes('ischiococcygeus') ||
      name.includes('gluteus') ||
      name.includes('piriformis')) &&
    mid_y < 1.05
  ) {
    return 'Pelvis';
  }

  // Abdomen
  if (
    name.includes('stomach') ||
    name.includes('liver') ||
    name.includes('hepatic') ||
    name.includes('gallbladder') ||
    name.includes('bile') ||
    name.includes('pancreas') ||
    name.includes('pancreatic') ||
    name.includes('spleen') ||
    name.includes('splenic') ||
    name.includes('kidney') ||
    name.includes('renal') ||
    name.includes('ureter') ||
    name.includes('adrenal') ||
    name.includes('suprarenal') ||
    name.includes('duodenum') ||
    name.includes('jejunum') ||
    name.includes('ileum') ||
    name.includes('caecum') ||
    name.includes('cecum') ||
    name.includes('appendix') ||
    name.includes('colon') ||
    name.includes('mesenter') ||
    name.includes('peritoneum') ||
    name.includes('gastric') ||
    name.includes('celiac') ||
    name.includes('lumbar') ||
    name.includes('psoas') ||
    name.includes('quadratus lumborum') ||
    name.includes('rectus abdominis') ||
    name.includes('abdominal') ||
    name.includes('transversus abdominis') ||
    name.includes('internal oblique') ||
    name.includes('external oblique')
  ) {
    return 'Abdomen';
  }

  // Thorax
  if (
    name.includes('lung') ||
    name.includes('pulmonary') ||
    name.includes('heart') ||
    name.includes('cardiac') ||
    name.includes('atrium') ||
    name.includes('ventricle') ||
    name.includes('aorta') ||
    name.includes('myocardium') ||
    name.includes('pericardium') ||
    name.includes('coronary') ||
    name.includes('rib') ||
    name.includes('costal') ||
    name.includes('sternum') ||
    name.includes('sternal') ||
    name.includes('manubrium') ||
    name.includes('thoracic') ||
    name.includes('trachea') ||
    name.includes('bronch') ||
    name.includes('thymus') ||
    name.includes('diaphragm') ||
    name.includes('intercostal') ||
    name.includes('pectoral') ||
    name.includes('mediastin') ||
    name.includes('azygos') ||
    name.includes('esophagus')
  ) {
    return 'Thorax';
  }

  // Geometric fallback
  if (mid_y >= 1.38) return 'Head';
  if (mid_y >= 1.10) return 'Thorax';
  if (mid_y >= 0.88) return 'Abdomen';
  if (mid_y >= 0.70) return 'Pelvis';
  return 'Lower Limb';
}

/**
 * Camera positioning per anatomical region for BodyParts3D coordinates (Y: 0..1.73m).
 */
export const REGION_CAMERA_CONFIGS = {
  All: {
    target: [0, 0.865, 0],
    camPos: [0.15, 0.90, 2.50],
    fov: 38,
  },
  'Full Body': {
    target: [0, 0.865, 0],
    camPos: [0.15, 0.90, 2.50],
    fov: 38,
  },
  Head: {
    target: [0, 1.56, 0.02],
    camPos: [0.08, 1.58, 0.72],
    fov: 34,
  },
  Thorax: {
    target: [0, 1.25, 0.01],
    camPos: [0.10, 1.27, 0.98],
    fov: 34,
  },
  Abdomen: {
    target: [0, 1.00, 0.01],
    camPos: [0.08, 1.02, 0.88],
    fov: 34,
  },
  Pelvis: {
    target: [0, 0.80, 0.01],
    camPos: [0.08, 0.82, 0.92],
    fov: 34,
  },
  'Upper Limb': {
    target: [0.16, 1.15, 0],
    camPos: [0.22, 1.18, 1.15],
    fov: 34,
  },
  'Lower Limb': {
    target: [0, 0.42, 0.01],
    camPos: [0.10, 0.45, 1.40],
    fov: 36,
  },
};
