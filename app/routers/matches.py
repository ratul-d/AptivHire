from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy.orm import Session
from app import crud
from app.schemas import match_schema, job_schema, candidate_schema
from app.db import get_db
from app.agents.matcher import matcher_agent
from app.models import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/matches",tags=["Matches"])

@router.post("/create",response_model=match_schema.Match)
async def create_match(match: match_schema.MatchPOSTEndpoint,db: Session=Depends(get_db),current_user: User = Depends(get_current_user)):
    job = crud.get_job_by_id(db=db,job_id=match.job_id,user_id=current_user["id"])
    if not job:
        raise HTTPException(status_code=404,detail=f"Job {match.job_id} not found")

    candidate =  crud.get_candidates_by_id(db=db,candidate_id=match.candidate_id,user_id=current_user["id"])
    if not candidate:
        raise HTTPException(status_code=404,detail=f"Candidate {match.candidate_id} not found")

    existing_match = crud.get_matches_by_job_and_candidate_id(db=db,job_id=match.job_id, candidate_id=match.candidate_id,user_id=current_user["id"])
    if existing_match:
        return existing_match

    job_dict = job_schema.Job.model_validate(job).model_dump()
    candidate_dict = candidate_schema.Candidate.model_validate(candidate).model_dump()

    job_no_id = {k: v for k, v in job_dict.items() if k != "id"}
    candidate_no_id = {k: v for k, v in candidate_dict.items() if k != "id"}

    job_no_title = {k: v for k, v in job_no_id.items() if k != "title"}
    candidate_no_name = {k: v for k, v in candidate_no_id.items() if k != "name"}

    job_text = " | ".join(f"{k}: {v}" for k, v in job_no_title.items())
    cand_text = " | ".join(f"{k}: {v}" for k, v in candidate_no_name.items())

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
            "user_id":current_user["id"],
            "job_id": job_dict["id"],
            "job_title": job_dict["title"],
            "candidate_id": candidate_dict["id"],
            "candidate_name": candidate_dict["name"],
            **match_data
        }

        return crud.create_match(db=db,match=match_schema.MatchBase(**match_payload))
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

@router.get("/read",response_model=list[match_schema.Match])
def read_matches(skip: int=0,limit: int=100,db: Session=Depends(get_db),current_user: User = Depends(get_current_user)):
    return crud.get_matches(db=db,skip=skip,limit=limit,user_id=current_user["id"])

@router.get("/{job_id}/{candidate_id}", response_model=match_schema.Match)
def read_match_by_job_and_candidate(job_id: int, candidate_id: int, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    db_match = crud.get_matches_by_job_and_candidate_id(db=db, job_id=job_id, candidate_id=candidate_id,user_id=current_user["id"])
    if not db_match:
        raise HTTPException(status_code=404, detail=f"No match found for Job ID {job_id} and Candidate ID {candidate_id}")
    return db_match