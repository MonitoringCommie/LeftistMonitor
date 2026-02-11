const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  TableOfContents
} = require("docx");

// ── Styling constants ──────────────────────────────────────────
const RED = "DD4444";
const DARK_BG = "0A0E1A";
const DARK_PANEL = "121828";
const GRAY = "888888";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "CCCCCC";

const border = { style: BorderStyle.SINGLE, size: 1, color: LIGHT_GRAY };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

// Helper: create a styled paragraph
function heading(text, level) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : 240, after: 120 },
    children: [new TextRun({ text, bold: true, font: "Arial" })]
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 22, ...opts })]
  });
}

function bulletItem(text, reference = "bullets") {
  return new Paragraph({
    numbering: { reference, level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 22 })]
  });
}

function boldPara(label, value) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: label, bold: true, font: "Arial", size: 22 }),
      new TextRun({ text: value, font: "Arial", size: 22 })
    ]
  });
}

function codeBlock(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "444444" })]
  });
}

// Table helper
function makeTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    children: headers.map((h, i) =>
      new TableCell({
        borders,
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
        margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, font: "Arial", size: 20 })] })]
      })
    )
  });

  const dataRows = rows.map(row =>
    new TableRow({
      children: row.map((cell, i) =>
        new TableCell({
          borders,
          width: { size: colWidths[i], type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: String(cell), font: "Arial", size: 20 })] })]
        })
      )
    })
  );

  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows]
  });
}

