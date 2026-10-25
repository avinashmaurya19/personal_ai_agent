"use client";

import React, { useState, useEffect, useRef } from "react";
import { FileText, X, Trash2, Upload, Search, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { api, DocumentItem } from "@/lib/api-client";

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentDrawer({ isOpen, onClose }: DocumentDrawerProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
      setUploadError(null);
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const newDoc = await api.uploadDocument(file);
      setDocuments((prev) => [newDoc, ...prev]);
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
      setDocuments((prev) => prev.filter((d) => d.id !== id));
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2 text-slate-100 font-semibold">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span>Document Knowledge (RAG)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Zone */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.md,.markdown,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <div className="flex items-center gap-2 text-xs text-indigo-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Parsing & Chunking Document...</span>
              </div>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-indigo-600/20 text-slate-400 group-hover:text-indigo-400 flex items-center justify-center mb-2 transition-colors">
                  <Upload className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-200">
                  Upload PDF, Markdown, or TXT
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Files are chunked and embedded in pgvector (Max 15MB)
                </span>
              </>
            )}
          </button>

          {uploadError && (
            <div className="mt-2.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Search Test Form */}
        <form onSubmit={handleSearch} className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents for answers or facts..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </form>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Search Results Display */}
          {searchResults.length > 0 && (
            <div className="space-y-2 mb-4 pb-4 border-b border-slate-800">
              <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                <span>Matching Excerpts ({searchResults.length})</span>
                <button
                  onClick={() => {
                    setSearchResults([]);
                    setSearchQuery("");
                  }}
                  className="text-slate-500 hover:text-slate-300 normal-case"
                >
                  Clear
                </button>
              </div>
              {searchResults.map((res: any, idx: number) => (
                <div key={idx} className="bg-slate-950/80 border border-indigo-500/20 rounded-xl p-3 text-xs space-y-1 font-mono">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-semibold">{res.citation}</span>
                    <span>{(res.score * 100).toFixed(0)}% match</span>
                  </div>
                  <p className="text-slate-300 whitespace-pre-wrap text-[11px] font-sans leading-relaxed">
                    {res.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Uploaded Documents List */}
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Uploaded Files ({documents.length})
          </div>

          {isLoading ? (
            <div className="text-center text-xs text-slate-500 py-8">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-8">
              No documents uploaded yet. Upload a PDF or Markdown file to equip the assistant with personal knowledge.
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-start justify-between gap-3 group hover:border-slate-600 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-100 truncate max-w-[220px]" title={doc.filename}>
                      {doc.filename}
                    </span>
                    {doc.status === "ready" ? (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Ready
                      </span>
                    ) : doc.status === "processing" ? (
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Processing
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-400 font-medium">Error</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{formatFileSize(doc.file_size_bytes)}</span>
                    <span>•</span>
                    <span className="bg-slate-700/60 px-1.5 py-0.5 rounded text-indigo-300">
                      {doc.chunk_count} chunks
                    </span>
                    <span>•</span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded transition-all"
                  title="Delete document"
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
