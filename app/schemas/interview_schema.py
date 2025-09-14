from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")

class InterviewBase(BaseModel):
    user_id: int
    candidate_id: Optional[int] = None
    candidate_name: Optional[str] = None
    job_id: Optional[int] = None
    job_title: Optional[str] = None
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