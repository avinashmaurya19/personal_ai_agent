"""Document parser and semantic chunking pipeline with prompt injection sanitization."""

import io
import re
from typing import List, Optional
from pydantic import BaseModel
import pypdf

from app.core.exceptions import AppException

# Prompt injection markers to strip from untrusted documents
_DISALLOWED_TOKENS = [
    "<|im_start|>",
    "<|im_end|>",
    "<|system|>",
    "<|user|>",
    "<|assistant|>",
    "[INST]",
    "[/INST]",
    "<<SYS>>",
    "<</SYS>>",
]


class ParsedChunk(BaseModel):
    """Semantic chunk resulting from document parsing."""

    chunk_index: int
    content: str
    page_number: Optional[int] = None
    token_count: int = 0


def sanitize_document_text(raw_text: str) -> str:
    """Strip raw null bytes and adversarial instruction tokens from document text."""
    cleaned = raw_text.replace("\x00", " ")
    for token in _DISALLOWED_TOKENS:
        if token in cleaned:
            cleaned = cleaned.replace(token, "[FILTERED_MARKER]")
    # Normalize excessive newlines
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def parse_document_bytes(
    filename: str, content_bytes: bytes, content_type: str
) -> List[tuple[str, Optional[int]]]:
    """Extract raw text and page numbers from document bytes."""
    fname_lower = filename.lower()

    if fname_lower.endswith(".pdf") or "pdf" in content_type:
        try:
            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            pages: List[tuple[str, Optional[int]]] = []
            for page_idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                cleaned = sanitize_document_text(text)
                if cleaned:
                    pages.append((cleaned, page_idx + 1))
            return pages
        except Exception as e:
            raise AppException(f"Failed to parse PDF document '{filename}': {str(e)}", status_code=400)

    elif (
        fname_lower.endswith(".md")
        or fname_lower.endswith(".markdown")
        or fname_lower.endswith(".txt")
        or "text" in content_type
    ):
        try:
            text = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = content_bytes.decode("latin-1", errors="replace")

        cleaned = sanitize_document_text(text)
        return [(cleaned, None)] if cleaned else []

    else:
        raise AppException(
            f"Unsupported file format '{filename}'. Supported formats: .pdf, .md, .txt",
            status_code=400,
        )


def chunk_document_segments(
    segments: List[tuple[str, Optional[int]]],
    max_chunk_chars: int = 500,
    overlap_chars: int = 100,
) -> List[ParsedChunk]:
    """Split extracted text segments into semantic overlapping chunks."""
    chunks: List[ParsedChunk] = []
    chunk_index = 0

    for text, page_number in segments:
        paragraphs = text.split("\n\n")
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if len(current_chunk) + len(para) + 2 <= max_chunk_chars:
                current_chunk = f"{current_chunk}\n\n{para}".strip()
            else:
                if current_chunk:
                    chunks.append(
                        ParsedChunk(
                            chunk_index=chunk_index,
                            content=current_chunk,
                            page_number=page_number,
                            token_count=len(current_chunk.split()),
                        )
                    )
                    chunk_index += 1
                    # Retain trailing overlap
                    overlap = current_chunk[-overlap_chars:] if len(current_chunk) > overlap_chars else ""
                    current_chunk = f"{overlap}\n\n{para}".strip()
                else:
                    # Paragraph is longer than max_chunk_chars, split by sentences or chunks
                    start = 0
                    while start < len(para):
                        sub_text = para[start : start + max_chunk_chars].strip()
                        chunks.append(
                            ParsedChunk(
                                chunk_index=chunk_index,
                                content=sub_text,
                                page_number=page_number,
                                token_count=len(sub_text.split()),
                            )
                        )
                        chunk_index += 1
                        start += max_chunk_chars - overlap_chars
                    current_chunk = ""

        if current_chunk:
            chunks.append(
                ParsedChunk(
                    chunk_index=chunk_index,
                    content=current_chunk,
                    page_number=page_number,
                    token_count=len(current_chunk.split()),
                )
            )
            chunk_index += 1

    return chunks
