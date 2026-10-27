"""Safe tool for searching uploaded documents and retrieving grounded source citations."""

from typing import Type
from crewai.tools import BaseTool
import numpy as np
import psycopg
from pgvector.psycopg import register_vector
from pydantic import BaseModel, Field

from app.core.context import get_current_owner_id
from app.config import settings
from app.modules.memory.embedding import EmbeddingService


class DocumentSearchInput(BaseModel):
    """Input parameters for searching personal documents."""

    query: str = Field(
        ...,
        description="Factual question, topic, or keyword to search within uploaded personal documents (PDF, Markdown, TXT)",
    )
    limit: int = Field(
        default=4,
        ge=1,
        le=8,
        description="Maximum number of document excerpts to return",
    )


class DocumentSearchTool(BaseTool):
    """Tool allowing the agent to retrieve verified excerpts and citations from uploaded documents."""

    name: str = "document_search"
    description: str = (
        "Searches uploaded personal documents (PDF, Markdown, TXT) for factual answers, project details, "
        "and source citations. Use this tool whenever the user asks about uploaded files, documents, or project specs."
    )
    args_schema: Type[BaseModel] = DocumentSearchInput

    def _run(self, query: str, limit: int = 4, **kwargs: object) -> str:
        """Execute vector similarity search synchronously using isolated psycopg connection."""
        cleaned = query.strip()
        if not cleaned:
            return "No search query provided."

        query_vec = EmbeddingService.get_sync_embedding(cleaned)
        vec_arr = np.array(query_vec)
        db_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

        with psycopg.connect(db_url) as conn:
            register_vector(conn)
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT dc.content, d.filename, dc.page_number, (dc.embedding <=> %s) AS distance
                    FROM document_chunks dc
                    JOIN documents d ON d.id = dc.document_id
                    WHERE d.status = %s AND d.owner_id = %s
                    ORDER BY distance ASC
                    LIMIT %s;
                    """,
                    (vec_arr, "ready", str(get_current_owner_id()), limit),
                )
                rows = cur.fetchall()

        if not rows:
            return "No matching document excerpts found in uploaded files."

        output_parts = [f"Found {len(rows)} relevant excerpt(s) in uploaded documents:"]
        for idx, (content, filename, page_number, dist) in enumerate(rows, 1):
            cosine_sim = max(0.0, 1.0 - float(dist)) if dist is not None else 0.0
            page_info = f", Page {page_number}" if page_number else ""
            citation = f"[Doc: {filename}{page_info}]"
            output_parts.append(
                f"\n--- [Source {idx}] {citation} (Relevance Score: {cosine_sim:.2f}) ---\n"
                f"{content.strip()}"
            )

        output_parts.append(
            "\nInstructions: Ground your response strictly on the sources above and cite the source filename in your response."
        )
        return "\n".join(output_parts)
