from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app import crud
from app.schemas import auth_schema
from app.auth import verify_password,create_access_token,create_refresh_token,decode_token
from app.db import get_db

router = APIRouter(prefix="/auth",tags=["Auth"])

@router.post("/register")
def register(user: auth_schema.UserBase, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db,user.email)
    if db_user:
        raise HTTPException(status_code=400,detail="Email already registered")
    new_user = crud.create_user(db=db,user=user)
    return {"msg": "User Created","user_id": new_user.id}

@router.post("/login")
def login(form: auth_schema.UserBase, db: Session=Depends(get_db)):
    user =crud.get_user_by_email(db,form.email)
    if not user or not verify_password(form.password,user.hashed_password):
        raise HTTPException(status_code=401,detail="Invalid Credentials")

    access_token = create_access_token({"sub":str(user.id),"email":user.email})
    refresh_token = create_refresh_token({"sub":str(user.id),"email":user.email})

    return {
        "msg":"Login Successful",
        "access_token":access_token,
        "refresh_token":refresh_token,
        "token_type":"bearer"
    }

@router.post("/refresh")
def refresh(refresh_request: auth_schema.RefreshRequest):
    payload = decode_token(refresh_request.refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Token is not a refresh token")
    new_access = create_access_token({"sub":payload["sub"],"email":payload["email"]})
    return {"msg": "Token Refreshed","access_token": new_access, "token_type": "bearer"}

@router.post("/logout")
def logout():
    #client side
    return {"msg":"Logged Out"}