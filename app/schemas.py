from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")

class JobBase(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    skills: Optional[str] = None
    experience_required: Optional[str] = None
    education_required: Optional[str] = None
    responsibilities: Optional[str] = None

    model_config = {"from_attributes": True}

class Job(JobBase):
    id: int

class JDInput(BaseModel):
    raw_text: str


class CandidateBase(BaseModel):
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


class MatchLLMOutput(BaseModel):
    match_score: int
    reasoning: Optional[str] = None
    missing_skills: Optional[str] = None
    missing_experience: Optional[str] = None
    missing_education: Optional[str] = None

class MatchBase(BaseModel):
    job_id: Optional[int] = None
    candidate_id: Optional[int] = None
    match_score: Optional[float] = None
    reasoning: Optional[str] = None
    missing_skills: Optional[str] = None
    missing_experience: Optional[str] = None
    missing_education: Optional[str] = None

    model_config = {"from_attributes": True}

class Match(MatchBase):
    id: int


class InterviewBase(BaseModel):
    candidate_id: Optional[int] = None
    job_id: Optional[int] = None
    interview_time: Optional[datetime] = None
    format: Optional[str] = None
    invite_email: Optional[EmailStr] = None

    model_config = {"from_attributes": True}

class Interview(InterviewBase):
    id: int

class InterviewPOSTEndpoint(BaseModel):
    job_id: Optional[int] = None
    candidate_id: Optional[int] = None
    interview_datetime: datetime = Field(
        ...,
        description="Date and time of the interview in IST (Asia/Kolkata)",
        example=datetime(2025, 9, 27, 9, 0, tzinfo=IST).isoformat()
    )
    interview_format: str = Field(..., description="Format of the interview")

class EmailContent(BaseModel):
    subject: str
    body: str
    recipient_email: EmailStr