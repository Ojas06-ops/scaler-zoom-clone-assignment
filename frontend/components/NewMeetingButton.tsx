"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createInstantMeeting } from "../lib/api";
import type { Meeting } from "../lib/types";

export default function NewMeetingButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<Meeting | null>(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleClick = async () => {
    try {
      setLoading(true);
      const meeting = await createInstantMeeting();
      setCreatedMeeting(meeting);
      setCountdown(4);
    } catch (err: any) {
      alert(err.message || "Failed to create instant meeting");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (countdown === null || !createdMeeting) return;
    if (countdown === 0) {
      router.push(`/meeting/${createdMeeting.meeting_code}`);
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, createdMeeting, router]);

  const handleCopy = async () => {
    if (!createdMeeting) return;
    try {
      await navigator.clipboard.writeText(createdMeeting.invite_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleEnterImmediately = () => {
    if (createdMeeting) {
      router.push(`/meeting/${createdMeeting.meeting_code}`);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow group disabled:opacity-60"
      >
        <div className="w-12 h-12 bg-[#2D8CFF] text-white rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors shadow-sm">
          {loading ? (
            <svg
              className="animate-spin h-6 w-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 10l4.553-2.277A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14v-4zm-11 8h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
            </svg>
          )}
        </div>
        <span className="font-medium text-gray-900">
          {loading ? "Creating..." : "New Meeting"}
        </span>
      </button>

      {/* Instant Meeting Success Modal */}
      {createdMeeting && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2D8CFF] flex items-center justify-center font-bold">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15 10l4.553-2.277A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14v-4zm-11 8h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Instant Meeting Created</h3>
                <p className="text-xs text-gray-500">ID: {createdMeeting.meeting_code}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Your meeting room is ready. Share the invite link with attendees or start right away.
            </p>

            {/* Invite Link Box */}
            <div className="mb-5 bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-gray-700 truncate select-all">
                {createdMeeting.invite_link}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-xs text-gray-400">
                {countdown !== null && countdown > 0
                  ? `Entering room in ${countdown}s...`
                  : "Entering..."}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCountdown(null)}
                  className="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Stay on page
                </button>
                <button
                  type="button"
                  onClick={handleEnterImmediately}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#2D8CFF] hover:bg-blue-600 rounded-xl transition-colors shadow-sm"
                >
                  Join Meeting Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
