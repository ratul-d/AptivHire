from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy.orm import Session
from .. import schemas,crud
from ..db import get_db

router = APIRouter(prefix="/interviews",tags=["Interviews"])

@router.post("/",response_model=schemas.Interview)
def create_interview(interview: schemas.InterviewBase, db: Session=Depends(get_db)):
    return crud.create_interview(db=db,interview=interview)

@router.get("/",response_model=list[schemas.Interview])
def read_interviews(skip: int=0,limit: int=100,db: Session=Depends(get_db)):
    return crud.get_interviews(db=db,skip=skip,limit=limit)

@router.get("/{candidate_id}",response_model=schemas.Interview)
def read_interviews_by_id(candidate_id: int,db: Session=Depends(get_db)):
    db_candidate = crud.get_candidates_by_id(db=db,candidate_id=candidate_id)
    if not db_candidate:
        raise HTTPException(status_code=404,detail="Interview not found for this candidate ID")
    return db_candidate