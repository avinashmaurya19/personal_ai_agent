"use client";

import React from "react";
import { DocumentItem } from "@/lib/api-client";

interface RecentDocumentsWidgetProps {
  documents: DocumentItem[];
  onViewAll: () => void;
}

export function RecentDocumentsWidget({
  documents,
  onViewAll,
}: RecentDocumentsWidgetProps) {
  const displayDocs = documents.slice(0, 4).map((doc) => ({
    id: doc.id,
    name: doc.filename,
    time: new Date(doc.created_at).toLocaleDateString(),
    isPdf: doc.filename.endsWith(".pdf"),
  }));

  return (
    <div className="w-full rounded-2xl bg-[#0C1222]/80 border border-white/10 backdrop-blur-xl p-4 flex flex-col gap-3.5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white tracking-tight">
          Recent Documents
        </h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          View all
        </button>
      </div>

      {/* Document Items or Clean Empty State */}
      {displayDocs.length === 0 ? (
        <div className="py-7 px-4 flex flex-col items-center justify-center text-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
          <span className="material-symbols-outlined text-slate-500 text-[26px]">
            description
          </span>
          <p className="text-xs font-semibold text-slate-300">
            No documents uploaded yet
          </p>
          <p className="text-[11px] text-slate-500 max-w-xs">
            Upload PDFs, Markdown, or text files to build your neural knowledge base.
          </p>
          <button
            type="button"
            onClick={onViewAll}
            className="mt-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-xs font-semibold text-cyan-300 border border-cyan-500/30 transition-colors shadow-sm"
          >
            + Upload Document
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 mt-1">
          {displayDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={onViewAll}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
            >
              {/* File Icon Badge */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  doc.isPdf
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                }`}
              >
                <span className="material-symbols-outlined text-[19px]">
                  {doc.isPdf ? "picture_as_pdf" : "description"}
                </span>
              </div>

              {/* Document Info */}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                  {doc.name}
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {doc.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
