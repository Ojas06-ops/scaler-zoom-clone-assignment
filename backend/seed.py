"""
seed.py — populate zoom_clone.db with:
  • 1 default user (Demo User)
  • 3 upcoming scheduled meetings
  • 3 ended/recent meetings
  • host participant row for each meeting

Run from the backend/ directory:
    python seed.py
"""

import random
import string
from datetime import datetime, timedelta, timezone

from database import Base, SessionLocal, engine
from models import Meeting, MeetingStatus, MeetingType, Participant, ParticipantRole, User

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def make_code() -> str:
    """Generate a human-readable meeting code like '123-456-789'."""
    digits = "".join(random.choices(string.digits, k=9))
    return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"


BASE_URL = "http://localhost:3000"

now = datetime.now(timezone.utc).replace(tzinfo=None)


# ---------------------------------------------------------------------------
# Seed data
# ---------------------------------------------------------------------------

UPCOMING_MEETINGS = [
    {
        "title": "Weekly Team Standup",
        "description": "Quick 15-min sync with the engineering team.",
        "scheduled_start": now + timedelta(hours=3),
        "duration_minutes": 15,
    },
    {
        "title": "Product Roadmap Review",
        "description": "Q3 roadmap planning session with product and design.",
        "scheduled_start": now + timedelta(days=1, hours=2),
        "duration_minutes": 60,
    },
    {
        "title": "Investor Update Call",
        "description": "Monthly investor update — Series A metrics review.",
        "scheduled_start": now + timedelta(days=3),
        "duration_minutes": 45,
    },
]

RECENT_MEETINGS = [
    {
        "title": "Design Sprint Kickoff",
        "description": "Kicked off the new onboarding flow sprint.",
        "scheduled_start": now - timedelta(days=2),
        "duration_minutes": 30,
    },
    {
        "title": "Backend Architecture Review",
        "description": "Reviewed the new microservices proposal.",
        "scheduled_start": now - timedelta(days=5),
        "duration_minutes": 60,
    },
    {
        "title": "All-Hands Company Meeting",
        "description": "Monthly all-hands — company updates and Q&A.",
        "scheduled_start": now - timedelta(days=7),
        "duration_minutes": 45,
    },
]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Idempotency: clear existing rows so re-running is safe
        db.query(Participant).delete()
        db.query(Meeting).delete()
        db.query(User).delete()
        db.commit()

        # ---- User ----
        demo_user = User(
            name="Demo User",
            email="demo@zoomclone.dev",
            avatar_url=None,
        )
        db.add(demo_user)
        db.flush()

        all_meetings = []

        # ---- Upcoming meetings ----
        for m in UPCOMING_MEETINGS:
            code = make_code()
            meeting = Meeting(
                meeting_code=code,
                host_id=demo_user.id,
                title=m["title"],
                description=m["description"],
                type=MeetingType.scheduled,
                scheduled_start=m["scheduled_start"],
                duration_minutes=m["duration_minutes"],
                status=MeetingStatus.scheduled,
                invite_link=f"{BASE_URL}/join?code={code}",
            )
            db.add(meeting)
            all_meetings.append(meeting)

        # ---- Recent/ended meetings ----
        for m in RECENT_MEETINGS:
            code = make_code()
            meeting = Meeting(
                meeting_code=code,
                host_id=demo_user.id,
                title=m["title"],
                description=m["description"],
                type=MeetingType.scheduled,
                scheduled_start=m["scheduled_start"],
                duration_minutes=m["duration_minutes"],
                status=MeetingStatus.ended,
                invite_link=f"{BASE_URL}/join?code={code}",
            )
            db.add(meeting)
            all_meetings.append(meeting)

        db.flush()

        # ---- Host participant row per meeting ----
        for meeting in all_meetings:
            participant = Participant(
                meeting_id=meeting.id,
                user_id=demo_user.id,
                display_name=demo_user.name,
                joined_at=meeting.scheduled_start,
                left_at=(
                    meeting.scheduled_start + timedelta(minutes=meeting.duration_minutes)
                    if meeting.status == MeetingStatus.ended and meeting.duration_minutes
                    else None
                ),
                role=ParticipantRole.host,
            )
            db.add(participant)

        db.commit()
        print("✅  Seed complete!")

    finally:
        db.close()


def show():
    db = SessionLocal()
    try:
        print("\n── USERS ──────────────────────────────────────────")
        for u in db.query(User).all():
            print(f"  id={u.id}  name={u.name!r}  email={u.email!r}  created_at={u.created_at}")

        print("\n── MEETINGS ────────────────────────────────────────")
        for m in db.query(Meeting).order_by(Meeting.id).all():
            print(
                f"  id={m.id:2}  code={m.meeting_code}  status={m.status.value:9}  "
                f"type={m.type.value:9}  title={m.title!r}"
            )
            if m.scheduled_start:
                print(f"         scheduled_start={m.scheduled_start}  duration={m.duration_minutes}min")

        print("\n── PARTICIPANTS ────────────────────────────────────")
        for p in db.query(Participant).order_by(Participant.id).all():
            print(
                f"  id={p.id:2}  meeting_id={p.meeting_id}  user_id={p.user_id}  "
                f"role={p.role.value:8}  display_name={p.display_name!r}  joined_at={p.joined_at}"
            )
        print()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
    show()
