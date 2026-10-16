import torch
import torch.nn.functional as F
import numpy as np
import io
import base64
from PIL import Image
from typing import Dict, Any, Tuple


def apply_colormap_turbo(normalized_grid: np.ndarray) -> np.ndarray:
    """
    Applies high-visibility Turbo colormap to 2D numpy array [H, W] (0..1)
    Returns [H, W, 4] RGBA uint8 array
    """
    t = np.clip(normalized_grid, 0.0, 1.0)
    r = np.sin(t * np.pi * 1.5 - 0.5) * 127 + 128
    g = np.sin(t * np.pi) * 220
    b = np.cos(t * np.pi * 1.4) * 140 + 100

    r = np.clip(r, 0, 255).astype(np.uint8)
    g = np.clip(g, 0, 255).astype(np.uint8)
    b = np.clip(b, 0, 255).astype(np.uint8)
    alpha = np.where(t < 0.12, (t * 8 * 80).astype(np.uint8), (170 + t * 80).astype(np.uint8))

    rgba = np.stack([r, g, b, alpha], axis=-1)
    return rgba


def encode_image_base64(rgba_array: np.ndarray) -> str:
    pil_img = Image.fromarray(rgba_array, mode="RGBA")
    buffered = io.BytesIO()
    pil_img.save(buffered, format="PNG")
    b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"


def compute_gradcam(model: torch.nn.Module, input_tensor: torch.Tensor, target_class_idx: int) -> Dict[str, Any]:
    """
    Grad-CAM: Gradient-weighted Class Activation Mapping
    Targeting the final convolutional stage of the CNN branch.
    """
    model.eval()
    input_tensor = input_tensor.clone().requires_grad_(True)
    
    outputs = model(input_tensor)
    logits = outputs["pathology_logits"]
    feature_maps = outputs["cnn_feature_maps"]

    score = logits[0, target_class_idx]
    grads = torch.autograd.grad(score, feature_maps, retain_graph=False)[0]

    # Global average pooling of gradients
    weights = grads.mean(dim=(2, 3), keepdim=True)
    cam = (weights * feature_maps).sum(dim=1, keepdim=True)
    cam = F.relu(cam)

    cam_upsampled = F.interpolate(cam, size=(384, 384), mode="bilinear", align_corners=False)
    cam_np = cam_upsampled.squeeze().detach().cpu().numpy()
    
    max_val = np.max(cam_np)
    if max_val > 0:
        cam_np = cam_np / max_val

    rgba = apply_colormap_turbo(cam_np)
    base64_url = encode_image_base64(rgba)

    # Calculate peak coordinates
    peak_y, peak_x = np.unravel_index(np.argmax(cam_np), cam_np.shape)

    return {
        "method": "gradcam",
        "overlay_base64": base64_url,
        "attribution_mean": float(np.mean(cam_np)),
        "peak_coordinates": (float(peak_x / 384), float(peak_y / 384)),
        "description": "Grad-CAM backpropagates target class gradients into the final convolutional stage of EfficientNetV2-S."
    }


def compute_integrated_gradients(model: torch.nn.Module, input_tensor: torch.Tensor, target_class_idx: int, steps: int = 20) -> Dict[str, Any]:
    """
    Integrated Gradients: Riemann sum path integral from a black baseline.
    """
    model.eval()
    baseline = torch.zeros_like(input_tensor)
    alphas = torch.linspace(0, 1, steps, device=input_tensor.device)
    
    accumulated_grads = torch.zeros_like(input_tensor)
    for alpha in alphas:
        interpolated = (baseline + alpha * (input_tensor - baseline)).requires_grad_(True)
        outputs = model(interpolated)
        score = outputs["pathology_logits"][0, target_class_idx]
        grad = torch.autograd.grad(score, interpolated)[0]
        accumulated_grads += grad

    avg_grads = accumulated_grads / steps
    attribution = (input_tensor - baseline) * avg_grads
    attribution_map = attribution.abs().sum(dim=1).squeeze().detach().cpu().numpy()

    # Normalize
    max_val = np.max(attribution_map)
    if max_val > 0:
        attribution_map = attribution_map / max_val

    rgba = apply_colormap_turbo(attribution_map)
    base64_url = encode_image_base64(rgba)
    peak_y, peak_x = np.unravel_index(np.argmax(attribution_map), attribution_map.shape)

    return {
        "method": "integrated_gradients",
        "overlay_base64": base64_url,
        "attribution_mean": float(np.mean(attribution_map)),
        "peak_coordinates": (float(peak_x / 384), float(peak_y / 384)),
        "description": "Integrated Gradients computes path integrals against a black baseline, satisfying completeness and sensitivity axioms."
    }
