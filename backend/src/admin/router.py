"""Admin CRUD router for managing database entities."""
from datetime import datetime
from typing import List, Optional
from uuid import UUID
import json

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..auth.models import User, Permission
from ..auth.dependencies import require_permission
from ..people.models import Person, Book, BookAuthor
from ..events.models import Event, Conflict
from ..geography.models import Country
from .schemas import (
    BookCreate, BookUpdate,
    PersonCreate, PersonUpdate,
    EventCreate, EventUpdate,
    ConflictCreate, ConflictUpdate,
    CountryUpdate,
)

router = APIRouter()


# ============== Audit Logging ==============

async def log_audit(
    db: AsyncSession,
    table_name: str,
    record_id: UUID,
    action: str,
    user_id: UUID,
    old_data: dict = None,
    new_data: dict = None,
):
    """Log an audit entry for data changes."""
    try:
        await db.execute(
            text("""
                INSERT INTO audit_log (id, table_name, record_id, action, old_data, new_data, user_id, created_at)
                VALUES (gen_random_uuid(), :table_name, :record_id, :action, :old_data, :new_data, :user_id, NOW())
            """),
            {
                "table_name": table_name,
                "record_id": str(record_id),
                "action": action,
                "old_data": json.dumps(old_data) if old_data else None,
                "new_data": json.dumps(new_data) if new_data else None,
                "user_id": str(user_id),
            }
        )
    except Exception:
        pass  # Don't fail if audit logging fails


# ============== Books CRUD ==============

