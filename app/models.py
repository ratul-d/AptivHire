from sqlalchemy import Column,Integer,String,Text,ForeignKey,Float,DateTime
from app.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer,primary_key=True,index=True)
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)
    title = Column(String,nullable=False)
    summary = Column(Text,nullable=True)
    skills = Column(Text, nullable=True)
    experience_required = Column(Text, nullable=True)
    education_required = Column(Text, nullable=True)
    responsibilities = Column(Text, nullable=True)


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer,primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(Text, nullable=False)
    email = Column(String, index=True, nullable=False)
    phone = Column(String, nullable=True)
    skills = Column(Text, nullable=True)
    education = Column(Text, nullable=True)
    experience = Column(Text, nullable=True)
    certifications = Column(Text, nullable=True)

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    job_title = Column(Text, nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    candidate_name = Column(Text, nullable=False)
    match_score = Column(Float, nullable=False)
    reasoning = Column(Text, nullable=False)
    missing_skills = Column(Text, nullable=True)
    missing_experience = Column(Text, nullable=True)
    missing_education = Column(Text, nullable=True)


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    candidate_name = Column(Text, nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    job_title = Column(Text, nullable=False)
    interview_time = Column(DateTime(timezone=True), nullable=False)
    format = Column(String, nullable=False)   #EG: "online", "onsite"
    invite_email = Column(String, nullable=False)