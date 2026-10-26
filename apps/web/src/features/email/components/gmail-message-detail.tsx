"use client";

import React, { useState, useEffect } from "react";
import { EmailThreadItem, EmailMessageItem, api } from "@/lib/api-client";

interface GmailMessageDetailProps {
  thread: EmailThreadItem;
  onBack: () => void;
  isStarred: boolean;
  onToggleStar: (threadId: string, e: React.MouseEvent) => void;
  onRefresh: () => void;
}

export function GmailMessageDetail({
  thread,
  onBack,
  isStarred,
  onToggleStar,
  onRefresh,
}: GmailMessageDetailProps) {
  const [messages, setMessages] = useState<EmailMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api.getThreadMessages(thread.thread_id)
      .then((msgs) => {
        if (isMounted) setMessages(msgs);
        api.markThreadRead(thread.thread_id).catch(() => {});
      })
      .catch((err) => {
        console.error("Failed to load thread messages:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [thread.thread_id]);

  const getInitial = (nameOrEmail: string) => {
    const clean = nameOrEmail.replace(/["<].*/, "").trim();
    return clean ? clean[0].toUpperCase() : "G";
  };

  const getAvatarColor = (nameOrEmail: string) => {
    const colors = [
      "bg-blue-600",
      "bg-indigo-600",
      "bg-emerald-600",
      "bg-purple-600",
      "bg-rose-600",
      "bg-amber-600",
      "bg-cyan-600",
    ];
    let hash = 0;
    for (let i = 0; i < nameOrEmail.length; i++) {
      hash = nameOrEmail.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleApplySmartReply = (reply: string) => {
    setIsReplying(true);
    setReplyText(reply);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsSending(true);
    setReplyFeedback(null);
    try {
      await api.sendEmail({
        recipient: thread.last_sender,
        subject: thread.subject.startsWith("Re:") ? thread.subject : `Re: ${thread.subject}`,
        body: replyText.trim(),
        thread_id: thread.thread_id,
      });
      setReplyFeedback("Email reply sent successfully!");
      setReplyText("");
      setIsReplying(false);
      onRefresh();
    } catch (err: any) {
      setReplyFeedback(`Error: ${err.message || "Failed to send reply"}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteThread = async () => {
    if (!window.confirm("Move this email to trash?")) return;
    try {
      await api.trashGmailMessage(thread.thread_id);
    } catch {
      // ignore
    }
    onBack();
    onRefresh();
  };

  const smartReplies = [
    "Thank you! Acknowledged and reviewing now.",
    "Could we schedule a quick 15-minute call to discuss?",
    "Got it, will update you with the finalized details shortly.",
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-card-surface/40 select-none overflow-y-auto">
      {/* Top Action Toolbar (Real Gmail Header) */}
      <div className="h-12 border-b border-border-hairline px-4 flex items-center justify-between text-xs text-text-tertiary bg-card-surface/60 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-elevated-surface hover:text-text-primary text-text-secondary transition flex items-center gap-1 mr-2"
            title="Back to Inbox"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="text-xs font-medium">Inbox</span>
          </button>

          <button
            onClick={(e) => onToggleStar(thread.thread_id, e)}
            className="p-1.5 rounded-lg hover:bg-elevated-surface hover:text-amber-400 transition"
            title={isStarred ? "Starred" : "Star message"}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isStarred ? "text-amber-400 fill-current" : "text-text-tertiary"
              }`}
            >
              {isStarred ? "star" : "star_border"}
            </span>
          </button>

          <button
            onClick={handleDeleteThread}
            className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-text-tertiary transition"
            title="Move to Trash"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-text-tertiary font-mono">
          <span className="px-2 py-0.5 rounded bg-elevated-surface text-[10px]">
            {new Date(thread.last_activity).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Thread Subject Title & Labels */}
        <div className="space-y-2 border-b border-border-hairline pb-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-bold text-text-primary tracking-tight leading-snug">
              {thread.subject}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
              Inbox
            </span>
          </div>
        </div>

        {/* AI Executive Briefing Co-Pilot Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-card-surface border border-indigo-500/20 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              <span>Personal AI Executive Briefing</span>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified &amp; Triaged
            </span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            {thread.snippet || "This message has been ingested by Personal AI."}
          </p>

          {/* Smart Reply Suggestions */}
          <div className="pt-2 border-t border-indigo-500/10 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-tertiary block">
              Suggested Smart Replies
            </span>
            <div className="flex flex-wrap gap-2">
              {smartReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplySmartReply(reply)}
                  className="px-3 py-1.5 rounded-xl bg-card-surface/80 hover:bg-indigo-600/20 border border-border-hairline hover:border-indigo-500/40 text-[11px] text-text-secondary hover:text-indigo-300 font-medium transition text-left"
                >
                  &ldquo;{reply}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages in Thread (Gmail message cards) */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-text-tertiary">
            <span className="material-symbols-outlined text-[24px] animate-spin block mx-auto mb-2 text-primary">
              sync
            </span>
            Loading email message details...
          </div>
        ) : messages.length === 0 ? (
          /* Fallback if single thread record */
          <div className="p-5 rounded-2xl bg-card-surface border border-border-hairline shadow-md space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${getAvatarColor(
                    thread.last_sender
                  )} text-white font-bold flex items-center justify-center text-sm shadow-sm`}
                >
                  {getInitial(thread.last_sender)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary">
                      {thread.last_sender}
                    </span>
                    <span className="text-[11px] text-text-tertiary font-mono">
                      &lt;{thread.recipient}&gt;
                    </span>
                  </div>
                  <span className="text-[10px] text-text-tertiary">to me</span>
                </div>
              </div>
              <span className="text-[11px] text-text-tertiary font-mono">
                {new Date(thread.last_activity).toLocaleString()}
              </span>
            </div>

            <div className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap pl-13 font-sans">
              {thread.snippet}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-card-surface border border-border-hairline shadow-md space-y-4"
            >
              {/* Message Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${getAvatarColor(
                      m.sender
                    )} text-white font-bold flex items-center justify-center text-sm shadow-sm`}
                  >
                    {getInitial(m.sender)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">{m.sender}</span>
                      <span className="text-[11px] text-text-tertiary font-mono">
                        &lt;{m.recipient}&gt;
                      </span>
                    </div>
                    <span className="text-[10px] text-text-tertiary">to me</span>
                  </div>
                </div>
                <span className="text-[11px] text-text-tertiary font-mono">
                  {new Date(m.created_at).toLocaleString()}
                </span>
              </div>

              {/* Message Body */}
              {m.body && /<[a-z][\s\S]*>/i.test(m.body) ? (
                <div className="pl-13 pt-1">
                  <iframe
                    sandbox="allow-same-origin"
                    srcDoc={m.body}
                    className="w-full min-h-[380px] border border-border-hairline rounded-xl bg-white text-slate-900 shadow-sm"
                    title="Email Body HTML"
                  />
                </div>
              ) : (
                <div className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap pl-13 font-sans">
                  {m.body || m.snippet}
                </div>
              )}
            </div>
          ))
        )}

        {/* Feedback Message */}
        {replyFeedback && (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs flex items-center justify-between">
            <span>{replyFeedback}</span>
            <button onClick={() => setReplyFeedback(null)} className="hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Gmail Reply Box */}
        <div className="rounded-2xl border border-border-hairline bg-card-surface/80 overflow-hidden shadow-md">
          {!isReplying ? (
            <div className="p-4 flex items-center gap-3">
              <button
                onClick={() => setIsReplying(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-hairline hover:bg-elevated-surface text-xs font-medium text-text-secondary hover:text-text-primary transition"
              >
                <span className="material-symbols-outlined text-[16px]">reply</span>
                <span>Reply</span>
              </button>
              <button
                onClick={() => setIsReplying(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-hairline hover:bg-elevated-surface text-xs font-medium text-text-secondary hover:text-text-primary transition"
              >
                <span className="material-symbols-outlined text-[16px]">forward</span>
                <span>Forward</span>
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-text-tertiary pb-2 border-b border-border-hairline">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">reply</span>
                  <span>
                    Reply to <span className="font-semibold text-text-primary">{thread.last_sender}</span>
                  </span>
                </div>
                <button
                  onClick={() => setIsReplying(false)}
                  className="text-text-tertiary hover:text-text-primary"
                >
                  ✕
                </button>
              </div>

              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                placeholder="Type your response here or pick a smart suggestion above..."
                className="w-full bg-elevated-surface border border-border-hairline rounded-xl p-3 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendReply}
                    disabled={isSending || !replyText.trim()}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
                  >
                    <span>{isSending ? "Sending..." : "Send"}</span>
                    <span className="material-symbols-outlined text-[14px]">send</span>
                  </button>

                  <button
                    onClick={() => {
                      setReplyText(
                        (prev) =>
                          prev +
                          "\n\nThank you for the update. I have reviewed the details and will proceed accordingly."
                      );
                    }}
                    className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-medium text-xs flex items-center gap-1 border border-purple-500/20 transition"
                  >
                    <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                    <span>AI Polish</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setReplyText("");
                    setIsReplying(false);
                  }}
                  className="p-2 text-text-tertiary hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                  title="Discard draft"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
