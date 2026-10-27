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
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "decision":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "context":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 pb-6 border-b border-white/5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Neural Memory Graph
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Continuous Learning Active
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Persistent facts, preferences, and context remembered across sessions.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-[#0D1527]/75 border border-white/5 backdrop-blur-md flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Memory Nodes
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-white tabular-nums">{memories.length}</span>
            <span className="text-xs text-slate-400">Nodes</span>
          </div>
          <span className="text-xs text-emerald-400 inline-flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Injected into context
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1527]/75 border border-white/5 backdrop-blur-md flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              High Confidence
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-white tabular-nums">
              {memories.filter((m) => m.confidence >= 0.8).length}
            </span>
            <span className="text-xs text-slate-400">Verified</span>
          </div>
          <span className="text-xs text-slate-400">&gt;80% certainty score</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1527]/75 border border-white/5 backdrop-blur-md flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Vector Embeddings
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400">
              <span className="material-symbols-outlined text-[18px]">hub</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-white">1536 dim</span>
          </div>
          <span className="text-xs text-cyan-400">HNSW cosine distance</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1527]/75 border border-white/5 backdrop-blur-md flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Storage Backend
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-purple-400">
              <span className="material-symbols-outlined text-[18px]">database</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-white">PostgreSQL</span>
          </div>
          <span className="text-xs text-slate-400">Owner scoped sandbox</span>
        </div>
      </div>

      {/* Quick Add Form */}
      <form
        onSubmit={handleCreate}
        className="mt-6 p-4 rounded-2xl bg-[#0C1222]/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center gap-3"
      >
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value as any)}
          className="h-10 px-3 bg-white/5 rounded-xl text-xs text-slate-300 border border-white/10 focus:outline-none"
        >
          <option value="fact" className="bg-[#0B1020] text-white">Fact</option>
          <option value="preference" className="bg-[#0B1020] text-white">Preference</option>
          <option value="context" className="bg-[#0B1020] text-white">Context</option>
          <option value="decision" className="bg-[#0B1020] text-white">Decision</option>
        </select>
        <input
          type="text"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Inject memory node (e.g. 'Avinash prefers concise bullet points for reviews')..."
          className="flex-1 h-10 px-4 bg-white/5 rounded-xl text-xs text-white placeholder:text-slate-500 border border-white/10 focus:border-indigo-500/40 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newContent.trim()}
          className="h-10 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-xs font-semibold hover:opacity-95 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Store Node</span>
        </button>
      </form>

      {/* Filter Bar */}
      <div className="mt-6 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter memory nodes..."
            className="w-full h-9 pl-9 pr-4 bg-[#0C1222]/80 rounded-xl text-xs text-white placeholder:text-slate-500 border border-white/10 focus:border-indigo-500/40 focus:outline-none transition-colors"
          />
        </div>
        <span className="text-xs text-slate-400">{filteredMemories.length} nodes found</span>
      </div>

      {/* Memory Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {filteredMemories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-[#0C1222]/80 border border-white/5 rounded-2xl">
            No memories matched. Use the input above to store persistent agent knowledge.
          </div>
        ) : (
          filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="p-4 rounded-2xl bg-[#0D1527]/75 hover:bg-[#131F38]/90 border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col justify-between gap-3 shadow-md group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getCategoryBadgeClass(
                      mem.category
                    )}`}
                  >
                    {mem.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      {(mem.confidence * 100).toFixed(0)}% conf
                    </span>
                    <button
                      onClick={() => handleDelete(mem.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 rounded hover:bg-white/5 transition-all"
                      title="Delete memory"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{mem.content}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-slate-500">
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
