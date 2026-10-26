"use client";

import React, { useState, useEffect } from "react";
import { GoogleConnectionStatus, api } from "@/lib/api-client";

export function ConnectedAppsView() {
  const [googleStatus, setGoogleStatus] = useState<GoogleConnectionStatus | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const fetchStatus = async () => {
    try {
      const status = await api.getGoogleStatus();
      setGoogleStatus(status);
    } catch {
      setGoogleStatus({ connected: false, email: null, scopes: [], expires_at: null });
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await api.getGoogleAuthUrl();
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to start Google OAuth", type: "error" });
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Disconnect your Google account?")) return;
    try {
      await api.disconnectGoogle();
      setMessage({ text: "Google account disconnected successfully.", type: "info" });
      fetchStatus();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to disconnect", type: "error" });
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await api.syncGmail(10);
      setMessage({ text: `Synced ${res.synced_count} emails from Gmail.`, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to sync Gmail", type: "error" });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 select-none">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 pb-6 border-b border-border-hairline">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Connected Apps &amp; OAuth Integrations</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
              OAuth 2.0 Ready
            </span>
          </div>
          <p className="text-xs text-text-secondary max-w-3xl">
            Authorize third-party services for autonomous agent tool execution, email synchronization, and context enrichment.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`mt-4 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between border ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : message.type === "error"
              ? "bg-red-500/10 text-red-400 border-red-500/30"
              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-text-tertiary hover:text-text-primary">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Google & Gmail Card */}
        <div className="p-6 rounded-2xl bg-card-surface border border-border-hairline shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                  <span className="material-symbols-outlined text-[22px]">mail</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Google &amp; Gmail</h3>
                  <p className="text-[11px] text-text-tertiary">OAuth2 • Read &amp; Send</p>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                  googleStatus?.connected
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-elevated-surface text-text-tertiary border border-border-hairline"
                }`}
              >
                {googleStatus?.connected ? "Connected" : "Not Connected"}
              </span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Enables autonomous email triage, semantic searching, thread summarization, and live inbox synchronization.
            </p>

            {googleStatus?.connected && (
              <div className="p-3 rounded-xl bg-elevated-surface border border-border-hairline text-[11px] space-y-1">
                <div className="flex items-center justify-between text-text-tertiary">
                  <span>Account:</span>
                  <span className="font-semibold text-text-primary font-mono">{googleStatus.email}</span>
                </div>
                {googleStatus.expires_at && (
                  <div className="flex items-center justify-between text-text-tertiary">
                    <span>Token Expiry:</span>
                    <span className="font-mono">{new Date(googleStatus.expires_at).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border-hairline flex items-center justify-between gap-2">
            {googleStatus?.connected ? (
              <>
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-hover font-medium text-xs flex items-center gap-1 transition disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined text-[15px] ${isSyncing ? "animate-spin" : ""}`}>
                    sync
                  </span>
                  <span>{isSyncing ? "Syncing..." : "Sync Gmail"}</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 rounded-lg bg-card-surface border border-border-hairline hover:border-red-500/30 text-text-tertiary hover:text-red-400 text-xs font-medium transition"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <span>{isConnecting ? "Redirecting..." : "Connect Google Account"}</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>

        {/* GitHub Placeholder */}
        <div className="p-6 rounded-2xl bg-card-surface border border-border-hairline shadow-lg flex flex-col justify-between space-y-4 opacity-75">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-elevated-surface text-text-primary flex items-center justify-center border border-border-hairline">
                  <span className="material-symbols-outlined text-[22px]">code</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">GitHub</h3>
                  <p className="text-[11px] text-text-tertiary">Repos, Issues &amp; PRs</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-card-surface text-text-tertiary border border-border-hairline">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Connect personal GitHub repositories to allow autonomous PR generation, codebase reviews, and issue management.
            </p>
          </div>
        </div>

        {/* Notion Placeholder */}
        <div className="p-6 rounded-2xl bg-card-surface border border-border-hairline shadow-lg flex flex-col justify-between space-y-4 opacity-75">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-elevated-surface text-text-primary flex items-center justify-center border border-border-hairline">
                  <span className="material-symbols-outlined text-[22px]">auto_stories</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Notion</h3>
                  <p className="text-[11px] text-text-tertiary">Workspace Knowledge</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-card-surface text-text-tertiary border border-border-hairline">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Bi-directional sync between your Personal AI memory lake and your Notion knowledge base databases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
