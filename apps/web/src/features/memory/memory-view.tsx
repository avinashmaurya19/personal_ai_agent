"use client";

import React, { useState } from "react";
import { MemoryItem, api } from "@/lib/api-client";

interface MemoryViewProps {
  memories: MemoryItem[];
  onRefresh: () => void;
}

export function MemoryView({ memories, onRefresh }: MemoryViewProps) {
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<"preference" | "fact" | "context" | "decision">("fact");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.createMemory(newContent.trim(), newCategory);
      setNewContent("");
      onRefresh();
    } catch (err) {
      console.error("Failed to create memory:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMemory(id);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete memory:", err);
    }
  };

  const filteredMemories = memories.filter((m) =>
    m.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
    m.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "preference":
        return "bg-secondary-container/30 text-secondary border border-secondary/20";
      case "decision":
        return "bg-warning-subtle text-warning border border-warning/20";
      case "context":
        return "bg-accent-subtle text-primary border border-primary/20";
      default:
        return "bg-success-subtle text-success border border-success/20";
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 select-none">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 pb-6 border-b border-border-hairline">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Neural Memory Graph &amp; Autonomous Recall
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-success-subtle text-success border border-success/20">
              <span className="material-symbols-outlined text-[13px]">psychology</span> Continuous Learning Active
            </span>
          </div>
          <p className="text-xs text-text-secondary max-w-3xl">
            Inspect, govern, and inject persistent facts, user preferences, and strategic context remembered across conversations.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-card-surface border border-border-hairline flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Total Memory Nodes
            </span>
            <div className="w-8 h-8 rounded-lg bg-elevated-surface flex items-center justify-center text-primary border border-border-hairline">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-text-primary tabular-nums">{memories.length}</span>
            <span className="text-xs text-text-tertiary">Nodes</span>
          </div>
          <span className="text-xs text-success inline-flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Real-time injection ready
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card-surface border border-border-hairline flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              High Confidence
            </span>
            <div className="w-8 h-8 rounded-lg bg-elevated-surface flex items-center justify-center text-success border border-border-hairline">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-text-primary tabular-nums">
              {memories.filter((m) => m.confidence >= 0.8).length}
            </span>
            <span className="text-xs text-text-tertiary">Verified</span>
          </div>
          <span className="text-xs text-text-secondary">&gt;80% certainty score</span>
        </div>

        <div className="p-4 rounded-xl bg-card-surface border border-border-hairline flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Vector Embeddings
            </span>
            <div className="w-8 h-8 rounded-lg bg-elevated-surface flex items-center justify-center text-secondary border border-border-hairline">
              <span className="material-symbols-outlined text-[18px]">hub</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-text-primary">1536 dim</span>
          </div>
          <span className="text-xs text-secondary">HNSW cosine distance</span>
        </div>

        <div className="p-4 rounded-xl bg-card-surface border border-border-hairline flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Storage Backend
            </span>
            <div className="w-8 h-8 rounded-lg bg-elevated-surface flex items-center justify-center text-tertiary border border-border-hairline">
              <span className="material-symbols-outlined text-[18px]">database</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-text-primary">PostgreSQL</span>
          </div>
          <span className="text-xs text-text-secondary">Owner scoped • Local</span>
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleCreate} className="mt-6 p-4 rounded-2xl bg-card-surface border border-border-hairline shadow-md flex flex-col sm:flex-row items-center gap-3">
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value as any)}
          className="h-10 px-3 bg-elevated-surface rounded-xl text-xs text-text-secondary border border-border-hairline focus:outline-none"
        >
          <option value="fact">Fact</option>
          <option value="preference">Preference</option>
          <option value="context">Context</option>
          <option value="decision">Decision</option>
        </select>
        <input
          type="text"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Inject memory node (e.g. 'Avinash prefers concise bullet points for architecture reviews')..."
          className="flex-1 h-10 px-4 bg-elevated-surface rounded-xl text-xs text-text-primary placeholder:text-text-tertiary border border-border-hairline focus:border-border-active focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newContent.trim()}
          className="h-10 px-5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-md"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Store Node</span>
        </button>
      </form>

      {/* Filter Bar */}
      <div className="mt-6 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-tertiary text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter memory nodes..."
            className="w-full h-9 pl-9 pr-4 bg-elevated-surface rounded-xl text-xs text-text-primary placeholder:text-text-tertiary border border-border-hairline focus:border-border-active focus:outline-none transition-colors"
          />
        </div>
        <span className="text-xs text-text-tertiary">{filteredMemories.length} nodes found</span>
      </div>

      {/* Memory Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {filteredMemories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-text-tertiary bg-card-surface border border-border-hairline rounded-2xl">
            No memories matched. Use the input above to store persistent agent knowledge.
          </div>
        ) : (
          filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="p-4 rounded-2xl bg-card-surface border border-border-hairline hover:border-border-active transition-all flex flex-col justify-between gap-3 shadow-md group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${getCategoryBadgeClass(
                      mem.category
                    )}`}
                  >
                    {mem.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-text-tertiary">
                      {(mem.confidence * 100).toFixed(0)}% conf
                    </span>
                    <button
                      onClick={() => handleDelete(mem.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-danger rounded hover:bg-elevated-surface transition-all"
                      title="Delete memory"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-text-primary leading-relaxed">{mem.content}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border-hairline/60 text-[10px] text-text-tertiary">
                <span className="font-mono">ID: #{mem.id.slice(0, 8)}</span>
                <span>{new Date(mem.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
