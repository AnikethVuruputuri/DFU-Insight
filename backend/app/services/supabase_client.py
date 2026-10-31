import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import uuid

logger = logging.getLogger("dfu_insight.supabase")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

_supabase_client = None
_in_memory_users: Dict[str, Dict[str, Any]] = {}

if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client, Client
        _supabase_client: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase client initialized successfully with remote PostgreSQL.")
    except Exception as e:
        logger.warning(f"Failed to initialize Supabase client: {e}. Falling back to in-memory store.")
        _supabase_client = None
else:
    logger.info("Supabase credentials not configured in environment. Using robust in-memory store for development.")


def get_supabase():
    return _supabase_client


def get_user_by_phone(full_phone: str) -> Optional[Dict[str, Any]]:
    """Look up a user by their full international phone number (e.g. '+919876543210')."""
    if _supabase_client:
        try:
            res = _supabase_client.table("users").select("*").eq("phone", full_phone).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return None
        except Exception as e:
            logger.error(f"Supabase query error: {e}")
            # Fall back to in-memory check
            return _in_memory_users.get(full_phone)
    return _in_memory_users.get(full_phone)


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Look up a user by their unique user UUID."""
    if _supabase_client:
        try:
            res = _supabase_client.table("users").select("*").eq("id", user_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return None
        except Exception as e:
            logger.error(f"Supabase lookup by ID error: {e}")
            for u in _in_memory_users.values():
                if u.get("id") == user_id:
                    return u
            return None
    for u in _in_memory_users.values():
        if u.get("id") == user_id:
            return u
    return None


def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new user in Supabase users table."""
    full_phone = user_data["phone"]
    now_iso = datetime.now(timezone.utc).isoformat()
    
    user_record = {
        "id": str(uuid.uuid4()),
        "phone": full_phone,
        "country_code": user_data.get("country_code", "91"),
        "name": user_data.get("name"),
        "role": user_data["role"].lower(),
        "phone_verified": True,
        "latitude": user_data.get("latitude"),
        "longitude": user_data.get("longitude"),
        "accuracy": user_data.get("accuracy"),
        "address": user_data.get("address"),
        "city": user_data.get("city"),
        "state": user_data.get("state"),
        "country": user_data.get("country", "India"),
        "postal_code": user_data.get("postal_code"),
        "location_source": user_data.get("location_source"),
        "location_captured_at": now_iso if user_data.get("latitude") else None,
        "created_at": now_iso,
        "last_login": now_iso,
        "updated_at": now_iso,
    }

    if _supabase_client:
        try:
            res = _supabase_client.table("users").insert(user_record).execute()
            if res.data and len(res.data) > 0:
                created = res.data[0]
                _in_memory_users[full_phone] = created
                return created
        except Exception as e:
            logger.error(f"Supabase insert user error: {e}. Storing in memory fallback.")
    
    _in_memory_users[full_phone] = user_record
    return user_record


def update_last_login(user_id: str):
    """Update last_login timestamp."""
    now_iso = datetime.now(timezone.utc).isoformat()
    if _supabase_client:
        try:
            _supabase_client.table("users").update({"last_login": now_iso}).eq("id", user_id).execute()
        except Exception as e:
            logger.error(f"Supabase update last_login error: {e}")
    for u in _in_memory_users.values():
        if u.get("id") == user_id:
            u["last_login"] = now_iso
            break
