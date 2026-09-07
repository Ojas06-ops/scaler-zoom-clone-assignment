"use client";

import { useEffect, useState } from "react";
import { getRecentMeetings } from "../lib/api";
import type { Meeting } from "../lib/types";

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr + "Z");
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RecentMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentMeetings()
      .then((data) => setMeetings(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Meetings</h2>
      {loading ? (
        <div className="text-gray-500">Loading recent meetings...</div>
      ) : meetings.length === 0 ? (
        <div className="text-gray-500 bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
          No recent meetings.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((m) => (
            <div
              key={m.id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 truncate">{m.title}</h3>
              <div className="text-sm text-gray-500 mt-2 space-y-1">
                <div>{m.scheduled_start ? formatDateTime(m.scheduled_start) : "No date"}</div>
                <div>ID: {m.meeting_code}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
