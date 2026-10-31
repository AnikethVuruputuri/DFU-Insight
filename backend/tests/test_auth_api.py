import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_auth_full_registration_and_login_flow():
    test_phone = "9876543210"
    country_code = "91"
    full_phone = "+919876543210"

    # 1. Login attempt with unregistered phone should fail gracefully
    resp_unreg = client.post(
        "/api/v1/auth/send-otp",
        json={"phone": test_phone, "country_code": country_code, "purpose": "login"},
    )
    assert resp_unreg.status_code == 200
    data_unreg = resp_unreg.json()
    assert data_unreg["success"] is False
    assert data_unreg["is_registered"] is False

    # 2. Registration: Request OTP
    resp_send = client.post(
        "/api/v1/auth/send-otp",
        json={"phone": test_phone, "country_code": country_code, "purpose": "register"},
    )
    assert resp_send.status_code == 200
    data_send = resp_send.json()
    assert data_send["success"] is True
    dev_otp = data_send["dev_otp"]
    assert dev_otp is not None
    assert len(dev_otp) == 6

    # 3. Verify OTP with incorrect code should fail
    resp_wrong = client.post(
        "/api/v1/auth/verify-otp",
        json={"phone": test_phone, "country_code": country_code, "otp": "000000", "purpose": "register"},
    )
    assert resp_wrong.status_code == 400

    # 4. Verify OTP with correct code -> should return registration_token
    resp_verify = client.post(
        "/api/v1/auth/verify-otp",
        json={"phone": test_phone, "country_code": country_code, "otp": dev_otp, "purpose": "register"},
    )
    assert resp_verify.status_code == 200
    data_verify = resp_verify.json()
    assert data_verify["success"] is True
    assert data_verify["status"] == "needs_registration"
    reg_token = data_verify["registration_token"]
    assert reg_token is not None

    # 5. Complete registration with role 'doctor' and location
    resp_reg = client.post(
        "/api/v1/auth/register",
        json={
            "registration_token": reg_token,
            "role": "doctor",
            "name": "Dr. Sarah Rao",
            "location": {
                "latitude": 19.0760,
                "longitude": 72.8777,
                "accuracy": 15.0,
                "address": "KEM Hospital, Parel, Mumbai",
                "city": "Mumbai",
                "state": "Maharashtra",
                "country": "India",
                "postal_code": "400012",
                "source": "gps",
            },
        },
    )
    assert resp_reg.status_code == 200
    data_reg = resp_reg.json()
    assert data_reg["success"] is True
    jwt_token = data_reg["token"]
    user = data_reg["user"]
    assert user["role"] == "doctor"
    assert user["name"] == "Dr. Sarah Rao"

    # 6. Verify Authenticated /me endpoint
    resp_me = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert resp_me.status_code == 200
    me = resp_me.json()
    assert me["role"] == "doctor"
    assert me["phone"] == full_phone

    # 7. Subsequent login for registered user
    resp_login_otp = client.post(
        "/api/v1/auth/send-otp",
        json={"phone": test_phone, "country_code": country_code, "purpose": "login"},
    )
    assert resp_login_otp.status_code == 200
    login_otp = resp_login_otp.json()["dev_otp"]

    resp_login_verify = client.post(
        "/api/v1/auth/verify-otp",
        json={"phone": test_phone, "country_code": country_code, "otp": login_otp, "purpose": "login"},
    )
    assert resp_login_verify.status_code == 200
    data_login = resp_login_verify.json()
    assert data_login["status"] == "login"
    assert data_login["user"]["role"] == "doctor"
