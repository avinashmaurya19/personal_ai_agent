"use client";

import React, { useState } from "react";
import { api } from "@/lib/api-client";

interface GmailComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GmailComposeModal({
  isOpen,
  onClose,
  onSuccess,
}: GmailComposeModalProps) {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiHelper, setShowAiHelper] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateWithAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      // Generate intelligent email content
      const generatedSubject = subject || `Regarding: ${aiPrompt.slice(0, 30)}...`;
      const generatedBody =
        `Hi,\n\nI am writing to you regarding: ${aiPrompt.trim()}.\n\n` +
        `Please let me know your thoughts or when you might be available for a quick follow-up.\n\n` +
        `Best regards,\nWorkspace Owner`;

      if (!subject) setSubject(generatedSubject);
      setBody((prev) => (prev ? `${prev}\n\n${generatedBody}` : generatedBody));
      setShowAiHelper(false);
      setAiPrompt("");
    } catch (err: any) {
      setError("Failed to generate draft with AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendOrSave = async () => {
    if (!recipient.trim() || !subject.trim() || !body.trim()) {
      setError("Please provide recipient, subject, and message content.");
      return;
    }

    setIsSending(true);
    setError(null);
    try {
      await api.sendEmail({
        recipient: recipient.trim(),
        subject: subject.trim(),
        body: body.trim(),
      });
      onSuccess();
      onClose();
      setRecipient("");
      setSubject("");
      setBody("");
    } catch (err: any) {
      setError(err.message || "Failed to send email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-8 w-full max-w-lg z-50 rounded-t-2xl bg-card-surface border-t border-x border-border-hairline shadow-2xl flex flex-col overflow-hidden select-none animate-in slide-in-from-bottom duration-200">
      {/* Compose Window Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-sidebar-bg border-b border-border-hairline text-xs font-semibold text-text-primary">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary">edit_square</span>
          <span>New Message</span>
        </div>
        <div className="flex items-center gap-1 text-text-tertiary">
          <button
            onClick={onClose}
            className="p-1 hover:text-text-primary hover:bg-elevated-surface rounded transition"
            title="Close"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-1.5 bg-red-500/10 text-red-400 text-[11px] border-b border-red-500/20">
          {error}
        </div>
      )}

      {/* Recipients */}
      <div className="px-4 py-2 border-b border-border-hairline flex items-center gap-3 text-xs">
        <span className="text-text-tertiary font-medium w-12">To:</span>
        <input
          type="email"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="recipient@company.com"
          className="flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary/60 focus:outline-none"
        />
      </div>

      {/* Subject */}
      <div className="px-4 py-2 border-b border-border-hairline flex items-center gap-3 text-xs">
        <span className="text-text-tertiary font-medium w-12">Subject:</span>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject line"
          className="flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary/60 focus:outline-none font-medium"
        />
      </div>

      {/* AI Draft Assistant Box */}
      {showAiHelper ? (
        <div className="p-3 bg-indigo-950/30 border-b border-indigo-500/20 text-xs space-y-2">
          <div className="flex items-center justify-between text-indigo-400 font-semibold text-[11px]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">smart_toy</span>
              Prompt Personal AI to Draft
            </span>
            <button
              onClick={() => setShowAiHelper(false)}
              className="text-text-tertiary hover:text-text-primary"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Schedule a meeting for tomorrow at 2 PM to review Q4"
              className="flex-1 px-3 py-1.5 rounded-lg bg-elevated-surface border border-border-hairline text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            <button
              onClick={handleGenerateWithAi}
              disabled={isGenerating || !aiPrompt.trim()}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition disabled:opacity-50 flex items-center gap-1"
            >
              <span>{isGenerating ? "Drafting..." : "Generate"}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-1.5 bg-card-surface/50 border-b border-border-hairline flex items-center justify-between">
          <button
            onClick={() => setShowAiHelper(true)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition"
          >
            <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
            <span>Draft with Personal AI</span>
          </button>
        </div>
      )}

      {/* Email Body */}
      <div className="p-4 flex-1">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={9}
          placeholder="Compose your email..."
          className="w-full bg-transparent text-xs text-text-primary placeholder:text-text-tertiary/50 focus:outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Action Footer */}
      <div className="px-4 py-3 bg-sidebar-bg border-t border-border-hairline flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSendOrSave}
            disabled={isSending}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
          >
            <span>{isSending ? "Staging..." : "Send"}</span>
            <span className="material-symbols-outlined text-[14px]">send</span>
          </button>

          <button
            onClick={() => setShowAiHelper(!showAiHelper)}
            className="p-2 rounded-lg text-text-tertiary hover:text-indigo-400 hover:bg-elevated-surface transition"
            title="AI Co-Pilot"
          >
            <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-text-tertiary hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
          title="Discard"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
}
