from pydantic import BaseModel
from typing import Optional


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