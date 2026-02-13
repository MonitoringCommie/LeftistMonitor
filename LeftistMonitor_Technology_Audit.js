const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
        BorderStyle, WidthType, ShadingType, PageNumber, PageBreak } = require("docx");

// ============================================================
// STYLING CONSTANTS
// ============================================================
const COLORS = {
  primary: "1B3A5C",      // Deep navy blue
  secondary: "2E7D32",    // Green for positive
  accent: "C62828",       // Red for critical
  warning: "E65100",      // Orange for high priority
  medium: "F57F17",       // Yellow-amber for medium
  bg_light: "F5F7FA",     // Light background
  bg_header: "1B3A5C",    // Header background
  bg_critical: "FFEBEE",  // Light red background
  bg_high: "FFF3E0",      // Light orange background
  bg_good: "E8F5E9",      // Light green background
  text_dark: "212121",
  text_light: "FFFFFF",
  border_light: "DEE2E6",
  border_dark: "1B3A5C",
};

const border = { style: BorderStyle.SINGLE, size: 1, color: COLORS.border_light };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, font: "Arial", size: 32, bold: true, color: COLORS.primary })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, font: "Arial", size: 26, bold: true, color: COLORS.primary })],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color: COLORS.text_dark })],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 276 },
    children: [new TextRun({ text, font: "Arial", size: 21, color: COLORS.text_dark, ...opts })],
  });
}

function paraRuns(runs) {
  return new Paragraph({
    spacing: { after: 120, line: 276 },
    children: runs.map(r => new TextRun({ font: "Arial", size: 21, color: COLORS.text_dark, ...r })),
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 60 }, children: [] });
}

function bulletItem(text, opts = {}) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 60, line: 276 },
    children: [new TextRun({ text, font: "Arial", size: 21, color: COLORS.text_dark, ...opts })],
  });
}

function bulletItemRuns(runs) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 60, line: 276 },
    children: runs.map(r => new TextRun({ font: "Arial", size: 21, color: COLORS.text_dark, ...r })),
  });
}

function numberItem(text, ref = "numbers") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 60, line: 276 },
    children: [new TextRun({ text, font: "Arial", size: 21, color: COLORS.text_dark })],
  });
}

function makeHeaderRow(cells, colWidths) {
  return new TableRow({
    tableHeader: true,
    children: cells.map((text, i) =>
      new TableCell({
        borders,
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { fill: COLORS.bg_header, type: ShadingType.CLEAR },
        margins: cellMargins,
        verticalAlign: "center",
        children: [new Paragraph({
          children: [new TextRun({ text, font: "Arial", size: 19, bold: true, color: COLORS.text_light })],
        })],
      })
    ),
  });
}

function makeRow(cells, colWidths, bgColor) {
  return new TableRow({
    children: cells.map((text, i) =>
      new TableCell({
        borders,
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: bgColor ? { fill: bgColor, type: ShadingType.CLEAR } : undefined,
        margins: cellMargins,
        children: [new Paragraph({
          children: [new TextRun({ text: String(text), font: "Arial", size: 19, color: COLORS.text_dark })],
        })],
      })
    ),
  });
}

function makeTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      makeHeaderRow(headers, colWidths),
      ...rows.map((row, idx) => makeRow(row, colWidths, idx % 2 === 1 ? COLORS.bg_light : undefined)),
    ],
  });
}

function calloutBox(title, text, bgColor) {
  const cw = [9360];
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: cw,
    rows: [new TableRow({
      children: [new TableCell({
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border_light },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border_light },
          left: { style: BorderStyle.SINGLE, size: 6, color: bgColor === COLORS.bg_critical ? COLORS.accent : COLORS.warning },
          right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border_light },
        },
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: bgColor, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        children: [
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: title, font: "Arial", size: 21, bold: true, color: COLORS.text_dark })] }),
          new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 19, color: COLORS.text_dark })] }),
        ],
      })],
    })],
  });
}

// ============================================================
// DOCUMENT CONTENT
// ============================================================
const children = [];

