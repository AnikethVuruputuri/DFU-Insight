import pytest
from fastapi.testclient import TestClient
from io import BytesIO
from PIL import Image

from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data
    assert "device" in data


def test_model_info_endpoint():
    response = client.get("/api/v1/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["model_name"] == "DFU-Wagner net (DFU-SIAM v3)"
    assert len(data["supported_classes"]) == 4
    assert data["wagner_grade_range"] == [0, 4]
    assert "gradcam" in data["available_explainability_methods"]


def test_predict_valid_image():
    # Create synthetic test image
    img = Image.new("RGB", (384, 384), color=(200, 150, 150))
    buf = BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    response = client.post(
        "/api/v1/predict",
        files={"image": ("test_wound.jpg", buf, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "request_id" in data
    assert data["predicted_pathology"] in ["None", "Infection", "Ischaemia", "Both"]
    assert 0 <= data["predicted_wagner_grade"] <= 4
    assert len(data["pathology_distribution"]) == 4
    assert "wagner_details" in data


def test_reject_unsupported_format():
    buf = BytesIO(b"fake text file content")
    response = client.post(
        "/api/v1/predict",
        files={"image": ("test.txt", buf, "text/plain")}
    )
    assert response.status_code == 400


def test_reject_empty_file():
    buf = BytesIO(b"")
    response = client.post(
        "/api/v1/predict",
        files={"image": ("empty.jpg", buf, "image/jpeg")}
    )
    assert response.status_code == 400


def test_explain_endpoint():
    response = client.post(
        "/api/v1/explain",
        json={
            "request_id": "test-req-001",
            "method": "gradcam",
            "target_class": "Infection"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["method"] == "gradcam"
    assert "overlay_base64" in data
    assert "attribution_mean" in data
