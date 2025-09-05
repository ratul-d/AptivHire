from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy.orm import Session
from .. import schemas,crud
from ..db import get_db
from ..agents.scheduler import interview_email_agent
from ..utils.email_sender import send_email

router = APIRouter(prefix="/interviews",tags=["Interviews"])

@router.post("/",response_model=schemas.Interview)
async def create_interview(interview: schemas.InterviewPOSTEndpoint, db: Session=Depends(get_db)):
    job = crud.get_job_by_id(db=db, job_id=interview.job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {interview.job_id} not found")

    candidate = crud.get_candidates_by_id(db=db, candidate_id=interview.candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail=f"Candidate {interview.candidate_id} not found")

    job_dict = schemas.Job.model_validate(job).model_dump()
    candidate_dict = schemas.Candidate.model_validate(candidate).model_dump()

    job_no_id = {k: v for k, v in job_dict.items() if k != "id"}
    candidate_no_id = {k: v for k, v in candidate_dict.items() if k != "id"}

    job_text = " | ".join(f"{k}: {v}" for k, v in job_no_id.items())
    cand_text = " | ".join(f"{k}: {v}" for k, v in candidate_no_id.items())

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
        recipient_email=email_data["recipient_email"]
    )
    if not sent:
        raise HTTPException(status_code=500,detail="Failed to send interview email")

    interview_payload = {
        "candidate_id": candidate_dict["id"],
        "job_id": job_dict["id"],
        "interview_time": interview.interview_datetime.isoformat(),
        "format": interview.interview_format,
        "invite_email": candidate_dict["email"]
    }
    try:
        return crud.create_interview(db=db,interview=schemas.InterviewBase(**interview_payload))
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Error at interview db insertion:{e}")

@router.get("/",response_model=list[schemas.Interview])
def read_interviews(skip: int=0,limit: int=100,db: Session=Depends(get_db)):
    return crud.get_interviews(db=db,skip=skip,limit=limit)

@router.get("/{candidate_id}",response_model=schemas.Interview)
def read_interviews_by_id(candidate_id: int,db: Session=Depends(get_db)):
    db_candidate = crud.get_interviews_by_id(db=db,candidate_id=candidate_id)
    if not db_candidate:
        raise HTTPException(status_code=404,detail="Interview not found for this candidate ID")
    return db_candidate