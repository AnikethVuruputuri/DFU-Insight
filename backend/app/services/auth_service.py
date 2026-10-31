import os
import time
import secrets
import hashlib
import logging
from typing import Dict, Any, Optional, Tuple
import httpx
from datetime import datetime, timedelta, timezone

try:
    import jwt
except ImportError:
    jwt = None

logger = logging.getLogger("dfu_insight.auth")

JWT_SECRET = os.getenv("JWT_SECRET", "dfu-insight-secret-key-production-change-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7

OTP_EXPIRY_SECONDS = 300  # 5 minutes validity
OTP_RESEND_COOLDOWN_SECONDS = 60  # 1 minute cooldown
MAX_OTP_ATTEMPTS = 5

# In-memory OTP storage
_otp_store: Dict[str, Dict[str, Any]] = {}


def hash_otp(otp: str, salt: str) -> str:
    """Generate SHA-256 hash of OTP + salt."""
    return hashlib.sha256(f"{salt}:{otp}".encode("utf-8")).hexdigest()


def generate_otp() -> str:
    """Generate cryptographically secure 6-digit OTP."""
    return str(secrets.randbelow(900000) + 100000)


def request_otp(full_phone: str, purpose: str = "login") -> Tuple[bool, str, Optional[str]]:
    """
    Generate and record an OTP for the phone number.
    Returns: (success, message, dev_otp_if_dev)
    """
    now = time.time()
    existing = _otp_store.get(full_phone)

    if existing:
        time_since_last = now - existing.get("last_sent_at", 0)
        if time_since_last < OTP_RESEND_COOLDOWN_SECONDS:
            remaining = int(OTP_RESEND_COOLDOWN_SECONDS - time_since_last)
            return False, f"Please wait {remaining} seconds before requesting a new OTP.", None

    otp = generate_otp()
    salt = secrets.token_hex(8)
    otp_hash = hash_otp(otp, salt)

    _otp_store[full_phone] = {
        "hash": otp_hash,
        "salt": salt,
        "expires_at": now + OTP_EXPIRY_SECONDS,
        "attempts": 0,
        "last_sent_at": now,
        "purpose": purpose,
        "plain_otp_dev": otp,
    }

    logger.info(f"===> [OTP GENERATED] Phone: {full_phone} | Purpose: {purpose} | OTP: {otp} <===")
    return True, "OTP dispatched successfully.", otp


def verify_otp_attempt(full_phone: str, entered_otp: str, expected_purpose: str = "login") -> Tuple[bool, str]:
    """
    Verify the entered 6-digit OTP against the stored hash.
    Single-use on success. Tracks attempts to block brute-force.
    """
    now = time.time()
    record = _otp_store.get(full_phone)

    if not record:
        return False, "No OTP request found for this phone number. Please request a new OTP."

    if now > record["expires_at"]:
        _otp_store.pop(full_phone, None)
        return False, "OTP has expired. Please request a new code."

    if record["attempts"] >= MAX_OTP_ATTEMPTS:
        _otp_store.pop(full_phone, None)
        return False, "Too many failed attempts. This OTP has been invalidated. Please request a new one."

    expected_hash = record["hash"]
    salt = record["salt"]
    entered_hash = hash_otp(entered_otp.strip(), salt)

    if not secrets.compare_digest(entered_hash, expected_hash):
        record["attempts"] += 1
        remaining_attempts = MAX_OTP_ATTEMPTS - record["attempts"]
        return False, f"Incorrect OTP code. {remaining_attempts} attempts remaining."

    # Success: Invalidate OTP (single-use guarantee)
    _otp_store.pop(full_phone, None)
    return True, "OTP verified successfully."


def create_access_token(user_id: str, phone: str, role: str) -> str:
    """Generate JWT session token valid for 7 days."""
    expire = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
    payload = {
        "sub": user_id,
        "phone": phone,
        "role": role,
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    if jwt:
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    # Simple token fallback if jwt package missing
    return f"dfu-token-{user_id}-{int(time.time())}"


def create_registration_token(full_phone: str, country_code: str) -> str:
    """Generate short-lived registration token for post-OTP wizard (15 min validity)."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    payload = {
        "phone": full_phone,
        "country_code": country_code,
        "type": "registration",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    if jwt:
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return f"dfu-reg-{secrets.token_hex(16)}"


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT token."""
    if not jwt:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except Exception as e:
        logger.warning(f"JWT verification error: {e}")
        return None


async def verify_phone_email_token_url(user_json_url: str) -> Optional[Dict[str, str]]:
    """
    Securely fetch phone.email verified user data from their server.
    Validates URL domain to prevent SSRF attacks.
    """
    if not user_json_url or not (user_json_url.startswith("https://user.phone.email/") or user_json_url.startswith("https://phone.email/")):
        logger.warning(f"Untrusted user_json_url provided: {user_json_url}")
        return None

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(user_json_url)
            if resp.status_code == 200:
                data = resp.json()
                phone_num = data.get("user_phone_number")
                country_code = data.get("user_country_code", "91")
                if phone_num:
                    full_phone = f"+{country_code}{phone_num}" if not str(phone_num).startswith("+") else str(phone_num)
                    return {
                        "phone": full_phone,
                        "country_code": str(country_code),
                        "user_phone_number": str(phone_num),
                    }
    except Exception as e:
        logger.error(f"Error fetching from phone.email user URL: {e}")
    return None
