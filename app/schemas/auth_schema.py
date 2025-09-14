from pydantic import BaseModel,constr

class UserBase(BaseModel):
    email: str
    password: constr(min_length=6)

class User(BaseModel):
    id: int

class RefreshRequest(BaseModel):
    refresh_token: str