// ---- TITLE PAGE ----
children.push(emptyLine(), emptyLine(), emptyLine(), emptyLine());
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 100 },
  children: [new TextRun({ text: "LEFTIST MONITOR", font: "Arial", size: 44, bold: true, color: COLORS.primary })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 60 },
  children: [new TextRun({ text: "Comprehensive Technology Audit", font: "Arial", size: 36, color: COLORS.primary })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 60 },
  children: [new TextRun({ text: "& Multi-Agent Architecture Proposal", font: "Arial", size: 36, color: COLORS.primary })],
}));
children.push(emptyLine());
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 400 },
  children: [new TextRun({ text: "February 9, 2026", font: "Arial", size: 24, color: "666666" })],
}));

// Divider
children.push(new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [9360],
  rows: [new TableRow({
    children: [new TableCell({
      borders: {
        top: { style: BorderStyle.SINGLE, size: 3, color: COLORS.primary },
        bottom: { style: BorderStyle.NONE, size: 0 },
        left: { style: BorderStyle.NONE, size: 0 },
        right: { style: BorderStyle.NONE, size: 0 },
      },
      width: { size: 9360, type: WidthType.DXA },
      children: [new Paragraph({ children: [] })],
    })],
  })],
}));

children.push(emptyLine());

// Executive summary box
children.push(new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [9360],
  rows: [new TableRow({
    children: [new TableCell({
      borders,
      width: { size: 9360, type: WidthType.DXA },
      shading: { fill: COLORS.bg_light, type: ShadingType.CLEAR },
      margins: { top: 160, bottom: 160, left: 240, right: 240 },
      children: [
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "EXECUTIVE SUMMARY", font: "Arial", size: 22, bold: true, color: COLORS.primary })] }),
        new Paragraph({ spacing: { after: 80, line: 276 }, children: [new TextRun({ text: "LeftistMonitor is a full-stack educational platform visualizing 430,000+ records of political, historical, and geographic data. This audit examined every technology choice across four layers (frontend, backend, data pipeline, infrastructure) and found the application is well-architected in concept but has significant inefficiencies that can be resolved.", font: "Arial", size: 20, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 0, line: 276 }, children: [new TextRun({ text: "Key findings: the frontend bundle can be reduced by 46% (935KB savings), the backend has critical connection pooling and security gaps, the data pipeline lacks orchestration and validation, and the infrastructure is over-engineered by 5x for the current scale. This document proposes a multi-agent architecture to systematically address these issues.", font: "Arial", size: 20, color: COLORS.text_dark })] }),
      ],
    })],
  })],
}));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============================================================
// SECTION 1: CURRENT TECH STACK OVERVIEW
// ============================================================
children.push(heading1("1. Current Technology Stack"));

children.push(para("The platform uses a modern but heavy stack. Here is every technology in use, organized by layer:"));
children.push(emptyLine());

