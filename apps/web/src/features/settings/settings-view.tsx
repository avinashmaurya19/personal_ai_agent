"use client";

import React, { useState, useEffect } from "react";
import { ModelOption, GoogleConnectionStatus, api } from "@/lib/api-client";

interface SettingsViewProps {
  models: ModelOption[];
}

export function SettingsView({ models }: SettingsViewProps) {
  const [googleStatus, setGoogleStatus] = useState<GoogleConnectionStatus | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    api.getGoogleStatus()
      .then(setGoogleStatus)
      .catch(() => setGoogleStatus({ connected: false, email: null, scopes: [], expires_at: null }));
  }, []);

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      const res = await api.getGoogleAuthUrl();
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
      }
    } catch (err) {
      console.error("Failed to get Google auth URL:", err);
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!window.confirm("Are you sure you want to disconnect Google?")) return;
    try {
      await api.disconnectGoogle();
      const status = await api.getGoogleStatus();
      setGoogleStatus(status);
    } catch (err) {
      console.error("Failed to disconnect Google:", err);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 pb-6 border-b border-white/5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              System Settings &amp; Infrastructure
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ₹0 Local Compute Target
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Configure local inference endpoints, API keys, and workspace parameters.
          </p>
        </div>
      </div>

      {/* Provider Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Ollama Local */}
        <div className="p-5 rounded-2xl bg-[#0D1527]/75 border border-white/5 backdrop-blur-md shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/5 text-indigo-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">terminal</span>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Ollama Local</h3>
                <p className="text-[10px] text-slate-500 font-mono">localhost:11434</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active • Local
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Primary inference engine running completely on-device. Zero cost, complete data privacy.
          </p>
          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
            Active: llama3.2, nomic-embed-text
          </div>
        </div>

        {/* Google Gemini */}
        <div className="p-5 rounded-2xl bg-[#0D1527]/75 border border-white/5 backdrop-blur-md shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/5 text-cyan-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">cloud</span>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Google Gemini</h3>
                <p className="text-[10px] text-slate-500">Free Tier Cloud</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Ready
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Fallback router for complex multimodal tasks and long-context documents.
          </p>
          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
            gemini-2.0-flash, gemini-1.5-pro
          </div>
        </div>

        {/* Groq Cloud */}
        <div className="p-5 rounded-2xl bg-[#0D1527]/75 border border-white/5 backdrop-blur-md shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/5 text-amber-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Groq LPU</h3>
                <p className="text-[10px] text-slate-500">Ultra Low Latency</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-slate-400 border border-white/10">
              Configured
            </span>
          </div>
          <p className="text-xs text-slate-300">
            High-speed token generation for instant summarization and rapid interactive loops.
          </p>
          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
            llama-3.3-70b-versatile
          </div>
        </div>

        {/* Google Workspace & Gmail */}
        <div className="p-5 rounded-2xl bg-[#0D1527]/75 border border-white/5 backdrop-blur-md shadow-md space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Google &amp; Gmail</h3>
                  <p className="text-[10px] text-slate-500">OAuth 2.0</p>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                  googleStatus?.connected
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-white/5 text-slate-400 border border-white/10"
                }`}
              >
                {googleStatus?.connected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {googleStatus?.connected
                ? `Account: ${googleStatus.email}. Ready for autonomous sync.`
                : "Authorize AceVertix to triage emails and execute briefings."}
            </p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            {googleStatus?.connected ? (
              <button
                type="button"
                onClick={handleDisconnectGoogle}
                className="text-xs text-red-400 hover:text-red-300 font-medium transition"
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={isConnecting}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition flex items-center gap-1"
              >
                <span>{isConnecting ? "Connecting..." : "Connect Account"}</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Available Models List */}
      <div className="mt-6 bg-[#0C1222]/80 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-4">
        <h2 className="text-sm font-semibold text-white">
          Active Runtime Models ({models.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {models.map((m) => (
            <div
              key={`${m.provider}-${m.id}`}
              className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-white block">{m.name}</span>
                <span className="text-[11px] text-slate-400 font-mono">{m.provider}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Online
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
