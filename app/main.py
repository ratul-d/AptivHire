from fastapi import  FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import Base,engine
from app.routers import jobs,candidates,matches,interviews

Base.metadata.create_all(bind = engine)

app = FastAPI(title="Recruiting Muti-Agent System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs.router)
app.include_router(candidates.router)
app.include_router(matches.router)
app.include_router(interviews.router)