import { BenchmarkSample, ModelInfo, PathologyClass, WagnerGrade, WagnerScore } from '../types/dfu';

export const WAGNER_DEFINITIONS: Record<WagnerGrade, WagnerScore> = {
  0: {
    grade: 0,
    ordinalScore: 0.12,
    definition: 'Pre-ulcerative lesion or healed intact epithelium with bony deformity / hyperkeratosis.',
    clinicalSignificance: 'High risk of ulceration; requires offloading and protective podiatric orthoses.',
  },
  1: {
    grade: 1,
    ordinalScore: 1.05,
    definition: 'Superficial diabetic ulcer involving full skin thickness without subcutaneous extension.',
    clinicalSignificance: 'Local wound dressing, sharp debridement, pressure redistribution.',
  },
  2: {
    grade: 2,
    ordinalScore: 2.14,
    definition: 'Deep ulcer penetrating to tendon, joint capsule, or deep fascia without osteomyelitis or abscess.',
    clinicalSignificance: 'Surgical wound exploration, offloading total contact casting, culture-guided therapy.',
  },
  3: {
    grade: 3,
    ordinalScore: 3.22,
    definition: 'Deep ulcer with abscess, tendonitis, deep fascial infection, joint sepsis, or osteomyelitis.',
    clinicalSignificance: 'Urgent hospitalization, surgical debridement, IV broad-spectrum antimicrobial therapy.',
  },
  4: {
    grade: 4,
    ordinalScore: 4.18,
    definition: 'Localized gangrene involving toes, forefoot, or localized heel tissue necrosis.',
    clinicalSignificance: 'Critical limb-threatening condition; immediate vascular surgery evaluation for revascularization or partial amputation.',
  },
};

export const PATHOLOGY_DESCRIPTIONS: Record<PathologyClass, string> = {
  None: 'Absence of active microbial infection and acute ischemic tissue compromise; localized ulceration without marked secondary pathology.',
  Infection: 'Presence of purulent exudate, localized erythema extending >2cm, warmth, edema, or ascending cellulitis with positive microbial flora.',
  Ischaemia: 'Severe peripheral arterial insufficiency, absent palpable distal pulses, atrophic skin, pallor on elevation, dependent rubor, and compromised capillary refill.',
  Both: 'Mixed neuro-ischemic ulcer with concurrent microbial infection and severe arterial perfusion deficit. Associated with the highest risk of limb loss.',
};

export const DEFAULT_MODEL_INFO: ModelInfo = {
  modelName: 'DFU-Wagner net (DFU-SIAM v3)',
  version: 'v3.2.0-rc4',
  architecture: 'Dual-Branch Fusion (EfficientNetV2-S + Swin-Tiny Transformer)',
  parametersTotal: 50428160,
  inputResolution: [384, 384],
  normalization: {
    mean: [0.485, 0.456, 0.406],
    std: [0.229, 0.224, 0.225],
  },
  supportedClasses: ['None', 'Infection', 'Ischaemia', 'Both'],
  wagnerGradeRange: [0, 4],
  availableExplainabilityMethods: ['gradcam', 'swin_attention', 'integrated_gradients', 'kernel_shap'],
  trainingCheckpoint: 'dfu_wagner_net_siam3_best_checkpoint.pt',
};