@router.get("/books")
async def list_books_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    current_user: User = Depends(require_permission(Permission.READ_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """List books for admin management."""
    query = select(Book).options(selectinload(Book.authors).selectinload(BookAuthor.person))

    if search:
        query = query.where(Book.title.ilike(f"%{search}%"))

    query = query.order_by(Book.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    books = result.scalars().all()

    # Get total count
    count_query = select(func.count(Book.id))
    if search:
        count_query = count_query.where(Book.title.ilike(f"%{search}%"))
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return {
        "items": [
            {
                "id": str(b.id),
                "title": b.title,
                "publication_year": b.publication_year,
                "book_type": b.book_type,
                "topics": b.topics or [],
                "created_at": b.created_at.isoformat() if b.created_at else None,
                "authors": [{"id": str(ba.person.id), "name": ba.person.name} for ba in b.authors] if b.authors else [],
            }
            for b in books
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.post("/books", status_code=status.HTTP_201_CREATED)
async def create_book(
    book_data: BookCreate,
    current_user: User = Depends(require_permission(Permission.WRITE_BOOKS)),
    db: AsyncSession = Depends(get_db),
):
    """Create a new book."""
    book = Book(
        title=book_data.title,
        title_original=book_data.title_original,
        publication_year=book_data.publication_year,
        publisher=book_data.publisher,
        book_type=book_data.book_type,
        topics=book_data.topics,
        description=book_data.description,
        significance=book_data.significance,
        progressive_analysis=book_data.progressive_analysis,
        marxists_archive_url=book_data.marxists_archive_url,
        gutenberg_url=book_data.gutenberg_url,
        pdf_url=book_data.pdf_url,
        wikidata_id=book_data.wikidata_id,
        isbn=book_data.isbn,
    )

    db.add(book)
    await db.flush()

    # Add authors
    for author_id in book_data.author_ids:
        book_author = BookAuthor(book_id=book.id, person_id=author_id, role="author")
        db.add(book_author)

    await db.flush()
    await db.refresh(book)

    await log_audit(db, "books", book.id, "CREATE", current_user.id, new_data={"title": book.title})

    return {"id": str(book.id), "title": book.title, "message": "Book created successfully"}


@router.get("/books/{book_id}")
async def get_book_admin(
    book_id: UUID,
    current_user: User = Depends(require_permission(Permission.READ_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Get a book by ID for editing."""
    result = await db.execute(
        select(Book)
        .where(Book.id == book_id)
        .options(selectinload(Book.authors).selectinload(BookAuthor.person))
    )
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
        "wikidata_id": book.wikidata_id,
        "isbn": book.isbn,
        "authors": [{"id": str(ba.person.id), "name": ba.person.name, "role": ba.role} for ba in book.authors] if book.authors else [],
    }


@router.put("/books/{book_id}")
async def update_book(
    book_id: UUID,
    book_data: BookUpdate,
    current_user: User = Depends(require_permission(Permission.EDIT_BOOKS)),
    db: AsyncSession = Depends(get_db),
):
    """Update a book."""
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    old_data = {"title": book.title}

    # Update fields
    update_data = book_data.model_dump(exclude_unset=True, exclude={"author_ids"})
    for field, value in update_data.items():
        setattr(book, field, value)

    book.updated_at = datetime.utcnow()

    # Update authors if provided
    if book_data.author_ids is not None:
        # Remove existing authors
        await db.execute(text("DELETE FROM book_authors WHERE book_id = :book_id"), {"book_id": str(book_id)})
        # Add new authors
        for author_id in book_data.author_ids:
            book_author = BookAuthor(book_id=book.id, person_id=author_id, role="author")
            db.add(book_author)

    await db.flush()

    await log_audit(db, "books", book.id, "UPDATE", current_user.id, old_data=old_data, new_data={"title": book.title})

    return {"id": str(book.id), "message": "Book updated successfully"}


@router.delete("/books/{book_id}")
async def delete_book(
    book_id: UUID,
    current_user: User = Depends(require_permission(Permission.DELETE_BOOKS)),
    db: AsyncSession = Depends(get_db),
):
    """Delete a book."""
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    await log_audit(db, "books", book.id, "DELETE", current_user.id, old_data={"title": book.title})

    await db.delete(book)
    await db.flush()

    return {"message": "Book deleted successfully"}


# ============== People CRUD ==============

@router.get("/people")
async def list_people_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    current_user: User = Depends(require_permission(Permission.READ_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """List people for admin management."""
    query = select(Person)

    if search:
        query = query.where(Person.name.ilike(f"%{search}%"))

    query = query.order_by(Person.name).offset(skip).limit(limit)
    result = await db.execute(query)
    people = result.scalars().all()

    count_query = select(func.count(Person.id))
    if search:
        count_query = count_query.where(Person.name.ilike(f"%{search}%"))
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return {
        "items": [
            {
                "id": str(p.id),
                "name": p.name,
                "birth_date": p.birth_date.isoformat() if p.birth_date else None,
                "death_date": p.death_date.isoformat() if p.death_date else None,
                "nationality": p.nationality,
                "bio_short": p.bio_short[:100] + "..." if p.bio_short and len(p.bio_short) > 100 else p.bio_short,
            }
            for p in people
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.post("/people", status_code=status.HTTP_201_CREATED)
async def create_person(
    person_data: PersonCreate,
    current_user: User = Depends(require_permission(Permission.WRITE_PEOPLE)),
    db: AsyncSession = Depends(get_db),
):
    """Create a new person."""
    person = Person(
        name=person_data.name,
        name_native=person_data.name_native,
        birth_date=person_data.birth_date,
        death_date=person_data.death_date,
        birth_place=person_data.birth_place,
        death_place=person_data.death_place,
        nationality=person_data.nationality,
        bio_short=person_data.bio_short,
        bio_full=person_data.bio_full,
        ideology_tags=person_data.ideology_tags,
        wikipedia_url=person_data.wikipedia_url,
        wikidata_id=person_data.wikidata_id,
        image_url=person_data.image_url,
    )

    db.add(person)
    await db.flush()
    await db.refresh(person)

    await log_audit(db, "people", person.id, "CREATE", current_user.id, new_data={"name": person.name})

    return {"id": str(person.id), "name": person.name, "message": "Person created successfully"}


@router.get("/people/{person_id}")
async def get_person_admin(
    person_id: UUID,
    current_user: User = Depends(require_permission(Permission.READ_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Get a person by ID for editing."""
    result = await db.execute(select(Person).where(Person.id == person_id))
    person = result.scalar_one_or_none()

    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    return {
        "id": str(person.id),
        "name": person.name,
        "name_native": person.name_native,
        "birth_date": person.birth_date.isoformat() if person.birth_date else None,
        "death_date": person.death_date.isoformat() if person.death_date else None,
        "birth_place": person.birth_place,
        "death_place": person.death_place,
        "nationality": person.nationality,
        "bio_short": person.bio_short,
        "bio_full": person.bio_full,
        "ideology_tags": person.ideology_tags or [],
        "wikipedia_url": person.wikipedia_url,
        "wikidata_id": person.wikidata_id,
        "image_url": person.image_url,
    }


@router.put("/people/{person_id}")
async def update_person(
    person_id: UUID,
    person_data: PersonUpdate,
    current_user: User = Depends(require_permission(Permission.EDIT_PEOPLE)),
    db: AsyncSession = Depends(get_db),
):
    """Update a person."""
    result = await db.execute(select(Person).where(Person.id == person_id))
    person = result.scalar_one_or_none()

    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    old_data = {"name": person.name}

    update_data = person_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(person, field, value)

    person.updated_at = datetime.utcnow()
    await db.flush()

    await log_audit(db, "people", person.id, "UPDATE", current_user.id, old_data=old_data, new_data={"name": person.name})

    return {"id": str(person.id), "message": "Person updated successfully"}


@router.delete("/people/{person_id}")
async def delete_person(
    person_id: UUID,
    current_user: User = Depends(require_permission(Permission.DELETE_PEOPLE)),
    db: AsyncSession = Depends(get_db),
):
    """Delete a person."""
    result = await db.execute(select(Person).where(Person.id == person_id))
    person = result.scalar_one_or_none()

    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    await log_audit(db, "people", person.id, "DELETE", current_user.id, old_data={"name": person.name})

    await db.delete(person)
    await db.flush()

    return {"message": "Person deleted successfully"}


# ============== Events CRUD ==============

@router.get("/events")
async def list_events_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(require_permission(Permission.READ_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """List events for admin management."""
    query = select(Event)

    if search:
        query = query.where(Event.title.ilike(f"%{search}%"))
    if category:
        query = query.where(Event.category == category)

    query = query.order_by(Event.start_date.desc().nullslast()).offset(skip).limit(limit)
    result = await db.execute(query)
    events = result.scalars().all()

    count_query = select(func.count(Event.id))
    if search:
        count_query = count_query.where(Event.title.ilike(f"%{search}%"))
    if category:
        count_query = count_query.where(Event.category == category)
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return {
        "items": [
            {
                "id": str(e.id),
                "title": e.title,
                "start_date": e.start_date.isoformat() if e.start_date else None,
                "category": e.category,
                "importance": e.importance,
            }
            for e in events
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.post("/events", status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    current_user: User = Depends(require_permission(Permission.WRITE_EVENTS)),
    db: AsyncSession = Depends(get_db),
):
    """Create a new event."""
    event = Event(
        title=event_data.title,
        description=event_data.description,
        start_date=event_data.start_date,
        end_date=event_data.end_date,
        category=event_data.category,
        location_name=event_data.location_name,
        primary_country_id=event_data.primary_country_id,
        importance=event_data.importance,
        wikipedia_url=event_data.wikipedia_url,
        wikidata_id=event_data.wikidata_id,
        progressive_analysis=event_data.progressive_analysis,
    )

    db.add(event)
    await db.flush()

    # Set location if coordinates provided
    if event_data.latitude and event_data.longitude:
        await db.execute(
            text("UPDATE events SET location = ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) WHERE id = :id"),
            {"lng": event_data.longitude, "lat": event_data.latitude, "id": str(event.id)}
        )

    await db.refresh(event)

    await log_audit(db, "events", event.id, "CREATE", current_user.id, new_data={"title": event.title})

    return {"id": str(event.id), "title": event.title, "message": "Event created successfully"}


@router.put("/events/{event_id}")
async def update_event(
    event_id: UUID,
    event_data: EventUpdate,
    current_user: User = Depends(require_permission(Permission.EDIT_EVENTS)),
    db: AsyncSession = Depends(get_db),
):
    """Update an event."""
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    old_data = {"title": event.title}

    update_data = event_data.model_dump(exclude_unset=True, exclude={"latitude", "longitude"})
    for field, value in update_data.items():
        setattr(event, field, value)

    # Update location if coordinates provided
    if event_data.latitude is not None and event_data.longitude is not None:
        await db.execute(
            text("UPDATE events SET location = ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) WHERE id = :id"),
            {"lng": event_data.longitude, "lat": event_data.latitude, "id": str(event_id)}
        )

    event.updated_at = datetime.utcnow()
    await db.flush()

    await log_audit(db, "events", event.id, "UPDATE", current_user.id, old_data=old_data, new_data={"title": event.title})

    return {"id": str(event.id), "message": "Event updated successfully"}


@router.delete("/events/{event_id}")
async def delete_event(
    event_id: UUID,
    current_user: User = Depends(require_permission(Permission.DELETE_EVENTS)),
    db: AsyncSession = Depends(get_db),
):
    """Delete an event."""
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    await log_audit(db, "events", event.id, "DELETE", current_user.id, old_data={"title": event.title})

    await db.delete(event)
    await db.flush()

    return {"message": "Event deleted successfully"}


# ============== Conflicts CRUD ==============

@router.get("/conflicts")
async def list_conflicts_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    current_user: User = Depends(require_permission(Permission.READ_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """List conflicts for admin management."""
    query = select(Conflict)

    if search:
        query = query.where(Conflict.name.ilike(f"%{search}%"))

    query = query.order_by(Conflict.start_date.desc().nullslast()).offset(skip).limit(limit)
    result = await db.execute(query)
    conflicts = result.scalars().all()

    count_query = select(func.count(Conflict.id))
    if search:
        count_query = count_query.where(Conflict.name.ilike(f"%{search}%"))
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return {
        "items": [
            {
                "id": str(c.id),
                "name": c.name,
                "conflict_type": c.conflict_type,
                "start_date": c.start_date.isoformat() if c.start_date else None,
                "end_date": c.end_date.isoformat() if c.end_date else None,
                "casualties_low": c.casualties_low,
            }
            for c in conflicts
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.post("/conflicts", status_code=status.HTTP_201_CREATED)
async def create_conflict(
    conflict_data: ConflictCreate,
    current_user: User = Depends(require_permission(Permission.WRITE_CONFLICTS)),
    db: AsyncSession = Depends(get_db),
):
    """Create a new conflict."""
    conflict = Conflict(
        name=conflict_data.name,
        conflict_type=conflict_data.conflict_type,
        start_date=conflict_data.start_date,
        end_date=conflict_data.end_date,
        description=conflict_data.description,
        casualties_low=conflict_data.casualties_low,
        casualties_high=conflict_data.casualties_high,
        displaced=conflict_data.displaced,
        intensity=conflict_data.intensity,
        belligerents=conflict_data.belligerents,
        wikipedia_url=conflict_data.wikipedia_url,
        wikidata_id=conflict_data.wikidata_id,
        progressive_analysis=conflict_data.progressive_analysis,
    )

    db.add(conflict)
    await db.flush()
    await db.refresh(conflict)

    await log_audit(db, "conflicts", conflict.id, "CREATE", current_user.id, new_data={"name": conflict.name})

    return {"id": str(conflict.id), "name": conflict.name, "message": "Conflict created successfully"}


@router.put("/conflicts/{conflict_id}")
async def update_conflict(
    conflict_id: UUID,
    conflict_data: ConflictUpdate,
    current_user: User = Depends(require_permission(Permission.EDIT_CONFLICTS)),
    db: AsyncSession = Depends(get_db),
):
    """Update a conflict."""
    result = await db.execute(select(Conflict).where(Conflict.id == conflict_id))
    conflict = result.scalar_one_or_none()

    if not conflict:
        raise HTTPException(status_code=404, detail="Conflict not found")

    old_data = {"name": conflict.name}

    update_data = conflict_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(conflict, value)

    conflict.updated_at = datetime.utcnow()
    await db.flush()

    await log_audit(db, "conflicts", conflict.id, "UPDATE", current_user.id, old_data=old_data, new_data={"name": conflict.name})

    return {"id": str(conflict.id), "message": "Conflict updated successfully"}


@router.delete("/conflicts/{conflict_id}")
async def delete_conflict(
    conflict_id: UUID,
    current_user: User = Depends(require_permission(Permission.DELETE_CONFLICTS)),
    db: AsyncSession = Depends(get_db),
):
    """Delete a conflict."""
    result = await db.execute(select(Conflict).where(Conflict.id == conflict_id))
    conflict = result.scalar_one_or_none()

    if not conflict:
        raise HTTPException(status_code=404, detail="Conflict not found")

    await log_audit(db, "conflicts", conflict.id, "DELETE", current_user.id, old_data={"name": conflict.name})

    await db.delete(conflict)
    await db.flush()

    return {"message": "Conflict deleted successfully"}


# ============== Dashboard Stats ==============

@router.get("/stats")
async def get_admin_stats(
    current_user: User = Depends(require_permission(Permission.READ_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Get admin dashboard statistics."""
    stats = {}

    # Count entities
    for model, name in [(Book, "books"), (Person, "people"), (Event, "events"), (Conflict, "conflicts"), (Country, "countries")]:
        result = await db.execute(select(func.count(model.id)))
        stats[name] = result.scalar()

    # Recent activity (last 7 days)
    try:
        result = await db.execute(text("""
            SELECT action, COUNT(*) as count
            FROM audit_log
            WHERE created_at > NOW() - INTERVAL '7 days'
            GROUP BY action
        """))
        stats["recent_activity"] = {row.action: row.count for row in result.fetchall()}
    except:
        stats["recent_activity"] = {}

    return stats


# ============== Audit Log ==============

@router.get("/audit-log")
async def get_audit_log(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    table_name: Optional[str] = None,
    action: Optional[str] = None,
    current_user: User = Depends(require_permission(Permission.READ_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Get audit log entries."""
    query = """
        SELECT al.id, al.table_name, al.record_id, al.action, al.old_data, al.new_data,
               al.user_id, u.email as user_email, al.created_at
        FROM audit_log al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE 1=1
    """
    params = {"skip": skip, "limit": limit}

    if table_name:
        query += " AND al.table_name = :table_name"
        params["table_name"] = table_name
    if action:
        query += " AND al.action = :action"
        params["action"] = action

    query += " ORDER BY al.created_at DESC OFFSET :skip LIMIT :limit"

    try:
        result = await db.execute(text(query), params)
        rows = result.fetchall()

        return {
            "items": [
                {
                    "id": str(r.id),
                    "table_name": r.table_name,
                    "record_id": str(r.record_id),
                    "action": r.action,
                    "old_data": r.old_data,
                    "new_data": r.new_data,
                    "user_id": str(r.user_id),
                    "user_email": r.user_email,
                    "created_at": r.created_at.isoformat(),
                }
                for r in rows
            ]
        }
    except Exception as e:
        return {"items": [], "error": str(e)}
