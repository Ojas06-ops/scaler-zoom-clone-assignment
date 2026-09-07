"use client";

import { useState } from "react";
import type { ParticipantWithState } from "./ParticipantGrid";

interface ChatMessage {
  id: string;
  sender: string;
  time: string;
  text: string;
  isMe?: boolean;
}

interface MeetingSidePanelProps {
  activePanel: "participants" | "chat";
  onClose: () => void;
  participants: ParticipantWithState[];
  currentUserName: string;
  onToggleParticipantMute: (participantId: number) => void;
  onMuteAll: () => void;
  onInvite: () => void;
  inviteCopied: boolean;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onTabChange: (tab: "participants" | "chat") => void;
}

function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function MeetingSidePanel({
  activePanel,
  onClose,
  participants,
  currentUserName,
  onToggleParticipantMute,
  onMuteAll,
  onInvite,
  inviteCopied,
  messages,
  onSendMessage,
  onTabChange,
}: MeetingSidePanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");

  const filteredParticipants = participants.filter((p) =>
    p.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <aside className="w-80 md:w-96 bg-[#23272D] border-l border-gray-800/80 flex flex-col h-full z-20 text-gray-200 select-none animate-in slide-in-from-right duration-200">
      {/* ── Top Tabs & Close ── */}
      <div className="flex items-center justify-between border-b border-gray-800 p-3">
        <div className="flex items-center gap-1 bg-[#1A1A1A] p-1 rounded-xl">
          <button
            onClick={() => onTabChange("participants")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePanel === "participants"
                ? "bg-[#2D8CFF] text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Participants ({participants.length})
          </button>
          <button
            onClick={() => onTabChange("chat")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePanel === "chat"
                ? "bg-[#2D8CFF] text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Chat
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          title="Close panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── Panel Content ── */}
      {activePanel === "participants" ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search bar */}
          <div className="p-3 border-b border-gray-800/60">
            <div className="relative">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find a participant"
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#1A1A1A] border border-gray-700/60 rounded-xl text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-[#2D8CFF]"
              />
            </div>
          </div>

          {/* Participant List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredParticipants.map((p) => {
              const isMe = p.display_name === currentUserName;
              const isHost = p.role === "host";

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#2D8CFF] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {getInitials(p.display_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-200 truncate flex items-center gap-1.5">
                        <span>{p.display_name}</span>
                        {isMe && <span className="text-gray-400 text-[10px]">(Me)</span>}
                        {isHost && (
                          <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-400/20">
                            Host
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Mute icon & camera status */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onToggleParticipantMute(p.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors"
                      title={p.isMuted ? "Unmute" : "Mute"}
                    >
                      {p.isMuted ? (
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6zM3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                        </svg>
                      )}
                    </button>

                    <div className="p-1.5 text-gray-400">
                      {p.isVideoOn ? (
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.277A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14v-4zm-11 8h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.277A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14v-4zm-11 8h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2zM3 3l18 18" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Controls: Invite & Mute All */}
          <div className="p-3 border-t border-gray-800 flex items-center justify-between gap-2 bg-[#1E2024]">
            <button
              onClick={onInvite}
              className="flex-1 py-1.5 px-3 bg-gray-800 hover:bg-gray-700 text-xs font-semibold rounded-xl text-gray-200 transition-colors flex items-center justify-center gap-1.5 border border-gray-700"
            >
              {inviteCopied ? (
                <>
                  <span className="text-emerald-400">✓ Link Copied</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Invite</span>
                </>
              )}
            </button>

            <button
              onClick={onMuteAll}
              className="flex-1 py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold rounded-xl transition-colors"
            >
              Mute All
            </button>
          </div>
        </div>
      ) : (
        /* ── Chat Panel ── */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs text-center p-4">
                <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No messages yet.</p>
                <p className="text-[10px] text-gray-600 mt-1">Send a message to everyone in this meeting.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="text-xs">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="font-semibold text-gray-300">{msg.sender}</span>
                    <span className="text-[10px] text-gray-500">{msg.time}</span>
                  </div>
                  <div
                    className={`p-2.5 rounded-2xl inline-block max-w-[90%] text-xs break-words ${
                      msg.isMe
                        ? "bg-[#2D8CFF] text-white rounded-tr-none"
                        : "bg-[#1A1A1A] border border-gray-800 text-gray-200 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-800 bg-[#1E2024]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type message here..."
                className="flex-1 px-3.5 py-2 text-xs bg-[#1A1A1A] border border-gray-700/60 rounded-xl text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-[#2D8CFF]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 bg-[#2D8CFF] hover:bg-blue-600 disabled:opacity-40 text-white rounded-xl transition-colors"
                title="Send"
              >
                <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </aside>
  );
}
