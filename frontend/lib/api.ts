import type { Meeting, Participant } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        msg = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      const text = await res.text().catch(() => "");
      if (text) msg = text;
    }
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

export const getUpcomingMeetings = () =>
  apiFetch<Meeting[]>("/meetings/upcoming");

export const getRecentMeetings = () =>
  apiFetch<Meeting[]>("/meetings/recent");

export const createInstantMeeting = () =>
  apiFetch<Meeting>("/meetings/instant", { method: "POST" });

export const scheduleMeeting = (body: {
  title: string;
  description?: string;
  scheduled_start?: string;
  duration_minutes?: number;
}) =>
  apiFetch<Meeting>("/meetings/schedule", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const getMeeting = (code: string) =>
  apiFetch<Meeting>(`/meetings/${code}`);

export const joinMeeting = (code: string, display_name: string) =>
  apiFetch<Participant>(`/meetings/${code}/join`, {
    method: "POST",
    body: JSON.stringify({ display_name }),
  });

export const getParticipants = (code: string) =>
  apiFetch<Participant[]>(`/meetings/${code}/participants`);
