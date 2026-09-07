"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getMeeting, getParticipants } from "../lib/api";
import type { Meeting, Participant } from "../lib/types";
import ParticipantGrid, { ParticipantWithState } from "./ParticipantGrid";
import MeetingControlsBar from "./MeetingControlsBar";
import MeetingSidePanel from "./MeetingSidePanel";

interface MeetingRoomProps {
  meetingCode: string;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  left: number;
}

export default function MeetingRoom({ meetingCode }: MeetingRoomProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryName = searchParams.get("name") || "Demo User";

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<ParticipantWithState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Media Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState<"gallery" | "speaker">("gallery");
  const [activeSidePanel, setActiveSidePanel] = useState<"participants" | "chat" | null>(null);
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  // Elapsed timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Floating Reactions
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  // Chat Messages
  const [messages, setMessages] = useState<
    Array<{ id: string; sender: string; time: string; text: string; isMe?: boolean }>
  >([
    {
      id: "1",
      sender: "System",
      time: "Just now",
      text: "Welcome to the meeting room! Chat with participants here.",
    },
  ]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTimer = useMemo(() => {
    const hrs = Math.floor(secondsElapsed / 3600);
    const mins = Math.floor((secondsElapsed % 3600) / 60);
    const secs = secondsElapsed % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [secondsElapsed]);

  // Load meeting & participants
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [meetingData, participantsData] = await Promise.all([
          getMeeting(meetingCode),
          getParticipants(meetingCode).catch(() => [] as Participant[]),
        ]);

        if (!mounted) return;
        setMeeting(meetingData);

        // Ensure current user is included in the participants list
        const exists = participantsData.some((p) => p.display_name === queryName);
        let list: ParticipantWithState[] = participantsData.map((p) => ({
          ...p,
          isMuted: p.display_name === queryName ? isMuted : false,
          isVideoOn: p.display_name === queryName ? isVideoOn : false,
        }));

        if (!exists) {
          list = [
            {
              id: 99999,
              meeting_id: meetingData.id,
              user_id: null,
              display_name: queryName,
              joined_at: new Date().toISOString(),
              left_at: null,
              role: list.length === 0 ? "host" : "attendee",
              isMuted,
              isVideoOn,
            },
            ...list,
          ];
        }

        setParticipants(list);
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Failed to load meeting room");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [meetingCode, queryName]);

  // Toggles
  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
    setParticipants((prev) =>
      prev.map((p) => (p.display_name === queryName ? { ...p, isMuted: !p.isMuted } : p))
    );
  };

  const handleToggleVideo = () => {
    setIsVideoOn((prev) => !prev);
    setParticipants((prev) =>
      prev.map((p) => (p.display_name === queryName ? { ...p, isVideoOn: !p.isVideoOn } : p))
    );
  };

  const handleToggleParticipantMute = (participantId: number) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, isMuted: !p.isMuted } : p))
    );
  };

  const handleMuteAll = () => {
    setParticipants((prev) => prev.map((p) => ({ ...p, isMuted: true })));
    setIsMuted(true);
  };

  const handleToggleSidePanel = (panel: "participants" | "chat") => {
    setActiveSidePanel((prev) => (prev === panel ? null : panel));
  };

  const handleCopyInviteLink = async () => {
    const link = meeting?.invite_link || `${window.location.origin}/join?code=${meetingCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2500);
    } catch {
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2500);
    }
  };

  const handleSendReaction = (emoji: string) => {
    const id = Math.random().toString(36).substring(7);
    const left = Math.floor(Math.random() * 60) + 20; // 20% to 80% screen width
    setReactions((prev) => [...prev, { id, emoji, left }]);

    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2800);
  };

  const handleSendMessage = (text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: queryName,
        time: timeStr,
        text,
        isMe: true,
      },
    ]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-[#2D8CFF] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-400">Connecting to meeting...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Unable to Join Meeting</h2>
        <p className="text-sm text-gray-400 max-w-sm mb-6">{error || "Meeting not found"}</p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-[#2D8CFF] hover:bg-blue-600 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#1A1A1A] select-none text-white font-sans relative">
      {/* ── Top Bar ── */}
      <header className="h-12 bg-[#1A1A1A]/90 backdrop-blur-sm border-b border-gray-800/80 px-4 flex items-center justify-between z-30">
        {/* Left: Meeting Info + Green Shield */}
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setShowInfoPopover(!showInfoPopover)}
            className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center transition-colors border border-emerald-500/30"
            title="Meeting Information"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-200 truncate max-w-xs md:max-w-md">
              {meeting.title}
            </span>
            <span className="text-gray-500">•</span>
            <span className="font-mono text-xs text-gray-400 bg-gray-800/80 px-2 py-0.5 rounded-md border border-gray-700/50">
              {meeting.meeting_code}
            </span>
          </div>

          {/* Meeting Info Popover */}
          {showInfoPopover && (
            <div className="absolute top-10 left-0 w-80 bg-[#24272C] border border-gray-700 rounded-2xl p-4 shadow-2xl z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-3 border-b border-gray-700 pb-2">
                <span className="font-bold text-gray-200">Meeting Details</span>
                <button
                  onClick={() => setShowInfoPopover(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-gray-300">
                <div>
                  <span className="text-gray-500 block text-[10px]">Topic</span>
                  <span className="font-medium text-white">{meeting.title}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Meeting ID</span>
                  <span className="font-mono text-[#2D8CFF] font-semibold">{meeting.meeting_code}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Invite Link</span>
                  <div className="flex items-center justify-between gap-1 bg-[#1A1A1A] p-1.5 rounded-lg mt-1 border border-gray-700">
                    <span className="truncate text-[10px] font-mono">{meeting.invite_link}</span>
                    <button
                      onClick={handleCopyInviteLink}
                      className="px-2 py-1 bg-[#2D8CFF] hover:bg-blue-600 text-white rounded text-[10px] font-semibold shrink-0"
                    >
                      {inviteCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center: Live Timer */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-gray-900/60 px-2.5 py-1 rounded-full border border-gray-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono font-medium">{formattedTimer}</span>
        </div>

        {/* Right: View Mode Toggle (Gallery vs Speaker) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode((prev) => (prev === "gallery" ? "speaker" : "gallery"))}
            className="flex items-center gap-1.5 px-3 py-1 bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg border border-gray-700/50 transition-colors"
          >
            {viewMode === "gallery" ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Speaker View</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Gallery View</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Screen Sharing Banner (when active) ── */}
      {isSharingScreen && (
        <div className="bg-emerald-600/90 text-white text-xs font-semibold py-1.5 px-4 flex items-center justify-between z-30 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>You are sharing your screen</span>
          </div>
          <button
            onClick={() => setIsSharingScreen(false)}
            className="px-2.5 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[11px] rounded font-medium transition-colors"
          >
            Stop Share
          </button>
        </div>
      )}

      {/* ── Center Area: Participant Grid + Side Panel ── */}
      <main className="flex-1 flex overflow-hidden relative">
        <ParticipantGrid
          participants={participants}
          currentUserName={queryName}
          isMyMuted={isMuted}
          isMyVideoOn={isVideoOn}
          viewMode={viewMode}
        />

        {/* Side Panel (Participants or Chat) */}
        {activeSidePanel && (
          <MeetingSidePanel
            activePanel={activeSidePanel}
            onClose={() => setActiveSidePanel(null)}
            participants={participants}
            currentUserName={queryName}
            onToggleParticipantMute={handleToggleParticipantMute}
            onMuteAll={handleMuteAll}
            onInvite={handleCopyInviteLink}
            inviteCopied={inviteCopied}
            messages={messages}
            onSendMessage={handleSendMessage}
            onTabChange={(tab) => setActiveSidePanel(tab)}
          />
        )}

        {/* ── Floating Reaction Emojis ── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-40">
          {reactions.map((r) => (
            <div
              key={r.id}
              style={{ left: `${r.left}%` }}
              className="absolute bottom-10 text-4xl animate-bounce duration-1000 transition-all opacity-90"
            >
              {r.emoji}
            </div>
          ))}
        </div>
      </main>

      {/* ── Bottom Controls Bar ── */}
      <MeetingControlsBar
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isVideoOn={isVideoOn}
        onToggleVideo={handleToggleVideo}
        participantsCount={participants.length}
        activeSidePanel={activeSidePanel}
        onToggleSidePanel={handleToggleSidePanel}
        onLeaveMeeting={() => setShowLeaveModal(true)}
        onSendReaction={handleSendReaction}
        isSharingScreen={isSharingScreen}
        onToggleShareScreen={() => setIsSharingScreen((prev) => !prev)}
      />

      {/* ── Leave Meeting Modal ── */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#24272D] border border-gray-700 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 mx-auto flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-1">Leave Meeting</h3>
            <p className="text-xs text-gray-400 mb-6">
              Are you sure you want to leave {meeting.title}?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-5 py-2 bg-[#E02828] hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
              >
                Leave Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
