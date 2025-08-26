import logging
import os

import firebase_admin
from dotenv import load_dotenv
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth, credentials
from pydantic import BaseModel

security = HTTPBearer()

load_dotenv()


class UserData(BaseModel):
    email: str
    uid: str


def _ensure_firebase_initialized() -> None:
    if firebase_admin._apps:
        return

    cred_path = os.getenv("FIREBASE_CREDENTIALS")
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")

    if not project_id:
        raise RuntimeError("GOOGLE_CLOUD_PROJECT must be set")
    if not cred_path:
        raise RuntimeError("FIREBASE_CREDENTIALS must be set to a valid JSON file path")
    if not os.path.exists(cred_path):
        raise RuntimeError(f"FIREBASE_CREDENTIALS path does not exist: {cred_path}")

    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, {"projectId": project_id})


async def get_current_user(
    credentials_data: HTTPAuthorizationCredentials = Security(security),
) -> UserData:
    _ensure_firebase_initialized()

    token = credentials_data.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        email = decoded_token.get("email")
        if not email:
            raise HTTPException(status_code=401, detail="User email not found in token")
        return UserData(email=email, uid=decoded_token.get("uid"))
    except Exception as exc:  # noqa: BLE001 - surface auth errors as 401
        raise HTTPException(
            status_code=401, detail=f"Invalid authentication credentials: {exc}"
        )
