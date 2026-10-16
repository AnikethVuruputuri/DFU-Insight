export type PathologyClass = 'None' | 'Infection' | 'Ischaemia' | 'Both';

export type WagnerGrade = 0 | 1 | 2 | 3 | 4;

export type XAIMethod = 'gradcam' | 'swin_attention' | 'integrated_gradients' | 'kernel_shap';

export interface PathologyScore {
  className: PathologyClass;
  probability: number; // 0 to 1
  logit: number;
}

export interface WagnerScore {
  grade: WagnerGrade;
  ordinalScore: number; // 0 to 4
  definition: string;
  clinicalSignificance: string;
}

export interface XAIMap {
  method: XAIMethod;
  title: string;
  subtitle: string;
  targetClass: PathologyClass;
  description: string;
  dataUrl: string; // Base64 data URL overlay
  attributionMean: number;
  peakCoordinates: { x: number; y: number }; // normalized 0..1
}

export interface PredictionResult {
  id: string;
  timestamp: string;
  imageDimensions: { width: number; height: number };
  imageSha256?: string;
  originalImageDataUrl: string;
  predictedPathology: PathologyClass;
  pathologyConfidence: number; // e.g. 0.884 (88.4%)
  pathologyScores: PathologyScore[];
  predictedWagnerGrade: WagnerGrade;
  wagnerOrdinalScore: number;
  wagnerDetails: WagnerScore;
  modelVersion: string;
  inferenceDurationMs: number;
  device: 'CUDA' | 'CPU' | 'WebGPU/WASM';
  dualBranchDetails: {
    efficientNetV2AttributionRatio: number;
    swinTinyAttributionRatio: number;
    representationAlignmentLoss: number;
  };
  explainability: Record<XAIMethod, XAIMap>;
  warnings?: string[];
}

export interface BenchmarkSample {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  groundTruthPathology: PathologyClass;
  groundTruthWagner: WagnerGrade;
  clinicalNotes: string;
  lesionSite: string;
}

export interface ModelInfo {
  modelName: string;
  version: string;
  architecture: string;
  parametersTotal: number;
  inputResolution: [number, number];
  normalization: {
    mean: [number, number, number];
    std: [number, number, number];
  };
  supportedClasses: PathologyClass[];
  wagnerGradeRange: [number, number];
  availableExplainabilityMethods: XAIMethod[];
  trainingCheckpoint: string;
}
