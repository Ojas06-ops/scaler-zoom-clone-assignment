"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import UpcomingMeetings from "@/components/UpcomingMeetings";
import RecentMeetings from "@/components/RecentMeetings";
import NewMeetingButton from "@/components/NewMeetingButton";
import JoinMeetingModal from "@/components/JoinMeetingModal";
import ScheduleMeetingModal from "@/components/ScheduleMeetingModal";

export default function DashboardPage() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [refreshUpcomingKey, setRefreshUpcomingKey] = useState(0);

  const handleMeetingScheduled = () => {
    // Increment refresh key to trigger upcoming meetings re-fetch
    setRefreshUpcomingKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-screen-xl w-full mx-auto">
        {/* Sidebar */}
        <aside className="w-64 py-8 px-5 hidden md:block">
          <nav className="space-y-1">
            <a
              href="#"
              className="flex items-center px-4 py-2.5 bg-blue-50 text-[#2D8CFF] rounded-xl font-medium"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </a>
            <a
              href="#upcoming"
              className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.277A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14v-4zm-11 8h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
              </svg>
              Meetings
            </a>
            <a
              href="#"
              className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
              Webinars
            </a>
            <a
              href="#"
              className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recordings
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 py-8 px-5 md:px-8 max-w-4xl">
          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {/* New Meeting */}
            <NewMeetingButton />

            {/* Join */}
            <button
              onClick={() => setJoinModalOpen(true)}
              className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-50 group-hover:text-[#2D8CFF] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Join</span>
            </button>

            {/* Schedule */}
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-50 group-hover:text-[#2D8CFF] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Schedule</span>
            </button>

            {/* Share Screen (Placeholder) */}
            <button
              onClick={() => setJoinModalOpen(true)}
              className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">Share Screen</span>
            </button>
          </div>

          <hr className="border-gray-200" />

          {/* Upcoming Meetings */}
          <div id="upcoming">
            <UpcomingMeetings refreshKey={refreshUpcomingKey} />
          </div>

          {/* Recent Meetings */}
          <div id="recent">
            <RecentMeetings />
          </div>
        </main>
      </div>

      {/* Modals */}
      <JoinMeetingModal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />

      <ScheduleMeetingModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onMeetingScheduled={handleMeetingScheduled}
      />
    </div>
  );
}
