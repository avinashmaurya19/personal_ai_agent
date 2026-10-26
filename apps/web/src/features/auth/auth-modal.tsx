"use client";

import React, { useState } from "react";
import { useAuth } from "./auth-context";

interface AuthModalProps {
  onSuccess?: () => void;
}

export function AuthModal({ onSuccess }: AuthModalProps) {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        await register(email.trim(), password, fullName.trim() || undefined);
      } else {
        await login(email.trim(), password);
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md bg-sidebar-bg border border-border-hairline rounded-2xl shadow-2xl p-6 relative flex flex-col gap-5"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary p-1 rounded-lg hover:bg-elevated-surface transition-colors"
          aria-label="Close"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center gap-2 pt-2">
          <div className="w-12 h-12 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-[26px]">lock</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary">
            {isRegisterMode ? "Create Your Account" : "Sign In to Personal AI"}
          </h2>
          <p className="text-xs text-text-tertiary max-w-xs">
            {isRegisterMode
              ? "Your personal data, notes, and emails remain in your private sandbox."
              : "Access your private sandbox, memory graph, and live integrations."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-elevated-surface rounded-xl border border-border-hairline text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              !isRegisterMode
                ? "bg-secondary-container text-on-secondary-container shadow-sm font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              isRegisterMode
                ? "bg-secondary-container text-on-secondary-container shadow-sm font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-danger-subtle/40 border border-danger/40 text-danger text-xs">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {isRegisterMode && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Avinash Maurya"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-elevated-surface border border-border-hairline focus:border-border-active focus:outline-none text-xs text-text-primary transition-colors"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-elevated-surface border border-border-hairline focus:border-border-active focus:outline-none text-xs text-text-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-elevated-surface border border-border-hairline focus:border-border-active focus:outline-none text-xs text-text-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 mt-2 rounded-lg bg-primary hover:bg-primary-hover active:bg-primary-active text-on-primary font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isRegisterMode ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-[11px] text-text-tertiary">
          Data isolation enforced per owner sandbox. ₹0 cloud overhead.
        </div>
      </div>
    </div>
  );
}
