from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from models import MeetingStatus, MeetingType, ParticipantRole


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Meeting
# ---------------------------------------------------------------------------


class MeetingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    duration_minutes: Optional[int] = None


class MeetingOut(BaseModel):
    id: int
    meeting_code: str
    host_id: int
    title: str
    description: Optional[str] = None
    type: MeetingType
    scheduled_start: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    status: MeetingStatus
    invite_link: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Participant
# ---------------------------------------------------------------------------


class JoinRequest(BaseModel):
    display_name: str


class ParticipantOut(BaseModel):
    id: int
    meeting_id: int
    user_id: Optional[int] = None
    display_name: str
    joined_at: Optional[datetime] = None
    left_at: Optional[datetime] = None
    role: ParticipantRole

    model_config = {"from_attributes": True}
