from sqlalchemy.orm import Session
from . import models, schemas

# Job CRUD
def create_job(db:Session, job:schemas.JobBase):
    db_job = models.Job(
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


def get_jobs(db: Session,skip: int=0,limit: int=100):
    return db.query(models.Job).offset(skip).limit(limit).all

def get_job_by_id(db: Session,job_id: int):
    return db.query(models.Job).filter(models.Job.id == job_id).first()


# Candidate CRUD
def create_candidate(db: Session,candidate:schemas.CandidateBase):
    db_candidate = models.Candidate(
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

def get_candidates(db: Session,skip: int=0,limit: int=0):
    return db.query(models.Candidate).offset(skip).limit(limit).all

def get_candidates_by_id(db:Session,candidate_id: int):
    return db.query(models.Candidate).filter(models.Candidate.candidate_id == candidate_id).first()


# Match CRUD
def create_match(db: Session, match: schemas.MatchBase):
    db_match = models.Match(
        job_id=match.job_id,
        cnadidate_id=match.candidate_id,
        match_score = match.match_score,
        missing_skills = match.missing_skills
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

def get_matches(db: Session,skip: int=0,limit: int=0):
    return db.query(models.Match).offset(skip).limit(limit).all

def get_matches_by_id(db:Session,job_id: int):
    return db.query(models.Match).filter(models.Match.job_id == job_id).all()


# Interview CRUD
def create_interview(db: Session,interview: schemas.InterviewBase):
    db_interview = models.Interview(
        candidate_id = interview.candidate_id,
        job_id = interview.job_id,
        interview_time = interview.interview_time,
        format = interview.format,
        invite_email = interview.invite_email
    )

    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview

def get_interviews(db: Session,skip: int=0,limit: int=0):
    return db.query(models.Interview).offset(skip).limit(limit).all

def get_interviews_by_id(db:Session,candidate_id: int):
    return db.query(models.Interview).filter(models.Interview.candidate_id == candidate_id).all()
