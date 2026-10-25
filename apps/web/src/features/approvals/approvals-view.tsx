"use client";

import React, { useState } from "react";
import { PendingActionItem } from "@/lib/api-client";

interface ApprovalsViewProps {
  pendingActions: PendingActionItem[];
  onDecideAction: (actionId: string, approved: boolean) => Promise<void>;
}

export function ApprovalsView({
  pendingActions,
  onDecideAction,
}: ApprovalsViewProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (id: string, approved: boolean) => {
    setProcessingId(id);
    try {
      await onDecideAction(id, approved);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 select-none">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 pb-6 border-b border-border-hairline">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Human-in-the-Loop Approvals
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-warning-subtle text-warning border border-warning/20">
              <span className="material-symbols-outlined text-[13px]">verified_user</span> Security Policy Active
            </span>
          </div>
          <p className="text-xs text-text-secondary max-w-3xl">
            Autonomous tools requiring write, dispatch, or sensitive access halt at security boundaries until you grant explicit authorization.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-card-surface border border-border-hairline flex flex-col justify-between shadow-md">
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Pending Decisional Gates
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-warning tabular-nums">
              {pendingActions.length}
            </span>
            <span className="text-xs text-text-tertiary">Actions</span>
          </div>
          <span className="text-xs text-text-secondary">Awaiting owner signature</span>
        </div>

        <div className="p-4 rounded-xl bg-card-surface border border-border-hairline flex flex-col justify-between shadow-md">
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Safety Boundary
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-text-primary">Strict Guard</span>
          </div>
          <span className="text-xs text-success">Zero unintended writes</span>
        </div>

        <div className="p-4 rounded-xl bg-card-surface border border-border-hairline flex flex-col justify-between shadow-md">
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Audit Ledger
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-text-primary">PostgreSQL</span>
          </div>
          <span className="text-xs text-text-secondary">Immutable trace logs</span>
        </div>
      </div>

      {/* Pending Items List */}
      <div className="mt-6 space-y-4">
        {pendingActions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-card-surface border border-border-hairline space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-success-subtle text-success mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <h3 className="text-sm font-semibold text-text-primary">
              All Security Boundaries Clear
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              There are no pending actions awaiting your authorization. All autonomous agent tasks are up to date.
            </p>
          </div>
        ) : (
          pendingActions.map((action) => (
            <div
              key={action.id}
              className="p-5 rounded-2xl bg-card-surface border border-warning/40 shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-warning-subtle text-warning flex items-center justify-center border border-warning/30 flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      Execution Request: <code className="text-primary font-mono">{action.action_type}</code>
                    </h3>
                    <p className="text-xs text-text-tertiary">
                      {action.description || "Initiated by autonomous task loop • High Consequence Gate"}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-warning-subtle text-warning border border-warning/30">
                  Pending Authorization
                </span>
              </div>

              {/* Parameters Inspector */}
              <div className="bg-elevated-surface rounded-xl p-3 border border-border-hairline">
                <div className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider mb-1.5">
                  Payload Parameters
                </div>
                <pre className="text-xs font-mono text-text-primary overflow-x-auto">
                  {JSON.stringify(action.payload, null, 2)}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  disabled={processingId === action.id}
                  onClick={() => handleAction(action.id, false)}
                  className="px-4 py-2 rounded-xl bg-elevated-surface hover:bg-card-surface text-text-secondary hover:text-text-primary text-xs font-semibold border border-border-hairline transition-all"
                >
                  Decline &amp; Cancel
                </button>
                <button
                  disabled={processingId === action.id}
                  onClick={() => handleAction(action.id, true)}
                  className="px-5 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Approve &amp; Execute</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
