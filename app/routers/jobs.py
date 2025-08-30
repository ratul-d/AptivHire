from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..  import crud, schemas
from ..db import get_db

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/",response_model=schemas.Job)
def create_job(job: schemas.JobBase, db: Session=Depends(get_db)):
    return crud.create_job(db=db,job=job)

@router.get("/",response_model=list[schemas.Job])
def read_jobs(skip: int=0,limit: int=100, db: Session=Depends(get_db)):
    return crud.get_jobs(db=db,skip=skip,limit=limit)

@router.get("/{job_id}",response_model=schemas.Job)
def read_jobs_by_id(job_id: int, db: Session=Depends(get_db)):
    db_job = crud.get_job_by_id(db=db,job_id=job_id)
    if not db_job:
        raise HTTPException(status_code=404, detail="Not Found")
    return db_job