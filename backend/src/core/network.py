"""Network analysis tools for person connections and relationships."""
from typing import Optional, List, Dict, Any
from uuid import UUID
from collections import defaultdict

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..database import get_db


router = APIRouter()


class NetworkNode(BaseModel):
    id: str
    name: str
    node_type: str  # person, organization, country, event
    attributes: Dict[str, Any] = {}


class NetworkEdge(BaseModel):
    source: str
    target: str
    relationship_type: str
    weight: float = 1.0
    attributes: Dict[str, Any] = {}


class NetworkMetrics(BaseModel):
    node_count: int
    edge_count: int
    density: float
    average_degree: float
    most_connected: List[Dict[str, Any]]
    communities: Optional[List[List[str]]] = None


class NetworkAnalysisResponse(BaseModel):
    nodes: List[NetworkNode]
    edges: List[NetworkEdge]
    metrics: NetworkMetrics


def calculate_degree_centrality(nodes: List[str], edges: List[tuple]) -> Dict[str, int]:
    """Calculate degree centrality for each node."""
    degrees = defaultdict(int)
    for source, target, _ in edges:
        degrees[source] += 1
        degrees[target] += 1
    return dict(degrees)


def calculate_network_density(node_count: int, edge_count: int) -> float:
    """Calculate network density."""
    if node_count < 2:
        return 0.0
    max_edges = node_count * (node_count - 1) / 2
    return edge_count / max_edges if max_edges > 0 else 0.0


@router.get("/person/{person_id}", response_model=NetworkAnalysisResponse)
async def get_person_network(
    person_id: str,
    depth: int = Query(2, ge=1, le=4, description="Depth of connections to include"),
    include_events: bool = Query(False, description="Include shared events"),
    include_organizations: bool = Query(True, description="Include organizations"),
    db: AsyncSession = Depends(get_db),
):
    """Get the network of connections around a person."""
    from ..people.models import Person, PersonConnection, PersonPosition
    from ..events.models import Event
    
    # Verify person exists
    result = await db.execute(select(Person).where(Person.id == person_id))
    root_person = result.scalar_one_or_none()
    if not root_person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    nodes = {}
    edges = []
    visited_persons = set()
    to_visit = [(person_id, 0)]
    
    while to_visit:
        current_id, current_depth = to_visit.pop(0)
        if current_id in visited_persons or current_depth > depth:
            continue
        visited_persons.add(current_id)
        
        # Get person details
        person_result = await db.execute(
            select(Person).where(Person.id == current_id)
        )
        person = person_result.scalar_one_or_none()
        if not person:
            continue
        
        nodes[current_id] = NetworkNode(
            id=str(person.id),
            name=person.name,
            node_type="person",
            attributes={
                "birth_year": person.birth_date.year if person.birth_date else None,
                "death_year": person.death_date.year if person.death_date else None,
                "person_types": person.person_types or [],
                "ideology_tags": person.ideology_tags or [],
            }
        )
        
        # Get connections
        connections_result = await db.execute(
            select(PersonConnection).where(
                or_(
                    PersonConnection.person_id == current_id,
                    PersonConnection.connected_person_id == current_id,
                )
            )
        )
        
        for conn in connections_result.scalars().all():
            other_id = str(conn.connected_person_id) if str(conn.person_id) == current_id else str(conn.person_id)
            
            edges.append((
                str(conn.person_id),
                str(conn.connected_person_id),
                conn.connection_type or "connected",
            ))
            
            if other_id not in visited_persons and current_depth < depth:
                to_visit.append((other_id, current_depth + 1))
        
        # Get positions/organizations
        if include_organizations:
            positions_result = await db.execute(
                select(PersonPosition).where(PersonPosition.person_id == current_id)
            )
            for pos in positions_result.scalars().all():
                if pos.organization:
                    org_id = f"org_{pos.organization.replace(' ', '_')[:20]}"
                    if org_id not in nodes:
                        nodes[org_id] = NetworkNode(
                            id=org_id,
                            name=pos.organization,
                            node_type="organization",
                            attributes={"position_type": pos.position_type}
                        )
                    edges.append((current_id, org_id, "member_of"))
    
    # Calculate metrics
    node_list = list(nodes.values())
    edge_list = [
        NetworkEdge(
            source=e[0],
            target=e[1],
            relationship_type=e[2],
            weight=1.0,
        )
        for e in edges
    ]
    
    degrees = calculate_degree_centrality(list(nodes.keys()), edges)
    density = calculate_network_density(len(nodes), len(edges))
    avg_degree = sum(degrees.values()) / len(degrees) if degrees else 0
    
    most_connected = sorted(
        [{"id": k, "name": nodes[k].name, "degree": v} for k, v in degrees.items()],
        key=lambda x: x["degree"],
        reverse=True,
    )[:10]
    
    return NetworkAnalysisResponse(
        nodes=node_list,
        edges=edge_list,
        metrics=NetworkMetrics(
            node_count=len(nodes),
            edge_count=len(edges),
            density=round(density, 4),
            average_degree=round(avg_degree, 2),
            most_connected=most_connected,
        ),
    )


