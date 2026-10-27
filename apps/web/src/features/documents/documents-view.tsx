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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 pb-6 border-b border-white/5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Documents &amp; Neural RAG
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <span className="material-symbols-outlined text-[13px]">psychology</span> Vector Search Active
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Upload, inspect, and query vector-embedded documents retrieved by AceVertix during autonomous tasks.
          </p>
        </div>

        {/* Upload Button */}
        <div className="flex items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.txt,.md,.json,.csv"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:opacity-95 active:scale-95 transition-all text-xs font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isUploading ? "sync" : "cloud_upload"}
            </span>
            <span>{isUploading ? "Vectorizing..." : "+ Upload Document"}</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center justify-between">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-[#0D1527]/75 border border-white/5 backdrop-blur-md flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Documents
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
              <span className="material-symbols-outlined text-[18px]">description</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-white tabular-nums">{documents.length}</span>
            <span className="text-xs text-slate-400">Files</span>
          </div>
          <span className="text-xs text-emerald-400 inline-flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Verified in sandbox
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1527]/75 border border-white/5 backdrop-blur-md flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Vector Chunks
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400">
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-white tabular-nums">{totalChunks}</span>
            <span className="text-xs text-slate-400">Indexed</span>
          </div>
          <span className="text-xs text-slate-400">Chunk size: 500 tokens</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1527]/75 border border-white/5 backdrop-blur-md flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Vector Database
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-purple-400">
              <span className="material-symbols-outlined text-[18px]">database</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-2xl font-bold text-white">PostgreSQL</span>
          </div>
          <span className="text-xs text-purple-400">pgvector • HNSW indexed</span>
        </div>
      </div>

      {/* Semantic Search Box */}
      <form onSubmit={handleSearch} className="mt-6 flex items-center gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all vector-embedded documents using natural semantic query..."
            className="w-full h-10 pl-10 pr-4 bg-[#0C1222]/80 rounded-xl text-xs text-white placeholder:text-slate-500 border border-white/10 focus:border-indigo-500/40 focus:outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isSearching ? "sync" : "manage_search"}
          </span>
          <span>{isSearching ? "Searching..." : "Semantic Search"}</span>
        </button>
      </form>

      {/* Semantic Search Results Display */}
      {searchResults.length > 0 && (
        <div className="mt-4 p-4 rounded-2xl bg-[#0D1424] border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              Semantic Similarity Matches ({searchResults.length})
            </span>
            <button
              onClick={() => setSearchResults([])}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {searchResults.map((res, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span className="font-mono truncate">{res.document_title || "Document Match"}</span>
                  <span className="text-emerald-400 font-medium">
                    Score: {(res.similarity_score * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-slate-300 line-clamp-3">{res.chunk_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Table / Card List */}
      <div className="mt-6 bg-[#0C1222]/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Indexed Files</h2>
          <span className="text-xs text-slate-400">{documents.length} files stored</span>
        </div>

        {documents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No documents uploaded yet. Upload PDFs, markdown, or text files to build your knowledge base.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {documents.map((doc) => {
              const isPdf = doc.filename.endsWith(".pdf");
              const isMd = doc.filename.endsWith(".md");
              return (
                <div
                  key={doc.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                        isPdf
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : isMd
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[19px]">
                        {isPdf ? "picture_as_pdf" : "description"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">
                        {doc.filename}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span>{formatFileSize(doc.file_size_bytes)}</span>
                        <span>&bull;</span>
                        <span>{doc.chunk_count} vector chunks</span>
                        <span>&bull;</span>
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Ready
                    </span>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="Delete document"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
