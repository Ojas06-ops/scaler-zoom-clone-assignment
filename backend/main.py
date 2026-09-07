from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import meetings, participants

app = FastAPI(title="Zoom Clone API", version="0.1.0")

# ---------------------------------------------------------------------------
# CORS — allow the Next.js dev server on :3000
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
