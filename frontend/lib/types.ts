export interface Meeting {
  id: number;
  meeting_code: string;
  host_id: number;
  title: string;
  description: string | null;
  type: "instant" | "scheduled";
  scheduled_start: string | null;
  duration_minutes: number | null;
  status: "scheduled" | "active" | "ended";
  invite_link: string;
  created_at: string;
}

export interface Participant {
  id: number;
  meeting_id: number;
  user_id: number | null;
  display_name: string;
  joined_at: string | null;
  left_at: string | null;
  role: "host" | "attendee";
}
