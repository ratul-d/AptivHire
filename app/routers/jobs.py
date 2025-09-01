from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..  import crud, schemas
from ..db import get_db
from ..agents.jd_agent import jd_agent

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/",response_model=schemas.Job)
async def create_job(jd_input: schemas.JDInput, db: Session=Depends(get_db)):
    try:
        result = await jd_agent.run(jd_input.raw_text)
        job_data = result.output.dict()

        return crud.create_job(db=db, job=schemas.JobBase(**job_data))
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

@router.get("/",response_model=list[schemas.Job])
def read_jobs(skip: int=0,limit: int=100, db: Session=Depends(get_db)):
    return crud.get_jobs(db=db,skip=skip,limit=limit)

@router.get("/{job_id}",response_model=schemas.Job)
def read_jobs_by_id(job_id: int, db: Session=Depends(get_db)):
    db_job = crud.get_job_by_id(db=db,job_id=job_id)
    if not db_job:
        raise HTTPException(status_code=404, detail="Not Found")
    return db_job