@router.get("/country-relationships/{year}")
async def get_country_relationship_network(
    year: int,
    relationship_types: Optional[str] = Query(None, description="Comma-separated types: ally,enemy,partner"),
    db: AsyncSession = Depends(get_db),
):
    """Get the network of country relationships for a specific year."""
    from ..geography.models import Country, CountryRelationship
    from datetime import date
    
    target_date = date(year, 7, 1)
    
    query = (
        select(CountryRelationship)
        .where(
            and_(
                CountryRelationship.valid_from <= target_date,
                or_(
                    CountryRelationship.valid_to.is_(None),
                    CountryRelationship.valid_to >= target_date,
                ),
            )
        )
    )
    
    if relationship_types:
        types = [t.strip() for t in relationship_types.split(",")]
        query = query.where(CountryRelationship.relationship_nature.in_(types))
    
    result = await db.execute(query)
    relationships = result.scalars().all()
    
    # Get all country IDs involved
    country_ids = set()
    for rel in relationships:
        country_ids.add(rel.country_a_id)
        country_ids.add(rel.country_b_id)
    
    # Get country names
    countries_result = await db.execute(
        select(Country.id, Country.name_en).where(Country.id.in_(country_ids))
    )
    country_names = {row.id: row.name_en for row in countries_result.all()}
    
    nodes = [
        NetworkNode(
            id=str(cid),
            name=country_names.get(cid, "Unknown"),
            node_type="country",
            attributes={},
        )
        for cid in country_ids
    ]
    
    edges = [
        NetworkEdge(
            source=str(rel.country_a_id),
            target=str(rel.country_b_id),
            relationship_type=rel.relationship_nature,
            weight=1.0,
            attributes={
                "name": rel.name,
                "type": rel.relationship_type,
            },
        )
        for rel in relationships
    ]
    
    # Calculate metrics
    edge_tuples = [(str(r.country_a_id), str(r.country_b_id), r.relationship_nature) for r in relationships]
    degrees = calculate_degree_centrality([str(c) for c in country_ids], edge_tuples)
    density = calculate_network_density(len(country_ids), len(relationships))
    
    most_connected = sorted(
        [{"id": k, "name": country_names.get(UUID(k), k), "degree": v} for k, v in degrees.items()],
        key=lambda x: x["degree"],
        reverse=True,
    )[:10]
    
    return NetworkAnalysisResponse(
        nodes=nodes,
        edges=edges,
        metrics=NetworkMetrics(
            node_count=len(nodes),
            edge_count=len(edges),
            density=round(density, 4),
            average_degree=round(sum(degrees.values()) / len(degrees), 2) if degrees else 0,
            most_connected=most_connected,
        ),
    )


@router.get("/conflict/{conflict_id}")
async def get_conflict_network(
    conflict_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get the network of participants in a conflict."""
    from ..events.models import Conflict, ConflictParticipant
    from ..geography.models import Country
    
    # Get conflict
    result = await db.execute(select(Conflict).where(Conflict.id == conflict_id))
    conflict = result.scalar_one_or_none()
    if not conflict:
        raise HTTPException(status_code=404, detail="Conflict not found")
    
    # Get participants
    participants_result = await db.execute(
        select(ConflictParticipant).where(ConflictParticipant.conflict_id == conflict_id)
    )
    participants = participants_result.scalars().all()
    
    # Get country names
    country_ids = [p.country_id for p in participants if p.country_id]
    countries_result = await db.execute(
        select(Country.id, Country.name_en).where(Country.id.in_(country_ids))
    )
    country_names = {row.id: row.name_en for row in countries_result.all()}
    
    nodes = []
    edges = []
    
    # Add conflict as central node
    conflict_node_id = f"conflict_{conflict_id}"
    nodes.append(NetworkNode(
        id=conflict_node_id,
        name=conflict.name,
        node_type="conflict",
        attributes={
            "start_date": conflict.start_date.isoformat() if conflict.start_date else None,
            "end_date": conflict.end_date.isoformat() if conflict.end_date else None,
            "conflict_type": conflict.conflict_type,
        },
    ))
    
    # Group participants by side
    sides = defaultdict(list)
    for p in participants:
        name = country_names.get(p.country_id, p.actor_name or "Unknown")
        node_id = str(p.country_id) if p.country_id else f"actor_{p.actor_name}"
        
        nodes.append(NetworkNode(
            id=node_id,
            name=name,
            node_type="country" if p.country_id else "actor",
            attributes={
                "side": p.side,
                "role": p.role,
            },
        ))
        
        edges.append(NetworkEdge(
            source=node_id,
            target=conflict_node_id,
            relationship_type="participant",
            attributes={"side": p.side, "role": p.role},
        ))
        
        sides[p.side].append(node_id)
    
    # Add edges between allies (same side)
    for side, members in sides.items():
        for i, m1 in enumerate(members):
            for m2 in members[i+1:]:
                edges.append(NetworkEdge(
                    source=m1,
                    target=m2,
                    relationship_type="ally",
                    attributes={"side": side},
                ))
    
    # Add edges between enemies (different sides)
    side_names = list(sides.keys())
    if len(side_names) >= 2:
        for m1 in sides.get(side_names[0], []):
            for m2 in sides.get(side_names[1], []):
                edges.append(NetworkEdge(
                    source=m1,
                    target=m2,
                    relationship_type="enemy",
                ))
    
    return NetworkAnalysisResponse(
        nodes=nodes,
        edges=edges,
        metrics=NetworkMetrics(
            node_count=len(nodes),
            edge_count=len(edges),
            density=calculate_network_density(len(nodes), len(edges)),
            average_degree=round(len(edges) * 2 / len(nodes), 2) if nodes else 0,
            most_connected=[],
        ),
    )
