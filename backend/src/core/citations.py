"""Citation generation service."""
from typing import Optional, Literal
from datetime import date
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..database import get_db


router = APIRouter()


class CitationResponse(BaseModel):
    entity_type: str
    entity_id: str
    title: str
    bibtex: str
    apa: str
    chicago: str
    mla: str
    ris: str


def generate_bibtex(
    entry_type: str,
    key: str,
    title: str,
    author: Optional[str] = None,
    year: Optional[int] = None,
    url: Optional[str] = None,
    accessed: Optional[str] = None,
    howpublished: Optional[str] = None,
    note: Optional[str] = None,
) -> str:
    """Generate BibTeX citation."""
    lines = [f"@{entry_type}{{{key},"]
    if title:
        lines.append(f'  title = {{{title}}},')
    if author:
        lines.append(f'  author = {{{author}}},')
    if year:
        lines.append(f'  year = {{{year}}},')
    if url:
        lines.append(f'  url = {{{url}}},')
    if accessed:
        lines.append(f'  urldate = {{{accessed}}},')
    if howpublished:
        lines.append(f'  howpublished = {{{howpublished}}},')
    if note:
        lines.append(f'  note = {{{note}}},')
    lines.append("}")
    return "\n".join(lines)


def generate_apa(
    title: str,
    author: Optional[str] = None,
    year: Optional[int] = None,
    source: str = "Leftist Monitor",
    url: Optional[str] = None,
) -> str:
    """Generate APA 7th edition citation."""
    parts = []
    if author:
        parts.append(f"{author}.")
    if year:
        parts.append(f"({year}).")
    else:
        parts.append("(n.d.).")
    parts.append(f"*{title}*.")
    parts.append(f"{source}.")
    if url:
        parts.append(f"Retrieved from {url}")
    return " ".join(parts)


def generate_chicago(
    title: str,
    author: Optional[str] = None,
    year: Optional[int] = None,
    source: str = "Leftist Monitor",
    url: Optional[str] = None,
    accessed: Optional[str] = None,
) -> str:
    """Generate Chicago style citation."""
    parts = []
    if author:
        parts.append(f"{author}.")
    parts.append(f'"{title}."')
    parts.append(f"*{source}*")
    if year:
        parts.append(f"({year}).")
    else:
        parts.append(".")
    if url:
        parts.append(url)
    if accessed:
        parts.append(f"Accessed {accessed}.")
    return " ".join(parts)


def generate_mla(
    title: str,
    author: Optional[str] = None,
    source: str = "Leftist Monitor",
    url: Optional[str] = None,
    accessed: Optional[str] = None,
) -> str:
    """Generate MLA style citation."""
    parts = []
    if author:
        parts.append(f"{author}.")
    parts.append(f'"{title}."')
    parts.append(f"*{source}*,")
    if url:
        parts.append(f"{url}.")
    if accessed:
        parts.append(f"Accessed {accessed}.")
    return " ".join(parts)


def generate_ris(
    entry_type: str,
    title: str,
    author: Optional[str] = None,
    year: Optional[int] = None,
    url: Optional[str] = None,
    database: str = "Leftist Monitor",
) -> str:
    """Generate RIS format citation."""
    lines = [f"TY  - {entry_type}"]
    if title:
        lines.append(f"TI  - {title}")
    if author:
        lines.append(f"AU  - {author}")
    if year:
        lines.append(f"PY  - {year}")
    if url:
        lines.append(f"UR  - {url}")
    lines.append(f"DB  - {database}")
    lines.append("ER  - ")
    return "\n".join(lines)


@router.get("/{entity_type}/{entity_id}", response_model=CitationResponse)
async def get_citation(
    entity_type: Literal["country", "person", "event", "conflict", "book", "party", "election"],
    entity_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Generate citations for any entity in various formats."""
    today = date.today().isoformat()
    base_url = "https://leftistmonitor.org"  # Placeholder URL
    
    title = ""
    author = None
    year = None
    entity_url = f"{base_url}/{entity_type}/{entity_id}"
    
    if entity_type == "country":
        from ..geography.models import Country
        result = await db.execute(select(Country).where(Country.id == entity_id))
        entity = result.scalar_one_or_none()
        if not entity:
            raise HTTPException(status_code=404, detail="Country not found")
        title = f"{entity.name_en} - Historical Profile"
        
    elif entity_type == "person":
        from ..people.models import Person
        result = await db.execute(select(Person).where(Person.id == entity_id))
        entity = result.scalar_one_or_none()
        if not entity:
            raise HTTPException(status_code=404, detail="Person not found")
        title = entity.name
        year = entity.birth_date.year if entity.birth_date else None
        
    elif entity_type == "event":
        from ..events.models import Event
        result = await db.execute(select(Event).where(Event.id == entity_id))
        entity = result.scalar_one_or_none()
        if not entity:
            raise HTTPException(status_code=404, detail="Event not found")
        title = entity.title
        year = entity.start_date.year if entity.start_date else None
        
    elif entity_type == "conflict":
        from ..events.models import Conflict
        result = await db.execute(select(Conflict).where(Conflict.id == entity_id))
        entity = result.scalar_one_or_none()
        if not entity:
            raise HTTPException(status_code=404, detail="Conflict not found")
        title = entity.name
        year = entity.start_date.year if entity.start_date else None
        
    elif entity_type == "book":
        from ..people.models import Book
        result = await db.execute(select(Book).where(Book.id == entity_id))
        entity = result.scalar_one_or_none()
        if not entity:
            raise HTTPException(status_code=404, detail="Book not found")
        title = entity.title
        author = entity.author
        year = entity.publication_year
        
    elif entity_type == "party":
        from ..politics.models import PoliticalParty
        result = await db.execute(select(PoliticalParty).where(PoliticalParty.id == entity_id))
        entity = result.scalar_one_or_none()
        if not entity:
            raise HTTPException(status_code=404, detail="Party not found")
        title = f"{entity.name} - Political Party Profile"
        year = entity.founded.year if entity.founded else None
        
    elif entity_type == "election":
        from ..politics.models import Election
        result = await db.execute(select(Election).where(Election.id == entity_id))
        entity = result.scalar_one_or_none()
        if not entity:
            raise HTTPException(status_code=404, detail="Election not found")
        title = f"{entity.election_type} Election - {entity.date}"
        year = entity.date.year if entity.date else None
    
    # Generate all citation formats
    bibtex_key = f"leftistmonitor_{entity_type}_{entity_id[:8]}"
    
    return CitationResponse(
        entity_type=entity_type,
        entity_id=entity_id,
        title=title,
        bibtex=generate_bibtex(
            entry_type="misc",
            key=bibtex_key,
            title=title,
            author=author,
            year=year,
            url=entity_url,
            accessed=today,
            howpublished="Leftist Monitor Database",
        ),
        apa=generate_apa(
            title=title,
            author=author,
            year=year,
            url=entity_url,
        ),
        chicago=generate_chicago(
            title=title,
            author=author,
            year=year,
            url=entity_url,
            accessed=today,
        ),
        mla=generate_mla(
            title=title,
            author=author,
            url=entity_url,
            accessed=today,
        ),
        ris=generate_ris(
            entry_type="ELEC",
            title=title,
            author=author,
            year=year,
            url=entity_url,
        ),
    )
