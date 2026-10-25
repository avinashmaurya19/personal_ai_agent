"use client";

import React, { useState, useEffect } from "react";
import { Brain, X, Trash2, Search, Plus, Tag } from "lucide-react";
import { api, MemoryItem } from "@/lib/api-client";

interface MemoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = ["all", "preference", "work", "personal", "routine", "general"];

export function MemoryDrawer({ isOpen, onClose }: MemoryDrawerProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMemories = async () => {
    setIsLoading(true);
    try {
      if (searchQuery.trim()) {
        const results = await api.searchMemories(searchQuery.trim());
        setMemories(results.map((r) => r.memory));
      } else {
        const cat = selectedCategory === "all" ? undefined : selectedCategory;
        const data = await api.getMemories(cat);
        setMemories(data);
      }
    } catch (err) {
      console.error("Failed to load memories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMemories();
    }
  }, [isOpen, selectedCategory, searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = await api.createMemory(newContent.trim(), newCategory);
      setMemories((prev) => [created, ...prev]);
      setNewContent("");
    } catch (err) {
      console.error("Failed to create memory:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete memory:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2 text-slate-100 font-semibold">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <span>Personal Memory Engine</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Memory Form */}
        <form onSubmit={handleCreate} className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Record a preference or fact..."
              className="flex-1 bg-slate-800 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700/80 rounded-lg px-2 text-xs text-slate-300 focus:outline-none"
            >
              <option value="preference">Preference</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="routine">Routine</option>
              <option value="general">General</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={!newContent.trim() || isSubmitting}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save Memory</span>
          </button>
        </form>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-800 space-y-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories via semantic & keyword match..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchQuery("");
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] capitalize transition-colors ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Memory List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading ? (
            <div className="text-center text-xs text-slate-500 py-8">Loading memories...</div>
          ) : memories.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-8">
              No memories found. Start chatting or save facts above to build your personal memory bank.
            </div>
          ) : (
            memories.map((mem) => (
              <div
                key={mem.id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-start justify-between gap-3 group hover:border-slate-600 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-950/60 border border-indigo-800/40 px-1.5 py-0.5 rounded">
                      <Tag className="w-2.5 h-2.5" />
                      {mem.category}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(mem.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{mem.content}</p>
                </div>
                <button
                  onClick={() => handleDelete(mem.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded transition-all"
                  title="Delete memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