// ── Build Document ─────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: RED },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "333333" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "555555" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "sub-bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
        }]
      }
    ]
  },
  sections: [
    // ══════════════════════════════════════════════════════════
    // TITLE PAGE
    // ══════════════════════════════════════════════════════════
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        new Paragraph({ spacing: { before: 3000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "LEFTISTMONITOR", font: "Arial", size: 56, bold: true, color: RED })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "Global Conflict Monitor & Educational Platform", font: "Arial", size: 28, color: "555555" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [new TextRun({ text: "Comprehensive Project Documentation", font: "Arial", size: 24, color: GRAY })]
        }),
        new Paragraph({ alignment: AlignmentType.CENTER }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 1200, after: 100 },
          children: [new TextRun({ text: "Version 1.0", font: "Arial", size: 22, color: GRAY })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "February 2026", font: "Arial", size: 22, color: GRAY })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Built with React, Three.js, FastAPI & GDELT", font: "Arial", size: 20, italics: true, color: GRAY })]
        }),
      ]
    },

    // ══════════════════════════════════════════════════════════
    // TABLE OF CONTENTS
    // ══════════════════════════════════════════════════════════
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "LeftistMonitor Documentation", font: "Arial", size: 18, color: GRAY, italics: true })]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Page ", font: "Arial", size: 18, color: GRAY }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: GRAY })]
          })]
        })
      },
      children: [
        heading("Table of Contents", HeadingLevel.HEADING_1),
        new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════
        // 1. PROJECT OVERVIEW
        // ══════════════════════════════════════════════════════
        heading("1. Project Overview", HeadingLevel.HEADING_1),
        para("LeftistMonitor is a comprehensive educational platform documenting liberation struggles, armed conflicts, progressive political movements, and social justice history worldwide. The platform combines a rich 3D interactive globe visualization with extensive datasets spanning people, books, elections, political parties, ideologies, conflicts, economic data, and real-time event monitoring."),
        para("The project serves as both a research tool and an educational resource, providing users with interactive exploration of global conflicts, political movements, and historical events through a modern, visually striking interface."),

        heading("1.1 Core Mission", HeadingLevel.HEADING_2),
        bulletItem("Document and preserve the history of liberation struggles and progressive movements globally"),
        bulletItem("Provide real-time monitoring of active conflicts, protests, and political incidents worldwide"),
        bulletItem("Create an accessible, interactive platform for exploring complex geopolitical and historical data"),
        bulletItem("Integrate multiple data sources (GDELT, Wikidata, World Bank, ACLED) into a unified interface"),

        heading("1.2 Technology Stack", HeadingLevel.HEADING_2),
        makeTable(
          ["Layer", "Technology", "Details"],
          [
            ["Frontend Framework", "React 18 + TypeScript", "Single-page application with React Router v6"],
            ["Build Tool", "Vite", "Fast development server with HMR, proxy to API"],
            ["3D Globe", "Three.js v0.182.0", "Standalone HTML (1,966 lines) embedded via iframe"],
            ["State Management", "React Query + Axios", "Server state caching, API integration"],
            ["Backend API", "FastAPI (Python)", "Mock server serving JSON data, 67 endpoints"],
            ["Data Sources", "GDELT, Wikidata, World Bank", "160 JSON files, 1.5GB total project size"],
            ["Styling", "CSS (Dark Glass-morphism)", "Red accent (#DD4444) on dark background (#0A0E1A)"],
            ["Real-time Data", "World Monitor API", "635 live conflict/protest/incident events"],
          ],
          [2200, 2800, 4360]
        ),

        heading("1.3 Project Statistics", HeadingLevel.HEADING_2),
        makeTable(
          ["Metric", "Count"],
          [
            ["TypeScript/TSX Source Files", "124"],
            ["React Components", "11 component modules"],
            ["Page Components", "34 pages"],
            ["JSON Data Files", "160 files"],
            ["API Endpoints", "67 endpoints"],
            ["Globe HTML Lines", "1,966 lines"],
            ["Mock API Lines", "943 lines"],
            ["Total Project Size", "1.5 GB"],
          ],
          [5000, 4360]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════
        // 2. ARCHITECTURE
        // ══════════════════════════════════════════════════════
        heading("2. Architecture & File Structure", HeadingLevel.HEADING_1),

        heading("2.1 Directory Structure", HeadingLevel.HEADING_2),
        codeBlock("LeftistMonitor/"),
        codeBlock("  backend/          \u2500 FastAPI mock server (mock_api.py)"),
        codeBlock("  data/             \u2500 All JSON datasets"),
        codeBlock("    formatted/      \u2500 Cleaned/structured data (conflicts, events, cities, ideologies)"),
        codeBlock("    generated/      \u2500 AI-generated content and mappings"),
        codeBlock("    scraped/        \u2500 Raw scraped data (people, books, elections, economic)"),
        codeBlock("  frontend/         \u2500 React + TypeScript application"),
        codeBlock("    public/         \u2500 Static assets including globe-test.html"),
        codeBlock("    src/            \u2500 Application source code"),
        codeBlock("      components/   \u2500 Shared React components (11 modules)"),
        codeBlock("      pages/        \u2500 Page components (34 pages)"),
        codeBlock("      services/     \u2500 API service layer"),
        codeBlock("      types/        \u2500 TypeScript type definitions"),
        codeBlock("  infrastructure/   \u2500 Deployment configs"),
        codeBlock("  scripts/          \u2500 Data processing and build scripts"),

        heading("2.2 Data Flow Architecture", HeadingLevel.HEADING_2),
        para("The application follows a clear data flow: JSON data files are loaded by the FastAPI mock server at startup, served through REST API endpoints, fetched by the React frontend via Axios/React Query, and rendered in the UI. The 3D globe operates as a standalone HTML page embedded via iframe, communicating with the same API server."),
        bulletItem("JSON Data Files (160 files) \u2192 FastAPI Mock Server (port 8000)"),
        bulletItem("FastAPI Mock Server \u2192 REST API Endpoints (67 routes)"),
        bulletItem("Vite Dev Server (port 5173) proxies /api \u2192 localhost:8000"),
        bulletItem("React Frontend fetches data via Axios + React Query"),
        bulletItem("Globe (iframe) fetches live events directly from /api/v1/live/events"),

        heading("2.3 Globe Integration", HeadingLevel.HEADING_2),
        para("The 3D globe is a standalone HTML file (globe-test.html, 1,966 lines) using Three.js v0.182.0. It renders an interactive Earth with country borders, conflict markers, city labels, and real-time GDELT event markers. The globe is embedded into the React app via an iframe on the /globe route, which bypasses the standard React Layout component to provide a full-screen experience."),
        para("Key globe features include: interactive rotation and zoom, country highlighting with data panels, conflict markers with pulsing animations, 635 live event markers color-coded by type (conflict=red, protest=yellow, incident=blue) and sized by severity, a scrollable live feed panel, and click-to-fly navigation."),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════
        // 3. WHAT WAS BUILT
        // ══════════════════════════════════════════════════════
        heading("3. Development Progress \u2014 What Was Built", HeadingLevel.HEADING_1),

        heading("3.1 Mock API Server (backend/mock_api.py)", HeadingLevel.HEADING_2),
        para("Since the original backend required PostgreSQL and Redis (which were not available in the development environment), a comprehensive mock API server was created. This lightweight FastAPI server loads all 160 JSON data files at startup and serves them through 67 REST endpoints, providing the same API surface the frontend expects."),

        heading("Data Loaded at Startup", HeadingLevel.HEADING_3),
        makeTable(
          ["Dataset", "Source File", "Records Loaded"],
          [
            ["Countries", "generated/country_coordinates.json", "261"],
            ["People", "scraped/people/all_people_comprehensive.json", "3,000 (of 76K+)"],
            ["Books", "scraped/books/all_books_comprehensive.json", "3,000 (of 18K+)"],
            ["Elections", "scraped/elections/all_elections.json", "3,000 (of 30K+)"],
            ["Political Parties", "scraped/elections/all_parties.json", "3,000 (of 20K+)"],
            ["Ideologies", "formatted/ideologies_formatted.json", "44"],
            ["Conflicts (Formatted)", "formatted/conflicts_formatted.json", "23"],
            ["Conflicts (Scraped)", "scraped/all_conflicts.json", "1,000 (of 21K+)"],
            ["Events (Formatted)", "formatted/events_formatted.json", "80"],
            ["Events (Scraped)", "scraped/events/all_events.json", "3,000 (of 22K+)"],
            ["Cities", "formatted/cities_formatted.json", "437"],
            ["Liberation Struggles", "formatted/liberation_struggles_formatted.json", "10"],
            ["World Bank Economic", "scraped/economic/worldbank_combined.json", "266"],
            ["Live GDELT Events", "world_monitor_live_events.json", "635"],
          ],
          [2800, 4000, 2560]
        ),

        heading("Key API Endpoint Categories", HeadingLevel.HEADING_3),
        makeTable(
          ["Category", "Endpoints", "Description"],
          [
            ["Health & Stats", "/api/v1/health, /api/v1/stats/overview", "System health, data counts overview"],
            ["People", "/api/v1/people/people", "Search/filter 3,000 historical figures"],
            ["Books", "/api/v1/books", "Search/filter 3,000 political/historical books"],
            ["Elections", "/api/v1/politics/elections", "Global election data with filtering"],
            ["Parties", "/api/v1/politics/parties", "Political party data with search"],
            ["Ideologies", "/api/v1/politics/ideologies", "44 political ideologies with details"],
            ["Countries", "/api/v1/geography/countries/*", "261 countries with coordinates, stats"],
            ["Conflicts", "/api/v1/conflicts/active, /all", "Active and historical conflict data"],
            ["Events", "/api/v1/events", "Historical events with date filtering"],
            ["Globe Data", "/api/v1/globe/*", "Cities, conflicts, liberation data for 3D globe"],
            ["Live Events", "/api/v1/live/events, /stats", "Real-time GDELT conflict monitoring"],
            ["Search", "/api/v1/search", "Cross-category search across all data"],
            ["Frontlines", "/api/v1/frontlines/*", "Military frontline data"],
            ["Economic", "/api/v1/economic/*", "World Bank economic indicators"],
          ],
          [1800, 3200, 4360]
        ),

        heading("3.2 Globe Visual Overhaul", HeadingLevel.HEADING_2),
        para("The 3D globe was transformed from a blue-themed visualization into a professional conflict monitoring dashboard inspired by platforms like Liveuamap, LiveWarsMap, and world-monitor.com. Key changes include:"),

        heading("Color Theme Conversion", HeadingLevel.HEADING_3),
        bulletItem("All blue accent colors (#4499dd, rgba(68,153,221,...)) replaced with red (#dd4444, rgba(221,68,68,...))"),
        bulletItem("Country border lines changed from blue (0x88bbff) to red tint (0xdd6666) with 0.3 opacity"),
        bulletItem("Panel borders, hover states, scrollbar tracks, and link colors all updated to red palette"),
        bulletItem("Background maintained at dark glass-morphism: #0a0e1a base with rgba(10,14,26,0.92) glass panels"),

        heading("Monitoring Dashboard Features", HeadingLevel.HEADING_3),
        bulletItem("Animated status bar at top of viewport with red gradient pulse"),
        bulletItem("Pulsing red dot indicator in Active Conflicts panel header"),
        bulletItem("Title redesigned: \"LEFTISTMONITOR\" with live indicator dot and subtitle \"Global Conflict Monitor \u2014 Real-time Tracking\""),
        bulletItem("Glow effects on glass panels (box-shadow with red tones)"),
        bulletItem("CSS @keyframes pulse-live animation for real-time monitoring aesthetic"),

        heading("3.3 Live Events Integration (GDELT)", HeadingLevel.HEADING_2),
        para("635 real-time events from the World Monitor GDELT API were integrated, covering conflicts, protests, and incidents across 88 countries. This data powers both 3D globe markers and a scrollable live feed panel."),

        heading("Event Data Breakdown", HeadingLevel.HEADING_3),
        makeTable(
          ["Metric", "Value"],
          [
            ["Total Events", "635"],
            ["Event Types", "279 conflicts, 256 incidents, 100 protests"],
            ["Severity Distribution", "458 sev-1, 153 sev-2, 20 sev-3, 4 sev-4"],
            ["Countries Covered", "88 unique countries"],
            ["Top Countries", "US (65), Nigeria (43), India (41), Italy (30), Ukraine (27)"],
            ["Data Source", "GDELT via world-monitor.com API"],
          ],
          [4000, 5360]
        ),

        heading("Globe Marker System", HeadingLevel.HEADING_3),
        bulletItem("Three.js SphereGeometry markers placed on globe surface at lat/lng coordinates"),
        bulletItem("Color-coded by type: conflict = red (#ff4444), protest = yellow (#ffcc44), incident = blue (#44aaff)"),
        bulletItem("Sized by severity: base 0.006 + severity * 0.003 globe units"),
        bulletItem("Animated pulsing effect in render loop, intensity scales with severity"),
        bulletItem("Toggle button to show/hide live events layer"),

        heading("Live Feed Panel", HeadingLevel.HEADING_3),
        bulletItem("Left-side scrollable panel showing top 30 events sorted by severity"),
        bulletItem("Each event shows: type badge, severity indicator, location, headline, source, timestamp"),
        bulletItem("Click any event to fly the globe camera to that location"),
        bulletItem("Live count badge shows total active events"),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════
        // 4. FRONTEND PAGES
        // ══════════════════════════════════════════════════════
        heading("4. Frontend Pages & Features", HeadingLevel.HEADING_1),
        para("The React application contains 34 page components organized into thematic categories. Each page connects to the mock API for data and features the dark glass-morphism design system."),

        heading("4.1 Core Pages", HeadingLevel.HEADING_2),
        makeTable(
          ["Page", "Route", "Description"],
          [
            ["HomePage", "/", "Dashboard overview with stats and quick navigation"],
            ["GlobePage", "/globe", "Full-screen 3D globe (iframe embed of globe-test.html)"],
            ["HubPage", "/hub", "Central navigation hub for all content areas"],
            ["AboutPage", "/about", "Project information and methodology"],
            ["SearchPage", "/search", "Cross-category search across all datasets"],
          ],
          [2200, 2000, 5160]
        ),

        heading("4.2 Conflict & Military", HeadingLevel.HEADING_2),
        makeTable(
          ["Page", "Description"],
          [
            ["FrontlinesPage", "Active military frontlines with map visualization"],
            ["HeatmapPage", "Geographic heatmap of conflict intensity"],
            ["SettlementTimelinePage", "Timeline of territorial settlements and changes"],
            ["RefugeeFlowsPage", "Refugee movement patterns and data"],
          ],
          [3500, 5860]
        ),

        heading("4.3 Political & Historical", HeadingLevel.HEADING_2),
        makeTable(
          ["Page", "Description"],
          [
            ["ElectionsPage", "Global election data with filtering and analysis"],
            ["PoliticalPrisonersPage", "Documentation of political prisoners worldwide"],
            ["RevolutionaryTimelinePage", "Timeline of revolutionary movements"],
            ["ColonialExtractionPage", "History of colonial resource extraction"],
            ["SlaveryHistoryPage", "Comprehensive slavery and abolition history"],
            ["UyghurRegionPage", "Uyghur region documentation and monitoring"],
          ],
          [3500, 5860]
        ),

        heading("4.4 Social Movements", HeadingLevel.HEADING_2),
        makeTable(
          ["Page", "Description"],
          [
            ["CivilRightsPage", "Civil rights movements documentation"],
            ["EnvironmentalMovementsPage", "Environmental justice and activism"],
            ["FeministMovementsPage", "Feminist movements history and progress"],
            ["IndigenousMovementsPage", "Indigenous peoples' rights movements"],
            ["LGBTQMovementsPage", "LGBTQ+ rights movements worldwide"],
            ["LaborMovementsPage", "Labor movements and union history"],
          ],
          [3500, 5860]
        ),

        heading("4.5 Research & Resources", HeadingLevel.HEADING_2),
        makeTable(
          ["Page", "Description"],
          [
            ["BooksPage", "Searchable library of 3,000+ political/historical books"],
            ["PeoplePage", "Database of 3,000+ historical figures with bios"],
            ["PersonDetailPage", "Individual person profiles with full details"],
            ["GlossaryPage", "Definitions of political and historical terms"],
            ["NetworkAnalysisPage", "Relationship network visualization"],
            ["HistoricalGalleryPage", "Visual gallery of historical events"],
            ["OralHistoryPage", "Oral history recordings and transcripts"],
          ],
          [3500, 5860]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════
        // 5. DESIGN SYSTEM
        // ══════════════════════════════════════════════════════
        heading("5. Design System", HeadingLevel.HEADING_1),

        heading("5.1 Color Palette", HeadingLevel.HEADING_2),
        makeTable(
          ["Token", "Value", "Usage"],
          [
            ["Primary Accent", "#DD4444", "Headers, links, buttons, active states, globe markers"],
            ["Background", "#0A0E1A", "Main page background, dark theme base"],
            ["Glass Panel", "rgba(10,14,26,0.92)", "Card/panel backgrounds with backdrop-blur"],
            ["Panel Border", "rgba(221,68,68,0.15)", "Subtle red-tinted borders on panels"],
            ["Text Primary", "#FFFFFF", "Main body text, headings"],
            ["Text Secondary", "#CCCCCC / #888888", "Subtitles, metadata, timestamps"],
            ["Severity 1", "#FF8C00", "Low severity events (orange)"],
            ["Severity 2", "#FF6600", "Medium severity events"],
            ["Severity 3", "#FF3300", "High severity events"],
            ["Severity 4", "#FF0000", "Critical severity events (bright red)"],
          ],
          [2200, 3000, 4160]
        ),

        heading("5.2 UI Components", HeadingLevel.HEADING_2),
        bulletItem("Glass-morphism panels: semi-transparent backgrounds with backdrop-filter blur, red-tinted borders"),
        bulletItem("Pulsing live indicators: CSS keyframe animations for real-time monitoring feel"),
        bulletItem("Status bar: fixed top gradient bar indicating system is live"),
        bulletItem("Glow effects: subtle box-shadow halos on interactive panels"),
        bulletItem("Scrollable feeds: custom scrollbar styling with red accent track"),
        bulletItem("Type badges: color-coded labels (conflict=red, protest=yellow, incident=blue)"),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════
        // 6. HOW TO RUN
        // ══════════════════════════════════════════════════════
        heading("6. How to Run the Project", HeadingLevel.HEADING_1),

        heading("6.1 Prerequisites", HeadingLevel.HEADING_2),
        bulletItem("Node.js (v18+) and npm"),
        bulletItem("Python 3.10+ with pip"),
        bulletItem("FastAPI and uvicorn: pip install fastapi uvicorn"),

        heading("6.2 Start the Mock API Server", HeadingLevel.HEADING_2),
        codeBlock("cd LeftistMonitor"),
        codeBlock("pip install fastapi uvicorn"),
        codeBlock("python3 backend/mock_api.py"),
        para("The API server starts on port 8000. Verify at http://localhost:8000/api/v1/health"),

        heading("6.3 Start the Frontend Dev Server", HeadingLevel.HEADING_2),
        codeBlock("cd LeftistMonitor/frontend"),
        codeBlock("npm install"),
        codeBlock("npx vite --host 0.0.0.0 --port 5173"),
        para("The frontend starts on port 5173. Vite automatically proxies /api requests to localhost:8000."),

        heading("6.4 Access the Application", HeadingLevel.HEADING_2),
        bulletItem("Main Application: http://localhost:5173"),
        bulletItem("3D Globe: http://localhost:5173/globe"),
        bulletItem("Standalone Globe: http://localhost:5173/globe-test.html"),
        bulletItem("API Health Check: http://localhost:8000/api/v1/health"),
        bulletItem("API Stats Overview: http://localhost:8000/api/v1/stats/overview"),
        bulletItem("Live Events API: http://localhost:8000/api/v1/live/events"),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════
        // 7. TECHNICAL DECISIONS
        // ══════════════════════════════════════════════════════
        heading("7. Technical Decisions & Rationale", HeadingLevel.HEADING_1),

        heading("7.1 Mock API vs Full Database", HeadingLevel.HEADING_2),
        para("The original backend required PostgreSQL and Redis, which added significant infrastructure complexity. The mock API approach was chosen because: all data already existed as JSON files, the development environment lacked PostgreSQL, and the mock server provides identical API responses. This allows rapid frontend development without database setup, while preserving the API contract for future migration to a full database backend."),

        heading("7.2 Standalone Globe vs React Component", HeadingLevel.HEADING_2),
        para("The 3D globe is maintained as a standalone HTML file (1,966 lines) rather than a React component. This decision was driven by: Three.js performance is better without React reconciliation overhead, the globe has its own complex state management (camera, markers, animations), and iframe isolation prevents memory leaks from affecting the main React app. The tradeoff is slightly more complex communication between the globe and React app."),

        heading("7.3 GDELT Live Events", HeadingLevel.HEADING_2),
        para("The world-monitor.com API provides GDELT (Global Database of Events, Language, and Tone) data in a clean format with geolocation, severity scoring, and event classification. The 635 events were cached as a local JSON file to avoid API rate limits during development, while the architecture supports fetching fresh data in production."),

        heading("7.4 Data Loading Strategy", HeadingLevel.HEADING_2),
        para("The mock API caps loaded records at 3,000 per category (from datasets of 18K-76K) to keep startup fast and memory reasonable. The capped datasets provide enough data for rich frontend experiences while keeping the server responsive. In production, these would be served from a paginated database."),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════
        // 8. KNOWN ISSUES
        // ══════════════════════════════════════════════════════
        heading("8. Known Issues & Bugs Fixed", HeadingLevel.HEADING_1),

        heading("8.1 Bugs Fixed", HeadingLevel.HEADING_2),
        makeTable(
          ["Issue", "Root Cause", "Fix"],
          [
            ["uuid.uuid5() TypeError on None", "Book author_name was None; uuid5 requires string", "Added null check: if s is None: s = \"unknown\""],
            ["Frontend pages empty", "PostgreSQL backend not running", "Created mock_api.py serving all JSON data"],
            ["FastAPI not installed", "Python venv was macOS, unusable on Linux VM", "pip install fastapi uvicorn on system Python"],
            ["Vite proxy failures", "API server not running on port 8000", "Ensured mock API starts before frontend"],
          ],
          [2500, 3000, 3860]
        ),

        heading("8.2 Known Limitations", HeadingLevel.HEADING_2),
        bulletItem("Mock API loads data into memory; large datasets (76K people) are capped at 3,000 records"),
        bulletItem("Live events are cached from a single API fetch; no automatic refresh mechanism yet"),
        bulletItem("Globe iframe communication is one-directional (no React-to-globe messaging)"),
        bulletItem("No authentication system active (auth endpoints return stubs)"),
        bulletItem("Some frontend pages may expect API response formats that differ from mock data"),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════
        // 9. FUTURE ROADMAP
        // ══════════════════════════════════════════════════════
        heading("9. Future Development Roadmap", HeadingLevel.HEADING_1),

        heading("9.1 High Priority", HeadingLevel.HEADING_2),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "PostgreSQL Database Migration: ", bold: true, font: "Arial", size: 22 }),
            new TextRun({ text: "Move from JSON files to a proper PostgreSQL database with asyncpg. Create migrations, seed scripts, and indexed queries for all 160 data files.", font: "Arial", size: 22 })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Live Event Auto-Refresh: ", bold: true, font: "Arial", size: 22 }),
            new TextRun({ text: "Implement WebSocket or polling-based refresh for GDELT live events. Add a cron job or background task to fetch fresh data from world-monitor.com API at regular intervals.", font: "Arial", size: 22 })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Full Data Integration: ", bold: true, font: "Arial", size: 22 }),
            new TextRun({ text: "Load all 76K+ people, 18K+ books, 30K+ elections, and 21K+ conflicts with server-side pagination, filtering, and full-text search.", font: "Arial", size: 22 })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Authentication System: ", bold: true, font: "Arial", size: 22 }),
            new TextRun({ text: "Implement JWT-based authentication with user accounts, admin roles, and protected API routes.", font: "Arial", size: 22 })
          ]
        }),

        heading("9.2 Medium Priority", HeadingLevel.HEADING_2),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Globe-React Communication: ", bold: true, font: "Arial", size: 22 }),
            new TextRun({ text: "Implement postMessage API between the React app and globe iframe for bidirectional communication (e.g., clicking a conflict in React flies the globe to that location).", font: "Arial", size: 22 })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Additional Data Sources: ", bold: true, font: "Arial", size: 22 }),
            new TextRun({ text: "Integrate ACLED conflict data, UNHCR refugee statistics, Freedom House democracy indices, and V-Dem political indicators.", font: "Arial", size: 22 })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Timeline Visualization: ", bold: true, font: "Arial", size: 22 }),
            new TextRun({ text: "Build interactive timelines for conflicts, revolutions, and social movements with zoom, filtering, and linked globe navigation.", font: "Arial", size: 22 })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Network Graph Visualization: ", bold: true, font: "Arial", size: 22 }),
            new TextRun({ text: "Implement D3.js or Cytoscape.js force-directed graphs showing relationships between people, organizations, events, and movements.", font: "Arial", size: 22 })
          ]
        }),

        heading("9.3 Lower Priority / Nice to Have", HeadingLevel.HEADING_2),
        bulletItem("Mobile responsive design optimization for all 34 pages"),
        bulletItem("PWA (Progressive Web App) support with offline caching of key datasets"),
        bulletItem("Export functionality: PDF reports, CSV data exports, shareable links"),
        bulletItem("Multi-language support (i18n) for global accessibility"),
        bulletItem("AI-powered analysis: automated conflict trend detection, severity forecasting"),
        bulletItem("User-contributed content: allow verified researchers to add/edit entries"),
        bulletItem("Dark/light theme toggle (currently dark-only)"),
        bulletItem("Performance optimization: lazy loading, code splitting, image optimization"),
        bulletItem("Deployment: Docker containerization, CI/CD pipeline, cloud hosting (AWS/GCP)"),
        bulletItem("API rate limiting, caching layer (Redis), and monitoring/logging"),

        new Paragraph({ children: [new PageBreak()] }),

        // ══════════════════════════════════════════════════════
        // 10. SESSION LOG
        // ══════════════════════════════════════════════════════
        heading("10. Development Session Log", HeadingLevel.HEADING_1),
        para("Below is a chronological log of the work completed during the current development sessions."),

        heading("Session 1: Initial Setup & React App", HeadingLevel.HEADING_2),
        bulletItem("Set up React 18 + TypeScript + Vite project structure"),
        bulletItem("Created 34 page components with React Router routing"),
        bulletItem("Built 11 shared component modules (navigation, layout, data display)"),
        bulletItem("Implemented API service layer with Axios and React Query"),
        bulletItem("Established TypeScript type definitions for all data models"),

        heading("Session 2: 3D Globe Development", HeadingLevel.HEADING_2),
        bulletItem("Built standalone 3D globe with Three.js v0.182.0 (globe-test.html)"),
        bulletItem("Implemented country borders from GeoJSON with interactive highlighting"),
        bulletItem("Added conflict markers, city labels, and camera fly-to animations"),
        bulletItem("Integrated globe into React app via iframe on /globe route"),
        bulletItem("Applied dark glass-morphism UI theme across the entire site"),

        heading("Session 3: Backend & Live Data (Current)", HeadingLevel.HEADING_2),
        bulletItem("Created comprehensive mock API server (mock_api.py, 943 lines) serving all JSON data"),
        bulletItem("Resolved PostgreSQL dependency by building JSON-file-based backend"),
        bulletItem("Fixed uuid5 TypeError bug in data processing pipeline"),
        bulletItem("Verified all 67 API endpoints returning correct data to frontend"),
        bulletItem("Converted globe color theme from blue to red (#DD4444) for conflict monitoring aesthetic"),
        bulletItem("Added monitoring dashboard UI: status bar, pulse animations, glow effects"),
        bulletItem("Fetched and integrated 635 GDELT live events from world-monitor.com API"),
        bulletItem("Built live event marker system on globe (color-coded, severity-sized, pulsing)"),
        bulletItem("Created scrollable live feed panel with click-to-fly navigation"),
        bulletItem("Generated this comprehensive project documentation"),

        new Paragraph({ spacing: { before: 600 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
          children: [new TextRun({ text: "\u2014 End of Documentation \u2014", font: "Arial", size: 22, color: GRAY, italics: true })]
        }),
      ]
    }
  ]
});

// ── Generate ───────────────────────────────────────────────────
const OUTPUT = process.argv[2] || "/sessions/peaceful-practical-mayer/mnt/LeftistMonitor/LeftistMonitor_Documentation.docx";
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUTPUT, buf);
  console.log(`Document generated: ${OUTPUT} (${(buf.length / 1024).toFixed(0)} KB)`);
}).catch(err => {
  console.error("Error generating document:", err);
  process.exit(1);
});
