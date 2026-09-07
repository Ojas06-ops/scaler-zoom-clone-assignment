"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getMeeting, joinMeeting } from "@/lib/api";

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCode = searchParams.get("code") || "";

  const [meetingCode, setMeetingCode] = useState(queryCode);
  const [displayName, setDisplayName] = useState("Demo User");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (queryCode) {
      setMeetingCode(queryCode);
    }
  }, [queryCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let cleanCode = meetingCode.trim();
    if (cleanCode.includes("code=")) {
      try {
        const url = new URL(cleanCode.startsWith("http") ? cleanCode : `http://dummy.com/${cleanCode}`);
        const c = url.searchParams.get("code");
        if (c) cleanCode = c.trim();
      } catch {}
    }

    if (!cleanCode) {
      setError("Please enter a meeting code.");
      return;
    }

    const name = displayName.trim() || "Guest";

    try {
      setLoading(true);
      const meeting = await getMeeting(cleanCode);
      if (meeting.status === "ended") {
        setError("This meeting has already ended.");
        setLoading(false);
        return;
      }

      await joinMeeting(cleanCode, name);
      router.push(`/meeting/${cleanCode}?name=${encodeURIComponent(name)}`);
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes("not found")) {
        setError(`Meeting "${cleanCode}" was not found.`);
      } else {
        setError(err.message || "Failed to join meeting.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 py-3 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-[#2D8CFF] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 10l4.553-2.277A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14v-4zm-11 8h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
              </svg>
            </div>
            <span className="text-[#2D8CFF] text-xl font-bold tracking-tight">zoom</span>
          </Link>
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-800 font-medium">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Join Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm max-w-md w-full p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Join a Meeting</h1>
            <p className="text-xs text-gray-500 mt-1">
              Enter your meeting details to connect instantly
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Meeting ID or Personal Link
              </label>
              <input
                type="text"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                placeholder="e.g. 123-456-789"
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#2D8CFF] focus:bg-white transition-all font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-[#2D8CFF] focus:bg-white transition-all"
                required
              />
            </div>

            <p className="text-[11px] text-gray-400">
              By clicking &ldquo;Join&rdquo;, you agree to our Terms of Service and Privacy Statement.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#2D8CFF] hover:bg-blue-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Connecting...</span>
                </>
              ) : (
                "Join"
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400">
        Zoom Meetings Clone • Educational Demo
      </footer>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">Loading...</div>}>
      <JoinContent />
    </Suspense>
  );
}
