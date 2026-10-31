from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class SendOtpRequest(BaseModel):
    phone: str = Field(..., description="Mobile number (e.g. 9876543210 or +919876543210)")
    country_code: str = Field("91", description="Country calling code without plus, default 91")
    purpose: Literal["login", "register"] = Field("login", description="Authentication intention")


class SendOtpResponse(BaseModel):
    success: bool
    message: str
    phone: str
    dev_otp: Optional[str] = None
    is_registered: Optional[bool] = None


class VerifyOtpRequest(BaseModel):
    phone: str
    country_code: str = "91"
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit verification code")
    purpose: Literal["login", "register"] = "login"


class VerifyOtpResponse(BaseModel):
    success: bool
    message: str
    status: Literal["login", "needs_registration"]
    token: Optional[str] = None
    registration_token: Optional[str] = None
    user: Optional[Dict[str, Any]] = None


class LocationPayload(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    postal_code: Optional[str] = None
    source: Optional[Literal["gps", "manual"]] = None


class RegisterRequest(BaseModel):
    registration_token: str = Field(..., description="Temporary token issued after phone verification")
    role: Literal["patient", "doctor", "nurse"] = Field(..., description="User role (immutable after registration)")
    name: Optional[str] = None
    location: Optional[LocationPayload] = None


class RegisterResponse(BaseModel):
    success: bool
    message: str
    token: str
    user: Dict[str, Any]


class VerifyPhoneEmailRequest(BaseModel):
    user_json_url: str = Field(..., description="Phone.email JSON verification URL")


class UserProfileResponse(BaseModel):
    id: str
    phone: str
    country_code: str
    name: Optional[str] = None
    role: str
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    created_at: str
    last_login: Optional[str] = None