children.push(makeTable(
  ["Layer", "Technology", "Version", "Assessment"],
  [
    ["Frontend", "React + TypeScript", "18 / 5.3", "Acceptable, not optimal"],
    ["Frontend", "MapLibre GL JS", "4.0", "784KB - severely oversized"],
    ["Frontend", "Recharts", "3.7", "394KB - overkill for simple charts"],
    ["Frontend", "Zustand + React Query", "5.0 / 5.17", "Good choices, poor patterns"],
    ["Frontend", "Tailwind CSS", "3.4", "Good - 54KB output"],
    ["Frontend", "Vite", "5.0", "Good build tool"],
    ["Frontend", "i18next (3 packages)", "25.8", "Over-engineered, runtime HTTP loading"],
    ["Backend", "FastAPI", "0.109+", "Excellent choice"],
    ["Backend", "SQLAlchemy 2.0 (async)", "2.0.25", "Good, but query patterns poor"],
    ["Backend", "PostgreSQL + PostGIS", "17 / 3.6", "Correct for geospatial data"],
    ["Backend", "Redis", "8.4", "Underutilized cache"],
    ["Backend", "JWT (python-jose)", "N/A", "Hardcoded secrets - critical risk"],
    ["Data", "Wikidata SPARQL scrapers", "Custom", "No orchestration, no validation"],
    ["Data", "655MB JSON/CSV in repo", "N/A", "Should not be in Git"],
    ["Data", "psycopg2 importers", "Custom", "No ETL framework"],
    ["Infra", "Docker + Compose", "Latest", "Images bloated (1GB+)"],
    ["Infra", "Kubernetes (EKS)", "1.28+", "Overkill - 5x over-engineered"],
    ["Infra", "Prometheus/Grafana/Loki", "Latest", "10 services for basic monitoring"],
    ["Infra", "GitHub Actions CI/CD", "Latest", "Good structure, broken tests"],
  ],
  [1400, 2800, 1400, 3760]
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============================================================
// SECTION 2: CRITICAL FINDINGS
// ============================================================
children.push(heading1("2. Critical Findings by Layer"));

// -- FRONTEND --
children.push(heading2("2.1 Frontend (React/TypeScript)"));

children.push(calloutBox(
  "CRITICAL: Bundle Size is 2x Larger Than Necessary",
  "The frontend ships a 2MB+ JavaScript bundle where MapLibre GL (784KB) and Recharts (394KB) account for 55% of total vendor JavaScript. Both can be replaced with dramatically lighter alternatives for identical functionality.",
  COLORS.bg_critical
));
children.push(emptyLine());

children.push(heading3("Bundle Size Analysis"));
children.push(makeTable(
  ["Dependency", "Current Size", "Replacement", "New Size", "Savings"],
  [
    ["MapLibre GL JS", "784 KB", "Leaflet.js", "~100 KB", "684 KB (87%)"],
    ["Recharts", "394 KB", "Visx (Airbnb)", "~50 KB", "344 KB (87%)"],
    ["Axios", "~20 KB", "Native fetch()", "0 KB", "20 KB (100%)"],
    ["i18next HTTP backend", "~20 KB", "Bundled imports", "0 KB", "20 KB (100%)"],
    ["TOTAL SAVINGS", "", "", "", "~935 KB (46%)"],
  ],
  [1800, 1400, 1800, 1400, 1960]
));

children.push(emptyLine());
children.push(heading3("Key Anti-Patterns Found"));

children.push(bulletItemRuns([
  { text: "Zustand store explosion: ", bold: true },
  { text: "mapStore.ts has 30+ individual selector hooks across 262 lines of boilerplate. A hook factory pattern would reduce this to 60 lines with identical functionality." },
]));
children.push(bulletItemRuns([
  { text: "Race condition handling: ", bold: true },
  { text: "WorldMap.tsx uses deprecated cancelled flag pattern instead of modern AbortController for cleanup." },
]));
children.push(bulletItemRuns([
  { text: "NetworkGraph SVG re-rendering: ", bold: true },
  { text: "Clears and recreates the entire SVG DOM on every update, losing zoom state and animations. Should use D3 data binding for incremental updates." },
]));
children.push(bulletItemRuns([
  { text: "i18n runtime HTTP loading: ", bold: true },
  { text: "Translations fetched via HTTP at runtime instead of being bundled at build time. Adds latency on every language switch." },
]));
children.push(bulletItemRuns([
  { text: "Missing prefetching: ", bold: true },
  { text: "React Query data is not prefetched on hover or route anticipation. Users wait for data on every page navigation." },
]));

children.push(emptyLine());
children.push(heading3("Framework Suitability"));
children.push(para("React is acceptable but not optimal for this application. 80% of pages are primarily content display with minimal interactivity. An Astro-based architecture with React islands for interactive components (map, charts, admin) would reduce the total bundle by approximately 85%, from 2MB to ~300KB, while maintaining full interactivity where needed."));

children.push(new Paragraph({ children: [new PageBreak()] }));

// -- BACKEND --
children.push(heading2("2.2 Backend (FastAPI/Python)"));

children.push(calloutBox(
  "CRITICAL: Three Security & Stability Issues Require Immediate Action",
  "1) Database connection pool uses defaults (5 connections) - will exhaust under 20 concurrent users. 2) JWT secret key defaults to a published string if .env is not set. 3) TOTP encryption key regenerates on every restart if not configured, locking users out of 2FA.",
  COLORS.bg_critical
));
children.push(emptyLine());

children.push(heading3("Connection Pooling"));
children.push(para("The database engine uses SQLAlchemy defaults: pool_size=5, max_overflow=10. With 25+ routers each creating sessions, this exhausts under moderate load. Should be pool_size=20, max_overflow=40, with pool_pre_ping=True for connection health checks."));

children.push(heading3("Authentication Vulnerabilities"));
children.push(makeTable(
  ["Issue", "Risk Level", "Current State", "Required Fix"],
  [
    ["JWT secret key", "CRITICAL", "Defaults to published string", "Require 32+ char env var, fail on startup if missing"],
    ["TOTP encryption key", "CRITICAL", "Generates new key per restart", "Require env var, validate on startup"],
    ["DB password", "HIGH", "Hardcoded in config.py source", "Remove from source, use env vars only"],
    ["Rate limiting", "HIGH", "Two conflicting limiters", "Consolidate to single Redis-based limiter"],
    ["CORS policy", "MEDIUM", "allow_methods=[*], duplicated", "Explicit methods, single middleware"],
  ],
  [1800, 1400, 2800, 3360]
));

children.push(emptyLine());
children.push(heading3("Query Performance"));
children.push(bulletItemRuns([
  { text: "N+1 queries: ", bold: true },
  { text: "People service makes 3 separate DB roundtrips (person + 2 relationship queries) where 1 with selectinload() would suffice." },
]));
children.push(bulletItemRuns([
  { text: "Offset pagination: ", bold: true },
  { text: "All list endpoints use OFFSET which is O(n). Page 1000 at 50/page = PostgreSQL reads and discards 50,000 rows. Cursor-based keyset pagination is O(1) with an index." },
]));
children.push(bulletItemRuns([
  { text: "Redundant COUNT queries: ", bold: true },
  { text: "Every paginated endpoint fires a separate COUNT query. PostgreSQL window functions can return total_count alongside data in a single query." },
]));
children.push(bulletItemRuns([
  { text: "Cache ineffectiveness: ", bold: true },
  { text: "Redis caches paginated results (different key per page), so cache hit rates are very low. Should cache stable datasets and paginate in memory." },
]));

children.push(new Paragraph({ children: [new PageBreak()] }));

// -- DATA PIPELINE --
children.push(heading2("2.3 Data Pipeline"));

children.push(calloutBox(
  "HIGH PRIORITY: Empty Association Tables Break the Knowledge Graph",
  "Five critical association tables (person_connections, event_person_association, person_country_association, party_memberships, person_positions) contain zero records. This means 265,000+ people and 81,000+ events exist in isolation with no links between them. Network visualizations, cross-referencing, and relationship queries are impossible.",
  COLORS.bg_critical
));
children.push(emptyLine());

children.push(heading3("Scraper Architecture Assessment"));
children.push(makeTable(
  ["Aspect", "Score", "Key Issue"],
  [
    ["Code Quality", "6/10", "Clean OOP patterns, but hardcoded Mac paths"],
    ["Resilience", "5/10", "Retries work, no circuit breaker"],
    ["Incrementalism", "3/10", "Query-level resume only, no change detection"],
    ["Validation", "3/10", "Silent failures, no Pydantic schemas"],
    ["Observability", "2/10", "Logs only, no metrics or alerts"],
    ["Orchestration", "2/10", "Sequential subprocess.run() loop"],
    ["Scheduling", "1/10", "Manual execution only, no cron or scheduler"],
  ],
  [2000, 1000, 6360]
));

children.push(emptyLine());
children.push(heading3("655MB of JSON/CSV in Git Repository"));
children.push(para("The data/ directory contains 679MB of scraped JSON and CSV files committed to Git. This is not viable: every git clone downloads the full history, multiple comprehensive versions of the same data exist without clear provenance, and there is no versioning strategy. This data should be moved to S3/GCS with date-based versioning (e.g., s3://leftist-data/v20260209/) and the directory added to .gitignore."));

children.push(heading3("Missing ETL Framework"));
children.push(para("Data imports run as ad-hoc Python scripts with no orchestration, dependency resolution, or monitoring. A tool like Dagster or Prefect would provide task graphs, failure handling, data lineage tracking, and scheduling. The current 50+ importer scripts with minimal validation represent the single biggest source of technical debt in the project."));

children.push(new Paragraph({ children: [new PageBreak()] }));

// -- INFRASTRUCTURE --
children.push(heading2("2.4 Infrastructure & DevOps"));

children.push(calloutBox(
  "HIGH PRIORITY: Kubernetes is 5x Over-Engineered for This Scale",
  "An educational platform with 265K records, PostgreSQL, and Redis does not need Kubernetes. The monitoring stack alone adds 7+ additional services. Estimated current cost: $350+/month. A Railway or Fly.io deployment achieves the same with better DX at $65/month (82% savings).",
  COLORS.bg_high
));
children.push(emptyLine());

children.push(heading3("Cost Comparison"));
children.push(makeTable(
  ["Platform", "Compute", "Database", "Monitoring", "Total/Month"],
  [
    ["Current (AWS EKS)", "$200", "$50", "$100", "$350+"],
    ["Railway (Recommended)", "$30", "$20", "Free", "$65"],
    ["Fly.io", "$20", "$20", "Free", "$55"],
    ["Coolify (Self-hosted)", "$5", "$0", "$10", "$15"],
  ],
  [2000, 1600, 1600, 1800, 2360]
));

children.push(emptyLine());
children.push(heading3("Docker Image Bloat"));
children.push(bulletItemRuns([
  { text: "Backend image: ~1GB. ", bold: true },
  { text: "Includes GDAL/GeoPandas (only needed for imports), dev dependencies, and psycopg2-binary (unused). Multi-stage build would reduce to ~400MB." },
]));
children.push(bulletItemRuns([
  { text: "Frontend image: ~350MB. ", bold: true },
  { text: "Runs Vite dev server in production instead of serving static assets via nginx. Proper build stage + nginx would be ~50MB." },
]));

children.push(heading3("CI/CD Pipeline Issues"));
children.push(bulletItemRuns([{ text: "Frontend test scripts missing from package.json - CI fails on npm run typecheck and npm run test." }]));
children.push(bulletItemRuns([{ text: "CD pipeline references non-existent Kustomize overlays (overlays/staging/, overlays/production/)." }]));
children.push(bulletItemRuns([{ text: "Alert rules reference Prometheus metrics (http_requests_total) that FastAPI does not export." }]));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============================================================
// SECTION 3: MULTI-AGENT ARCHITECTURE
// ============================================================
children.push(heading1("3. Multi-Agent Architecture Proposal"));

children.push(para("Based on the audit findings, we propose five specialized agents, each owning a distinct domain of the codebase. This structure ensures focused expertise, parallel progress, and clear ownership boundaries."));
children.push(emptyLine());

// Agent 1
children.push(new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [9360],
  rows: [new TableRow({
    children: [new TableCell({
      borders: { ...borders, left: { style: BorderStyle.SINGLE, size: 6, color: "1565C0" } },
      width: { size: 9360, type: WidthType.DXA },
      shading: { fill: "E3F2FD", type: ShadingType.CLEAR },
      margins: { top: 160, bottom: 160, left: 240, right: 240 },
      children: [
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "AGENT 1: FRONTEND", font: "Arial", size: 24, bold: true, color: "1565C0" })] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Owns: React, TypeScript, MapLibre, Tailwind, Zustand, React Query, Vite, i18n, Vitest", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Immediate priorities:", font: "Arial", size: 19, bold: true, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "1. Replace MapLibre with Leaflet (-684KB)", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "2. Replace Recharts with Visx (-344KB)", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "3. Bundle i18n translations at build time (-20KB)", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "4. Replace Axios with native fetch (-20KB)", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "5. Refactor mapStore.ts boilerplate (262 lines to ~60)", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: "6. Fix NetworkGraph D3 re-rendering, add AbortController patterns", font: "Arial", size: 19, color: COLORS.text_dark })] }),
      ],
    })],
  })],
}));

