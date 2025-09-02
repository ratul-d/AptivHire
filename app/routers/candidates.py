from fastapi import APIRouter,HTTPException, Depends
from sqlalchemy.orm import Session
from .. import crud,schemas
from ..db import get_db
from ..agents.cv_agent import cv_agent


router = APIRouter(prefix="/candidates",tags=["Candidates"])

@router.post("/",response_model=schemas.Candidate)
async def create_candidate(cv_input: schemas.CVInput,db: Session=Depends(get_db)):
    try:
        result = await cv_agent.run(cv_input.raw_text)
        cv_data = result.output.dict()

        return crud.create_candidate(db=db,candidate=schemas.CandidateBase(**cv_data))
    except Exception as e:
        raise HTTPException(status_code=404,detail=str(e))

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