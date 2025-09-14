from pydantic import BaseModel, EmailStr
from typing import Optional


class CandidateBase(BaseModel):
    user_id: int
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    skills: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    certifications: Optional[str] = None

    model_config = {"from_attributes": True}

class Candidate(CandidateBase):
    id: int


class CVInput(BaseModel):
    raw_text: str

class CVOutput(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    skills: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    certifications: Optional[str] = None

    model_config = {"from_attributes": True}