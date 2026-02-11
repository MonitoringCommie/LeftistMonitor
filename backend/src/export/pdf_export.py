"""
PDF export functionality using reportlab.
"""

import io
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


router = APIRouter(prefix="/export", tags=["export"])


def create_pdf_response(buffer: io.BytesIO, filename: str) -> StreamingResponse:
    """Create a streaming PDF response."""
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
        },
    )


def create_header_style():
    """Create custom header style."""
    styles = getSampleStyleSheet()
    return ParagraphStyle(
        "CustomHeader",
        parent=styles["Heading1"],
        fontSize=24,
        textColor=colors.darkred,
        spaceAfter=20,
        alignment=TA_CENTER,
    )


def create_subheader_style():
    """Create custom subheader style."""
    styles = getSampleStyleSheet()
    return ParagraphStyle(
        "CustomSubHeader",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=colors.grey,
        spaceAfter=30,
        alignment=TA_CENTER,
    )


@router.get("/people/pdf")
async def export_people_pdf(
    db: AsyncSession = Depends(get_db),
    ideology: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
):
    """Export political figures to PDF."""
    if not REPORTLAB_AVAILABLE:
        return {"error": "PDF export requires reportlab. Install with: pip install reportlab"}
    
    from sqlalchemy import select
    from src.people.models import Person
    
    query = select(Person).limit(limit)
    if ideology:
        query = query.where(Person.ideology.ilike(f"%{ideology}%"))
    if country:
        query = query.where(Person.country == country)
    
    result = await db.execute(query)
    people = result.scalars().all()
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Header
    elements.append(Paragraph("LeftistMonitor", create_header_style()))
    elements.append(Paragraph("Political Figures Export", create_subheader_style()))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}", styles["Normal"]))
    if ideology:
        elements.append(Paragraph(f"Filter: Ideology contains \"{ideology}\"", styles["Normal"]))
    if country:
        elements.append(Paragraph(f"Filter: Country = \"{country}\"", styles["Normal"]))
    elements.append(Spacer(1, 20))
    
    # Table data
    table_data = [["Name", "Years", "Country", "Ideology"]]
    for p in people:
        years = f"{p.birth_year or "?"} - {p.death_year or "present"}"
        table_data.append([
            p.name[:30] if p.name else "",
            years,
            (p.country or "")[:15],
            (p.ideology or "")[:20],
        ])
    
    # Create table
    table = Table(table_data, colWidths=[2.5*inch, 1.2*inch, 1.5*inch, 1.8*inch])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.darkred),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
        ("TEXTCOLOR", (0, 1), (-1, -1), colors.black),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.Color(0.95, 0.95, 0.95)]),
    ]))
    
    elements.append(table)
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f"Total: {len(people)} records", styles["Normal"]))
    
    doc.build(elements)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"leftist_monitor_people_{timestamp}.pdf"
    
    return create_pdf_response(buffer, filename)


@router.get("/events/pdf")
async def export_events_pdf(
    db: AsyncSession = Depends(get_db),
    category: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    year_from: Optional[int] = Query(None),
    year_to: Optional[int] = Query(None),
    limit: int = Query(100, le=500),
):
    """Export historical events to PDF."""
    if not REPORTLAB_AVAILABLE:
        return {"error": "PDF export requires reportlab. Install with: pip install reportlab"}
    
    from sqlalchemy import select
    from src.events.models import Event
    
    query = select(Event).limit(limit)
    if category:
        query = query.where(Event.category == category)
    if country:
        query = query.where(Event.country == country)
    if year_from:
        query = query.where(Event.year >= year_from)
    if year_to:
        query = query.where(Event.year <= year_to)
    
    result = await db.execute(query)
    events = result.scalars().all()
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Header
    elements.append(Paragraph("LeftistMonitor", create_header_style()))
    elements.append(Paragraph("Historical Events Export", create_subheader_style()))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}", styles["Normal"]))
    elements.append(Spacer(1, 20))
    
    # Table data
    table_data = [["Event", "Year", "Country", "Category"]]
    for e in events:
        table_data.append([
            (e.name or "")[:35],
            str(e.year) if e.year else "",
            (e.country or "")[:15],
            (e.category or "")[:15],
        ])
    
    table = Table(table_data, colWidths=[3*inch, 0.8*inch, 1.5*inch, 1.5*inch])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.darkred),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.Color(0.95, 0.95, 0.95)]),
    ]))
    
    elements.append(table)
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f"Total: {len(events)} records", styles["Normal"]))
    
    doc.build(elements)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"leftist_monitor_events_{timestamp}.pdf"
    
    return create_pdf_response(buffer, filename)


@router.get("/liberation/{region}/pdf")
async def export_liberation_pdf(
    region: str,
):
    """Export liberation struggle data to PDF."""
    if not REPORTLAB_AVAILABLE:
        return {"error": "PDF export requires reportlab. Install with: pip install reportlab"}
    
    import json
    import os
    
    # Map region to data directory
    region_map = {
        "palestine": "palestine",
        "ireland": "ireland", 
        "kurdistan": "kurdistan",
        "west-papua": "west_papua",
        "kashmir": "kashmir",
        "tibet": "tibet",
        "western-sahara": "western_sahara",
    }
    
    if region not in region_map:
        return {"error": f"Unknown region: {region}"}
    
    data_dir = f"/Users/linusgollnow/LeftistMonitor/data/scraped/liberation/{region_map[region]}"
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Header
    elements.append(Paragraph("LeftistMonitor", create_header_style()))
    elements.append(Paragraph(f"{region.replace("-", " ").title()} Liberation Struggle", create_subheader_style()))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}", styles["Normal"]))
    elements.append(Spacer(1, 20))
    
    # Load overview if exists
    overview_path = os.path.join(data_dir, "overview.json")
    if os.path.exists(overview_path):
        with open(overview_path) as f:
            overview = json.load(f)
        
        elements.append(Paragraph("Overview", styles["Heading2"]))
        if "description" in overview:
            elements.append(Paragraph(overview["description"], styles["Normal"]))
        elements.append(Spacer(1, 15))
        
        if "key_facts" in overview:
            elements.append(Paragraph("Key Facts:", styles["Heading3"]))
            for fact in overview.get("key_facts", []):
                elements.append(Paragraph(f"\u2022 {fact}", styles["Normal"]))
            elements.append(Spacer(1, 15))
    
    # Load massacres if exists
    massacres_path = os.path.join(data_dir, "massacres.json")
    if os.path.exists(massacres_path):
        with open(massacres_path) as f:
            massacres = json.load(f)
        
        if massacres:
            elements.append(Paragraph("Documented Massacres", styles["Heading2"]))
            table_data = [["Name", "Date", "Location", "Casualties"]]
            for m in massacres[:50]:  # Limit to 50
                table_data.append([
                    (m.get("name", ""))[:30],
                    m.get("date", ""),
                    (m.get("location", ""))[:20],
                    str(m.get("casualties", "")),
                ])
            
            table = Table(table_data, colWidths=[2.5*inch, 1.2*inch, 1.8*inch, 1*inch])
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.darkred),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ]))
            elements.append(table)
    
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("This document is for educational and research purposes.", styles["Italic"]))
    
    doc.build(elements)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"leftist_monitor_{region}_{timestamp}.pdf"
    
    return create_pdf_response(buffer, filename)
