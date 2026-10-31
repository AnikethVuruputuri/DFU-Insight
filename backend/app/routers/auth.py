import logging
from fastapi import APIRouter, HTTPException, Depends, Header, status
from typing import Optional

from backend.app.schemas.auth_schemas import (
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    RegisterRequest,
    RegisterResponse,
    VerifyPhoneEmailRequest,
    UserProfileResponse,
)
from backend.app.services.supabase_client import (
    get_user_by_phone,
    get_user_by_id,
    create_user,
    update_last_login,
)
from backend.app.services.auth_service import (
    request_otp,
    verify_otp_attempt,
    create_access_token,
    create_registration_token,
    decode_token,
    verify_phone_email_token_url,
)

logger = logging.getLogger("dfu_insight.auth_router")
router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


def normalize_phone(raw_phone: str, country_code: str = "91") -> str:
    """Normalize phone input to standard E.164-like format: e.g. '+919876543210'."""
    clean_digits = "".join(filter(str.isdigit, raw_phone))
    clean_cc = "".join(filter(str.isdigit, country_code)) or "91"
    
    if raw_phone.startswith("+"):
        return f"+{clean_digits}"
    
    # If the digits already start with the country code (e.g. 919876543210 where length is 12)
    if clean_digits.startswith(clean_cc) and len(clean_digits) > len(clean_cc) + 6:
        return f"+{clean_digits}"
    
    return f"+{clean_cc}{clean_digits}"


async def get_current_user(authorization: Optional[str] = Header(None)):
    """Dependency to extract and validate authenticated user from Bearer JWT."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header. Please sign in.",
        )
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token. Please sign in again.",
        )
    user_id = payload.get("sub")
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account associated with this session no longer exists.",
        )
    return user


@router.post("/send-otp", response_model=SendOtpResponse)
async def send_otp(req: SendOtpRequest):
    """
    Step 1: Check mobile number status and dispatch 6-digit OTP via SMS (or dev fallback).
    Enforces rate-limits and registration check.
    """
    full_phone = normalize_phone(req.phone, req.country_code)
    existing_user = get_user_by_phone(full_phone)

    if req.purpose == "login" and not existing_user:
        return SendOtpResponse(
            success=False,
            message="This mobile number is not registered. Please sign up first to create an account.",
            phone=full_phone,
            is_registered=False,
        )

    if req.purpose == "register" and existing_user:
        return SendOtpResponse(
            success=False,
            message="This mobile number is already registered. Please sign in instead.",
            phone=full_phone,
            is_registered=True,
        )

    success, msg, dev_otp = request_otp(full_phone, purpose=req.purpose)
    if not success:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=msg)

    return SendOtpResponse(
        success=True,
        message=f"A 6-digit OTP has been dispatched to {full_phone}.",
        phone=full_phone,
        dev_otp=dev_otp,
        is_registered=bool(existing_user),
    )


@router.post("/verify-otp", response_model=VerifyOtpResponse)
async def verify_otp(req: VerifyOtpRequest):
    """
    Step 2: Verify 6-digit OTP.
    - If Login: returns JWT token + user profile with saved role.
    - If Register: returns temporary registration token to proceed with role & location.
    """
    full_phone = normalize_phone(req.phone, req.country_code)
    is_valid, msg = verify_otp_attempt(full_phone, req.otp, expected_purpose=req.purpose)

    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    existing_user = get_user_by_phone(full_phone)

    if existing_user:
        # Existing user login
        update_last_login(existing_user["id"])
        token = create_access_token(
            user_id=existing_user["id"],
            phone=existing_user["phone"],
            role=existing_user["role"],
        )
        return VerifyOtpResponse(
            success=True,
            message="OTP verified. Welcome back!",
            status="login",
            token=token,
            user={
                "id": existing_user["id"],
                "phone": existing_user["phone"],
                "role": existing_user["role"],
                "name": existing_user.get("name"),
                "city": existing_user.get("city"),
                "state": existing_user.get("state"),
                "created_at": existing_user.get("created_at"),
            },
        )
    else:
        # Unregistered user -> proceed to registration wizard
        clean_cc = "".join(filter(str.isdigit, req.country_code)) or "91"
        reg_token = create_registration_token(full_phone, clean_cc)
        return VerifyOtpResponse(
            success=True,
            message="Phone verified. Please select your clinical role and location.",
            status="needs_registration",
            registration_token=reg_token,
        )


@router.post("/register", response_model=RegisterResponse)
async def complete_registration(req: RegisterRequest):
    """
    Step 3-5: Finalize user registration with verified phone, selected role, and optional location.
    Role is strictly immutable after this step.
    """
    payload = decode_token(req.registration_token)
    if not payload or payload.get("type") != "registration":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Registration session has expired or is invalid. Please verify your phone number again.",
        )

    full_phone = payload.get("phone")
    country_code = payload.get("country_code", "91")

    # Guard against duplicate registration
    existing_user = get_user_by_phone(full_phone)
    if existing_user:
        token = create_access_token(existing_user["id"], existing_user["phone"], existing_user["role"])
        return RegisterResponse(
            success=True,
            message="Account already exists. Logged in successfully.",
            token=token,
            user=existing_user,
        )

    location_data = req.location.model_dump() if req.location else {}

    new_user_data = {
        "phone": full_phone,
        "country_code": country_code,
        "name": req.name.strip() if req.name else None,
        "role": req.role.lower(),
        "latitude": location_data.get("latitude"),
        "longitude": location_data.get("longitude"),
        "accuracy": location_data.get("accuracy"),
        "address": location_data.get("address"),
        "city": location_data.get("city"),
        "state": location_data.get("state"),
        "country": location_data.get("country") or "India",
        "postal_code": location_data.get("postal_code"),
        "location_source": location_data.get("source"),
    }

    created_user = create_user(new_user_data)
    token = create_access_token(created_user["id"], created_user["phone"], created_user["role"])

    return RegisterResponse(
        success=True,
        message=f"Account successfully created as {created_user['role'].capitalize()}.",
        token=token,
        user=created_user,
    )


@router.post("/verify-phone-email")
async def verify_phone_email(req: VerifyPhoneEmailRequest):
    """
    Integration endpoint for Phone.Email free verification widget.
    Receives user_json_url from the frontend callback, verifies on server, and returns session or registration token.
    """
    verified_data = await verify_phone_email_token_url(req.user_json_url)
    if not verified_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone.Email verification failed or URL is invalid.",
        )

    full_phone = verified_data["phone"]
    country_code = verified_data["country_code"]

    existing_user = get_user_by_phone(full_phone)
    if existing_user:
        update_last_login(existing_user["id"])
        token = create_access_token(existing_user["id"], existing_user["phone"], existing_user["role"])
        return {
            "status": "login",
            "token": token,
            "user": existing_user,
        }
    else:
        reg_token = create_registration_token(full_phone, country_code)
        return {
            "status": "needs_registration",
            "registration_token": reg_token,
            "phone": full_phone,
            "country_code": country_code,
        }


@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(user: dict = Depends(get_current_user)):
    """Retrieve verified profile of the currently authenticated user."""
    return UserProfileResponse(
        id=user["id"],
        phone=user["phone"],
        country_code=user.get("country_code", "91"),
        name=user.get("name"),
        role=user["role"],
        city=user.get("city"),
        state=user.get("state"),
        country=user.get("country"),
        created_at=user.get("created_at", ""),
        last_login=user.get("last_login"),
    )


@router.post("/logout")
async def logout_user():
    """Sign out endpoint."""
    return {"success": True, "message": "Signed out successfully."}
