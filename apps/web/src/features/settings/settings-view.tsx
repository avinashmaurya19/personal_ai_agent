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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 pb-6 border-b border-border-hairline">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Model Providers &amp; Infrastructure Settings
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-success-subtle text-success border border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span> ₹0 Local Compute Target
            </span>
          </div>
          <p className="text-xs text-text-secondary max-w-3xl">
            Configure local Ollama instance, free-tier cloud fallback keys, and connected integrations.
          </p>
        </div>
      </div>

      {/* Provider Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Ollama Local */}
        <div className="p-5 rounded-2xl bg-card-surface border border-border-hairline shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-[18px]">terminal</span>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-text-primary">Ollama Local</h3>
                <p className="text-[10px] text-text-tertiary">http://localhost:11434</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-success-subtle text-success">
              Active • Local
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            Primary inference engine running completely on-device. Zero cost, complete data privacy.
          </p>
          <div className="text-[11px] font-mono text-text-tertiary pt-2 border-t border-border-hairline/60">
            Active: llama3.2, nomic-embed-text
          </div>
        </div>

        {/* Google Gemini */}
        <div className="p-5 rounded-2xl bg-card-surface border border-border-hairline shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-secondary-container/20 text-secondary flex items-center justify-center border border-secondary/20">
                <span className="material-symbols-outlined text-[18px]">cloud</span>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-text-primary">Google Gemini</h3>
                <p className="text-[10px] text-text-tertiary">Free Tier Cloud Fallback</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-subtle text-primary">
              Ready
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            Fallback router for complex multimodal tasks and long-context documents.
          </p>
          <div className="text-[11px] font-mono text-text-tertiary pt-2 border-t border-border-hairline/60">
            Models: gemini-2.0-flash, gemini-1.5-pro
          </div>
        </div>

        {/* Groq Cloud */}
        <div className="p-5 rounded-2xl bg-card-surface border border-border-hairline shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 text-tertiary flex items-center justify-center border border-tertiary/20">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-text-primary">Groq LPU</h3>
                <p className="text-[10px] text-text-tertiary">Ultra Low Latency</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-card-surface text-text-secondary border border-border-hairline">
              Configured
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            High-speed token generation for instant summarization and rapid interactive chat loops.
          </p>
          <div className="text-[11px] font-mono text-text-tertiary pt-2 border-t border-border-hairline/60">
            Model: llama-3.3-70b-versatile
          </div>
        </div>

        {/* Google Workspace & Gmail */}
        <div className="p-5 rounded-2xl bg-card-surface border border-border-hairline shadow-md space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-text-primary">Google &amp; Gmail</h3>
                  <p className="text-[10px] text-text-tertiary">OAuth 2.0 Integration</p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  googleStatus?.connected
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-card-surface text-text-tertiary border border-border-hairline"
                }`}
              >
                {googleStatus?.connected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              {googleStatus?.connected
                ? `Active account: ${googleStatus.email}. Ready for autonomous email sync and agent tools.`
                : "Authorize Personal AI to triage emails and execute autonomous briefings."}
            </p>
          </div>
          <div className="pt-2 border-t border-border-hairline/60 flex items-center justify-between">
            {googleStatus?.connected ? (
              <button
                onClick={handleDisconnectGoogle}
                className="text-xs text-red-400 hover:text-red-300 font-medium transition"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnectGoogle}
                disabled={isConnecting}
                className="text-xs text-primary hover:text-primary-hover font-medium transition flex items-center gap-1"
              >
                <span>{isConnecting ? "Connecting..." : "Connect Account"}</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Available Models List */}
      <div className="mt-6 bg-card-surface border border-border-hairline rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">
          Discovered Runtime Models ({models.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {models.map((m) => (
            <div
              key={`${m.provider}-${m.id}`}
              className="p-3 rounded-xl bg-elevated-surface border border-border-hairline flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-text-primary block">{m.name}</span>
                <span className="text-[11px] text-text-tertiary font-mono">{m.provider}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-success font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                Online
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
