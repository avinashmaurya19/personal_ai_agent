"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "./auth-context";

interface UserMenuProps {
  variant?: "header" | "sidebar";
  collapsed?: boolean;
  onOpenSettings?: () => void;
}

export function UserMenu({ variant = "header", collapsed = false, onOpenSettings }: UserMenuProps) {
  const { user, token, logout, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.full_name || (user?.email ? user.email.split("@")[0] : "Workspace Owner");
  const displayEmail = user?.email || "dev@personal-ai.local";
  const isAuthenticated = Boolean(token);

  if (variant === "sidebar") {
    if (collapsed) {
      return (
        <div className="relative flex justify-center py-1" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            title={displayName}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors relative"
          >
            {user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-xs font-bold uppercase">{displayName.charAt(0)}</span>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#090D18]"></span>
          </button>
          {isOpen && (
            <div className="absolute bottom-full mb-2 left-0 w-56 bg-[#0E1526] border border-white/10 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 text-xs">
              <div className="px-3 py-2 border-b border-white/10 flex flex-col">
                <span className="font-semibold text-white truncate">{displayName}</span>
                <span className="text-[11px] text-slate-400 truncate">{displayEmail}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openAuthModal();
                }}
                className="w-full px-3 py-2 rounded-lg text-left text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">switch_account</span>
                <span>{isAuthenticated ? "Switch Account" : "Sign In / Register"}</span>
              </button>
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full px-3 py-2 rounded-lg text-left text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">settings</span>
                  <span>System Settings</span>
                </button>
              )}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="w-full px-3 py-2 rounded-lg text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="relative m-3" ref={menuRef}>
        <div
          onClick={() => setIsOpen((prev) => !prev)}
          className="p-3 bg-card-surface border border-border-hairline hover:border-border-active rounded-xl flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-elevated-surface flex items-center justify-center overflow-hidden border border-border-hairline text-primary">
                {user?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold uppercase">
                    {displayName.charAt(0)}
                  </span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-card-surface"></span>
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-xs font-semibold text-text-primary truncate">
                {displayName}
              </span>
              <span className="text-[11px] text-text-tertiary truncate">
                {isAuthenticated ? "Sandbox Active" : "Workspace Owner"}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[18px] text-text-tertiary">
            unfold_more
          </span>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute bottom-full mb-2 left-0 right-0 bg-sidebar-bg border border-border-hairline rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 text-xs">
            <div className="px-3 py-2 border-b border-border-hairline/60 flex flex-col">
              <span className="font-semibold text-text-primary truncate">{displayName}</span>
              <span className="text-[11px] text-text-tertiary truncate">{displayEmail}</span>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                openAuthModal();
              }}
              className="w-full px-3 py-2 rounded-lg text-left text-text-secondary hover:text-text-primary hover:bg-elevated-surface flex items-center gap-2.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">switch_account</span>
              <span>{isAuthenticated ? "Switch Account" : "Sign In / Register"}</span>
            </button>

            {onOpenSettings && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="w-full px-3 py-2 rounded-lg text-left text-text-secondary hover:text-text-primary hover:bg-elevated-surface flex items-center gap-2.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">settings</span>
                <span>System Settings</span>
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full px-3 py-2 rounded-lg text-left text-danger hover:bg-danger-subtle/30 flex items-center gap-2.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Header Variant
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-8 h-8 rounded-full bg-white text-slate-900 font-bold flex items-center justify-center text-xs shadow-md hover:ring-2 hover:ring-indigo-400 transition-all select-none"
        aria-label="User Account"
        type="button"
      >
        {user?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
        ) : (
          <span>{displayName.charAt(0).toUpperCase()}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-56 bg-sidebar-bg border border-border-hairline rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 text-xs">
          <div className="px-3 py-2 border-b border-border-hairline/60 flex flex-col">
            <span className="font-semibold text-text-primary truncate">{displayName}</span>
            <span className="text-[11px] text-text-tertiary truncate">{displayEmail}</span>
            <span className="text-[10px] text-success mt-0.5">
              {isAuthenticated ? "• Authenticated Token" : "• Local Dev Workspace"}
            </span>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              openAuthModal();
            }}
            className="w-full px-3 py-2 rounded-lg text-left text-text-secondary hover:text-text-primary hover:bg-elevated-surface flex items-center gap-2.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">switch_account</span>
            <span>{isAuthenticated ? "Switch Account" : "Sign In / Register"}</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full px-3 py-2 rounded-lg text-left text-danger hover:bg-danger-subtle/30 flex items-center gap-2.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Sign Out</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
