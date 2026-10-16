# DFU Insight — Explainable Medical AI for Diabetic Foot Ulcers

**DFU-Wagner net (DFU-SIAM v3)**: An explainable AI research web application for diabetic foot ulcer (DFU) pathology classification and Wagner severity grading.

---

## 1. System Overview

DFU Insight integrates dual-branch deep learning representations with Explainable AI (XAI) to analyze photographic diabetic foot ulcer images.

### Key Capabilities
- **4-Class Pathology Classification**: *None*, *Infection*, *Ischaemia*, *Both* (Neuro-ischemic mixed).
- **5-Level Wagner Severity Staging**: Grade 0 (Pre-ulcerative/intact), Grade 1 (Superficial), Grade 2 (Deep to tendon/capsule), Grade 3 (Deep with abscess/osteomyelitis), Grade 4 (Forefoot gangrene).
- **Multi-Method Explainable AI**:
  - **Grad-CAM**: CNN feature map activation backpropagation (EfficientNetV2-S).
  - **Swin Token Attribution**: Shifted-window self-attention rollout across spatial token hierarchies.
  - **Integrated Gradients**: Axiomatic Riemann path integrals from a black reference baseline.
  - **KernelSHAP**: SLIC superpixel segmentation and weighted ridge regression marginal contributions.
- **Premium Medical Video Visualization**: High-resolution clinical medical animation video with subtle optical tomography laser scanning sweep and fallback poster rendering.

---

## 2. Technical Architecture

```
[Photographic Input (384×384×3)]
        │
   ┌────┴──────────────────────────┐
   ▼                               ▼
[Branch A: EfficientNetV2-S]   [Branch B: Swin-Tiny Transformer]
(Fused-MBConv Local Textures)   (Shifted-Window Self-Attention)
   │                               │
   └───────────────┬───────────────┘
                   ▼
     [Cross-Attention Fusion (512-d)]
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
[Pathology Softmax Head]  [Wagner Ordinal Grading Head]
(4-Class Distribution)    (Continuous Score & Grade 0–4)
```

---

## 3. Local Installation & Development

### Frontend Setup (Node.js 20+)
```bash
# Install dependencies
npm install

# Start Vite development server on port 3000
npm run dev
```

### Backend Setup (Python 3.10+)
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (Windows: python -m venv venv && venv\Scripts\activate)
python -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Docker Deployment
```bash
docker-compose up --build
```

---

## 4. API Endpoints

- `GET /health` — Verifies service status, loaded model weights, and compute device (CUDA/CPU).
- `GET /api/v1/model-info` — Returns architecture specifications, normalization parameters, and class labels.
- `POST /api/v1/predict` — Accepts multipart form data with image file; returns validated predictions and telemetry.
- `POST /api/v1/explain` — Generates attribution heatmap overlay for requested XAI method.

---

## 5. Automated Tests

```bash
# Run backend pytest suite
pytest backend/tests/test_api.py -v

# Run frontend build check
npm run build
```

---

## 6. Known Limitations & Research Disclaimer

1. **Non-Diagnostic Device**: DFU Insight is an investigational research prototype for academic evaluation and explainability research. It is not approved by regulatory authorities (FDA/CE) as a medical diagnostic device.
2. **Photographic Variation**: Extreme specular lighting glares or low-resolution camera sensors may influence edge gradients.
3. **Clinical Governance**: Any diabetic foot lesion exhibiting signs of ascending cellulitis, systemic sepsis, or critical limb ischemia requires immediate physical evaluation by qualified podiatric and vascular specialists.
