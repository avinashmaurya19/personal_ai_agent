"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "./auth-context";

interface UserMenuProps {
  variant?: "header" | "sidebar";
  onOpenSettings?: () => void;
}

export function UserMenu({ variant = "header", onOpenSettings }: UserMenuProps) {
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
        className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center cursor-pointer text-primary hover:bg-primary/30 transition-colors"
        aria-label="User Account"
        type="button"
      >
        {user?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="text-xs font-bold uppercase">{displayName.charAt(0)}</span>
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