children.push(emptyLine());

// Agent 2
children.push(new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [9360],
  rows: [new TableRow({
    children: [new TableCell({
      borders: { ...borders, left: { style: BorderStyle.SINGLE, size: 6, color: COLORS.secondary } },
      width: { size: 9360, type: WidthType.DXA },
      shading: { fill: COLORS.bg_good, type: ShadingType.CLEAR },
      margins: { top: 160, bottom: 160, left: 240, right: 240 },
      children: [
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "AGENT 2: BACKEND", font: "Arial", size: 24, bold: true, color: COLORS.secondary })] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Owns: FastAPI, SQLAlchemy, PostgreSQL/PostGIS, Redis, Auth, Alembic migrations", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Immediate priorities:", font: "Arial", size: 19, bold: true, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "1. Fix connection pooling (pool_size=20, max_overflow=40)", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "2. Require JWT_SECRET and TOTP_ENCRYPTION_KEY env vars (fail on startup if missing)", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "3. Remove psycopg2-binary dependency (unused, 10MB bloat)", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "4. Consolidate dual rate limiters into single Redis-based middleware", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "5. Add selectinload() to eliminate N+1 queries in people/events services", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: "6. Implement cursor-based pagination for all list endpoints", font: "Arial", size: 19, color: COLORS.text_dark })] }),
      ],
    })],
  })],
}));

