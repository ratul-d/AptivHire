from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy.orm import Session
from .. import crud,schemas
from ..db import get_db

router = APIRouter(prefix="/matches",tags=["Matches"])

@router.post("/",response_model=schemas.Match)
def create_match(match: schemas.MatchBase,db: Session=Depends(get_db)):
    return crud.create_match(db=db,match=match)

@router.get("/",response_model=list[schemas.Match])
def read_matches(skip: int=0,limit: int=100,db: Session=Depends(get_db)):
    return crud.get_matches(db=db,skip=skip,limit=limit)

@router.get("/{job_id}",response_model=schemas.Match)
def read_matches_by_id(job_id: int,db: Session=Depends(get_db)):
    db_match = crud.get_matches_by_id(db=db,job_id=job_id)
    if not db_match:
        raise HTTPException(status_code=404,detail="No matches with respect to Job ID")
    return db_match