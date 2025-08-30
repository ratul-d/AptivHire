from fastapi import APIRouter,HTTPException, Depends
from sqlalchemy.orm import Session
from .. import crud,schemas
from ..db import get_db


router = APIRouter(prefix="/candidates",tags=["Candidates"])

@router.post("/",response_model=schemas.Candidate)
def create_candidate(candidate: schemas.CandidateBase,db: Session=Depends(get_db)):
    return crud.create_candidate(db=db,candidate=candidate)

@router.get("/",response_model=list[schemas.Candidate])
def read_candidates(skip: int=0, limit: int=100, db: Session=Depends(get_db)):
    return crud.get_candidates(db=db,skip=skip,limit=limit)

@router.get("/{candidate_id}",response_model=schemas.Candidate)
def read_candidates_by_id(candidate_id: int,db: Session=Depends(get_db)):
    db_candidate = crud.get_candidates_by_id(db=db,candidate_id=candidate_id)
    if not db_candidate:
        raise HTTPException(status_code=404,detail="Candidate Not Found")
    else:
        return db_candidate