from typing import List, Optional, Dict, Any, Tuple
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "healthy"
    model_loaded: bool
    device: str
    version: str


class PathologyScore(BaseModel):
    class_name: str
    probability: float
    logit: float


class WagnerScore(BaseModel):
    grade: int
    ordinal_score: float
    definition: str
    clinical_significance: str


class PredictionResponse(BaseModel):
    request_id: str
    timestamp: str
    model_version: str
    inference_duration_ms: int
    device: str
    predicted_pathology: str
    pathology_confidence: float
    pathology_distribution: List[PathologyScore]
    predicted_wagner_grade: int
    wagner_continuous_score: float
    wagner_details: WagnerScore
    dual_branch_telemetry: Dict[str, float]
    warnings: List[str] = Field(default_factory=list)


class ExplainRequest(BaseModel):
    request_id: str
    method: str = Field(description="gradcam | swin_attention | integrated_gradients | kernel_shap")
    target_class: Optional[str] = None


class ExplainResponse(BaseModel):
    request_id: str
    method: str
    target_class: str
    overlay_base64: str
    attribution_mean: float
    peak_coordinates: Tuple[float, float]
    description: str


class ModelInfoResponse(BaseModel):
    model_name: str
    version: str
    architecture: str
    parameters_total: int
    input_resolution: Tuple[int, int]
    normalization: Dict[str, List[float]]
    supported_classes: List[str]
    wagner_grade_range: Tuple[int, int]
    available_explainability_methods: List[str]