children.push(emptyLine());

// Agent 3
children.push(new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [9360],
  rows: [new TableRow({
    children: [new TableCell({
      borders: { ...borders, left: { style: BorderStyle.SINGLE, size: 6, color: COLORS.warning } },
      width: { size: 9360, type: WidthType.DXA },
      shading: { fill: COLORS.bg_high, type: ShadingType.CLEAR },
      margins: { top: 160, bottom: 160, left: 240, right: 240 },
      children: [
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "AGENT 3: DATA PIPELINE", font: "Arial", size: 24, bold: true, color: COLORS.warning })] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Owns: Scrapers, importers, data validation, ETL orchestration, PostGIS optimization", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Immediate priorities:", font: "Arial", size: 19, bold: true, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "1. Write scrapers for person_connections and event_person_association (fill empty tables)", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "2. Add Pydantic validation schemas for all scraper outputs", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "3. Move 679MB of data out of Git to S3 with date versioning", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "4. Implement Dagster/Prefect for orchestration and scheduling", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "5. Add GiST spatial indexes on all geometry columns", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: "6. Fix hardcoded Mac paths in all scraper scripts", font: "Arial", size: 19, color: COLORS.text_dark })] }),
      ],
    })],
  })],
}));

children.push(emptyLine());

// Agent 4
children.push(new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [9360],
  rows: [new TableRow({
    children: [new TableCell({
      borders: { ...borders, left: { style: BorderStyle.SINGLE, size: 6, color: "7B1FA2" } },
      width: { size: 9360, type: WidthType.DXA },
      shading: { fill: "F3E5F5", type: ShadingType.CLEAR },
      margins: { top: 160, bottom: 160, left: 240, right: 240 },
      children: [
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "AGENT 4: INFRASTRUCTURE & DEVOPS", font: "Arial", size: 24, bold: true, color: "7B1FA2" })] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Owns: Docker, deployment, CI/CD, monitoring, secrets management, database ops", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Immediate priorities:", font: "Arial", size: 19, bold: true, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "1. Multi-stage Docker builds (backend 1GB to 400MB, frontend 350MB to 50MB)", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "2. Fix frontend Dockerfile to build static assets and serve via nginx", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "3. Add missing test/typecheck scripts to frontend package.json", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "4. Fix or remove broken Kustomize overlay references in CD pipeline", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "5. Implement proper secrets management (no base64 secrets in Git)", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: "6. Evaluate migration from Kubernetes to Railway/Fly.io (82% cost reduction)", font: "Arial", size: 19, color: COLORS.text_dark })] }),
      ],
    })],
  })],
}));

