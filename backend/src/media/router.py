"""Media resources API."""
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..database import get_db
from .models import MediaResource, MediaEntityLink


router = APIRouter()


class MediaResponse(BaseModel):
    id: str
    title: str
    title_original: Optional[str]
    media_type: str
    release_year: Optional[int]
    duration_minutes: Optional[int]
    director: Optional[str]
    creator: Optional[str]
    description: Optional[str]
    primary_url: Optional[str]
    youtube_url: Optional[str]
    archive_url: Optional[str]
    thumbnail_url: Optional[str]
    language: Optional[str]
    topics: Optional[List[str]]
    regions: Optional[List[str]]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[MediaResponse])
async def list_media(
    media_type: Optional[str] = Query(None),
    topic: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    start_year: Optional[int] = Query(None),
    end_year: Optional[int] = Query(None),
    has_free_access: bool = Query(False),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """List media resources with filters."""
    query = select(MediaResource)
    
    if media_type:
        query = query.where(MediaResource.media_type == media_type)
    if topic:
        query = query.where(MediaResource.topics.contains([topic]))
    if region:
        query = query.where(MediaResource.regions.contains([region]))
    if start_year:
        query = query.where(MediaResource.release_year >= start_year)
    if end_year:
        query = query.where(MediaResource.release_year <= end_year)
    if has_free_access:
        query = query.where(
            or_(
                MediaResource.youtube_url.isnot(None),
                MediaResource.archive_url.isnot(None),
            )
        )
    
    query = query.order_by(MediaResource.release_year.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    
    return [
        MediaResponse(
            id=str(m.id),
            title=m.title,
            title_original=m.title_original,
            media_type=m.media_type,
            release_year=m.release_year,
            duration_minutes=m.duration_minutes,
            director=m.director,
            creator=m.creator,
            description=m.description,
            primary_url=m.primary_url,
            youtube_url=m.youtube_url,
            archive_url=m.archive_url,
            thumbnail_url=m.thumbnail_url,
            language=m.language,
            topics=m.topics,
            regions=m.regions,
        )
        for m in result.scalars().all()
    ]


@router.get("/{media_id}", response_model=MediaResponse)
async def get_media(
    media_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific media resource."""
    result = await db.execute(
        select(MediaResource).where(MediaResource.id == media_id)
    )
    media = result.scalar_one_or_none()
    
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    return MediaResponse(
        id=str(media.id),
        title=media.title,
        title_original=media.title_original,
        media_type=media.media_type,
        release_year=media.release_year,
        duration_minutes=media.duration_minutes,
        director=media.director,
        creator=media.creator,
        description=media.description,
        primary_url=media.primary_url,
        youtube_url=media.youtube_url,
        archive_url=media.archive_url,
        thumbnail_url=media.thumbnail_url,
        language=media.language,
        topics=media.topics,
        regions=media.regions,
    )


@router.get("/for/{entity_type}/{entity_id}", response_model=List[MediaResponse])
async def get_media_for_entity(
    entity_type: str,
    entity_id: str,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get media resources related to a specific entity."""
    query = (
        select(MediaResource)
        .join(MediaEntityLink, MediaResource.id == MediaEntityLink.media_id)
        .where(
            and_(
                MediaEntityLink.entity_type == entity_type,
                MediaEntityLink.entity_id == entity_id,
            )
        )
        .limit(limit)
    )
    
    result = await db.execute(query)
    
    return [
        MediaResponse(
            id=str(m.id),
            title=m.title,
            title_original=m.title_original,
            media_type=m.media_type,
            release_year=m.release_year,
            duration_minutes=m.duration_minutes,
            director=m.director,
            creator=m.creator,
            description=m.description,
            primary_url=m.primary_url,
            youtube_url=m.youtube_url,
            archive_url=m.archive_url,
            thumbnail_url=m.thumbnail_url,
            language=m.language,
            topics=m.topics,
            regions=m.regions,
        )
        for m in result.scalars().all()
    ]


@router.get("/documentaries/recommended")
async def get_recommended_documentaries(
    topic: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get recommended documentaries, prioritizing free access."""
    query = (
        select(MediaResource)
        .where(MediaResource.media_type == 'documentary')
    )
    
    if topic:
        query = query.where(MediaResource.topics.contains([topic]))
    
    # Prioritize those with free access
    query = query.order_by(
        MediaResource.youtube_url.isnot(None).desc(),
        MediaResource.archive_url.isnot(None).desc(),
        MediaResource.release_year.desc(),
    ).limit(limit)
    
    result = await db.execute(query)
    
    return [
        {
            "id": str(m.id),
            "title": m.title,
            "release_year": m.release_year,
            "duration_minutes": m.duration_minutes,
            "director": m.director,
            "description": m.description[:200] if m.description else None,
            "youtube_url": m.youtube_url,
            "archive_url": m.archive_url,
            "thumbnail_url": m.thumbnail_url,
            "free_access": bool(m.youtube_url or m.archive_url),
            "topics": m.topics,
        }
        for m in result.scalars().all()
    ]
