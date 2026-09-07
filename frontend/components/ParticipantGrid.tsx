"use client";

import { useMemo } from "react";
import type { Participant } from "../lib/types";

export interface ParticipantWithState extends Participant {
  isMuted?: boolean;
  isVideoOn?: boolean;
  isHandRaised?: boolean;
}

interface ParticipantGridProps {
  participants: ParticipantWithState[];
  currentUserName: string;
  isMyMuted: boolean;
  isMyVideoOn: boolean;
  viewMode: "gallery" | "speaker";
}

// Deterministic distinct colors for avatar backgrounds
const AVATAR_COLORS = [
  "from-blue-600 to-indigo-600",
  "from-emerald-600 to-teal-600",
  "from-purple-600 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-rose-600 to-red-600",
  "from-cyan-600 to-blue-700",
  "from-fuchsia-600 to-purple-700",
];

function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function ParticipantGrid({
  participants,
  currentUserName,
  isMyMuted,
  isMyVideoOn,
  viewMode,
}: ParticipantGridProps) {
  // Merge current user local states into participants list
  const displayList = useMemo(() => {
    if (participants.length === 0) {
      return [
        {
          id: 9999,
          meeting_id: 0,
          user_id: 1,
          display_name: currentUserName || "Demo User",
          joined_at: new Date().toISOString(),
          left_at: null,
          role: "host" as const,
          isMuted: isMyMuted,
          isVideoOn: isMyVideoOn,
        },
      ];
    }
    return participants.map((p) => {
      const isMe = p.display_name === currentUserName;
      return {
        ...p,
        isMuted: isMe ? isMyMuted : p.isMuted ?? false,
        isVideoOn: isMe ? isMyVideoOn : p.isVideoOn ?? false,
      };
    });
  }, [participants, currentUserName, isMyMuted, isMyVideoOn]);

  const count = displayList.length;

  // Layout grid calculation
  const gridClasses = useMemo(() => {
    if (viewMode === "speaker") {
      return "grid grid-cols-1 w-full h-full max-w-5xl";
    }
    if (count === 1) return "grid grid-cols-1 w-full h-full max-w-4xl max-h-[85vh]";
    if (count === 2) return "grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full max-w-5xl";
    if (count <= 4) return "grid grid-cols-2 gap-4 w-full h-full max-w-5xl";
    if (count <= 6) return "grid grid-cols-2 md:grid-cols-3 gap-3 w-full h-full max-w-6xl";
    return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full h-full max-w-7xl";
  }, [count, viewMode]);

  return (
    <div className="flex-1 w-full h-full p-4 flex items-center justify-center overflow-hidden">
      <div className={`${gridClasses} transition-all duration-300 items-center justify-center`}>
        {displayList.map((participant, index) => {
          const isMe = participant.display_name === currentUserName;
          const initials = getInitials(participant.display_name);
          const colorGradient = getColorForName(participant.display_name);
          const isMuted = participant.isMuted;
          const isVideoOn = participant.isVideoOn;

          return (
            <div
              key={participant.id || index}
              className="relative aspect-video w-full h-full max-h-[75vh] bg-[#23272D] rounded-2xl overflow-hidden border border-gray-800/80 shadow-2xl flex items-center justify-center group select-none transition-all duration-200"
            >
              {/* Tile Content: Video or Avatar */}
              {isVideoOn ? (
                <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-tr from-slate-900 via-gray-900 to-zinc-900">
                  {/* Simulated Camera Feed with Ambient Live Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse flex items-center justify-center border border-blue-500/30">
                      <span className="text-3xl font-bold text-white/80">{initials}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Live Video
                  </div>
                </div>
              ) : (
                /* Avatar view when camera is off */
                <div className="flex flex-col items-center justify-center">
                  <div
                    className={`w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-tr ${colorGradient} flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-xl border-2 border-white/10`}
                  >
                    {initials}
                  </div>
                </div>
              )}

              {/* Hand raised badge */}
              {participant.isHandRaised && (
                <div className="absolute top-3 right-3 bg-amber-500 text-black px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-bounce">
                  <span>✋</span>
                  <span>Hand Raised</span>
                </div>
              )}

              {/* Bottom info pill: Name + Mic icon */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 text-xs text-white max-w-[80%]">
                {isMuted ? (
                  <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6zM3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                )}
                <span className="truncate font-medium">
                  {participant.display_name} {isMe ? "(Me)" : ""}
                </span>
                {participant.role === "host" && (
                  <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded font-medium border border-blue-400/20">
                    Host
                  </span>
                )}
              </div>

              {/* Hover overlay menu icon (Zoom style) */}
              <button className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/80 rounded-lg text-gray-300 hover:text-white">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
