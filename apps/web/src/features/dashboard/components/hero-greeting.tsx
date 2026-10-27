"use client";

import React from "react";
import { useAuth } from "@/features/auth/auth-context";

interface HeroGreetingProps {
  onCheckEmails: () => void;
  onAddTask: () => void;
  onSummarizeDoc: () => void;
  onPlanTrip: () => void;
  onGenerateReport: () => void;
}

export function HeroGreeting({
  onCheckEmails,
  onAddTask,
  onSummarizeDoc,
  onPlanTrip,
  onGenerateReport,
}: HeroGreetingProps) {
  const { user } = useAuth();

  // Dynamic time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName =
    user?.full_name ||
    (user?.email ? user.email.split("@")[0] : "Avinash");

  const actionCards = [
    {
      id: "emails",
      icon: "mail",
      colorClass: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      line1: "Check my",
      line2: "unread emails",
      onClick: onCheckEmails,
    },
    {
      id: "tasks",
      icon: "check_box",
      colorClass: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      line1: "Add a new",
      line2: "task for today",
      onClick: onAddTask,
    },
    {
      id: "docs",
      icon: "description",
      colorClass: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
      line1: "Summarize",
      line2: "this document",
      onClick: onSummarizeDoc,
    },
    {
      id: "trip",
      icon: "flight",
      colorClass: "text-sky-400 border-sky-500/30 bg-sky-500/10",
      line1: "Plan my",
      line2: "next trip",
      onClick: onPlanTrip,
    },
    {
      id: "report",
      icon: "bar_chart",
      colorClass: "text-teal-400 border-teal-500/30 bg-teal-500/10",
      line1: "Generate",
      line2: "a report",
      onClick: onGenerateReport,
    },
  ];

  return (
    <div className="flex flex-col gap-5 pt-4 pb-2 z-10 relative">
      {/* Greeting Heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>{getGreeting()}, {displayName}</span>
          <span>👋</span>
        </h1>
        <p className="text-sm text-slate-300 font-normal">
          How can I help you today?
        </p>
      </div>

      {/* 5 Quick Action Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {actionCards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={card.onClick}
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-[#0D1527]/75 hover:bg-[#131F38]/90 border border-white/5 hover:border-indigo-500/40 backdrop-blur-md transition-all group shadow-sm hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:translate-y-0 select-none"
          >
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105 ${card.colorClass}`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {card.icon}
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-200 leading-tight">
              {card.line1}
              <br />
              {card.line2}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
