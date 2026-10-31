import uuid
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.schemas.dfu_schemas import (
    HealthResponse,
    ModelInfoResponse,
    PredictionResponse,
    ExplainRequest,
    ExplainResponse,
)
from backend.app.services.inference import inference_service, PATHOLOGY_CLASSES
from backend.app.services.xai import compute_gradcam, compute_integrated_gradients
from backend.app.routers.auth import router as auth_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("dfu_insight")

app = FastAPI(
    title="DFU Insight Medical AI API",
    description="Explainable AI API for Diabetic Foot Ulcer Pathology Classification, Wagner Grading, and Clinical Authentication",
    version="3.2.0",
)

# Safe CORS configuration allowing local dev and production frontends (Vercel, Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount authentication router
app.include_router(auth_router)

MAX_UPLOAD_SIZE = 15 * 1024 * 1024  # 15 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png"}


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint reporting model status and device availability."""
    return HealthResponse(
        status="healthy",
        model_loaded=inference_service.model_loaded,
        device=str(inference_service.device),
        version="v3.2.0-rc4",
    )


@app.get("/api/v1/model-info", response_model=ModelInfoResponse)
async def get_model_info():
    """Returns technical architecture specifications, input dimensions, and label mappings."""
    return ModelInfoResponse(
        model_name="DFU-Wagner net (DFU-SIAM v3)",
        version="v3.2.0-rc4",
        architecture="Dual-Branch Feature Fusion (EfficientNetV2-S + Swin-Tiny Transformer)",
        parameters_total=50428160,
        input_resolution=(384, 384),
        normalization={
            "mean": [0.485, 0.456, 0.406],
            "std": [0.229, 0.224, 0.225],
        },
        supported_classes=PATHOLOGY_CLASSES,
        wagner_grade_range=(0, 4),
        available_explainability_methods=[
            "gradcam",
            "swin_attention",
            "integrated_gradients",
            "kernel_shap",
        ],
    )


@app.post("/api/v1/predict", response_model=PredictionResponse)
async def predict_wound(image: UploadFile = File(...)):
    """
    Accepts one photographic wound image via multipart form data.
    Executes dual-branch inference and returns pathology probabilities and Wagner grade.
    """
    if image.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported media type: {image.content_type}. Only JPG, JPEG, and PNG are accepted.",
        )

    image_bytes = await image.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(image_bytes) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="Uploaded file exceeds 15 MB limit.")

    req_id = f"dfu-py-{uuid.uuid4().hex[:10]}"
    logger.info(f"Processing inference request {req_id} ({len(image_bytes)} bytes)")

    try:
        prediction_result = inference_service.predict(image_bytes, request_id=req_id)
        return PredictionResponse(**prediction_result)
    except Exception as e:
        logger.error(f"Inference failed for {req_id}: {e}")
        raise HTTPException(status_code=500, detail="Inference execution failure. Please retry with a valid image.")


@app.post("/api/v1/explain", response_model=ExplainResponse)
async def explain_prediction(request: ExplainRequest):
    """
    Generates explainability attribution overlay for a validated request.
    Supports Grad-CAM and Integrated Gradients on the trained PyTorch model.
    """
    method = request.method.lower()
    if method not in ["gradcam", "integrated_gradients", "swin_attention", "kernel_shap"]:
        raise HTTPException(status_code=400, detail=f"Unsupported XAI method: {request.method}")

    target_idx = 0
    if request.target_class and request.target_class in PATHOLOGY_CLASSES:
        target_idx = PATHOLOGY_CLASSES.index(request.target_class)

    try:
        if method == "gradcam":
            result = compute_gradcam(inference_service.model, None, target_idx)
        else:
            result = compute_integrated_gradients(inference_service.model, None, target_idx)

        return ExplainResponse(
            request_id=request.request_id,
            method=method,
            target_class=request.target_class or PATHOLOGY_CLASSES[target_idx],
            overlay_base64=result["overlay_base64"],
            attribution_mean=result["attribution_mean"],
            peak_coordinates=result["peak_coordinates"],
            description=result["description"],
        )
    except Exception as e:
        logger.error(f"XAI generation failed: {e}")
        raise HTTPException(status_code=500, detail="Explainability generation failed.")
