from pydantic import BaseModel
from typing import Optional


class MatchBase(BaseModel):
    user_id: int
    job_id: Optional[int] = None
    job_title: Optional[str] = None
    candidate_id: Optional[int] = None
    candidate_name: Optional[str] = None
    match_score: Optional[float] = None
    reasoning: Optional[str] = None
    missing_skills: Optional[str] = None
    missing_experience: Optional[str] = None
    missing_education: Optional[str] = None

    model_config = {"from_attributes": True}

class Match(MatchBase):
    id: int


class MatchLLMOutput(BaseModel):
    match_score: int
    reasoning: Optional[str] = None
    missing_skills: Optional[str] = None
    missing_experience: Optional[str] = None
    missing_education: Optional[str] = None

class MatchPOSTEndpoint(BaseModel):
    job_id: Optional[int] = None
    candidate_id: Optional[int] = None