children.push(emptyLine());

// Agent 5
children.push(new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [9360],
  rows: [new TableRow({
    children: [new TableCell({
      borders: { ...borders, left: { style: BorderStyle.SINGLE, size: 6, color: "00695C" } },
      width: { size: 9360, type: WidthType.DXA },
      shading: { fill: "E0F2F1", type: ShadingType.CLEAR },
      margins: { top: 160, bottom: 160, left: 240, right: 240 },
      children: [
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "AGENT 5: QUALITY & VERIFICATION", font: "Arial", size: 24, bold: true, color: "00695C" })] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Owns: Testing, code review, data integrity, accessibility, performance benchmarking", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Immediate priorities:", font: "Arial", size: 19, bold: true, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "1. Add pytest-cov with 80% minimum coverage threshold", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "2. Add mypy/pyright for backend type checking", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "3. Create integration tests with real database (PostGIS)", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "4. Add load testing with k6 (establish baseline: concurrent users, p95 latency)", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "5. Verify data integrity of all imported records (referential constraints, date ranges)", font: "Arial", size: 19, color: COLORS.text_dark })] }),
        new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: "6. Add Web Vitals monitoring and Lighthouse CI to pipeline", font: "Arial", size: 19, color: COLORS.text_dark })] }),
      ],
    })],
  })],
}));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============================================================
// SECTION 4: PRIORITY ROADMAP
// ============================================================
children.push(heading1("4. Priority Roadmap"));

