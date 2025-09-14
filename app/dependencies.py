from fastapi import HTTPException,status,Depends
from app.auth import decode_token
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials

bearer_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials
    if not isinstance(token, str) or token.count(".") != 2:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Malformed token")

    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token is not an access token")


    return {
            "id": payload["sub"],
            "email": payload.get("email")
        }