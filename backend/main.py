from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, SessionLocal, engine
import models
from models import Meeting
from routers import meetings, participants
from seed import seed


# ---------------------------------------------------------------------------
# Lifespan: Auto-migrate & seed on startup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically create all tables if they don't already exist
    Base.metadata.create_all(bind=engine)

    # Startup check: if meetings table is empty, auto-run seed once
    db = SessionLocal()
    try:
        if db.query(Meeting).count() == 0:
            print("No meetings found in database. Running initial seed...")
            seed()
    finally:
        db.close()

    yield


app = FastAPI(title="Zoom Clone API", version="0.1.0", lifespan=lifespan)

# ---------------------------------------------------------------------------
# CORS — allow the Next.js dev server on :3000 and any Vercel deployment
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(meetings.router)
app.include_router(participants.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Zoom Clone API is running"}
