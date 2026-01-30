"""Research pathways and collections API."""
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

from ..database import get_db
from .models import ResearchPathway, PathwayNode, FeaturedCollection, CollectionItem


router = APIRouter()


class PathwayNodeResponse(BaseModel):
    id: str
    order: int
    title: str
    description: Optional[str]
    entity_type: Optional[str]
    entity_id: Optional[str]
    discussion_questions: Optional[List[str]]
    further_reading: Optional[List[str]]

    class Config:
        from_attributes = True


class PathwayResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: Optional[str]
    category: str
    difficulty_level: Optional[str]
    estimated_time_minutes: Optional[int]
    introduction: Optional[str]
    conclusion: Optional[str]
    tags: Optional[List[str]]
    regions: Optional[List[str]]
    start_year: Optional[int]
    end_year: Optional[int]
    image_url: Optional[str]
    node_count: int = 0

    class Config:
        from_attributes = True


class PathwayDetailResponse(PathwayResponse):
    nodes: List[PathwayNodeResponse]


class CollectionItemResponse(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    custom_title: Optional[str]
    custom_description: Optional[str]
    highlight_reason: Optional[str]
    order: int

    class Config:
        from_attributes = True


class CollectionResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: Optional[str]
    collection_type: str
    focus_tags: Optional[List[str]]
    image_url: Optional[str]
    item_count: int = 0

    class Config:
        from_attributes = True


class CollectionDetailResponse(CollectionResponse):
    items: List[CollectionItemResponse]


@router.get("/pathways", response_model=List[PathwayResponse])
async def list_pathways(
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    featured_only: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List available research pathways."""
    query = (
        select(ResearchPathway)
        .options(selectinload(ResearchPathway.nodes))
        .where(ResearchPathway.is_published == True)
    )
    
    if category:
        query = query.where(ResearchPathway.category == category)
    if difficulty:
        query = query.where(ResearchPathway.difficulty_level == difficulty)
    if tag:
        query = query.where(ResearchPathway.tags.contains([tag]))
    if featured_only:
        query = query.where(ResearchPathway.featured == True)
    
    query = query.order_by(ResearchPathway.title).limit(limit)
    result = await db.execute(query)
    
    return [
        PathwayResponse(
            id=str(p.id),
            title=p.title,
            slug=p.slug,
            description=p.description,
            category=p.category,
            difficulty_level=p.difficulty_level,
            estimated_time_minutes=p.estimated_time_minutes,
            introduction=p.introduction,
            conclusion=p.conclusion,
            tags=p.tags,
            regions=p.regions,
            start_year=p.start_year,
            end_year=p.end_year,
            image_url=p.image_url,
            node_count=len(p.nodes),
        )
        for p in result.scalars().all()
    ]


@router.get("/pathways/{slug}", response_model=PathwayDetailResponse)
async def get_pathway(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific research pathway with all nodes."""
    result = await db.execute(
        select(ResearchPathway)
        .options(selectinload(ResearchPathway.nodes))
        .where(
            and_(
                ResearchPathway.slug == slug,
                ResearchPathway.is_published == True,
            )
        )
    )
    pathway = result.scalar_one_or_none()
    
    if not pathway:
        raise HTTPException(status_code=404, detail="Pathway not found")
    
    return PathwayDetailResponse(
        id=str(pathway.id),
        title=pathway.title,
        slug=pathway.slug,
        description=pathway.description,
        category=pathway.category,
        difficulty_level=pathway.difficulty_level,
        estimated_time_minutes=pathway.estimated_time_minutes,
        introduction=pathway.introduction,
        conclusion=pathway.conclusion,
        tags=pathway.tags,
        regions=pathway.regions,
        start_year=pathway.start_year,
        end_year=pathway.end_year,
        image_url=pathway.image_url,
        node_count=len(pathway.nodes),
        nodes=[
            PathwayNodeResponse(
                id=str(n.id),
                order=n.order,
                title=n.title,
                description=n.description,
                entity_type=n.entity_type,
                entity_id=str(n.entity_id) if n.entity_id else None,
                discussion_questions=n.discussion_questions,
                further_reading=n.further_reading,
            )
            for n in sorted(pathway.nodes, key=lambda x: x.order)
        ],
    )


@router.get("/collections", response_model=List[CollectionResponse])
async def list_collections(
    collection_type: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    featured_only: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List featured collections."""
    query = (
        select(FeaturedCollection)
        .options(selectinload(FeaturedCollection.items))
        .where(FeaturedCollection.is_published == True)
    )
    
    if collection_type:
        query = query.where(FeaturedCollection.collection_type == collection_type)
    if tag:
        query = query.where(FeaturedCollection.focus_tags.contains([tag]))
    if featured_only:
        query = query.where(FeaturedCollection.featured == True)
    
    query = query.order_by(FeaturedCollection.title).limit(limit)
    result = await db.execute(query)
    
    return [
        CollectionResponse(
            id=str(c.id),
            title=c.title,
            slug=c.slug,
            description=c.description,
            collection_type=c.collection_type,
            focus_tags=c.focus_tags,
            image_url=c.image_url,
            item_count=len(c.items),
        )
        for c in result.scalars().all()
    ]


@router.get("/collections/{slug}", response_model=CollectionDetailResponse)
async def get_collection(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific collection with all items."""
    result = await db.execute(
        select(FeaturedCollection)
        .options(selectinload(FeaturedCollection.items))
        .where(
            and_(
                FeaturedCollection.slug == slug,
                FeaturedCollection.is_published == True,
            )
        )
    )
    collection = result.scalar_one_or_none()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    return CollectionDetailResponse(
        id=str(collection.id),
        title=collection.title,
        slug=collection.slug,
        description=collection.description,
        collection_type=collection.collection_type,
        focus_tags=collection.focus_tags,
        image_url=collection.image_url,
        item_count=len(collection.items),
        items=[
            CollectionItemResponse(
                id=str(item.id),
                entity_type=item.entity_type,
                entity_id=str(item.entity_id),
                custom_title=item.custom_title,
                custom_description=item.custom_description,
                highlight_reason=item.highlight_reason,
                order=item.order,
            )
            for item in sorted(collection.items, key=lambda x: x.order)
        ],
    )


# Pre-defined collection queries

@router.get("/women-revolutionaries")
async def get_women_revolutionaries(
    country_id: Optional[str] = Query(None),
    start_year: Optional[int] = Query(None),
    end_year: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Get women revolutionaries, activists, and political figures."""
    from ..people.models import Person
    from ..geography.models import Country
    from datetime import date
    
    # Filter for women with revolutionary/activist tags
    query = (
        select(Person, Country.name_en.label('country_name'))
        .outerjoin(Country, Person.primary_country_id == Country.id)
        .where(
            Person.person_types.overlap(['revolutionary', 'activist', 'politician', 'labor_leader', 'feminist'])
        )
    )
    
    # This is a simplified approach - in production, you'd have a gender field
    # For now, we'll rely on tags or a curated collection
    
    if country_id:
        query = query.where(Person.primary_country_id == country_id)
    if start_year:
        query = query.where(Person.birth_date >= date(start_year, 1, 1))
    if end_year:
        query = query.where(Person.birth_date <= date(end_year, 12, 31))
    
    query = query.order_by(Person.name).limit(limit)
    result = await db.execute(query)
    
    return [
        {
            "id": str(row.Person.id),
            "name": row.Person.name,
            "birth_year": row.Person.birth_date.year if row.Person.birth_date else None,
            "death_year": row.Person.death_date.year if row.Person.death_date else None,
            "country": row.country_name,
            "person_types": row.Person.person_types,
            "ideology_tags": row.Person.ideology_tags,
            "bio_short": row.Person.bio_short,
        }
        for row in result.all()
    ]


@router.get("/anti-colonial-movements")
async def get_anti_colonial_movements(
    region: Optional[str] = Query(None, description="Region: africa, asia, americas, middle_east"),
    start_year: Optional[int] = Query(None),
    end_year: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Get anti-colonial and independence movements."""
    from ..events.models import Event
    from ..geography.models import Country
    from datetime import date
    
    # Search for anti-colonial events
    anti_colonial_keywords = ['independence', 'colonial', 'liberation', 'decolonization', 'anti-colonial']
    
    query = (
        select(Event, Country.name_en.label('country_name'))
        .outerjoin(Country, Event.primary_country_id == Country.id)
        .where(
            Event.tags.overlap(['independence', 'anti_colonial', 'liberation', 'decolonization'])
        )
    )
    
    if start_year:
        query = query.where(Event.start_date >= date(start_year, 1, 1))
    if end_year:
        query = query.where(Event.start_date <= date(end_year, 12, 31))
    
    query = query.order_by(Event.start_date).limit(limit)
    result = await db.execute(query)
    
    return [
        {
            "id": str(row.Event.id),
            "title": row.Event.title,
            "start_date": row.Event.start_date.isoformat() if row.Event.start_date else None,
            "end_date": row.Event.end_date.isoformat() if row.Event.end_date else None,
            "country": row.country_name,
            "category": row.Event.category,
            "tags": row.Event.tags,
            "description": row.Event.description[:300] if row.Event.description else None,
        }
        for row in result.all()
    ]
