"use client";

import React, { useState } from "react";

interface AiPromptCenterProps {
  onSendPrompt: (prompt: string, sources?: string[]) => void;
}

export function AiPromptCenter({ onSendPrompt }: AiPromptCenterProps) {
  const [prompt, setPrompt] = useState("");
  const [activeSources, setActiveSources] = useState<string[]>([
    "web",
    "docs",
    "gmail",
    "calendar",
    "notion",
  ]);

  const toggleSource = (id: string) => {
    setActiveSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSendPrompt(prompt.trim(), activeSources);
    setPrompt("");
  };

  const handleSuggestion = (text: string) => {
    setPrompt(text);
    onSendPrompt(text, activeSources);
  };

  const sources = [
    { id: "web", label: "Web search", icon: "travel_explore", badgeColor: "text-cyan-400" },
    { id: "docs", label: "My documents", icon: "description", badgeColor: "text-indigo-400" },
    {
      id: "gmail",
      label: "Gmail",
      customIcon: (
        <span className="w-3.5 h-3.5 bg-red-500 text-white font-bold rounded-sm text-[9px] flex items-center justify-center">
          M
        </span>
      ),
    },
    {
      id: "calendar",
      label: "Calendar",
      customIcon: (
        <span className="w-3.5 h-3.5 bg-blue-500 text-white font-bold rounded-sm text-[9px] flex items-center justify-center">
          31
        </span>
      ),
    },
    {
      id: "notion",
      label: "Notion",
      customIcon: (
        <span className="w-3.5 h-3.5 bg-slate-100 text-slate-900 font-bold rounded-sm text-[9px] flex items-center justify-center">
          N
        </span>
      ),
    },
  ];

  const suggestions = [
    "Summarize my day",
    "Find important emails",
    "Create a weekly plan",
    "Research a topic",
  ];

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Main Input Box */}
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-2xl bg-[#0B1120]/85 border border-white/10 hover:border-indigo-500/30 backdrop-blur-xl shadow-2xl p-4 flex flex-col gap-3 transition-all"
      >
        <textarea
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask me anything or give me a task..."
          className="w-full bg-transparent resize-none text-sm text-white placeholder:text-slate-400 focus:outline-none leading-relaxed"
        />

        {/* Bottom Toolbar inside the box */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
          {/* Source Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {sources.map((s) => {
              const isSelected = activeSources.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSource(s.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    isSelected
                      ? "bg-white/10 text-white border-white/15 shadow-sm"
                      : "bg-white/5 text-slate-400 border-transparent hover:text-slate-300"
                  }`}
                >
                  {s.customIcon ? (
                    s.customIcon
                  ) : (
                    <span
                      className={`material-symbols-outlined text-[15px] ${
                        isSelected ? s.badgeColor : "text-slate-400"
                      }`}
                    >
                      {s.icon}
                    </span>
                  )}
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!prompt.trim()}
            aria-label="Send prompt"
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px] translate-x-[1px] -translate-y-[1px]">
              send
            </span>
          </button>
        </div>
      </form>

      {/* Suggestion Pills below */}
      <div className="flex flex-wrap items-center gap-2">
        {suggestions.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => handleSuggestion(text)}
            className="px-3.5 py-1.5 rounded-xl bg-[#0D1527]/70 hover:bg-[#131F38]/90 border border-white/5 hover:border-white/15 text-xs text-slate-300 hover:text-white transition-all shadow-sm select-none"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
