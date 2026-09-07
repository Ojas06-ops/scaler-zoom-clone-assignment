import random
import string
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Meeting, MeetingStatus, MeetingType, Participant, ParticipantRole, User
from schemas import JoinRequest, MeetingCreate, MeetingOut, ParticipantOut

router = APIRouter(prefix="/meetings", tags=["meetings"])

BASE_URL = "http://localhost:3000"
DEFAULT_HOST_ID = 1  # Demo User seeded in seed.py


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_code() -> str:
    """Generate a human-readable 9-digit code like '123-456-789'."""
    digits = "".join(random.choices(string.digits, k=9))
    return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"


def _get_meeting_or_404(meeting_code: str, db: Session) -> Meeting:
    meeting = db.query(Meeting).filter(Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail=f"Meeting '{meeting_code}' not found")
    return meeting


def _get_default_host(db: Session) -> User:
    host = db.query(User).filter(User.id == DEFAULT_HOST_ID).first()
    if not host:
        raise HTTPException(status_code=500, detail="Default host user not found — run seed.py first")
    return host


# ---------------------------------------------------------------------------
# POST /meetings/instant
# ---------------------------------------------------------------------------


@router.post("/instant", response_model=MeetingOut, status_code=201)
def create_instant_meeting(db: Session = Depends(get_db)):
    """Create an instant meeting and return its details including invite_link."""
    host = _get_default_host(db)
    code = _make_code()

    meeting = Meeting(
        meeting_code=code,
        host_id=host.id,
        title=f"{host.name}'s Instant Meeting",
        description=None,
        type=MeetingType.instant,
        scheduled_start=datetime.utcnow(),
        duration_minutes=None,
        status=MeetingStatus.active,
        invite_link=f"{BASE_URL}/join?code={code}",
    )
    db.add(meeting)
    db.flush()

    # Add host as participant
    participant = Participant(
        meeting_id=meeting.id,
        user_id=host.id,
        display_name=host.name,
        joined_at=datetime.utcnow(),
        role=ParticipantRole.host,
    )
    db.add(participant)
    db.commit()
    db.refresh(meeting)
    return meeting


# ---------------------------------------------------------------------------
# POST /meetings/schedule
# ---------------------------------------------------------------------------


@router.post("/schedule", response_model=MeetingOut, status_code=201)
def schedule_meeting(payload: MeetingCreate, db: Session = Depends(get_db)):
    """Create a scheduled meeting."""
    host = _get_default_host(db)
    code = _make_code()

    meeting = Meeting(
        meeting_code=code,
        host_id=host.id,
        title=payload.title,
        description=payload.description,
        type=MeetingType.scheduled,
        scheduled_start=payload.scheduled_start,
        duration_minutes=payload.duration_minutes,
        status=MeetingStatus.scheduled,
        invite_link=f"{BASE_URL}/join?code={code}",
    )
    db.add(meeting)
    db.flush()

    # Add host as participant
    participant = Participant(
        meeting_id=meeting.id,
        user_id=host.id,
        display_name=host.name,
        joined_at=None,
        role=ParticipantRole.host,
    )
    db.add(participant)
    db.commit()
    db.refresh(meeting)
    return meeting


# ---------------------------------------------------------------------------
# GET /meetings/upcoming
# ---------------------------------------------------------------------------


@router.get("/upcoming", response_model=list[MeetingOut])
def get_upcoming_meetings(db: Session = Depends(get_db)):
    """Return scheduled or active upcoming meetings, ordered soonest first."""
    now = datetime.utcnow()
    meetings = (
        db.query(Meeting)
        .filter(
            Meeting.status.in_([MeetingStatus.scheduled, MeetingStatus.active]),
            Meeting.scheduled_start >= now - timedelta(hours=2),
        )
        .order_by(Meeting.scheduled_start.asc())
        .all()
    )
    return meetings


# ---------------------------------------------------------------------------
# GET /meetings/recent
# ---------------------------------------------------------------------------


@router.get("/recent", response_model=list[MeetingOut])
def get_recent_meetings(db: Session = Depends(get_db)):
    """Return ended meetings, most recent first."""
    meetings = (
        db.query(Meeting)
        .filter(Meeting.status == MeetingStatus.ended)
        .order_by(Meeting.scheduled_start.desc())
        .all()
    )
    return meetings


# ---------------------------------------------------------------------------
# GET /meetings/{meeting_code}
# ---------------------------------------------------------------------------


@router.get("/{meeting_code}", response_model=MeetingOut)
def get_meeting(meeting_code: str, db: Session = Depends(get_db)):
    """Fetch meeting details by code. 404 if not found."""
    return _get_meeting_or_404(meeting_code, db)


# ---------------------------------------------------------------------------
# POST /meetings/{meeting_code}/join
# ---------------------------------------------------------------------------


@router.post("/{meeting_code}/join", response_model=ParticipantOut, status_code=201)
def join_meeting(meeting_code: str, payload: JoinRequest, db: Session = Depends(get_db)):
    """Add a participant to a meeting. 404 if meeting not found."""
    meeting = _get_meeting_or_404(meeting_code, db)

    if meeting.status == MeetingStatus.ended:
        raise HTTPException(status_code=400, detail="Cannot join an ended meeting")

    participant = Participant(
        meeting_id=meeting.id,
        user_id=None,  # guest — no account required
        display_name=payload.display_name,
        joined_at=datetime.utcnow(),
        role=ParticipantRole.attendee,
    )
    db.add(participant)

    # Activate the meeting if it was still scheduled
    if meeting.status == MeetingStatus.scheduled:
        meeting.status = MeetingStatus.active

    db.commit()
    db.refresh(participant)
    return participant


# ---------------------------------------------------------------------------
# GET /meetings/{meeting_code}/participants
# ---------------------------------------------------------------------------


@router.get("/{meeting_code}/participants", response_model=list[ParticipantOut])
def list_participants(meeting_code: str, db: Session = Depends(get_db)):
    """List all participants for a meeting."""
    meeting = _get_meeting_or_404(meeting_code, db)
    return (
        db.query(Participant)
        .filter(Participant.meeting_id == meeting.id)
        .order_by(Participant.id.asc())
        .all()
    )
