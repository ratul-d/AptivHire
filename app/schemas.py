from pydantic import BaseModel, EmailStr
from typing import Optional

class JobBase(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    skills: Optional[str] = None
    experience_required: Optional[str] = None
    education_required: Optional[str] = None
    responsibilities: Optional[str] = None

    class Config:
        orm_mode = True

class CandidateBase(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    skills: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    certifications: Optional[str] = None

    class Config:
        orm_mode = True

class MatchBase(BaseModel):
    job_id: Optional[int] = None
    candidate_id: Optional[int] = None
    match_score: Optional[float] = None
    missing_skills: Optional[str] = None

    class Config:
        orm_mode = True

class InterviewBase(BaseModel):
    candidate_id: Optional[int] = None
    job_id: Optional[int] = None
    interview_time: Optional[str] = None
    format: Optional[str] = None
    invite_email: Optional[EmailStr] = None

    class Config:
        orm_mode=True