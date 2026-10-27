"use client";

import React, { useState } from "react";

interface MarkdownRendererProps {
  content: string;
}

/**
 * Sanitizes raw agent output by unwrapping accidental whole-message markdown code fences,
 * leading artifacts, and internal thought leaks.
 */
function cleanContent(raw: string): string {
  if (!raw) return "";
  let text = raw.trim();

  // Strip leading stray bold artifacts (e.g. "**\n```markdown...")
  if (text.startsWith("**\n") || text.startsWith("**\r\n")) {
    text = text.slice(2).trim();
  }

  // Strip whole-message code fence wrapper (```markdown ... ``` or ``` ... ```)
  const fullFenceMatch = text.match(/^```(?:markdown|text|md)?\s*\n([\s\S]*?)\n```$/i);
  if (fullFenceMatch) {
    text = fullFenceMatch[1].trim();
  } else if (text.startsWith("```") && text.endsWith("```") && text.split("```").length === 3) {
    const lines = text.split("\n");
    if (lines.length >= 2) {
      text = lines.slice(1, -1).join("\n").trim();
    }
  }

  // Handle leaked 'Final Answer:'
  if (text.includes("Final Answer:")) {
    text = text.split("Final Answer:")[1].trim();
  }

  // Strip internal chain-of-thought leaks if present
  if (text.startsWith("Thought:")) {
    const lines = text.split("\n");
    const nonThoughtLines: string[] = [];
    let pastThoughts = false;

    for (const line of lines) {
      if (pastThoughts) {
        nonThoughtLines.push(line);
      } else if (
        line.startsWith("Thought:") ||
        line.startsWith("Action:") ||
        line.startsWith("Action Input:") ||
        line.startsWith("Observation:")
      ) {
        continue;
      } else if (!line.trim()) {
        continue;
      } else {
        pastThoughts = true;
        nonThoughtLines.push(line);
      }
    }

    if (nonThoughtLines.length > 0) {
      text = nonThoughtLines.join("\n").trim();
    } else {
      const lower = text.toLowerCase();
      if (lower.includes("greeting") || lower.includes("hello") || lower.includes("hi")) {
        text = "Hello! How can I assist you today? Feel free to ask a question, check your email or calendar, or assign a task.";
      } else {
        text = "I'm here and ready to help. How can I assist you today?";
      }
    }
  }

  return text;
}

/**
 * Modern code block with language badge and one-click copy button.
 */
