import os.path
from fastapi import APIRouter,HTTPException, Depends, UploadFile,File
from sqlalchemy.orm import Session
from app import crud
from app.schemas import candidate_schema
from app.db import get_db
from app.agents.cv_agent import cv_agent
from app.utils.pdf_parser import extract_text_from_pdf


router = APIRouter(prefix="/candidates",tags=["Candidates"])

@router.post("/",response_model=candidate_schema.Candidate)
async def create_candidate(file: UploadFile = File(...),db: Session=Depends(get_db)):
    temp_path=f"temp_{file.filename}"
    try:
        with open(temp_path,"wb") as f:
            f.write(await file.read())

        pdf_data = extract_text_from_pdf(temp_path)
        cv_input = candidate_schema.CVInput(**pdf_data)


        result = await cv_agent.run(cv_input.raw_text)
        cv_data = result.output.dict()

        return crud.create_candidate(db=db,candidate=candidate_schema.CandidateBase(**cv_data))
    except Exception as e:
        raise HTTPException(status_code=404,detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.get("/",response_model=list[candidate_schema.Candidate])
def read_candidates(skip: int=0, limit: int=100, db: Session=Depends(get_db)):
    return crud.get_candidates(db=db,skip=skip,limit=limit)

@router.get("/{candidate_id}",response_model=candidate_schema.Candidate)
def read_candidates_by_id(candidate_id: int,db: Session=Depends(get_db)):
    db_candidate = crud.get_candidates_by_id(db=db,candidate_id=candidate_id)
    if not db_candidate:
        raise HTTPException(status_code=404,detail="Candidate Not Found")
    else:
        return db_candidate