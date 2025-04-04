import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

try:
    if not firebase_admin._apps:
        cred_path = os.getenv('FIREBASE_CREDENTIALS')
        project_id = os.getenv('GOOGLE_CLOUD_PROJECT', 'charge-trails')
        
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {
                'projectId': project_id
            })
        else:
            raise ValueError("Firebase credentials file not found. Set the FIREBASE_CREDENTIALS environment variable.")
            
except Exception as e:
    print(f"Firebase initialization failed: {str(e)}")
    raise

security = HTTPBearer()

class UserData(BaseModel):
    email: str
    uid: str

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        if not decoded_token.get("email"):
            raise HTTPException(
                status_code=401,
                detail="User email not found in token"
            )
        return UserData(email=decoded_token.get("email"), uid=decoded_token.get("uid"))
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid authentication credentials: {str(e)}"
        )
