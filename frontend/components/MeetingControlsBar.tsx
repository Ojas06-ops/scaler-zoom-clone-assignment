"use client";

import { useState } from "react";

interface MeetingControlsBarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isVideoOn: boolean;
  onToggleVideo: () => void;
  participantsCount: number;
  activeSidePanel: "participants" | "chat" | null;
  onToggleSidePanel: (panel: "participants" | "chat") => void;
  onLeaveMeeting: () => void;
  onSendReaction: (emoji: string) => void;
  isSharingScreen: boolean;
  onToggleShareScreen: () => void;
}

const EMOJIS = ["👏", "👍", "❤️", "😂", "😮", "🎉"];

export default function MeetingControlsBar({
  isMuted,
  onToggleMute,
  isVideoOn,
  onToggleVideo,
  participantsCount,
  activeSidePanel,
  onToggleSidePanel,
  onLeaveMeeting,
  onSendReaction,
  isSharingScreen,
  onToggleShareScreen,
}: MeetingControlsBarProps) {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <footer className="h-20 bg-[#1A1A1A] border-t border-gray-800/80 px-4 md:px-8 flex items-center justify-between select-none relative z-30">
      {/* ── Left Controls: Mic & Camera ── */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mute / Unmute Button */}
        <div className="relative flex items-center group">
          <button
            onClick={onToggleMute}
            className="flex flex-col items-center justify-center w-16 h-14 rounded-xl hover:bg-gray-800/70 transition-colors"
            title={isMuted ? "Unmute microphone" : "Mute microphone"}
          >
            <div className="relative">
              {isMuted ? (
                <svg className="w-6 h-6 text-red-500 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6zM3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-200 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              )}
            </div>
            <span className={`text-[11px] mt-1 font-medium ${isMuted ? "text-red-400" : "text-gray-300"}`}>
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </button>
          <button
            onClick={onToggleMute}
            className="absolute top-1 right-0.5 p-0.5 text-gray-400 hover:text-white rounded hover:bg-gray-700/50"
            title="Audio settings"
          >
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Video Start / Stop Button */}
        <div className="relative flex items-center group">
          <button
            onClick={onToggleVideo}
            className="flex flex-col items-center justify-center w-16 h-14 rounded-xl hover:bg-gray-800/70 transition-colors"
            title={isVideoOn ? "Stop Video" : "Start Video"}
          >
            <div className="relative">
              {isVideoOn ? (
                <svg className="w-6 h-6 text-gray-200 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.277A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14v-4zm-11 8h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-500 group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.277A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14v-4zm-11 8h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2zM3 3l18 18" />
                </svg>
              )}
            </div>
            <span className={`text-[11px] mt-1 font-medium ${isVideoOn ? "text-gray-300" : "text-red-400"}`}>
              {isVideoOn ? "Stop Video" : "Start Video"}
            </span>
          </button>
          <button
            onClick={onToggleVideo}
            className="absolute top-1 right-0.5 p-0.5 text-gray-400 hover:text-white rounded hover:bg-gray-700/50"
            title="Video settings"
          >
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Center Controls: Participants, Chat, Share, Reactions ── */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Participants */}
        <button
          onClick={() => onToggleSidePanel("participants")}
          className={`flex flex-col items-center justify-center w-16 md:w-20 h-14 rounded-xl transition-colors group relative ${
            activeSidePanel === "participants" ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800/70 text-gray-300"
          }`}
        >
          <div className="relative">
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="absolute -top-1 -right-2 bg-[#2D8CFF] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#1A1A1A]">
              {participantsCount}
            </span>
          </div>
          <span className="text-[11px] mt-1 font-medium">Participants</span>
        </button>

        {/* Chat */}
        <button
          onClick={() => onToggleSidePanel("chat")}
          className={`flex flex-col items-center justify-center w-16 md:w-20 h-14 rounded-xl transition-colors group ${
            activeSidePanel === "chat" ? "bg-gray-800 text-blue-400" : "hover:bg-gray-800/70 text-gray-300"
          }`}
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[11px] mt-1 font-medium">Chat</span>
        </button>

        {/* Share Screen (Zoom classic green icon) */}
        <button
          onClick={onToggleShareScreen}
          className="flex flex-col items-center justify-center w-16 md:w-20 h-14 rounded-xl hover:bg-gray-800/70 transition-colors group"
        >
          <div className="w-6 h-6 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
          </div>
          <span className={`text-[11px] mt-1 font-medium ${isSharingScreen ? "text-emerald-400" : "text-emerald-400"}`}>
            {isSharingScreen ? "Stop Share" : "Share"}
          </span>
        </button>

        {/* Reactions */}
        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="flex flex-col items-center justify-center w-16 md:w-20 h-14 rounded-xl hover:bg-gray-800/70 transition-colors group text-gray-300"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[11px] mt-1 font-medium">Reactions</span>
          </button>

          {/* Emoji Reactions Picker Popover */}
          {showReactions && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#2B2E33] border border-gray-700/80 rounded-2xl p-2 flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSendReaction(emoji);
                    setShowReactions(false);
                  }}
                  className="text-2xl hover:scale-125 hover:bg-gray-700/60 p-2 rounded-xl transition-all duration-150"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Controls: End / Leave Button ── */}
      <div className="flex items-center">
        <button
          onClick={onLeaveMeeting}
          className="px-4 md:px-5 py-2 bg-[#E02828] hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md hover:shadow-red-600/20 active:scale-95"
        >
          Leave
        </button>
      </div>
    </footer>
  );
}
