"use client";

import React, { useState, useRef } from "react";
import { DocumentItem, api } from "@/lib/api-client";

interface DocumentsViewProps {
  documents: DocumentItem[];
  onRefresh: () => void;
}

export function DocumentsView({ documents, onRefresh }: DocumentsViewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      await api.uploadDocument(file);
      onRefresh();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteDocument(id);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await api.searchDocuments(searchQuery.trim());
      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalChunks = documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0);

  return (
    <div className="flex flex-col w-full pb-16 select-none">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 pb-6 border-b border-border-hairline">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Document Knowledge Base &amp; RAG
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-accent-subtle text-primary border border-primary/20">
              <span className="material-symbols-outlined text-[13px]">psychology</span> v2.4 Active
            </span>
          </div>
          <p className="text-xs text-text-secondary max-w-3xl">
            Upload, inspect, and govern vector-embedded documents retrieved by your autonomous assistant during RAG workflows.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.txt,.md,.json,.csv"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 h-[38px] px-4 rounded-xl bg-primary-container text-on-primary hover:brightness-110 active:scale-95 transition-all text-xs font-semibold shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isUploading ? "sync" : "cloud_upload"}
            </span>
            <span>{isUploading ? "Vectorizing..." : "+ Upload Document"}</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="mt-4 p-3 rounded-xl bg-danger-subtle border border-danger/20 text-xs text-danger flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-card-surface border border-border-hairline flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Total Indexed Docs
            </span>
            <div className="w-8 h-8 rounded-lg bg-elevated-surface flex items-center justify-center text-text-secondary border border-border-hairline">
              <span className="material-symbols-outlined text-[18px]">description</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-text-primary tabular-nums">{documents.length}</span>
            <span className="text-xs text-text-tertiary">Files</span>
          </div>
          <span className="text-xs text-success inline-flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success"></span> All embeddings verified
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card-surface border border-border-hairline flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Vector Chunks
            </span>
            <div className="w-8 h-8 rounded-lg bg-elevated-surface flex items-center justify-center text-primary border border-border-hairline">
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-text-primary tabular-nums">{totalChunks}</span>
            <span className="text-xs text-text-tertiary">Chunks</span>
          </div>
          <span className="text-xs text-text-secondary">Chunk size: 500 tokens</span>
        </div>

        <div className="p-4 rounded-xl bg-card-surface border border-border-hairline flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Embedding Model
            </span>
            <div className="w-8 h-8 rounded-lg bg-elevated-surface flex items-center justify-center text-secondary border border-border-hairline">
              <span className="material-symbols-outlined text-[18px]">neurology</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-lg font-bold text-text-primary truncate">nomic-embed-text</span>
          </div>
          <span className="text-xs text-success">Local Ollama • 0 Cost</span>
        </div>

        <div className="p-4 rounded-xl bg-card-surface border border-border-hairline flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Vector Database
            </span>
            <div className="w-8 h-8 rounded-lg bg-elevated-surface flex items-center justify-center text-tertiary border border-border-hairline">
              <span className="material-symbols-outlined text-[18px]">database</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-text-primary">PostgreSQL</span>
          </div>
          <span className="text-xs text-text-secondary">pgvector • HNSW indexed</span>
        </div>
      </div>

      {/* Semantic Search Box */}
      <form onSubmit={handleSearch} className="mt-6 flex items-center gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-tertiary text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all vector-embedded documents using natural semantic query..."
            className="w-full h-10 pl-10 pr-4 bg-elevated-surface rounded-xl text-xs text-text-primary placeholder:text-text-tertiary border border-border-hairline focus:border-border-active focus:outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="h-10 px-4 rounded-xl bg-elevated-surface hover:bg-card-surface text-text-primary border border-border-hairline hover:border-border-active text-xs font-semibold transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isSearching ? "sync" : "manage_search"}
          </span>
          <span>{isSearching ? "Searching..." : "Semantic Search"}</span>
        </button>
      </form>

      {/* Semantic Search Results Display */}
      {searchResults.length > 0 && (
        <div className="mt-4 p-4 rounded-2xl bg-card-surface border border-border-active space-y-3">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              Semantic Similarity Matches ({searchResults.length})
            </span>
            <button
              onClick={() => setSearchResults([])}
              className="text-xs text-text-tertiary hover:text-text-primary"
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {searchResults.map((res, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-elevated-surface border border-border-hairline text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-text-tertiary text-[10px]">
                  <span className="font-mono truncate">{res.document_title || "Document Match"}</span>
                  <span className="text-success font-medium">
                    Score: {(res.similarity_score * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-text-secondary line-clamp-3">{res.chunk_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Table / Card List */}
      <div className="mt-6 bg-card-surface border border-border-hairline rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-border-hairline flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Indexed Files</h2>
          <span className="text-xs text-text-tertiary">{documents.length} files stored</span>
        </div>

        {documents.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-tertiary">
            No documents uploaded yet. Upload PDFs, markdown, or text files to build your RAG index.
          </div>
        ) : (
          <div className="divide-y divide-border-hairline/60">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-elevated-surface/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-elevated-surface border border-border-hairline flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-text-primary truncate">
                      {doc.filename}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-text-tertiary mt-0.5">
                      <span>{formatFileSize(doc.file_size_bytes)}</span>
                      <span>&bull;</span>
                      <span>{doc.chunk_count} vector chunks</span>
                      <span>&bull;</span>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-success-subtle text-success">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                    Ready
                  </span>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded-lg text-text-tertiary hover:text-danger hover:bg-elevated-surface transition-colors"
                    title="Delete document"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
