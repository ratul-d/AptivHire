from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app  import crud
from app.schemas import job_schema
from app.db import get_db
from app.agents.jd_agent import jd_agent
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/create",response_model=job_schema.Job)
async def create_job(jd_input: job_schema.JDInput, db: Session=Depends(get_db),current_user: User = Depends(get_current_user)):
    try:
        result = await jd_agent.run(jd_input.raw_text)
        job_data = result.output.dict()

        job_payload={
            "user_id":current_user["id"],
            **job_data
        }

        return crud.create_job(db=db, job=job_schema.JobBase(**job_payload))
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

@router.get("/read",response_model=list[job_schema.Job])
def read_jobs(skip: int=0,limit: int=100, db: Session=Depends(get_db),current_user: User = Depends(get_current_user)):
    return crud.get_jobs(db=db,user_id=current_user["id"],skip=skip,limit=limit)

@router.get("/{job_id}",response_model=job_schema.Job)
def read_jobs_by_id(job_id: int, db: Session=Depends(get_db),current_user: User = Depends(get_current_user)):
    db_job = crud.get_job_by_id(db=db,user_id=current_user["id"],job_id=job_id)
    if not db_job:
        raise HTTPException(status_code=404, detail="Not Found")
    return db_job