from fastapi import  FastAPI
from .db import Base,engine
from .routers import jobs,candidates,matches,interviews

Base.metadata.create_all(bind = engine)

app = FastAPI(title="Recruiting Muti-Agent System API")

app.include_router(jobs.router)
app.include_router(candidates.router)
app.include_router(matches.router)
app.include_router(interviews.router)