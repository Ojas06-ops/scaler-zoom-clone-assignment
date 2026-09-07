# Zoom Clone

A Zoom Meetings web application clone built with visual and workflow parity to Zoom.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | **Next.js 15** (App Router), **React 18**, **TypeScript**, **Tailwind CSS** |
| **Backend** | **FastAPI** (Python 3.13), **Uvicorn** (ASGI server) |
| **Database** | **SQLite** via **SQLAlchemy 2.0** ORM |
| **Data Validation** | **Pydantic v2** |
| **Networking** | CORS configured between frontend (`:3000`) and backend (`:8000`) |

---

## Folder Structure

```
zoom-clone/
├── backend/
│   ├── main.py              # FastAPI app entry point + CORS configuration
│   ├── models.py            # SQLAlchemy ORM models (User, Meeting, Participant)
│   ├── schemas.py           # Pydantic request/response validation schemas
│   ├── database.py          # SQLite engine, sessionmaker, and DB dependency
│   ├── routers/
│   │   ├── meetings.py      # /meetings/* endpoints (CRUD, join, participants)
│   │   └── participants.py  # Participants router module
│   ├── seed.py              # Idempotent DB seed script (default user + meetings)
│   ├── zoom_clone.db        # SQLite database file
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with Inter font and metadata
│   │   ├── page.tsx         # Zoom Dashboard (action buttons, upcoming, recent)
│   │   ├── meeting/[id]/
│   │   │   └── page.tsx     # Zoom Meeting Room (video grid, controls, side panel)
│   │   └── join/
│   │       └── page.tsx     # Direct join page with query parameter support
│   ├── components/
│   │   ├── Navbar.tsx             # Top navigation (Zoom logo, search, profile)
│   │   ├── NewMeetingButton.tsx   # Instant meeting action + copy invite modal
│   │   ├── JoinMeetingModal.tsx   # Join modal with ID pre-validation
│   │   ├── ScheduleMeetingModal.tsx # Schedule modal with date/time/duration
│   │   ├── UpcomingMeetings.tsx   # Upcoming scheduled/live meetings list
│   │   ├── RecentMeetings.tsx     # Past/ended meetings grid
│   │   ├── MeetingRoom.tsx        # Master meeting room layout & state manager
│   │   ├── ParticipantGrid.tsx    # Responsive video tile grid with avatars
│   │   ├── MeetingControlsBar.tsx # Zoom bottom toolbar with carets & badges
│   │   └── MeetingSidePanel.tsx   # Side panel (Participants list + Room Chat)
│   ├── lib/
│   │   ├── api.ts           # Typed API fetch client
│   │   └── types.ts         # Shared TypeScript data models
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
└── README.md
```

---

## Database Schema

- **`users`**
  - `id` (PK, Integer)
  - `name` (String, default: "Demo User")
  - `email` (String, unique)
  - `avatar_url` (String, nullable)
  - `created_at` (DateTime)

- **`meetings`**
  - `id` (PK, Integer)
  - `meeting_code` (String, unique, format: `123-456-789`)
  - `host_id` (FK -> `users.id`)
  - `title` (String)
  - `description` (Text, nullable)
  - `type` (Enum: `instant`, `scheduled`)
  - `scheduled_start` (DateTime, nullable)
  - `duration_minutes` (Integer, nullable)
  - `status` (Enum: `scheduled`, `active`, `ended`)
  - `invite_link` (String)
  - `created_at` (DateTime)

- **`participants`**
  - `id` (PK, Integer)
  - `meeting_id` (FK -> `meetings.id`)
  - `user_id` (FK -> `users.id`, nullable for guests)
  - `display_name` (String)
  - `joined_at` (DateTime, nullable)
  - `left_at` (DateTime, nullable)
  - `role` (Enum: `host`, `attendee`)

---

## Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/meetings/instant` | Create instant meeting, marks `active`, returns code & link |
| `POST` | `/meetings/schedule` | Schedule a future meeting with title, start, duration |
| `GET` | `/meetings/upcoming` | List upcoming and active meetings, soonest first |
| `GET` | `/meetings/recent` | List past/ended meetings, most recent first |
| `GET` | `/meetings/{meeting_code}` | Fetch meeting details (returns 404 if not found) |
| `POST` | `/meetings/{meeting_code}/join` | Add participant by name (returns 400 if ended) |
| `GET` | `/meetings/{meeting_code}/participants` | List current participants with roles |

API documentation is interactively accessible via Swagger UI at **`http://localhost:8000/docs`**.

---

## Getting Started

### 1. Backend Setup

```bash
cd backend

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations and seed sample data
python seed.py

# Start the FastAPI backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Backend will be running at: `http://localhost:8000`  
Swagger API Docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```

Frontend will be running at: `http://localhost:3000`

---

## Core Features & User Flows

1. **Dashboard (`/`)**:
   - Matches Zoom's desktop web dashboard.
   - Top navbar: Zoom wordmark with camera icon, global search bar, notification bell, settings gear, and user profile avatar.
   - Left sidebar with active state navigation (Home, Meetings, Webinars, Recordings).
   - Primary action cards: **New Meeting** (prominent blue), **Join**, **Schedule**, and **Share Screen**.
   - **Upcoming Meetings**: Cards with live countdown dates, meeting IDs, and "Start" / "Join" buttons. Active meetings feature a pulsing green `Live Now` badge.
   - **Recent Meetings**: Card grid of past meetings with timestamps and IDs.

2. **Instant Meeting Flow**:
   - Clicking **New Meeting** triggers `POST /meetings/instant`.
   - Displays a modal with the generated Meeting ID, direct Invite Link, and a one-click **Copy Link** button.
   - Automatically counts down or lets the user click **Join Meeting Now** to enter `/meeting/{meeting_code}`.

3. **Join Meeting Flow**:
   - Clicking **Join** opens a modal accepting either a 9-digit code (`123-456-789`) or a full URL (`http://localhost:3000/join?code=...`).
   - Validates existence against `GET /meetings/{code}` before joining.
   - Enters participant into the room via `POST /meetings/{code}/join`.
   - Direct invite links (`/join?code=...`) also route to a dedicated join screen.

4. **Schedule Meeting Flow**:
   - Clicking **Schedule** opens a modal with Title, optional Description, Date picker, Time picker, and Duration dropdown (15m to 2h).
   - Posts to `POST /meetings/schedule` and immediately refreshes the Upcoming Meetings list on the dashboard.

5. **Meeting Room (`/meeting/[id]`)**:
   - Zoom dark theme (`#1A1A1A`).
   - Top bar with security shield popover (meeting details & copy link), meeting title, meeting ID pill, live elapsed meeting timer, and Speaker/Gallery view toggle.
   - Responsive video tile grid: renders dynamic participant tiles with initials and colored gradients.
   - Bottom controls toolbar:
     - **Mute / Unmute** with device caret `^` and red status indicators
     - **Start / Stop Video** with device caret `^`
     - **Participants** with live badge counter (toggles side panel)
     - **Chat** (toggles in-room chat stream)
     - **Share Screen** (Zoom green icon with screen-share indicator banner)
     - **Reactions** with floating animated emojis (`👏`, `👍`, `❤️`, `😂`, `😮`, `🎉`)
     - **Leave** button with confirmation dialog
   - Side panel with searchable participants list, host badge, individual mute controls, and "Mute All" button.

---

## Assumptions & Explicit Non-Goals

Per the project specification:
- **No real WebRTC/video streaming**: This project is a UI and workflow parity clone. Video tiles use placeholder initials and avatars with simulated camera toggles. No real media streaming or WebSockets/WebRTC signaling is required.
- **No authentication required**: A default user (`Demo User`, `id=1`) is automatically assumed and pre-seeded. Guest attendees can enter any display name when joining.
- **Local SQLite database**: The database is stored locally at `backend/zoom_clone.db`. For production deployment, configure `SQLALCHEMY_DATABASE_URL` in `backend/database.py` for PostgreSQL.
- **Invite link domain**: Formatted as `http://localhost:3000/join?code=<meeting_code>`.
