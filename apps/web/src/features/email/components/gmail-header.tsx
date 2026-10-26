"use client";

import React from "react";
import { GoogleConnectionStatus } from "@/lib/api-client";

interface GmailHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  googleStatus: GoogleConnectionStatus | null;
  isSyncing: boolean;
  onSync: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function GmailHeader({
  searchQuery,
  onSearchChange,
  googleStatus,
  isSyncing,
  onSync,
  onConnect,
  onDisconnect,
}: GmailHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 border-b border-border-hairline bg-card-surface/80 select-none">
      {/* Brand & Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 shadow-sm">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <span>Gmail</span>
            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
              AI Powered
            </span>
          </h2>
          <p className="text-[10px] text-text-tertiary">
            {googleStatus?.connected && googleStatus.email ? googleStatus.email : "Local Simulated Gateway"}
          </p>
        </div>
      </div>

      {/* Gmail Search Bar */}
      <div className="flex-1 max-w-xl mx-2">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined text-[18px] text-text-tertiary absolute left-3 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search in mail..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-elevated-surface border border-border-hairline text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 text-text-tertiary hover:text-text-primary p-0.5"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {googleStatus?.connected ? (
          <>
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-hover font-medium text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
              title="Sync latest live messages from Gmail"
            >
              <span className={`material-symbols-outlined text-[16px] ${isSyncing ? "animate-spin" : ""}`}>
                sync
              </span>
              <span>{isSyncing ? "Syncing..." : "Sync Gmail"}</span>
            </button>

            <button
              onClick={onDisconnect}
              className="p-1.5 rounded-lg text-text-tertiary hover:text-red-400 hover:bg-red-500/10 transition"
              title="Disconnect Google Account"
            >
              <span className="material-symbols-outlined text-[18px]">link_off</span>
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md transition"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            <span>Connect Gmail</span>
          </button>
        )}
      </div>
    </div>
  );
}
