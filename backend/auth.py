import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK
try:
    # Check if app is already initialized to prevent multiple initializations
    if not firebase_admin._apps:
        # Try to use environment variable for credentials path
        cred_path = os.getenv('FIREBASE_CREDENTIALS')
        project_id = os.getenv('GOOGLE_CLOUD_PROJECT', 'charge-trails')
        
        if cred_path and os.path.exists(cred_path):
            print(f"Using Firebase credentials from: {cred_path}")
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {
                'projectId': project_id
            })
        else:
            # For production, we must have valid credentials
            raise ValueError("Firebase credentials file not found. Set the FIREBASE_CREDENTIALS environment variable.")
            
            # For development only (uncomment if needed):
            # print("No credentials file found. Creating default app with projectId only.")
            # firebase_admin.initialize_app(options={
            #     'projectId': project_id
            # })
except Exception as e:
    print(f"Firebase initialization failed: {str(e)}")
    raise  # Re-raise the exception in production

security = HTTPBearer()

class UserData(BaseModel):
    email: str
    uid: str

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> UserData:
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
        # Production error handling - return proper HTTP exceptions
        raise HTTPException(
            status_code=401,
            detail=f"Invalid authentication credentials: {str(e)}"
        )
        
        # For development only (uncomment if needed):
        # print(f"Authentication error: {str(e)}")
        # print("Using test user: test@example.com")
        # return UserData(email="test@example.com", uid="test-uid-123")