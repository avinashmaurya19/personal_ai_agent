"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  X,
  Clock,
  Send,
  MapPin,
  Users,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  api,
  EmailThreadItem,
  EmailMessageItem,
  CalendarEventItem,
  PendingActionItem,
} from "@/lib/api-client";

interface InboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InboxDrawer({ isOpen, onClose }: InboxDrawerProps) {
  const [activeTab, setActiveTab] = useState<"approvals" | "inbox" | "calendar">("approvals");

  // State
  const [pendingActions, setPendingActions] = useState<PendingActionItem[]>([]);
  const [emailThreads, setEmailThreads] = useState<EmailThreadItem[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<EmailMessageItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);

  // Reply Draft Form state
  const [replyBody, setReplyBody] = useState("");
  const [isSendingDraft, setIsSendingDraft] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const fetchApprovals = async () => {
    try {
      const data = await api.getPendingActions("pending");
      setPendingActions(data);
    } catch (err) {
      console.error("Failed to load pending actions:", err);
    }
  };

  const fetchEmails = async () => {
    try {
      const data = await api.getEmailThreads();
      setEmailThreads(data);
    } catch (err) {
      console.error("Failed to load email threads:", err);
    }
  };

  const fetchCalendar = async () => {
    try {
      const data = await api.getCalendarEvents();
      setCalendarEvents(data);
    } catch (err) {
      console.error("Failed to load calendar events:", err);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchApprovals(), fetchEmails(), fetchCalendar()]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleSelectThread = async (threadId: string) => {
    setSelectedThreadId(threadId);
    try {
      const msgs = await api.getThreadMessages(threadId);
      setThreadMessages(msgs);
      await api.markThreadRead(threadId);
      // update local unread state
      setEmailThreads((prev) =>
        prev.map((t) => (t.thread_id === threadId ? { ...t, has_unread: false } : t))
      );
    } catch (err) {
      console.error("Failed to load thread messages:", err);
    }
  };

  const handleSendDraft = async (e: React.FormEvent, thread: EmailThreadItem) => {
    e.preventDefault();
    if (!replyBody.trim() || isSendingDraft) return;

    setIsSendingDraft(true);
    try {
      await api.createEmailDraft({
        recipient: thread.last_sender,
        subject: `Re: ${thread.subject}`,
        body: replyBody.trim(),
        thread_id: thread.thread_id,
      });
      setReplyBody("");
      // Refresh thread
      if (selectedThreadId) {
        const msgs = await api.getThreadMessages(selectedThreadId);
        setThreadMessages(msgs);
      }
    } catch (err) {
      console.error("Failed to create draft:", err);
    } finally {
      setIsSendingDraft(false);
    }
  };

  const handleDecision = async (actionId: string, approved: boolean) => {
    try {
      await api.decideAction(actionId, approved);
      setPendingActions((prev) => prev.filter((a) => a.id !== actionId));
      // Refresh mailbox and calendar in case the approved action mutated them
      fetchEmails();
      fetchCalendar();
    } catch (err) {
      console.error("Failed to decide action:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="flex h-full w-full max-w-lg flex-col bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Inbox & Approvals</h2>
              <p className="text-xs text-slate-400">Communication, schedule & human-in-the-loop gates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            onClick={() => setActiveTab("approvals")}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors relative ${
              activeTab === "approvals"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Approvals</span>
            {pendingActions.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                {pendingActions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("inbox");
              setSelectedThreadId(null);
            }}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "inbox"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>Inbox ({emailThreads.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "calendar"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Calendar ({calendarEvents.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: APPROVALS */}
          {activeTab === "approvals" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300">
                <p className="font-medium">The &ldquo;Do the Work&rdquo; Human-in-the-Loop Gate</p>
                <p className="mt-1 text-amber-400/80 text-[11px]">
                  Consequential external actions (sending emails, scheduling meetings) are held here. They are only executed once you authorize them.
                </p>
              </div>

              {isLoading ? (
                <div className="py-12 text-center text-xs text-slate-500">Checking pending authorizations...</div>
              ) : pendingActions.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500/40 mx-auto mb-2" />
                  <p className="text-slate-400 font-medium">All caught up!</p>
                  <p className="mt-1">No pending actions requiring your authorization.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingActions.map((action) => (
                    <div
                      key={action.id}
                      className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-3 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {action.action_type.replace("_", " ")}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(action.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        {action.description}
                      </p>

                      {/* Payload preview */}
                      <div className="rounded-lg bg-slate-900/90 border border-slate-800/80 p-2.5 text-[11px] text-slate-400 space-y-1">
                        {Object.entries(action.payload).map(([k, v]) => (
                          <div key={k} className="flex items-start space-x-2">
                            <span className="font-semibold text-slate-500 capitalize">{k}:</span>
                            <span className="text-slate-300 break-all">{Array.isArray(v) ? v.join(", ") : String(v)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          onClick={() => handleDecision(action.id, false)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-xs text-slate-300 font-medium transition-colors"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleDecision(action.id, true)}
                          className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-medium shadow-sm transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approve & Execute</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INBOX */}
          {activeTab === "inbox" && (
            <div>
              {selectedThreadId ? (
                // Thread View
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedThreadId(null)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                  >
                    <span>&larr; Back to all threads</span>
                  </button>

                  <div className="space-y-3">
                    {threadMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-xl border space-y-2 ${
                          msg.is_draft
                            ? "bg-amber-500/5 border-amber-500/20"
                            : "bg-slate-950/60 border-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-200">
                            {msg.sender} {msg.is_draft && <span className="text-amber-400 font-normal">[DRAFT]</span>}
                          </span>
                          <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-100">{msg.subject}</h4>
                        <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Composer */}
                  <form
                    onSubmit={(e) => {
                      const cur = emailThreads.find((t) => t.thread_id === selectedThreadId);
                      if (cur) handleSendDraft(e, cur);
                    }}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2"
                  >
                    <textarea
                      rows={3}
                      placeholder="Write a draft reply..."
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      className="w-full rounded-lg bg-slate-900 border border-slate-700/60 p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSendingDraft || !replyBody.trim()}
                        className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                      >
                        <Send className="h-3 w-3" />
                        <span>Save Draft</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                // Thread List
                <div className="space-y-2.5">
                  {emailThreads.map((thread) => (
                    <div
                      key={thread.thread_id}
                      onClick={() => handleSelectThread(thread.thread_id)}
                      className={`group p-3.5 rounded-xl border cursor-pointer transition-all ${
                        thread.has_unread
                          ? "bg-slate-900 border-indigo-500/40 hover:border-indigo-500"
                          : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {thread.has_unread && <span className="h-2 w-2 rounded-full bg-indigo-500"></span>}
                          <span
                            className={`text-xs ${
                              thread.has_unread ? "font-bold text-slate-100" : "font-medium text-slate-300"
                            }`}
                          >
                            {thread.last_sender}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(thread.last_activity).toLocaleDateString()}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 truncate ${
                          thread.has_unread ? "font-semibold text-slate-200" : "text-slate-300"
                        }`}
                      >
                        {thread.subject}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{thread.snippet}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CALENDAR */}
          {activeTab === "calendar" && (
            <div className="space-y-3">
              {calendarEvents.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">No scheduled events found.</div>
              ) : (
                calendarEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-semibold text-slate-100">{ev.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                        {ev.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-indigo-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {new Date(ev.start_time).toLocaleDateString()}{" "}
                        {new Date(ev.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                        {new Date(ev.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {ev.location && (
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        <span>{ev.location}</span>
                      </div>
                    )}

                    {ev.attendees && ev.attendees.length > 0 && (
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                        <Users className="h-3 w-3 text-slate-500" />
                        <span>{ev.attendees.join(", ")}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
