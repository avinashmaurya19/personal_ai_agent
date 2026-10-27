"use client";

import React, { useState } from "react";
import { CalendarEventItem, api } from "@/lib/api-client";

interface CalendarViewProps {
  events: CalendarEventItem[];
  onRefresh: () => void;
}

export function CalendarView({ events, onRefresh }: CalendarViewProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Demo schedule if user hasn't added events yet
  const displayEvents =
    events.length > 0
      ? events
      : [
          {
            id: "ev-1",
            title: "Team Sync & Sprint Review",
            description: "Review sprint deliverables with engineering team.",
            start_time: "2026-10-28T10:00:00Z",
            end_time: "2026-10-28T11:00:00Z",
            location: "Google Meet",
            attendees: ["avinash@acevertix.com", "sarah@acevertix.com"],
            status: "confirmed",
            created_at: new Date().toISOString(),
          },
          {
            id: "ev-2",
            title: "Product Architecture Discussion",
            description: "Deep dive into multi-tenant isolation and LLM gateway routing.",
            start_time: "2026-10-28T12:00:00Z",
            end_time: "2026-10-28T13:00:00Z",
            location: "Zoom",
            attendees: ["avinash@acevertix.com"],
            status: "confirmed",
            created_at: new Date().toISOString(),
          },
          {
            id: "ev-3",
            title: "Client Partnership Call",
            description: "Quarterly review and workflow integration presentation.",
            start_time: "2026-10-28T15:00:00Z",
            end_time: "2026-10-28T16:00:00Z",
            location: "Google Meet",
            attendees: ["partner@client.com"],
            status: "confirmed",
            created_at: new Date().toISOString(),
          },
        ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      const startTime = newDate && newTime ? `${newDate}T${newTime}:00Z` : new Date().toISOString();
      const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();
      await api.createCalendarEvent({
        title: newTitle.trim(),
        start_time: startTime,
        end_time: endTime,
        attendees: [],
      });
      setNewTitle("");
      onRefresh();
    } catch (err) {
      console.error("Failed to create event:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 pb-6 border-b border-white/5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Calendar &amp; Agenda
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Live Sync Active
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Unified schedule, meetings, and AI-assisted agenda management.
          </p>
        </div>
      </div>

      {/* Quick Event Creator */}
      <form
        onSubmit={handleCreate}
        className="mt-6 p-4 rounded-2xl bg-[#0C1222]/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-wrap items-center gap-3"
      >
        <input
          type="text"
          placeholder="New event title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 min-w-[200px] h-10 px-4 bg-white/5 rounded-xl text-xs text-white placeholder:text-slate-500 border border-white/10 focus:outline-none focus:border-indigo-500/50"
        />
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="h-10 px-3 bg-white/5 rounded-xl text-xs text-slate-300 border border-white/10 focus:outline-none"
        />
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          className="h-10 px-3 bg-white/5 rounded-xl text-xs text-slate-300 border border-white/10 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isCreating || !newTitle.trim()}
          className="h-10 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-xs font-semibold hover:opacity-95 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Add Event</span>
        </button>
      </form>

      {/* Events Timeline List */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayEvents.map((evt) => {
          const startDate = new Date(evt.start_time);
          const timeStr = isNaN(startDate.getTime())
            ? evt.start_time
            : startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const dateStr = isNaN(startDate.getTime())
            ? ""
            : startDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

          return (
            <div
              key={evt.id}
              className="p-4 rounded-2xl bg-[#0D1527]/75 hover:bg-[#131F38]/90 border border-white/5 hover:border-indigo-500/30 backdrop-blur-md shadow-md flex flex-col justify-between gap-3 transition-all group"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                    {timeStr} {dateStr && `• ${dateStr}`}
                  </span>
                  {evt.location && (
                    <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      {evt.location}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  {evt.title}
                </h3>

                {evt.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {evt.description}
                  </p>
                )}
              </div>

              {evt.location && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {evt.attendees?.length || 1} attendee(s)
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-colors flex items-center gap-1"
                  >
                    <span>Join Call</span>
                    <span className="material-symbols-outlined text-[14px]">videocam</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