children.push(heading2("Week 1-2: Critical Fixes (All Agents)"));
children.push(makeTable(
  ["#", "Task", "Agent", "Impact"],
  [
    ["1", "Fix DB connection pooling", "Backend", "Prevents crash under 20 users"],
    ["2", "Require JWT/TOTP env vars on startup", "Backend", "Prevents forged tokens"],
    ["3", "Replace MapLibre with Leaflet", "Frontend", "684KB bundle reduction"],
    ["4", "Fix frontend test scripts in package.json", "Infra", "Unblocks CI pipeline"],
    ["5", "Multi-stage Docker builds", "Infra", "1GB to 400MB images"],
    ["6", "Write person_connections scraper", "Data", "Enables knowledge graph"],
  ],
  [500, 3800, 1400, 3660]
));

children.push(emptyLine());
children.push(heading2("Week 3-4: High Priority"));
children.push(makeTable(
  ["#", "Task", "Agent", "Impact"],
  [
    ["7", "Replace Recharts with Visx", "Frontend", "344KB bundle reduction"],
    ["8", "Implement cursor-based pagination", "Backend", "O(1) vs O(n) list queries"],
    ["9", "Add Pydantic validation to scrapers", "Data", "Prevents garbage data imports"],
    ["10", "Move 679MB data out of Git to S3", "Data", "Faster clones, proper versioning"],
    ["11", "Consolidate rate limiters", "Backend", "Removes confusion, proper auth limits"],
    ["12", "Add pytest-cov and mypy to CI", "Quality", "Establishes quality baseline"],
  ],
  [500, 3800, 1400, 3660]
));

children.push(emptyLine());
children.push(heading2("Month 2: Architecture Improvements"));
children.push(makeTable(
  ["#", "Task", "Agent", "Impact"],
  [
    ["13", "Implement Dagster/Prefect for ETL", "Data", "Automated, monitored data pipeline"],
    ["14", "Add selectinload() to all services", "Backend", "Eliminates N+1 query problem"],
    ["15", "Bundle i18n translations at build time", "Frontend", "Eliminates runtime HTTP loading"],
    ["16", "Evaluate Kubernetes to Railway migration", "Infra", "82% cost reduction"],
    ["17", "Add GiST spatial indexes", "Data", "10-100x faster geospatial queries"],
    ["18", "Load testing baseline with k6", "Quality", "Know breaking point"],
  ],
  [500, 3800, 1400, 3660]
));

