"""Rule and heuristic memory extraction pipeline from conversation turns."""

import re
from typing import List, Optional
from pydantic import BaseModel, Field


class ExtractedMemory(BaseModel):
    """Candidate memory extracted from conversation turns."""

    content: str = Field(..., min_length=3, max_length=1000)
    category: str = Field(default="general")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)


# Regular expression patterns for personal facts and durable preferences
_EXTRACTION_RULES = [
    # Explicit user instruction to remember
    (
        re.compile(r"\b(?:remember\s+that|please\s+note\s+that|don't\s+forget\s+that)\s+(.+)", re.IGNORECASE),
        "general",
        1.0,
    ),
    # Preferences
    (
        re.compile(r"\b(?:i\s+prefer|i\s+like|my\s+favorite|my\s+preferred)\s+(.+)", re.IGNORECASE),
        "preference",
        0.95,
    ),
    # Personal identity & role
    (
        re.compile(r"\b(?:i\s+am\s+a|i\s+work\s+as|my\s+job\s+is|my\s+profession\s+is)\s+(.+)", re.IGNORECASE),
        "work",
        0.95,
    ),
    # Personal facts & location
    (
        re.compile(r"\b(?:my\s+name\s+is|i\s+live\s+in|my\s+email\s+is|my\s+timezone\s+is)\s+(.+)", re.IGNORECASE),
        "personal",
        0.95,
    ),
    # Habits & routines
    (
        re.compile(r"\b(?:every\s+morning\s+i|every\s+day\s+i|my\s+daily\s+routine\s+is)\s+(.+)", re.IGNORECASE),
        "routine",
        0.90,
    ),
]

_TRANSIENT_PATTERNS = [
    re.compile(r"^(?:hi|hello|hey|good\s+morning|good\s+night|thanks|thank\s+you|bye)[\s.!]*$", re.IGNORECASE),
    re.compile(r"^(?:what|who|where|when|why|how|can\s+you|please\s+calculate|solve)[\s?]", re.IGNORECASE),
]


class MemoryExtractor:
    """Extracts candidate durable personal facts from natural language messages."""

    @classmethod
    def extract_candidates(cls, text: str) -> List[ExtractedMemory]:
        """Analyze message content and return extracted candidate memories."""
        cleaned = text.strip()
        if not cleaned or len(cleaned) < 5:
            return []

        # Discard transient conversational noise
        for transient in _TRANSIENT_PATTERNS:
            if transient.match(cleaned):
                return []

        candidates: List[ExtractedMemory] = []
        sentences = re.split(r"[.!?\n]+", cleaned)

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence or len(sentence) < 6:
                continue

            for pattern, category, confidence in _EXTRACTION_RULES:
                match = pattern.search(sentence)
                if match:
                    extracted_fact = sentence
                    # Capitalize first letter and format cleanly
                    formatted = extracted_fact[0].upper() + extracted_fact[1:]
                    candidates.append(
                        ExtractedMemory(
                            content=formatted,
                            category=category,
                            confidence=confidence,
                        )
                    )
                    break

        return candidates