function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#070A14] shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/5 border-b border-white/5 text-[11px] font-mono text-slate-400">
        <span className="uppercase tracking-wider font-semibold text-[10px] text-indigo-400">
          {lang || "CODE"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[13px]">
            {copied ? "check" : "content_copy"}
          </span>
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-3.5 text-xs font-mono text-indigo-200/90 overflow-x-auto leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const sanitized = cleanContent(content);
  const lines = sanitized.split("\n");
  const elements: React.ReactNode[] = [];

  let listItems: React.ReactNode[] = [];
  let isOrderedList = false;
  let inCodeBlock = false;
  let currentCodeLang = "";
  let codeBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      if (isOrderedList) {
        elements.push(
          <ol key={key} className="space-y-1.5 my-2.5 pl-1">
            {listItems}
          </ol>
        );
      } else {
        elements.push(
          <ul key={key} className="space-y-1.5 my-2.5 pl-1">
            {listItems}
          </ul>
        );
      }
      listItems = [];
      isOrderedList = false;
    }
  };

  const flushCode = (key: string) => {
    if (codeBuffer.length > 0) {
      elements.push(
        <CodeBlock
          key={key}
          code={codeBuffer.join("\n")}
          lang={currentCodeLang}
        />
      );
      codeBuffer = [];
      currentCodeLang = "";
    }
  };

  const formatInlineText = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.slice(lastIdx, match.index));
      }
      const token = match[0];
      if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={match.index} className="font-semibold text-white">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded bg-white/10 text-indigo-300 font-mono text-xs"
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith("*") && token.endsWith("*")) {
        parts.push(
          <em key={match.index} className="text-slate-300 italic">
            {token.slice(1, -1)}
          </em>
        );
      }
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < text.length) {
      parts.push(text.slice(lastIdx));
    }

    return parts.length > 0 ? parts : text;
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trimEnd();

    // Code block toggle (``` or ```ts, ```python, etc.)
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        flushCode(`code-${idx}`);
        inCodeBlock = false;
      } else {
        flushList(`list-before-code-${idx}`);
        inCodeBlock = true;
        currentCodeLang = line.slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      return;
    }

    // Horizontal Divider
    if (line === "---" || line === "***" || line === "___") {
      flushList(`list-before-hr-${idx}`);
      elements.push(<hr key={`hr-${idx}`} className="border-white/10 my-3.5" />);
      return;
    }

    // Headings
    if (line.startsWith("### ")) {
      flushList(`list-before-h3-${idx}`);
      elements.push(
        <h4
          key={`h3-${idx}`}
          className="text-xs font-bold text-white mt-3.5 mb-1.5 flex items-center gap-1.5 tracking-tight uppercase"
        >
          <span className="w-1.5 h-3 rounded-full bg-indigo-400" />
          <span>{formatInlineText(line.slice(4))}</span>
        </h4>
      );
      return;
    }

    if (line.startsWith("## ")) {
      flushList(`list-before-h2-${idx}`);
      elements.push(
        <h3
          key={`h2-${idx}`}
          className="text-sm font-bold text-white mt-4 mb-2 flex items-center gap-2 tracking-tight"
        >
          <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-indigo-400 to-purple-500" />
          <span>{formatInlineText(line.slice(3))}</span>
        </h3>
      );
      return;
    }

    if (line.startsWith("# ")) {
      flushList(`list-before-h1-${idx}`);
      elements.push(
        <h2
          key={`h1-${idx}`}
          className="text-base font-extrabold text-white mt-4 mb-2 tracking-tight"
        >
          {formatInlineText(line.slice(2))}
        </h2>
      );
      return;
    }

    // Unordered bullet list items (- or * or •)
    if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      if (isOrderedList) flushList(`flush-ol-for-ul-${idx}`);
      isOrderedList = false;
      const itemContent = line.slice(2);
      listItems.push(
        <li
          key={`li-${idx}`}
          className="flex items-start gap-2.5 text-slate-200 text-xs sm:text-[13px] leading-relaxed"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
          <span className="flex-1">{formatInlineText(itemContent)}</span>
        </li>
      );
      return;
    }

    // Ordered numbered list items (1. , 2. , etc.)
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (!isOrderedList && listItems.length > 0) flushList(`flush-ul-for-ol-${idx}`);
      isOrderedList = true;
      const num = orderedMatch[1];
      const itemContent = orderedMatch[2];
      listItems.push(
        <li
          key={`oli-${idx}`}
          className="flex items-start gap-2.5 text-slate-200 text-xs sm:text-[13px] leading-relaxed"
        >
          <span className="w-4 h-4 rounded-full bg-white/10 text-indigo-300 font-mono text-[10px] font-semibold flex items-center justify-center mt-0.5 flex-shrink-0 border border-white/5">
            {num}
          </span>
          <span className="flex-1">{formatInlineText(itemContent)}</span>
        </li>
      );
      return;
    }

    // Empty line
    if (!line.trim()) {
      flushList(`list-empty-${idx}`);
      return;
    }

    // Standard paragraph
    flushList(`list-para-${idx}`);
    elements.push(
      <p key={`p-${idx}`} className="text-xs sm:text-[13.5px] text-slate-200 leading-relaxed my-1.5">
        {formatInlineText(line)}
      </p>
    );
  });

  flushList("list-final");
  flushCode("code-final");

  return <div className="space-y-1 leading-relaxed">{elements}</div>;
}