children.push(emptyLine());
children.push(heading2("Quarter 2: Strategic"));
children.push(makeTable(
  ["#", "Task", "Agent", "Impact"],
  [
    ["19", "Evaluate Astro for static content pages", "Frontend", "85% overall bundle reduction"],
    ["20", "Implement structured logging (structlog)", "Backend", "Production observability"],
    ["21", "Fill remaining association tables", "Data", "Complete knowledge graph"],
    ["22", "Add Sentry error tracking", "Infra", "Proactive error detection"],
    ["23", "Add PostGIS materialized views", "Data", "Pre-computed map data"],
    ["24", "Implement integration + E2E test suite", "Quality", "Confidence in deployments"],
  ],
  [500, 3800, 1400, 3660]
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============================================================
// SECTION 5: TECHNOLOGY REPLACEMENT RECOMMENDATIONS
// ============================================================
children.push(heading1("5. Technology Replacement Summary"));

children.push(para("Not every technology needs replacing. The following table distinguishes between what should stay, what should be optimized, and what should be replaced entirely."));
children.push(emptyLine());

children.push(makeTable(
  ["Technology", "Verdict", "Action", "Rationale"],
  [
    ["FastAPI", "KEEP", "Optimize patterns", "Excellent framework, fix usage not tool"],
    ["PostgreSQL + PostGIS", "KEEP", "Add spatial indexes", "Correct choice for geospatial data"],
    ["SQLAlchemy 2.0", "KEEP", "Fix query patterns", "Good ORM, add selectinload everywhere"],
    ["React 18", "KEEP (for now)", "Evaluate Astro later", "Acceptable, optimize before replacing"],
    ["TypeScript", "KEEP", "Add stricter options", "Good, already strict mode"],
    ["Tailwind CSS", "KEEP", "Remove manual RTL utils", "54KB output is efficient"],
    ["Zustand", "KEEP", "Refactor store patterns", "Right tool, reduce boilerplate"],
    ["React Query", "KEEP", "Add prefetching", "Excellent, underutilized"],
    ["Vite", "KEEP", "Improve code splitting", "Good build tool"],
    ["Redis", "KEEP", "Rearchitect cache strategy", "Right tool, wrong patterns"],
    ["MapLibre GL", "REPLACE", "Use Leaflet.js", "784KB for one page is inexcusable"],
    ["Recharts", "REPLACE", "Use Visx (Airbnb)", "394KB for simple charts"],
    ["Axios", "REPLACE", "Use native fetch()", "Redundant with React Query"],
    ["i18next HTTP backend", "REPLACE", "Bundle at build time", "Runtime loading adds latency"],
    ["psycopg2-binary", "REMOVE", "Delete from deps", "Unused, 10MB bloat"],
    ["Kubernetes", "EVALUATE", "Consider Railway/Fly.io", "5x over-engineered for scale"],
    ["Prometheus/Grafana stack", "EVALUATE", "Use platform monitoring", "10 services for basic needs"],
    ["No ETL tool", "ADD", "Implement Dagster/Prefect", "Critical for data reliability"],
    ["No validation", "ADD", "Implement Pydantic schemas", "Prevents garbage data"],
  ],
  [2200, 1200, 2400, 3560]
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============================================================
// SECTION 6: ESTIMATED IMPACT
// ============================================================
children.push(heading1("6. Estimated Impact"));

children.push(heading2("Performance Improvements"));
children.push(makeTable(
  ["Metric", "Current", "After Optimization", "Improvement"],
  [
    ["Frontend bundle size", "2.1 MB", "~1.1 MB", "46% reduction"],
    ["Frontend (with Astro)", "2.1 MB", "~300 KB", "85% reduction"],
    ["Backend Docker image", "~1 GB", "~400 MB", "60% reduction"],
    ["Frontend Docker image", "~350 MB", "~50 MB", "86% reduction"],
    ["API list query (page 100)", "~500ms", "~10ms", "50x faster (cursor pagination)"],
    ["Person detail query", "3 roundtrips", "1 roundtrip", "3x fewer DB calls"],
    ["Geospatial query", "Full scan", "GIST indexed", "10-100x faster"],
    ["Monthly infrastructure cost", "$350+", "$65", "82% reduction"],
  ],
  [2800, 1800, 2400, 2360]
));

children.push(emptyLine());
children.push(heading2("Quality Improvements"));
children.push(makeTable(
  ["Area", "Current State", "Target State"],
  [
    ["Test coverage", "Unknown / broken", "80% minimum with CI enforcement"],
    ["Type checking", "Frontend only (TS strict)", "Frontend + backend (mypy)"],
    ["Data validation", "Minimal null checks", "Full Pydantic schema validation"],
    ["Data freshness", "Manual (1-2 week lag)", "Automated daily with scheduling"],
    ["Knowledge graph", "Flat (zero associations)", "Connected (300K+ relationships)"],
    ["Error tracking", "Console logs only", "Sentry with structured logging"],
    ["Security", "Hardcoded secrets", "Env-var required, validated on startup"],
    ["Secrets management", "Base64 in Git", "External secret store"],
  ],
  [2200, 3200, 3960]
));

// ============================================================
// BUILD DOCUMENT
// ============================================================
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: COLORS.primary },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: COLORS.primary },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: COLORS.text_dark },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "LeftistMonitor Technology Audit", font: "Arial", size: 16, color: "999999", italics: true })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", font: "Arial", size: 16, color: "999999" }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "999999" }),
          ],
        })],
      }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/sessions/peaceful-practical-mayer/mnt/LeftistMonitor/LeftistMonitor_Technology_Audit.docx", buffer);
  console.log("Document created successfully!");
});
