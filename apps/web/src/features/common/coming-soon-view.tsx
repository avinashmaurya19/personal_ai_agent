"use client";

import React, { useState } from "react";

interface ComingSoonViewProps {
  moduleName: string;
  icon: string;
  description: string;
  upcomingFeatures: Array<{
    title: string;
    detail: string;
    icon: string;
  }>;
}

export function ComingSoonView({
  moduleName,
  icon,
  description,
  upcomingFeatures,
}: ComingSoonViewProps) {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 max-w-4xl mx-auto text-center select-none animate-fadeIn">
      {/* Glowing Floating Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-500 p-[2px] shadow-2xl shadow-indigo-500/25">
          <div className="w-full h-full bg-[#0B1020] rounded-[22px] flex items-center justify-center text-cyan-400">
            <span className="material-symbols-outlined text-[36px]">{icon}</span>
          </div>
        </div>
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500" />
        </span>
      </div>

      {/* Pill Badge */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
        Phase 3 Roadmap • Coming Soon
      </span>

      {/* Title & Description */}
      <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
        {moduleName}
      </h1>
      <p className="text-sm text-slate-400 max-w-lg mb-8 leading-relaxed">
        {description}
      </p>

      {/* Preview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8 text-left">
        {upcomingFeatures.map((feat) => (
          <div
            key={feat.title}
            className="p-4 rounded-2xl bg-[#0D1527]/75 border border-white/5 backdrop-blur-md shadow-md flex flex-col gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
              <span className="material-symbols-outlined text-[18px]">
                {feat.icon}
              </span>
            </div>
            <h3 className="text-xs font-semibold text-white tracking-tight">
              {feat.title}
            </h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              {feat.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSubscribed(true)}
          disabled={subscribed}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 hover:opacity-95 active:scale-95 disabled:opacity-80 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">
            {subscribed ? "check" : "notifications"}
          </span>
          <span>{subscribed ? "Notification Enabled" : "Notify Me When Ready"}</span>
        </button>
      </div>
    </div>
  );
}
