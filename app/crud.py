from sqlalchemy.orm import Session
from app import models
from app.schemas import job_schema,candidate_schema,match_schema,interview_schema, auth_schema
from app.auth import hash_password

# Auth CRUD
def get_user_by_email(db:Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: auth_schema.UserBase):
    db_user = models.User(
        email=user.email,
        hashed_password = hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Job CRUD
def create_job(db:Session, job:job_schema.JobBase):
    db_job = models.Job(
        user_id = job.user_id,
        title = job.title,
        summary = job.summary,
        skills = job.skills,
        experience_required = job.experience_required,
        education_required = job.education_required,
        responsibilities = job.responsibilities
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


def get_jobs(db: Session,user_id: int,skip: int=0,limit: int=100):
    return db.query(models.Job).filter(models.Job.user_id==user_id).offset(skip).limit(limit).all()

def get_job_by_id(db: Session, user_id: int,job_id: int):
    return db.query(models.Job).filter(models.Job.id == job_id,models.Job.user_id==user_id).first()


# Candidate CRUD
def create_candidate(db: Session,candidate:candidate_schema.CandidateBase):
    db_candidate = models.Candidate(
        user_id = candidate.user_id,
        name = candidate.name,
        email = candidate.email,
        phone = candidate.phone,
        skills = candidate.skills,
        education = candidate.education,
        experience = candidate.experience,
        certifications = candidate.certifications
    )
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

def get_candidates(db: Session,user_id: int,skip: int=0,limit: int=100):
    return db.query(models.Candidate).filter(models.Candidate.user_id==user_id).offset(skip).limit(limit).all()

def get_candidates_by_id(db:Session,user_id: int,candidate_id: int):
    return db.query(models.Candidate).filter(models.Candidate.id == candidate_id,models.Candidate.user_id==user_id).first()


# Match CRUD
def create_match(db: Session, match: match_schema.MatchBase):
    db_match = models.Match(
        user_id=match.user_id,
        job_id=match.job_id,
        job_title=match.job_title,
        candidate_id=match.candidate_id,
        candidate_name=match.candidate_name,
        match_score = match.match_score,
        reasoning = match.reasoning,
        missing_skills = match.missing_skills,
        missing_experience = match.missing_experience,
        missing_education = match.missing_education
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

def get_matches(db: Session,user_id: int,skip: int=0,limit: int=100):
    return db.query(models.Match).filter(models.Match.user_id==user_id).offset(skip).limit(limit).all()

def get_matches_by_job_and_candidate_id(db:Session,user_id: int,job_id: int, candidate_id: int):
    return db.query(models.Match).filter(
            models.Match.job_id == job_id,
            models.Match.candidate_id == candidate_id,models.Match.user_id==user_id).first()


# Interview CRUD
def create_interview(db: Session,interview: interview_schema.InterviewBase):
    db_interview = models.Interview(
        user_id= interview.user_id,
        candidate_id = interview.candidate_id,
        candidate_name = interview.candidate_name,
        job_id = interview.job_id,
        job_title = interview.job_title,
        interview_time = interview.interview_time,
        format = interview.format,
        invite_email = interview.invite_email
    )

    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview

def get_interviews(db: Session,user_id: int,skip: int=0,limit: int=100):
    return db.query(models.Interview).filter(models.Interview.user_id==user_id).offset(skip).limit(limit).all()

def get_interviews_by_job_and_candidate_id(db:Session,user_id: int,job_id: int,candidate_id: int):
    return db.query(models.Interview).filter(
        models.Interview.job_id == job_id,
        models.Interview.candidate_id == candidate_id,models.Interview.user_id==user_id).first()