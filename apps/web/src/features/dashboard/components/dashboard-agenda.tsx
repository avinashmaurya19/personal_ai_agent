"use client";

import React from "react";
import { CalendarEventItem } from "@/lib/api-client";

interface DashboardAgendaProps {
  calendarEvents: CalendarEventItem[];
  onOpenCalendar: () => void;
}

export function DashboardAgenda({
  calendarEvents,
  onOpenCalendar,
}: DashboardAgendaProps) {
  return (
    <section className="lg:col-span-5 flex flex-col bg-card-surface border border-border-hairline rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-hairline/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-elevated-surface flex items-center justify-center text-secondary border border-border-hairline">
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary tracking-tight">
              Upcoming Agenda
            </h2>
            <p className="text-xs text-text-tertiary">
              {calendarEvents.length} events • Synced
            </p>
          </div>
        </div>
        <button
          onClick={onOpenCalendar}
          className="text-xs font-medium text-secondary hover:underline flex items-center gap-1"
        >
          <span>Calendar</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[420px]">
        {calendarEvents.length === 0 ? (
          <div className="p-4 rounded-xl bg-elevated-surface/50 border border-border-hairline text-center text-xs text-text-tertiary">
            No events currently scheduled. Your calendar is clear.
          </div>
        ) : (
          calendarEvents.map((evt, idx) => {
            const isNext = idx === 0;
            return (
              <div
                key={evt.id}
                className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
                  isNext
                    ? "bg-elevated-surface border-border-active shadow-md"
                    : "bg-elevated-surface/60 border-border-hairline hover:bg-elevated-surface"
                }`}
              >
                <div className="flex items-center justify-between">
                  {isNext ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary text-on-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      Next Up
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-card-surface text-text-secondary border border-border-hairline">
                      Scheduled
                    </span>
                  )}
                  <span className="text-xs font-mono text-text-tertiary">
                    {evt.start_time
                      ? new Date(evt.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Today"}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-text-primary leading-snug">
                  {evt.title}
                </h3>

                {evt.description && (
                  <p className="text-xs text-text-secondary line-clamp-1">
                    {evt.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">videocam</span>
                    Virtual Meeting
                  </span>
                  {isNext && (
                    <button className="px-3 py-1 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-medium transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">videocam</span>
                      <span>Join Call</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
