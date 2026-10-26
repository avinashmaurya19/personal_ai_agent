"""Services for DuckDuckGo web search, page scraping, and research report management."""

import re
import uuid
from typing import Any, List, Optional
import httpx
from bs4 import BeautifulSoup
from ddgs import DDGS
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import NotFoundError
from app.db.models.research import ResearchReport
from app.modules.research.schemas import (
    ResearchReportCreate,
    ScrapedContent,
    SearchResultItem,
)


class SearchService:
    """Zero-cost web search service powered by DuckDuckGo (DDGS)."""

    @staticmethod
    def search(query: str, max_results: int = 5) -> List[SearchResultItem]:
        """Execute a web search query and return formatted search hits."""
        if not query.strip():
            return []

        # Deterministic stub for testing environment
        if settings.ENVIRONMENT == "testing":
            return [
                SearchResultItem(
                    title=f"Result 1 for {query}",
                    url="https://example.com/item1",
                    snippet=f"Comprehensive documentation and details regarding {query}.",
                ),
                SearchResultItem(
                    title=f"Result 2 for {query}",
                    url="https://example.com/item2",
                    snippet=f"Technical analysis, benchmarks, and comparison for {query}.",
                ),
            ][:max_results]

        try:
            with DDGS() as ddgs:
                raw_results = list(ddgs.text(query.strip(), max_results=max_results))

            results: List[SearchResultItem] = []
            for r in raw_results:
                title = r.get("title") or "Untitled Document"
                url = r.get("href") or r.get("link") or ""
                snippet = r.get("body") or r.get("snippet") or ""
                if url:
                    results.append(SearchResultItem(title=title, url=url, snippet=snippet))
            return results
        except Exception as e:
            # Fallback gracefully on network/rate-limiting errors
            return [
                SearchResultItem(
                    title=f"Search Query: {query}",
                    url="https://duckduckgo.com/?q=" + query.replace(" ", "+"),
                    snippet=f"Search executed with fallback due to network response: {str(e)[:100]}",
                )
            ]


class WebScraperService:
    """Safe HTML page extraction and text cleaner."""

    USER_AGENT = (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    )

    @classmethod
    def scrape_url(
        cls,
        url: str,
        timeout: float = 6.0,
        max_chars: int = 4000,
    ) -> ScrapedContent:
        """Fetch a web page and strip HTML into cleaned, readable text."""
        if settings.ENVIRONMENT == "testing":
            return ScrapedContent(
                url=url,
                title="Example Test Page",
                text_content=f"Extracted content body from {url} for automated testing.",
                success=True,
            )

        try:
            headers = {"User-Agent": cls.USER_AGENT}
            with httpx.Client(timeout=timeout, follow_redirects=True, headers=headers) as client:
                resp = client.get(url)
                resp.raise_for_status()
                html = resp.text

            soup = BeautifulSoup(html, "html.parser")

            # Remove non-content elements
            for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "svg"]):
                tag.decompose()

            title = soup.title.string.strip() if soup.title and soup.title.string else url

            # Extract text paragraphs and headers
            text = soup.get_text(separator=" ", strip=True)
            # Normalize whitespace
            clean_text = re.sub(r"\s+", " ", text).strip()

            if len(clean_text) > max_chars:
                clean_text = clean_text[:max_chars] + "... [Content Truncated]"

            return ScrapedContent(
                url=url,
                title=title,
                text_content=clean_text,
                success=True,
            )
        except Exception as e:
            return ScrapedContent(
                url=url,
                title="Unreachable Page",
                text_content="",
                success=False,
                error=str(e),
            )


class ResearchService:
    """Async database service for managing research reports."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_report(
        self,
        owner_id: uuid.UUID,
        data: ResearchReportCreate,
    ) -> ResearchReport:
        """Save a new research report in the database."""
        report = ResearchReport(
            owner_id=owner_id,
            title=data.title,
            topic=data.topic,
            summary=data.summary,
            content=data.content,
            sources=data.sources,
            status=data.status,
            source_conversation_id=data.source_conversation_id,
        )
        self.session.add(report)
        await self.session.commit()
        await self.session.refresh(report)
        return report

    async def list_reports(
        self,
        owner_id: uuid.UUID,
        topic: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[ResearchReport]:
        """List research reports belonging to the user with optional topic filtering."""
        stmt = (
            select(ResearchReport)
            .where(ResearchReport.owner_id == owner_id)
            .order_by(desc(ResearchReport.created_at))
            .limit(limit)
            .offset(offset)
        )
        if topic:
            stmt = stmt.where(ResearchReport.topic.ilike(f"%{topic}%"))

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_report(
        self,
        report_id: uuid.UUID,
        owner_id: uuid.UUID,
    ) -> ResearchReport:
        """Get a single report by ID enforcing owner scoping."""
        stmt = select(ResearchReport).where(
            ResearchReport.id == report_id,
            ResearchReport.owner_id == owner_id,
        )
        result = await self.session.execute(stmt)
        report = result.scalar_one_or_none()
        if not report:
            raise NotFoundError("ResearchReport", report_id)
        return report

    async def delete_report(
        self,
        report_id: uuid.UUID,
        owner_id: uuid.UUID,
    ) -> None:
        """Delete a research report enforcing owner scoping."""
        report = await self.get_report(report_id, owner_id)
        await self.session.delete(report)
        await self.session.commit()
