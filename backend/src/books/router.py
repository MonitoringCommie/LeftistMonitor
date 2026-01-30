"""Books API router."""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..people.models import Book, BookAuthor, Person

router = APIRouter()


@router.get("")
async def list_books(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    book_type: Optional[str] = None,
    topic: Optional[str] = None,
    search: Optional[str] = None,
    author: Optional[str] = None,
    year_from: Optional[int] = None,
    year_to: Optional[int] = None,
):
    """List books with optional filtering."""
    query = select(Book).options(
        selectinload(Book.authors).selectinload(BookAuthor.person)
    )
    
    # Apply filters
    if book_type:
        query = query.where(Book.book_type == book_type)
    
    if topic:
        query = query.where(Book.topics.contains([topic]))
    
    if search:
        search_filter = or_(
            Book.title.ilike(f"%{search}%"),
            Book.description.ilike(f"%{search}%")
        )
        query = query.where(search_filter)
    
    if year_from:
        query = query.where(Book.publication_year >= year_from)
    
    if year_to:
        query = query.where(Book.publication_year <= year_to)
    
    # Order by publication year descending, then title
    query = query.order_by(Book.publication_year.desc().nullslast(), Book.title)
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    books = result.scalars().all()
    
    # Format response
    return [
        {
            "id": str(book.id),
            "title": book.title,
            "title_original": book.title_original,
            "publication_year": book.publication_year,
            "publisher": book.publisher,
            "book_type": book.book_type,
            "topics": book.topics or [],
            "description": book.description,
            "significance": book.significance,
            "progressive_analysis": book.progressive_analysis,
            "marxists_archive_url": book.marxists_archive_url,
            "gutenberg_url": book.gutenberg_url,
            "pdf_url": book.pdf_url,
            "cover_url": book.cover_url,
            "authors": [
                {
                    "id": str(ba.person.id),
                    "name": ba.person.name,
                    "role": ba.role
                }
                for ba in book.authors
            ] if book.authors else []
        }
        for book in books
    ]


@router.get("/count")
async def count_books(
    db: AsyncSession = Depends(get_db),
    book_type: Optional[str] = None,
    topic: Optional[str] = None,
    search: Optional[str] = None,
):
    """Get total count of books matching filters."""
    query = select(func.count(Book.id))
    
    if book_type:
        query = query.where(Book.book_type == book_type)
    
    if topic:
        query = query.where(Book.topics.contains([topic]))
    
    if search:
        search_filter = or_(
            Book.title.ilike(f"%{search}%"),
            Book.description.ilike(f"%{search}%")
        )
        query = query.where(search_filter)
    
    result = await db.execute(query)
    return {"count": result.scalar()}


@router.get("/types")
async def get_book_types(db: AsyncSession = Depends(get_db)):
    """Get all unique book types."""
    query = select(Book.book_type).distinct().where(Book.book_type.isnot(None))
    result = await db.execute(query)
    types = [row[0] for row in result.all()]
    return {"types": sorted(types)}


@router.get("/topics")
async def get_topics(db: AsyncSession = Depends(get_db)):
    """Get all unique topics across all books."""
    query = select(func.unnest(Book.topics)).distinct()
    result = await db.execute(query)
    topics = [row[0] for row in result.all() if row[0]]
    return {"topics": sorted(topics)}


@router.get("/{book_id}")
async def get_book(
    book_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a single book by ID."""
    query = select(Book).where(Book.id == book_id).options(
        selectinload(Book.authors).selectinload(BookAuthor.person)
    )
    
    result = await db.execute(query)
    book = result.scalar_one_or_none()
    
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    return {
        "id": str(book.id),
        "title": book.title,
        "title_original": book.title_original,
        "publication_year": book.publication_year,
        "publisher": book.publisher,
        "book_type": book.book_type,
        "topics": book.topics or [],
        "description": book.description,
        "significance": book.significance,
        "progressive_analysis": book.progressive_analysis,
        "marxists_archive_url": book.marxists_archive_url,
        "gutenberg_url": book.gutenberg_url,
        "pdf_url": book.pdf_url,
        "cover_url": book.cover_url,
        "isbn": book.isbn,
        "wikidata_id": book.wikidata_id,
        "authors": [
            {
                "id": str(ba.person.id),
                "name": ba.person.name,
                "role": ba.role
            }
            for ba in book.authors
        ] if book.authors else []
    }
