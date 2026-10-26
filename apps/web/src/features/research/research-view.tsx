"use client";

import React, { useState } from "react";
import { ResearchReportItem, SearchResultItem, api } from "@/lib/api-client";

interface ResearchViewProps {
  reports: ResearchReportItem[];
  onRefresh: () => void;
}

export function ResearchView({ reports, onRefresh }: ResearchViewProps) {
  const [activeTab, setActiveTab] = useState<"reports" | "live_search">("reports");
  const [selectedReport, setSelectedReport] = useState<ResearchReportItem | null>(
    reports[0] || null
  );

  // Deep research form state
  const [topicInput, setTopicInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Live search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerateError(null);
    try {
      const newReport = await api.generateResearchReport(topicInput.trim(), 3);
      setTopicInput("");
      onRefresh();
      setSelectedReport(newReport);
    } catch (err: any) {
      console.error("Deep research error:", err);
      setGenerateError(err.message || "Failed to generate research report.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteResearchReport(id);
      onRefresh();
      if (selectedReport?.id === id) {
        const remaining = reports.filter((r) => r.id !== id);
        setSelectedReport(remaining[0] || null);
      }
    } catch (err) {
      console.error("Failed to delete report:", err);
    }
  };

  const handleLiveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const hits = await api.quickSearch(searchQuery.trim(), 6);
      setSearchResults(hits);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadMarkdown = (report: ResearchReportItem) => {
    const element = document.createElement("a");
    const file = new Blob([report.content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${report.topic.replace(/\s+/g, "_")}_research_report.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col w-full pb-16 select-none">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 pb-6 border-b border-border-hairline">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Autonomous Web Research &amp; Reporting
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-success-subtle text-success border border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span> DDGS Engine Active • ₹0 Cost
            </span>
          </div>
          <p className="text-xs text-text-secondary max-w-3xl">
            Synthesize multiple online sources, cross-verify claims, and export citation-backed Markdown reports.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "reports"
                ? "bg-secondary-container text-on-secondary-container shadow-sm"
                : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span>Reports ({reports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("live_search")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "live_search"
                ? "bg-secondary-container text-on-secondary-container shadow-sm"
                : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">travel_explore</span>
            <span>Live Search</span>
          </button>
        </div>
      </div>

      {/* TAB 1: REPORTS */}
      {activeTab === "reports" && (
        <div className="space-y-6 mt-6">
          {/* Autonomous Deep Research Launch Bar */}
          <form
            onSubmit={handleGenerate}
            className="p-4 rounded-2xl bg-card-surface border border-border-hairline shadow-md flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-tertiary text-[18px]">
                biotech
              </span>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="Enter research topic (e.g. 'State of WebAssembly in 2026', 'Quantum Error Correction')..."
                className="w-full h-10 pl-10 pr-4 bg-elevated-surface rounded-xl text-xs text-text-primary placeholder:text-text-tertiary border border-border-hairline focus:border-border-active focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isGenerating || !topicInput.trim()}
              className="w-full sm:w-auto h-10 px-5 rounded-xl bg-primary-container text-on-primary text-xs font-semibold hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-md flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isGenerating ? "sync" : "auto_awesome"}
              </span>
              <span>{isGenerating ? "Researching Sources..." : "Conduct Deep Research"}</span>
            </button>
          </form>

          {generateError && (
            <div className="p-3 rounded-xl bg-danger-subtle border border-danger/20 text-xs text-danger">
              {generateError}
            </div>
          )}

          {/* Two-Pane Reports Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[520px]">
            {/* Left Column: Reports List (4 cols) */}
            <div className="lg:col-span-4 bg-card-surface border border-border-hairline rounded-2xl overflow-hidden shadow-xl flex flex-col">
              <div className="p-4 border-b border-border-hairline flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">
                  Synthesized Briefs ({reports.length})
                </span>
                <button
                  onClick={onRefresh}
                  className="text-xs text-text-tertiary hover:text-text-primary flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                  <span>Sync</span>
                </button>
              </div>

              <div className="divide-y divide-border-hairline/60 overflow-y-auto max-h-[580px]">
                {reports.length === 0 ? (
                  <div className="p-8 text-center text-xs text-text-tertiary">
                    No research reports generated yet. Enter a topic above to initiate deep research.
                  </div>
                ) : (
                  reports.map((report) => {
                    const isSelected = selectedReport?.id === report.id;
                    return (
                      <div
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        className={`p-4 cursor-pointer transition-colors relative group ${
                          isSelected
                            ? "bg-elevated-surface border-l-2 border-l-primary"
                            : "hover:bg-elevated-surface/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-text-primary truncate">
                            {report.title}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(report.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-danger rounded hover:bg-card-surface transition-all"
                            title="Delete report"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-text-secondary line-clamp-2 mb-1.5">
                          {report.summary || report.topic}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-text-tertiary font-mono">
                          <span>{report.sources.length} sources</span>
                          <span>&bull;</span>
                          <span>{new Date(report.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Active Report Reader (8 cols) */}
            <div className="lg:col-span-8 bg-card-surface border border-border-hairline rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              {selectedReport ? (
                <div className="space-y-6">
                  {/* Report Meta Header */}
                  <div className="border-b border-border-hairline pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-subtle text-primary border border-primary/20">
                          Verified Research
                        </span>
                        <span className="text-xs font-mono text-text-tertiary">
                          {new Date(selectedReport.created_at).toLocaleString()}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-text-primary">
                        {selectedReport.title}
                      </h2>
                    </div>

                    <button
                      onClick={() => handleDownloadMarkdown(selectedReport)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-elevated-surface hover:bg-card-surface text-text-primary border border-border-hairline text-xs font-semibold transition-all flex-shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      <span>Export Markdown</span>
                    </button>
                  </div>

                  {/* Markdown Body */}
                  <div className="prose prose-invert max-w-none text-xs text-text-primary leading-relaxed whitespace-pre-wrap bg-elevated-surface/50 p-5 rounded-xl border border-border-hairline overflow-y-auto max-h-[420px]">
                    {selectedReport.content}
                  </div>

                  {/* Sources Footnote Cluster */}
                  {selectedReport.sources.length > 0 && (
                    <div className="p-4 rounded-xl bg-elevated-surface border border-border-hairline space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                        <span className="material-symbols-outlined text-primary text-[16px]">link</span>
                        <span>Verifiable Primary Citations ({selectedReport.sources.length})</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                        {selectedReport.sources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-card-surface border border-border-hairline hover:border-border-active text-left flex items-start gap-2 group transition-colors"
                          >
                            <span className="text-[10px] font-mono text-primary flex-shrink-0">
                              [{s.index || idx + 1}]
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-medium text-text-primary truncate group-hover:text-primary">
                                {s.title}
                              </p>
                              <p className="text-[10px] text-text-tertiary truncate">{s.url}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-text-tertiary py-20">
                  Select a research report from the left or generate a new one above.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE WEB SEARCH */}
      {activeTab === "live_search" && (
        <div className="space-y-6 mt-6">
          <form
            onSubmit={handleLiveSearch}
            className="p-4 rounded-2xl bg-card-surface border border-border-hairline shadow-md flex items-center gap-3"
          >
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-tertiary text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query live web via DuckDuckGo (e.g. 'FastAPI latest release notes', 'Apple M4 benchmarks')..."
                className="w-full h-10 pl-10 pr-4 bg-elevated-surface rounded-xl text-xs text-text-primary placeholder:text-text-tertiary border border-border-hairline focus:border-border-active focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="h-10 px-5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-2 shadow-md flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isSearching ? "sync" : "travel_explore"}
              </span>
              <span>{isSearching ? "Searching..." : "Search Web"}</span>
            </button>
          </form>

          {/* Search Results Grid */}
          <div className="space-y-3">
            {searchResults.length === 0 ? (
              <div className="p-12 text-center text-xs text-text-tertiary bg-card-surface border border-border-hairline rounded-2xl">
                Enter a query above to fetch instant search results.
              </div>
            ) : (
              searchResults.map((hit, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-card-surface border border-border-hairline hover:border-border-active transition-all space-y-1.5"
                >
                  <a
                    href={hit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
                  >
                    <span>{hit.title}</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                  <p className="text-[11px] font-mono text-text-tertiary">{hit.url}</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{hit.snippet}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
