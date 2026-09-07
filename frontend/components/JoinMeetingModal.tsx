"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getMeeting, joinMeeting } from "../lib/api";

interface JoinMeetingModalProps {
  open: boolean;
  onClose: () => void;
  initialCode?: string;
}

function extractMeetingCode(raw: string): string {
  const input = raw.trim();
  try {
    if (input.includes("code=")) {
      const url = new URL(input.startsWith("http") ? input : `http://dummy.com/${input}`);
      const code = url.searchParams.get("code");
      if (code) return code.trim();
    }
  } catch {}
  if (input.includes("/meeting/")) {
    const parts = input.split("/meeting/");
    if (parts[1]) return parts[1].split("?")[0].split("/")[0].trim();
  }
  return input;
}

export default function JoinMeetingModal({
  open,
  onClose,
  initialCode = "",
}: JoinMeetingModalProps) {
  const router = useRouter();
  const [meetingInput, setMeetingInput] = useState(initialCode);
  const [displayName, setDisplayName] = useState("Demo User");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = extractMeetingCode(meetingInput);
    if (!cleanCode) {
      setError("Please enter a Meeting ID or paste an invite link.");
      return;
    }

    const name = displayName.trim() || "Guest";

    try {
      setLoading(true);
      // 1. Validate meeting exists via GET
      const meeting = await getMeeting(cleanCode);
      if (meeting.status === "ended") {
        setError("This meeting has already ended.");
        setLoading(false);
        return;
      }

      // 2. Add participant via POST
      await joinMeeting(cleanCode, name);

      // 3. Redirect to room
      onClose();
      router.push(`/meeting/${cleanCode}?name=${encodeURIComponent(name)}`);
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes("not found")) {
        setError(`Meeting "${cleanCode}" not found. Please verify the ID.`);
      } else {
        setError(err.message || "Failed to join meeting. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2D8CFF] flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Join Meeting</h3>
              <p className="text-xs text-gray-500">Enter details to connect</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Meeting ID or Personal Link Name
            </label>
            <input
              type="text"
              value={meetingInput}
              onChange={(e) => {
                setMeetingInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. 123-456-789 or paste link"
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#2D8CFF] focus:bg-white transition-all placeholder:text-gray-400"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Your Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#2D8CFF] focus:bg-white transition-all placeholder:text-gray-400"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#2D8CFF] hover:bg-blue-600 rounded-xl transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Checking...</span>
                </>
              ) : (
                "Join"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
