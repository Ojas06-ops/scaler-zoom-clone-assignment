"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUpcomingMeetings } from "../lib/api";
import type { Meeting } from "../lib/types";

interface UpcomingMeetingsProps {
  refreshKey?: number;
}

function formatDateTime(dateStr: string) {
  // Parse UTC datetime string from SQLite/FastAPI
  const d = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
  if (isNaN(d.getTime())) {
    // fallback if format already has timezone or local
    return new Date(dateStr).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function UpcomingMeetings({ refreshKey = 0 }: UpcomingMeetingsProps) {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getUpcomingMeetings()
      .then((data) => setMeetings(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Upcoming Meetings</h2>
        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2.5 py-1 rounded-full">
          {meetings.length} scheduled
        </span>
      </div>

      {loading ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-400 text-sm animate-pulse">
          Loading upcoming meetings...
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-gray-500 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
          <p className="font-medium text-gray-700 mb-1">No upcoming meetings</p>
          <p className="text-xs text-gray-400">Click &ldquo;Schedule&rdquo; above to set up a new meeting.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => (
            <div
              key={m.id}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="font-semibold text-gray-900 text-base">{m.title}</h3>
                {m.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{m.description}</p>
                )}
                <div className="text-xs text-gray-500 mt-2 flex flex-wrap items-center gap-2">
                  {m.status === "active" ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live Now
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {m.scheduled_start ? formatDateTime(m.scheduled_start) : "No date"}
                    </span>
                  )}
                  {m.duration_minutes && (
                    <span className="text-gray-400">({m.duration_minutes} min)</span>
                  )}
                  <span className="text-gray-300">•</span>
                  <span className="font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                    ID: {m.meeting_code}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => router.push(`/meeting/${m.meeting_code}`)}
                  className="bg-[#2D8CFF] hover:bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
