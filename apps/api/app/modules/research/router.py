"""FastAPI router for research reports, autonomous web research, and live search."""

from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_owner, get_db_session
from app.db.models.user import User
from app.modules.research.schemas import (
    ResearchGenerateRequest,
    ResearchReportCreate,
    ResearchReportResponse,
    SearchResultItem,
)
from app.modules.research.service import ResearchService, SearchService
from app.modules.tools.builtins.research_tool import DeepResearchTool

router = APIRouter(prefix="/research", tags=["Research & Reporting"])


def get_research_service(
    session: AsyncSession = Depends(get_db_session),
) -> ResearchService:
    """Dependency producing ResearchService instance."""
    return ResearchService(session)


@router.get("/search", response_model=List[SearchResultItem], summary="Quick web search")
async def quick_search(
    q: str = Query(..., min_length=1, description="Search query string"),
    limit: int = Query(default=5, ge=1, le=10, description="Max results"),
    owner: User = Depends(get_current_owner),
) -> List[SearchResultItem]:
    """Execute a live zero-cost web search using DuckDuckGo."""
    return SearchService.search(query=q, max_results=limit)


@router.get("", response_model=List[ResearchReportResponse], summary="List research reports")
async def list_reports(
    topic: Optional[str] = Query(default=None, description="Filter by topic keyword"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    owner: User = Depends(get_current_owner),
    service: ResearchService = Depends(get_research_service),
) -> List[ResearchReportResponse]:
    """Retrieve research reports belonging to authenticated owner."""
    return await service.list_reports(
        owner_id=owner.id,
        topic=topic,
        limit=limit,
        offset=offset,
    )


@router.post(
    "",
    response_model=ResearchReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save a research report",
)
async def create_report(
    payload: ResearchReportCreate,
    owner: User = Depends(get_current_owner),
    service: ResearchService = Depends(get_research_service),
) -> ResearchReportResponse:
    """Save a research report for the owner."""
    return await service.create_report(owner_id=owner.id, data=payload)


@router.post(
    "/generate",
    response_model=ResearchReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger autonomous deep research",
)
async def generate_research_report(
    payload: ResearchGenerateRequest,
    owner: User = Depends(get_current_owner),
    service: ResearchService = Depends(get_research_service),
) -> ResearchReportResponse:
    """Conduct deep multi-source research on a topic, synthesize facts, and save report."""
    tool = DeepResearchTool()
    tool_output = tool._run(topic=payload.topic, max_sources=payload.num_sources)

    # Fetch the newly generated report
    reports = await service.list_reports(owner_id=owner.id, topic=payload.topic, limit=1)
    if reports:
        return reports[0]

    # Fallback: create record if background insertion wasn't caught
    fallback_data = ResearchReportCreate(
        title=f"Research: {payload.topic.title()}",
        topic=payload.topic,
        summary=f"Autonomous research synthesis on '{payload.topic}'.",
        content=tool_output,
        sources=[],
    )
    return await service.create_report(owner_id=owner.id, data=fallback_data)


@router.get("/{report_id}", response_model=ResearchReportResponse, summary="Get research report")
async def get_report(
    report_id: uuid.UUID,
    owner: User = Depends(get_current_owner),
    service: ResearchService = Depends(get_research_service),
) -> ResearchReportResponse:
    """Retrieve a single research report by ID enforcing owner scoping."""
    return await service.get_report(report_id=report_id, owner_id=owner.id)


@router.delete(
    "/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete research report",
)
async def delete_report(
    report_id: uuid.UUID,
    owner: User = Depends(get_current_owner),
    service: ResearchService = Depends(get_research_service),
) -> None:
    """Delete a research report enforcing owner scoping."""
    await service.delete_report(report_id=report_id, owner_id=owner.id)
