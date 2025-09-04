from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy.orm import Session
from .. import crud,schemas
from ..db import get_db
from ..agents.matcher import matcher_agent

router = APIRouter(prefix="/matches",tags=["Matches"])

@router.post("/",response_model=schemas.Match)
async def create_match(job_id: int, candidate_id: int,db: Session=Depends(get_db)):
    job = crud.get_job_by_id(db=db,job_id=job_id)
    if not job:
        raise HTTPException(status_code=404,detail=f"Job {job_id} not found")

    candidate =  crud.get_candidates_by_id(db=db,candidate_id=candidate_id)
    if not candidate:
        raise HTTPException(status_code=404,detail=f"Candidate {candidate_id} not found")

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
    """
    
    try:
        result = await matcher_agent.run(payload)
        match_data = result.output.model_dump()

        match_payload = {
            "job_id": job_dict["id"],
            "candidate_id": candidate_dict["id"],
            **match_data
        }

        return crud.create_match(db=db,match=schemas.MatchBase(**match_payload))
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

@router.get("/",response_model=list[schemas.Match])
def read_matches(skip: int=0,limit: int=100,db: Session=Depends(get_db)):
    return crud.get_matches(db=db,skip=skip,limit=limit)

@router.get("/{job_id}",response_model=schemas.Match)
def read_matches_by_id(job_id: int,db: Session=Depends(get_db)):
    db_match = crud.get_matches_by_id(db=db,job_id=job_id)
    if not db_match:
        raise HTTPException(status_code=404,detail="No matches with respect to Job ID")
    return db_match