// Procedural generator for clinical research sample images (drawn on HTML5 canvas) to ensure 0 external 404s
export function generateSyntheticClinicalSample(type: 'infection' | 'ischaemia' | 'both' | 'grade1'): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background dermal skin tone
  const skinGrad = ctx.createRadialGradient(200, 200, 50, 200, 200, 240);
  skinGrad.addColorStop(0, '#e8beac');
  skinGrad.addColorStop(0.7, '#d4a390');
  skinGrad.addColorStop(1, '#b88975');
  ctx.fillStyle = skinGrad;
  ctx.fillRect(0, 0, 400, 400);

  // Add subtle skin texture noise
  ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
  for (let i = 0; i < 2000; i++) {
    const rx = Math.random() * 400;
    const ry = Math.random() * 400;
    ctx.fillRect(rx, ry, 1.5, 1.5);
  }

  // Draw plantar / foot margin contour
  ctx.strokeStyle = 'rgba(120, 80, 60, 0.18)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(200, 200, 160, 180, 0.1, 0, Math.PI * 2);
  ctx.stroke();

  // Central ulcer bed
  const cx = 195;
  const cy = 205;

  if (type === 'infection') {
    // Erythematous periwound halo (>2cm redness)
    const erythema = ctx.createRadialGradient(cx, cy, 30, cx, cy, 110);
    erythema.addColorStop(0, 'rgba(215, 45, 45, 0.7)');
    erythema.addColorStop(0.6, 'rgba(235, 75, 75, 0.45)');
    erythema.addColorStop(1, 'rgba(215, 60, 60, 0)');
    ctx.fillStyle = erythema;
    ctx.beginPath();
    ctx.arc(cx, cy, 110, 0, Math.PI * 2);
    ctx.fill();

    // Deep ulcer crater with purulent exudate
    const ulcerBed = ctx.createRadialGradient(cx, cy, 5, cx, cy, 45);
    ulcerBed.addColorStop(0, '#fef08a'); // yellow slough/pus
    ulcerBed.addColorStop(0.4, '#b91c1c'); // red granulation
    ulcerBed.addColorStop(0.85, '#7f1d1d'); // dark ulcer margin
    ulcerBed.addColorStop(1, 'rgba(127, 29, 29, 0)');
    ctx.fillStyle = ulcerBed;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 45, 40, 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'ischaemia') {
    // Pale atrophic ischemic skin & punched-out cyanotic ulcer
    const ischemicHalo = ctx.createRadialGradient(cx, cy, 20, cx, cy, 100);
    ischemicHalo.addColorStop(0, 'rgba(70, 50, 70, 0.6)');
    ischemicHalo.addColorStop(0.5, 'rgba(140, 120, 140, 0.35)');
    ischemicHalo.addColorStop(1, 'rgba(220, 210, 215, 0)');
    ctx.fillStyle = ischemicHalo;
    ctx.beginPath();
    ctx.arc(cx, cy, 100, 0, Math.PI * 2);
    ctx.fill();

    // Punched out dark eschar bed
    const eschar = ctx.createRadialGradient(cx, cy, 8, cx, cy, 38);
    eschar.addColorStop(0, '#1c1917'); // black necrotic eschar
    eschar.addColorStop(0.6, '#44403c');
    eschar.addColorStop(0.9, '#78716c');
    eschar.addColorStop(1, 'rgba(120, 113, 108, 0)');
    ctx.fillStyle = eschar;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 38, 35, -0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'both') {
    // Mixed neuro-ischemic ulcer: surrounding erythema + central necrotic eschar
    const mixedHalo = ctx.createRadialGradient(cx, cy, 25, cx, cy, 120);
    mixedHalo.addColorStop(0, 'rgba(185, 28, 28, 0.7)');
    mixedHalo.addColorStop(0.5, 'rgba(90, 40, 60, 0.45)');
    mixedHalo.addColorStop(1, 'rgba(180, 50, 50, 0)');
    ctx.fillStyle = mixedHalo;
    ctx.beginPath();
    ctx.arc(cx, cy, 120, 0, Math.PI * 2);
    ctx.fill();

    // Central necrosis with purulent margins
    ctx.fillStyle = '#171717';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 35, 30, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(253, 224, 71, 0.75)';
    ctx.beginPath();
    ctx.ellipse(cx - 10, cy - 8, 12, 10, 0.4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Grade 1 superficial neuropathic ulcer
    const superficial = ctx.createRadialGradient(cx, cy, 5, cx, cy, 32);
    superficial.addColorStop(0, '#dc2626');
    superficial.addColorStop(0.7, '#ef4444');
    superficial.addColorStop(0.9, '#fca5a5');
    superficial.addColorStop(1, 'rgba(254, 202, 202, 0)');
    ctx.fillStyle = superficial;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 32, 28, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Clinical measurement scale bar in corner
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillRect(20, 360, 90, 24);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(25, 370, 80, 4);
  ctx.font = '10px monospace';
  ctx.fillText('20 mm SCALE', 25, 366);

  return canvas.toDataURL('image/jpeg', 0.92);
}

export const BENCHMARK_SAMPLES: BenchmarkSample[] = [
  {
    id: 'sample-inf-01',
    name: 'Sample #INF-284',
    category: 'Infection (Wagner 2)',
    thumbnailUrl: '', // Generated on demand
    groundTruthPathology: 'Infection',
    groundTruthWagner: 2,
    clinicalNotes: '1st metatarsal head plantar ulcer with 3.2cm erythema halo and purulent slough at deep base.',
    lesionSite: 'Plantar Forefoot (Right Metatarsal 1)',
  },
  {
    id: 'sample-isc-02',
    name: 'Sample #ISC-519',
    category: 'Ischaemia (Wagner 4)',
    thumbnailUrl: '',
    groundTruthPathology: 'Ischaemia',
    groundTruthWagner: 4,
    clinicalNotes: 'Hallux tip ulcer with dry necrotic black eschar and severe distal arterial hypoperfusion.',
    lesionSite: 'Distal Phalanx Hallux (Left)',
  },
  {
    id: 'sample-both-03',
    name: 'Sample #MIX-108',
    category: 'Both / Mixed (Wagner 3)',
    thumbnailUrl: '',
    groundTruthPathology: 'Both',
    groundTruthWagner: 3,
    clinicalNotes: 'Lateral calcaneal ulcer with tendon exposure, peripheral cellulitis, and absent tibial pulse.',
    lesionSite: 'Lateral Calcaneus (Right Heel)',
  },
  {
    id: 'sample-sup-04',
    name: 'Sample #SUP-042',
    category: 'None / Superficial (Wagner 1)',
    thumbnailUrl: '',
    groundTruthPathology: 'None',
    groundTruthWagner: 1,
    clinicalNotes: 'Superficial 12mm neuropathic ulcer with pink granulation tissue and no signs of acute infection.',
    lesionSite: 'Plantar Midfoot (Left Arch)',
  },
];
