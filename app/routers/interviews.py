from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy.orm import Session
from app import crud
from app.schemas import interview_schema, job_schema, candidate_schema
from app.db import get_db
from app.agents.scheduler import interview_email_agent
from app.utils.gmail_helper import send_email
from app.models import User
from app.dependencies import get_current_user


router = APIRouter(prefix="/interviews",tags=["Interviews"])

@router.post("/create",response_model=interview_schema.Interview)
async def create_interview(interview: interview_schema.InterviewPOSTEndpoint, db: Session=Depends(get_db),current_user: User = Depends(get_current_user)):
    job = crud.get_job_by_id(db=db, job_id=interview.job_id,user_id=current_user["id"])
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {interview.job_id} not found")

    candidate = crud.get_candidates_by_id(db=db, candidate_id=interview.candidate_id,user_id=current_user["id"])
    if not candidate:
        raise HTTPException(status_code=404, detail=f"Candidate {interview.candidate_id} not found")

    job_dict = job_schema.Job.model_validate(job).model_dump()
    candidate_dict = candidate_schema.Candidate.model_validate(candidate).model_dump()

    existing_interview = crud.get_interviews_by_job_and_candidate_id(db=db,job_id=interview.job_id,candidate_id=interview.candidate_id,user_id=current_user["id"])
    if existing_interview:
        raise HTTPException(
            status_code=460,
            detail=f"Interview already exists for Job {interview.job_id} and Candidate {interview.candidate_id}"
        )

    job_no_id = {k: v for k, v in job_dict.items() if k != "id"}
    candidate_no_id = {k: v for k, v in candidate_dict.items() if k != "id"}

    job_no_title = {k: v for k, v in job_no_id.items() if k != "title"}
    candidate_no_name = {k: v for k, v in candidate_no_id.items() if k != "name"}

    job_text = " | ".join(f"{k}: {v}" for k, v in job_no_title.items())
    cand_text = " | ".join(f"{k}: {v}" for k, v in candidate_no_name.items())

    payload = f"""
        Job Details:
        {job_text}

        Candidate Details:
        {cand_text}
        
        Interview DateTime:
        {interview.interview_datetime.isoformat()}
        
        Interview Format:
        {interview.interview_format}
        """
    try:
        result = await interview_email_agent.run(payload)
        email_data = result.output.model_dump()
    except Exception as e:
        raise HTTPException(status_code=404,detail=f"Error at email generation: {e}")

    sent = await send_email(
        subject=email_data["subject"],
        body=email_data["body"],
        recipient_email=email_data["recipient_email"],
        reply_to=current_user["email"]
    )
    if not sent:
        raise HTTPException(status_code=500,detail="Failed to send interview email")

    interview_payload = {
        "user_id":current_user["id"],
        "candidate_id": candidate_dict["id"],
        "candidate_name": candidate_dict["name"],
        "job_id": job_dict["id"],
        "job_title": job_dict["title"],
        "interview_time": interview.interview_datetime.isoformat(),
        "format": interview.interview_format,
        "invite_email": candidate_dict["email"]
    }

    try:
        return crud.create_interview(db=db,interview=interview_schema.InterviewBase(**interview_payload))
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Error at interview db insertion:{e}")

@router.get("/read",response_model=list[interview_schema.Interview])
def read_interviews(skip: int=0,limit: int=100,db: Session=Depends(get_db),current_user: User = Depends(get_current_user)):
    return crud.get_interviews(db=db,skip=skip,limit=limit,user_id=current_user["id"])

@router.get("/{job_id}/{candidate_id}",response_model=interview_schema.Interview)
def read_interviews_by_job_and_candidate(job_id: int,candidate_id: int,db: Session=Depends(get_db),current_user: User = Depends(get_current_user)):
    db_interview = crud.get_interviews_by_job_and_candidate_id(db=db,job_id=job_id,candidate_id=candidate_id,user_id=current_user["id"])
    if not db_interview:
        raise HTTPException(status_code=404,detail=f"No interview found for Job ID {job_id} and Candidate ID {candidate_id}")
    return db_interview