"""People business logic."""
from datetime import date
from typing import Optional, List, Set
from uuid import UUID

from sqlalchemy import and_, or_, select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from .models import Person, PersonConnection, PersonPosition, Book, BookAuthor
from ..geography.models import Country
from .schemas import (
    PersonListItem, PersonResponse, PersonConnectionResponse,
    PersonPositionResponse, BookListItem, BookResponse, BookAuthorResponse,
    ConnectionGraphNode, ConnectionGraphLink, ConnectionGraphResponse
)


class PeopleService:
    """Service for people operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_people_by_country(
        self,
        country_id: UUID,
        year: Optional[int] = None,
        person_type: Optional[str] = None,
        page: int = 1,
        per_page: int = 50,
    ) -> tuple[List[Person], int]:
        """Get people associated with a country."""
        query = select(Person).where(Person.primary_country_id == country_id)

        # Eager load connections to avoid N+1 queries
        query = query.options(
            selectinload(Person.connections_from),
            selectinload(Person.connections_to)
        )

        # Filter by year (person must be alive)
        if year:
            target_date = date(year, 7, 1)
            query = query.where(
                and_(
                    or_(
                        Person.birth_date.is_(None),
                        Person.birth_date <= target_date,
                    ),
                    or_(
                        Person.death_date.is_(None),
                        Person.death_date >= target_date,
                    ),
                )
            )

        # Filter by type
        if person_type:
            query = query.where(Person.person_types.contains([person_type]))

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query) or 0

        # Apply pagination and ordering
        query = query.order_by(Person.birth_date.nulls_last())
        query = query.offset((page - 1) * per_page).limit(per_page)

        result = await self.db.execute(query)
        people = result.scalars().all()

        return list(people), total

    async def get_person(self, person_id: UUID) -> Optional[dict]:
        """Get a person with all details."""
        result = await self.db.execute(
            select(Person).where(Person.id == person_id)
        )
        person = result.scalar_one_or_none()
        if not person:
            return None

        # Get connections (both directions)
        connections = []

        # Connections from this person
        from_query = (
            select(
                PersonConnection.id,
                PersonConnection.person_to_id.label("person_id"),
                Person.name.label("person_name"),
                Person.image_url.label("person_image"),
                PersonConnection.connection_type,
                PersonConnection.description,
                PersonConnection.strength,
                PersonConnection.start_date,
                PersonConnection.end_date,
            )
            .join(Person, PersonConnection.person_to_id == Person.id)
            .where(PersonConnection.person_from_id == person_id)
        )
        result = await self.db.execute(from_query)
        for row in result.all():
            connections.append(PersonConnectionResponse(
                id=row.id,
                person_id=row.person_id,
                person_name=row.person_name,
                person_image=row.person_image,
                connection_type=row.connection_type,
                description=row.description,
                strength=row.strength,
                start_date=row.start_date,
                end_date=row.end_date,
            ))

        # Connections to this person (reverse the type)
        to_query = (
            select(
                PersonConnection.id,
                PersonConnection.person_from_id.label("person_id"),
                Person.name.label("person_name"),
                Person.image_url.label("person_image"),
                PersonConnection.connection_type,
                PersonConnection.description,
                PersonConnection.strength,
                PersonConnection.start_date,
                PersonConnection.end_date,
            )
            .join(Person, PersonConnection.person_from_id == Person.id)
            .where(PersonConnection.person_to_id == person_id)
        )
        result = await self.db.execute(to_query)
        for row in result.all():
            # Reverse directional connection types
            conn_type = row.connection_type
            if conn_type == "influenced_by":
                conn_type = "influenced"
            elif conn_type == "mentor_of":
                conn_type = "student_of"
            elif conn_type == "student_of":
                conn_type = "mentor_of"
            elif conn_type == "parent_of":
                conn_type = "child_of"

            connections.append(PersonConnectionResponse(
                id=row.id,
                person_id=row.person_id,
                person_name=row.person_name,
                person_image=row.person_image,
                connection_type=conn_type,
                description=row.description,
                strength=row.strength,
                start_date=row.start_date,
                end_date=row.end_date,
            ))

        # Get positions
        positions_query = (
            select(
                PersonPosition.id,
                PersonPosition.title,
                PersonPosition.position_type,
                PersonPosition.country_id,
                Country.name_en.label("country_name"),
                PersonPosition.start_date,
                PersonPosition.end_date,
            )
            .outerjoin(Country, PersonPosition.country_id == Country.id)
            .where(PersonPosition.person_id == person_id)
            .order_by(desc(PersonPosition.start_date))
        )
        result = await self.db.execute(positions_query)
        positions = [
            PersonPositionResponse(
                id=row.id,
                title=row.title,
                position_type=row.position_type,
                country_id=row.country_id,
                country_name=row.country_name,
                start_date=row.start_date,
                end_date=row.end_date,
            )
            for row in result.all()
        ]

        # Get books
        books_query = (
            select(Book)
            .join(BookAuthor, Book.id == BookAuthor.book_id)
            .where(BookAuthor.person_id == person_id)
            .order_by(Book.publication_year)
        )
        result = await self.db.execute(books_query)
        books = [BookListItem.model_validate(b) for b in result.scalars().all()]

        return {
            "id": person.id,
            "name": person.name,
            "name_native": person.name_native,
            "wikidata_id": person.wikidata_id,
            "birth_date": person.birth_date,
            "death_date": person.death_date,
            "person_types": person.person_types,
            "ideology_tags": person.ideology_tags,
            "bio_short": person.bio_short,
            "bio_full": person.bio_full,
            "progressive_analysis": person.progressive_analysis,
            "image_url": person.image_url,
            "birth_place": person.birth_place,
            "death_place": person.death_place,
            "primary_country_id": person.primary_country_id,
            "connections": connections,
            "positions": positions,
            "books": books,
        }

    async def get_connection_graph(
        self,
        person_id: UUID,
        depth: int = 2,
    ) -> ConnectionGraphResponse:
        """Get a network graph of connections starting from a person."""
        nodes: dict[str, ConnectionGraphNode] = {}
        links: List[ConnectionGraphLink] = []
        visited: Set[UUID] = set()

        async def explore_connections(pid: UUID, current_depth: int):
            if current_depth > depth or pid in visited:
                return
            visited.add(pid)

            # Get person info
            result = await self.db.execute(
                select(Person).where(Person.id == pid)
            )
            person = result.scalar_one_or_none()
            if not person:
                return

            nodes[str(pid)] = ConnectionGraphNode(
                id=str(pid),
                name=person.name,
                image=person.image_url,
                person_types=person.person_types,
            )

            # Get connections from this person
            conn_query = (
                select(PersonConnection)
                .where(PersonConnection.person_from_id == pid)
            )
            result = await self.db.execute(conn_query)
            for conn in result.scalars().all():
                links.append(ConnectionGraphLink(
                    source=str(pid),
                    target=str(conn.person_to_id),
                    type=conn.connection_type,
                    strength=conn.strength or 1.0,
                ))
                await explore_connections(conn.person_to_id, current_depth + 1)

            # Get connections to this person
            conn_query = (
                select(PersonConnection)
                .where(PersonConnection.person_to_id == pid)
            )
            result = await self.db.execute(conn_query)
            for conn in result.scalars().all():
                links.append(ConnectionGraphLink(
                    source=str(conn.person_from_id),
                    target=str(pid),
                    type=conn.connection_type,
                    strength=conn.strength or 1.0,
                ))
                await explore_connections(conn.person_from_id, current_depth + 1)

        await explore_connections(person_id, 0)

        return ConnectionGraphResponse(
            nodes=list(nodes.values()),
            links=links,
        )

    async def get_books_by_country(
        self,
        country_id: UUID,
        book_type: Optional[str] = None,
        page: int = 1,
        per_page: int = 50,
    ) -> tuple[List[Book], int]:
        """Get books associated with a country."""
        query = select(Book).where(Book.country_id == country_id)

        if book_type:
            query = query.where(Book.book_type == book_type)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query) or 0

        # Apply pagination and ordering
        query = query.order_by(Book.publication_year)
        query = query.offset((page - 1) * per_page).limit(per_page)

        result = await self.db.execute(query)
        books = result.scalars().all()

        return list(books), total

    async def get_book(self, book_id: UUID) -> Optional[dict]:
        """Get a book with authors."""
        result = await self.db.execute(
            select(Book).where(Book.id == book_id)
        )
        book = result.scalar_one_or_none()
        if not book:
            return None

        # Get authors
        authors_query = (
            select(
                BookAuthor.person_id,
                Person.name.label("person_name"),
                BookAuthor.role,
            )
            .join(Person, BookAuthor.person_id == Person.id)
            .where(BookAuthor.book_id == book_id)
        )
        result = await self.db.execute(authors_query)
        authors = [
            BookAuthorResponse(
                person_id=row.person_id,
                person_name=row.person_name,
                role=row.role,
            )
            for row in result.all()
        ]

        return {
            "id": book.id,
            "title": book.title,
            "title_original": book.title_original,
            "publication_year": book.publication_year,
            "publisher": book.publisher,
            "book_type": book.book_type,
            "topics": book.topics,
            "description": book.description,
            "significance": book.significance,
            "progressive_analysis": book.progressive_analysis,
            "marxists_archive_url": book.marxists_archive_url,
            "gutenberg_url": book.gutenberg_url,
            "pdf_url": book.pdf_url,
            "cover_url": book.cover_url,
            "wikidata_id": book.wikidata_id,
            "isbn": book.isbn,
            "authors": authors,
        }

    async def get_all_people(
        self,
        person_type: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        per_page: int = 50,
    ) -> tuple[List[Person], int]:
        """Get all people with optional filtering."""
        query = select(Person)

        # Eager load connections to avoid N+1 queries
        query = query.options(
            selectinload(Person.connections_from),
            selectinload(Person.connections_to)
        )

        # Filter by type
        if person_type:
            query = query.where(Person.person_types.contains([person_type]))

        # Search by name
        if search:
            query = query.where(func.lower(Person.name).like(f"%{search.lower()}%"))

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query) or 0

        # Apply pagination and ordering
        query = query.order_by(Person.name)
        query = query.offset((page - 1) * per_page).limit(per_page)

        result = await self.db.execute(query)
        people = result.scalars().all()

        return list(people), total
