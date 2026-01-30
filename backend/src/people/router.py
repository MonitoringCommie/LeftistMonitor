"""People API routes."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.exceptions import NotFoundError
from ..core.pagination import PaginatedResponse
from ..database import get_db
from .schemas import (
    PersonListItem, PersonResponse, BookListItem, BookResponse,
    ConnectionGraphResponse
)
from .service import PeopleService

router = APIRouter()


@router.get("/countries/{country_id}/people", response_model=PaginatedResponse[PersonListItem])
async def list_people_by_country(
    country_id: UUID,
    year: Optional[int] = Query(None, ge=1800, le=2100),
    person_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get people associated with a country."""
    service = PeopleService(db)
    people, total = await service.get_people_by_country(
        country_id=country_id,
        year=year,
        person_type=person_type,
        page=page,
        per_page=per_page,
    )

    return PaginatedResponse.create(
        items=[PersonListItem.model_validate(p) for p in people],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/people/{person_id}", response_model=PersonResponse)
async def get_person(
    person_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a person with all details."""
    service = PeopleService(db)
    person = await service.get_person(person_id)

    if not person:
        raise NotFoundError(f"Person {person_id} not found")

    return person


@router.get("/people/{person_id}/connections", response_model=ConnectionGraphResponse)
async def get_person_connections(
    person_id: UUID,
    depth: int = Query(2, ge=1, le=4),
    db: AsyncSession = Depends(get_db),
):
    """Get a network graph of connections for a person."""
    service = PeopleService(db)
    return await service.get_connection_graph(person_id, depth)


@router.get("/countries/{country_id}/books", response_model=PaginatedResponse[BookListItem])
async def list_books_by_country(
    country_id: UUID,
    book_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get books associated with a country."""
    service = PeopleService(db)
    books, total = await service.get_books_by_country(
        country_id=country_id,
        book_type=book_type,
        page=page,
        per_page=per_page,
    )

    return PaginatedResponse.create(
        items=[BookListItem.model_validate(b) for b in books],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/books/{book_id}", response_model=BookResponse)
async def get_book(
    book_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a book with authors."""
    service = PeopleService(db)
    book = await service.get_book(book_id)

    if not book:
        raise NotFoundError(f"Book {book_id} not found")

    return book
