# LeftistMonitor - Complete Project Documentation

> **Last Updated**: February 2026
> **Status**: Production-ready, actively developed
> **Purpose**: Educational platform documenting liberation struggles, anti-colonial movements, and progressive history through an interactive world map

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Backend API Reference](#backend-api-reference)
6. [Frontend Structure](#frontend-structure)
7. [State Management](#state-management)
8. [Data Pipeline & Importers](#data-pipeline--importers)
9. [Infrastructure & Deployment](#infrastructure--deployment)
10. [Authentication & Security](#authentication--security)
11. [Current Data Statistics](#current-data-statistics)
12. [Known Issues & Blockers](#known-issues--blockers)
13. [Future Implementation Plan](#future-implementation-plan)

---

## Project Overview

LeftistMonitor is a full-stack web application that visualizes 430,000+ records of political, historical, and geographic data on an interactive world map. It documents:

- **Liberation struggles**: Palestine, Ireland, Kurdistan, Kashmir, Tibet, Western Sahara, West Papua, Uyghur Region
- **Political movements**: Feminist, civil rights, labor, LGBTQ+, environmental, indigenous
- **Historical data**: Elections, conflicts, political parties, policies, books, people
- **Economic data**: GDP, military spending, population, budget breakdowns (World Bank)
- **Historical borders**: Country borders from 1886-2019 (CShapes 2.0 dataset)

### Mission
Document struggles of oppressed peoples fighting against occupation, colonialism, and imperialism from a leftist/progressive perspective. Provide educational resources, connect solidarity movements, and democratize access to political history.

---

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Backend Framework** | FastAPI | 0.109+ |
| **Language (Backend)** | Python | 3.11+ (dev machine has 3.14) |
| **Database** | PostgreSQL + PostGIS | PG 17, PostGIS 3.6 |
| **ORM** | SQLAlchemy (async) | 2.0+ |
| **DB Driver** | asyncpg | 0.29+ |
| **Cache** | Redis | 8.4 |
| **Frontend Framework** | React + TypeScript | React 18, TS 5.3 |
| **Build Tool** | Vite | 5.0 |
| **Mapping** | MapLibre GL JS | 4.0 |
| **Charts** | Recharts | 3.7 |
| **State Management** | Zustand + React Query | Zustand 5.0, RQ 5.17 |
| **Styling** | Tailwind CSS | 3.4 |
| **HTTP Client** | Axios | 1.6 |
| **i18n** | i18next | 25.8 |
| **Routing** | React Router | 6.21 |
| **Auth** | JWT (python-jose) + bcrypt | |
| **Rate Limiting** | slowapi | 0.1.9 |
| **Container** | Docker + Docker Compose | |
| **Orchestration** | Kubernetes | |
| **Monitoring** | Prometheus + Grafana + Loki | |
| **CI/CD** | GitHub Actions | |

---

## Architecture

```
LeftistMonitor/
├── backend/                    # FastAPI Python backend
│   ├── src/                    # Application source code
│   │   ├── main.py             # FastAPI app entry point (22 routers)
│   │   ├── config.py           # Settings via pydantic-settings
│   │   ├── database.py         # Async SQLAlchemy engine + sessions
│   │   ├── cache.py            # Redis connection + caching utilities
│   │   ├── admin/              # Admin CRUD + audit logging
│   │   ├── auth/               # JWT auth, 2FA, RBAC
│   │   ├── books/              # Books router
│   │   ├── conflicts/          # Conflicts + frontlines routers
│   │   ├── core/               # Search, export, citations, network
│   │   ├── events/             # Events + adjacent events
│   │   ├── geography/          # Countries, borders, economic data
│   │   ├── importers/          # Data import ETL pipeline
│   │   ├── labor/              # Labor orgs, strikes, leaders
│   │   ├── media/              # Documentaries, films, podcasts
│   │   ├── middleware/         # Rate limit, security, logging, versioning
│   │   ├── monitoring/         # Prometheus metrics, health checks
│   │   ├── people/             # People + connections + positions
│   │   ├── policies/           # Government policies + votes
│   │   ├── politics/           # Elections, parties, ideologies
│   │   ├── research/           # Research pathways + collections
│   │   ├── stats/              # Database statistics
│   │   └── territories/        # Liberation struggle GeoJSON data
│   ├── alembic/                # Database migrations
│   ├── scripts/                # Import orchestration scripts
│   ├── tests/                  # pytest test suite
│   ├── pyproject.toml          # Python dependencies (uv)
│   └── Dockerfile
├── frontend/                   # React TypeScript frontend
│   ├── src/
│   │   ├── App.tsx             # Route definitions (38 routes)
│   │   ├── api/                # API service functions + React Query hooks
│   │   ├── components/         # 92 reusable components
│   │   ├── pages/              # 38 page components
│   │   ├── stores/             # Zustand state stores
│   │   ├── types/              # TypeScript interfaces
│   │   ├── i18n.ts             # Internationalization setup
│   │   └── __tests__/          # Vitest test files
│   ├── public/locales/         # Translation files (6 languages)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
├── data/                       # 655 MB scraped data
│   ├── CShapes-2/              # Historical border shapefiles (1886-2019)
│   ├── frontlines/             # Military conflict frontlines
│   ├── parlgov/                # European parliament data (CSV)
│   └── scraped/                # JSON data from importers
│       ├── people/             # 100K+ political figures
│       ├── books/              # 33K+ books
│       ├── events/             # 81K+ events
│       ├── conflicts/          # Conflict records
│       ├── elections/          # Election data
│       ├── economic/           # World Bank indicators
│       ├── liberation/         # Palestine, Ireland, Kashmir, etc.
│       ├── movements/          # Feminist, civil rights, labor
│       ├── history/            # Slavery, colonial extraction
│       ├── ucdp/               # UCDP armed conflicts
│       └── prisoners/          # Political prisoners
├── infrastructure/
│   ├── kubernetes/             # K8s deployment manifests
│   ├── prometheus/             # Monitoring config + alert rules
│   ├── grafana/                # Dashboard + datasource provisioning
│   ├── alertmanager/           # Alert routing
│   ├── loki/                   # Log aggregation config
│   └── docker-compose.monitoring.yml
├── scripts/                    # Root-level utility scripts
│   ├── init-db.sql             # PostGIS + pg_trgm + uuid-ossp extensions
│   ├── import_cshapes.py       # Historical borders import
│   ├── import_leftists.py      # People + books import
│   ├── import_relationships.py # Country relationships
│   └── fetch_*.py              # Image fetching scripts
├── .github/workflows/          # CI/CD pipelines
│   ├── ci.yml                  # Tests, lint, security scan, Docker build
│   └── cd.yml                  # Staging/production deploy, rollback
├── docker-compose.yml          # Dev environment (PG, Redis, backend, frontend)
├── .env                        # Local dev config
└── .env.example                # Config template
```

### Request Flow
```
Browser → Vite Dev Server (:5173) → Proxy /api → FastAPI (:8000) → PostgreSQL/Redis
                                                     ↓
                                              PostGIS (geospatial)
                                              Redis (cache)
```

---

## Database Schema

**Database**: `leftist_monitor` (172 MB, PostgreSQL 17 + PostGIS 3.6)
**Extensions**: PostGIS, pg_trgm (fuzzy text search), uuid-ossp

### Core Tables (with record counts)

#### `countries` (710 rows) - Historical States & Territories
```sql
id              UUID PK
gwcode          INTEGER          -- Gleditsch-Ward country code
cowcode         INTEGER          -- Correlates of War code
iso_alpha2      VARCHAR(2)       -- ISO 3166-1 alpha-2
iso_alpha3      VARCHAR(3)       -- ISO 3166-1 alpha-3
wikidata_id     VARCHAR(20)
name_en         VARCHAR(255) NOT NULL
name_native     VARCHAR(255)
name_short      VARCHAR(100)
valid_from      DATE NOT NULL    -- State existence start
valid_to        DATE             -- State existence end (NULL = current)
entity_type     VARCHAR(50) NOT NULL  -- state, territory, etc.
description     TEXT
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
deleted_at      TIMESTAMPTZ      -- Soft delete

-- Indexes: name_en trigram (GIN), valid_from/valid_to, gwcode, cowcode
-- Referenced by: 19 foreign keys (people, events, elections, parties, policies, etc.)
```

#### `country_borders` (710 rows) - Geographic Boundaries
```sql
id              UUID PK
country_id      UUID FK → countries (CASCADE)
geometry        GEOMETRY(MultiPolygon, 4326) NOT NULL  -- PostGIS
valid_from      DATE NOT NULL
valid_to        DATE
source          VARCHAR(100) NOT NULL  -- "CShapes-2.0"
source_id       VARCHAR(100)
area_km2        DOUBLE PRECISION
created_at      TIMESTAMPTZ DEFAULT now()

-- Indexes: country_id, geometry (GiST), valid_from/valid_to
```

#### `people` (104,453 rows) - Political Figures
```sql
id                   UUID PK
wikidata_id          VARCHAR(20) UNIQUE
name                 VARCHAR(255) NOT NULL
name_native          VARCHAR(255)
birth_date           DATE
birth_date_precision VARCHAR(10)    -- "day", "month", "year"
death_date           DATE
death_date_precision VARCHAR(10)
person_types         VARCHAR(50)[]  -- {politician,activist,writer,...}
ideology_tags        VARCHAR(50)[]  -- {communist,socialist,anarchist,...}
bio_short            VARCHAR(500)
bio_full             TEXT
progressive_analysis TEXT           -- Leftist perspective on the person
image_url            TEXT
birth_place          VARCHAR(255)
death_place          VARCHAR(255)
primary_country_id   UUID FK → countries
created_at           TIMESTAMPTZ DEFAULT now()
updated_at           TIMESTAMPTZ DEFAULT now()
deleted_at           TIMESTAMPTZ

-- Indexes: name trigram (GIN), wikidata_id UNIQUE, birth_date, death_date, primary_country_id
-- Referenced by: book_authors, event_person_association, person_connections, person_positions, party_memberships, labor_leaders
```

#### `events` (81,096 rows) - Historical Events
```sql
id                   UUID PK
wikidata_id          VARCHAR(20) UNIQUE
title                VARCHAR(500) NOT NULL
title_native         VARCHAR(500)
start_date           DATE
end_date             DATE
date_precision       VARCHAR(10)
category             VARCHAR(50) NOT NULL  -- political, economic, cultural, social, military
event_type           VARCHAR(100)   -- revolution, election, war, treaty, strike, protest, coup, independence
tags                 VARCHAR(50)[]
description          TEXT
progressive_analysis TEXT
importance           INTEGER        -- 1-10 scale
location_name        VARCHAR(255)
location             GEOMETRY(Point, 4326)  -- PostGIS point
primary_country_id   UUID FK → countries
image_url            VARCHAR(500)
created_at           TIMESTAMPTZ DEFAULT now()
updated_at           TIMESTAMPTZ DEFAULT now()
deleted_at           TIMESTAMPTZ

-- Indexes: title trigram (GIN), wikidata_id UNIQUE, category, start_date, end_date, location (GiST), primary_country_id
```

#### `books` (33,034 rows) - Political Literature
```sql
id                   UUID PK
wikidata_id          VARCHAR(20) UNIQUE
isbn                 VARCHAR(20)
title                VARCHAR(500) NOT NULL
title_original       VARCHAR(500)
publication_year     INTEGER
publisher            VARCHAR(255)
book_type            VARCHAR(50)    -- political_theory, manifesto, history, economics, memoir
topics               VARCHAR(100)[] -- {liberation, revolution, economics, culture,...}
description          TEXT
significance         TEXT           -- Why it matters
progressive_analysis TEXT
marxists_archive_url VARCHAR(500)
gutenberg_url        VARCHAR(500)
pdf_url              VARCHAR(500)
cover_url            TEXT
country_id           UUID FK → countries
created_at           TIMESTAMPTZ DEFAULT now()
deleted_at           TIMESTAMPTZ

-- Indexes: title trigram (GIN), wikidata_id UNIQUE, publication_year
```

#### `conflicts` (21,045 rows) - Armed Conflicts
```sql
id                   UUID PK
ucdp_id              VARCHAR(50)    -- Uppsala Conflict Data Program ID
cow_id               VARCHAR(50)    -- Correlates of War ID
wikidata_id          VARCHAR(20) UNIQUE
name                 VARCHAR(255) NOT NULL
start_date           DATE
end_date             DATE
conflict_type        VARCHAR(50) NOT NULL  -- interstate, civil_war, colonial, ethnic, revolutionary, proxy
intensity            VARCHAR(20)    -- minor (25-999 deaths/yr), major (1000+)
casualties_low       INTEGER
casualties_high      INTEGER
description          TEXT
progressive_analysis TEXT
outcome              TEXT
created_at           TIMESTAMPTZ DEFAULT now()
deleted_at           TIMESTAMPTZ

-- Indexes: start_date, end_date, ucdp_id, cow_id, wikidata_id UNIQUE
```

#### `elections` (1,009 rows) - Electoral Data
```sql
id              UUID PK
country_id      UUID FK → countries NOT NULL
date            DATE NOT NULL
election_type   VARCHAR(50) NOT NULL  -- parliamentary, presidential, local
turnout_percent DOUBLE PRECISION
total_votes     INTEGER
total_seats     INTEGER
notes           TEXT
parlgov_id      INTEGER
wikidata_id     VARCHAR(20)
created_at      TIMESTAMPTZ DEFAULT now()

-- Unique: (country_id, date, election_type)
```

#### `political_parties` (12,891 rows) - Political Parties
```sql
id                UUID PK
parlgov_id        INTEGER
partyfacts_id     INTEGER
manifesto_id      VARCHAR(50)
wikidata_id       VARCHAR(20)
name              VARCHAR(255) NOT NULL
name_english      VARCHAR(255)
name_short        VARCHAR(50)
country_id        UUID FK → countries
founded           DATE
dissolved         DATE
left_right_score  DOUBLE PRECISION  -- -100 (far left) to 100 (far right)
party_family      VARCHAR(100)      -- Social Democracy, Communist, etc.
description       TEXT
progressive_analysis TEXT
logo_url          VARCHAR(500)
created_at        TIMESTAMPTZ DEFAULT now()
updated_at        TIMESTAMPTZ DEFAULT now()
```

### Association & Detail Tables

| Table | Rows | Purpose |
|-------|------|---------|
| `election_results` | 8,812 | Party results per election (votes, seats, shares) |
| `conflict_frontlines` | 1,136 | Geographic frontline snapshots with geometry |
| `country_capitals` | 710 | Capital city for each country |
| `book_authors` | 364 | Book-to-person links with role (author/editor/translator) |
| `nakba_villages` | 168 | Palestinian villages destroyed in 1948 |
| `policy_topics` | 50 | Policy categorization (hierarchical) |
| `event_country_association` | 45 | Event-to-country links |
| `conflict_participants` | 34 | Conflict sides with casualties |
| `famine_data` | 32 | Irish Great Famine records |
| `resistance_movements` | 21 | Liberation movements |
| `occupations` | 20 | Territorial occupation records |
| `checkpoints` | 18 | Military checkpoints (Palestine, etc.) |
| `troubles_events` | 16 | Northern Ireland Troubles events |
| `settlements` | 15 | Israeli settlements |
| `massacres` | 14 | Documented massacres |
| `separation_wall` | 8 | Israeli separation barrier segments |
| `country_relationships` | 5 | Interstate relationships (alliance, treaty, etc.) |
| `users` | 1 | Registered users |

### Empty Tables (0 rows - need data import)
```
person_positions         -- Career positions (head of state, minister, etc.)
person_connections       -- Person-to-person relationships
person_country_association -- Person-country links
event_person_association -- Event-person links
party_memberships        -- Person-party membership records
party_ideology_association -- Party-ideology links
ideologies               -- Political ideology definitions
policies                 -- Government policies
policy_impacts           -- Policy impact assessments
policy_votes             -- Party votes on policies
policy_relationships     -- Policy-policy links
policy_topic_association -- Policy-topic links
labor_organizations      -- Trade unions
strikes                  -- Labor strikes
labor_leaders            -- Union leaders
media_resources          -- Documentaries, films, podcasts
media_entity_links       -- Media-entity associations
featured_collections     -- Curated content collections
collection_items         -- Items within collections
research_pathways        -- Guided research paths
pathway_nodes            -- Steps within research paths
territory_snapshots      -- Territory change snapshots
gaza_siege_data          -- Gaza siege statistics
audit_log                -- Admin action audit trail
```

### User Role Enum
```sql
CREATE TYPE userrole AS ENUM ('viewer', 'contributor', 'editor', 'moderator', 'admin', 'superadmin');
```

---

## Backend API Reference

**Base URL**: `http://localhost:8000/api/v1`
**Docs**: `http://localhost:8000/docs` (Swagger), `/redoc` (ReDoc)

### Geography (`/geography/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/countries` | List countries (paginated, filterable by year/search) |
| GET | `/countries/{id}` | Country details |
| GET | `/countries/stats` | Global country statistics |
| GET | `/borders/geojson` | All borders as GeoJSON for a given year |
| GET | `/countries/{id}/borders` | Single country border for year |
| GET | `/countries/{id}/economic/gdp` | GDP history (World Bank) |
| GET | `/countries/{id}/economic/budget` | Budget breakdown |
| GET | `/countries/{id}/economic/military` | Military spending |
| GET | `/countries/{id}/economic/overview` | Economic overview |
| GET | `/countries/{id}/demographics/population` | Population history |
| GET | `/relationships` | Country-to-country relationships by year |

### People (`/people/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all people (paginated, filterable) |
| GET | `/countries/{id}/people` | People by country |
| GET | `/{person_id}` | Person details with connections/positions/books |
| GET | `/{person_id}/connections` | Network graph (nodes + links) |
| GET | `/countries/{id}/books` | Books by country |
| GET | `/books/{book_id}` | Book with authors |

### Events (`/events/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all events (paginated, searchable) |
| GET | `/{event_id}` | Event details |
| GET | `/countries/{id}/events` | Events by country (year/category filters) |
| GET | `/countries/{id}/conflicts` | Conflicts by country |
| GET | `/conflict/{conflict_id}` | Conflict with participants |
| GET | `/countries/{id}/timeline` | Combined timeline |
| GET | `/global/year/{year}` | Important global events for year |

### Politics (`/politics/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/countries/{id}/parties` | Parties by country |
| GET | `/parties/{party_id}` | Party with election history |
| GET | `/countries/{id}/elections` | Elections by country |
| GET | `/elections/{election_id}` | Election with results |
| GET | `/elections` | All elections (paginated) |
| GET | `/ideologies` | All political ideologies |
| GET | `/countries/{id}/voting-trends` | Historical voting trends |

### Conflicts (`/conflicts/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List conflicts |
| GET | `/{conflict_id}` | Conflict details |
| GET | `/active` | Active conflicts for year |
| GET | `/all` | All conflicts |

### Frontlines (`/frontlines/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conflicts-with-frontlines` | Conflicts that have frontline data |
| GET | `/{id}/dates` | Available dates for frontline snapshots |
| GET | `/{id}/geojson` | Frontline GeoJSON for date |
| GET | `/{id}/timeline` | Full frontline timeline |

### Territories (`/territories/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/occupations` | List occupations |
| GET | `/resistance-movements` | Resistance movements |
| GET | `/palestine/nakba-villages/geojson` | Nakba village GeoJSON |
| GET | `/palestine/settlements/geojson` | Settlement GeoJSON |
| GET | `/palestine/checkpoints/geojson` | Checkpoint GeoJSON |
| GET | `/palestine/separation-wall/geojson` | Separation wall GeoJSON |
| GET | `/palestine/massacres/geojson` | Massacre GeoJSON |
| GET | `/palestine/summary` | Palestine data summary |
| GET | `/ireland/troubles/geojson` | Troubles events GeoJSON |
| GET | `/ireland/famine` | Great Famine data |
| GET | `/kashmir/events/geojson` | Kashmir events GeoJSON |
| GET | `/tibet/events/geojson` | Tibet events GeoJSON |
| GET | `/kurdistan/events/geojson` | Kurdistan events GeoJSON |
| GET | `/western-sahara/events/geojson` | Western Sahara events GeoJSON |
| GET | `/west-papua/events/geojson` | West Papua events GeoJSON |

### Books (`/books/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all books (paginated, filterable) |
| GET | `/{book_id}` | Book details |

### Auth (`/auth/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Login (supports 2FA) |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Logout (blacklists token) |
| GET | `/me` | Current user |
| PUT | `/me` | Update profile |
| POST | `/2fa/setup` | Setup TOTP 2FA |
| POST | `/2fa/verify` | Verify 2FA code |
| GET | `/users` | List users (admin) |
| PUT | `/users/{id}/role` | Change user role (admin) |
| DELETE | `/users/{id}` | Delete user (superadmin) |

### Admin (`/admin/`)
Full CRUD for: books, people, events, conflicts
- `GET/POST /admin/{entity}` - List/Create
- `GET/PUT/DELETE /admin/{entity}/{id}` - Read/Update/Delete
- `GET /admin/stats` - Dashboard stats
- `GET /admin/audit-log` - Audit trail

### Other Routers
| Router | Prefix | Description |
|--------|--------|-------------|
| Search | `/search/` | Full-text search across all entities |
| Search Advanced | `/search/` | Advanced search with filters |
| Stats | `/stats/` | Database statistics & overview |
| Export | `/export/` | CSV/PDF export |
| Citations | `/citations/` | Citation generation |
| Network | `/network/` | Network analysis |
| Comparison | `/comparison/` | Country comparison |
| Labor | `/labor/` | Labor organizations, strikes, leaders |
| Research | `/research/` | Research pathways & collections |
| Media | `/media/` | Documentaries, films, podcasts |
| History | `/history/` | Adjacent/related events |

---

## Frontend Structure

### Route Map (38 routes, all lazy-loaded)

```
/                          → HubPage (topic selection landing page)
/map                       → HomePage (interactive world map + time slider)
/country/:id               → CountryPage (10 tabs: overview, borders, elections, parties, people, events, conflicts, books, policies, occupations)
/people                    → PeoplePage (browse 100K+ people)
/person/:id                → PersonDetailPage (bio, career timeline, connections graph)
/books                     → BooksPage (browse 33K+ books)
/book/:id                  → BookDetailPage
/event/:id                 → EventDetailPage
/elections                 → ElectionsPage
/frontlines                → FrontlinesPage (conflict frontline viewer)
/compare                   → ComparisonPage
/stats                     → GlobalStatsPage
/about                     → AboutPage
/glossary                  → GlossaryPage
/login                     → LoginPage
/admin                     → AdminPage

/movements/feminist        → FeministMovementsPage
/movements/civil-rights    → CivilRightsPage
/movements/labor           → LaborMovementsPage
/movements/lgbtq           → LGBTQMovementsPage
/movements/environmental   → EnvironmentalMovementsPage
/movements/indigenous      → IndigenousMovementsPage

/liberation/uyghur-region  → UyghurRegionPage

/visualizations/network    → NetworkAnalysisPage
/visualizations/heatmap    → HeatmapPage
/visualizations/refugee-flows → RefugeeFlowsPage
/visualizations/timeline   → RevolutionaryTimelinePage

/history/slavery           → SlaveryHistoryPage
/prisoners                 → PoliticalPrisonersPage
```

### Key Components (92 total)

**Map Components** (`components/map/`):
- `WorldMap.tsx` - MapLibre GL JS interactive map with year-based borders, conflict visualization, 7 liberation struggle overlays
- `TimeSlider.tsx` - Year slider (1900-present) with playback animation and historical markers
- `CountryInfoPanel.tsx` - Country details sidebar
- `FrontlinesViewer.tsx` - Conflict frontline display
- `PalestineOverlay.tsx` - Nakba villages, settlements, checkpoints, separation wall, massacres
- `KurdistanOverlay.tsx`, `KashmirOverlay.tsx`, `TibetOverlay.tsx`, `WesternSaharaOverlay.tsx`, `IrelandOverlay.tsx`, `WestPapuaOverlay.tsx`

**Country Tabs** (`components/country/`):
- `OverviewTab.tsx`, `BorderDevelopmentTab.tsx`, `ElectionsTab.tsx`, `PartiesTab.tsx`, `PeopleTab.tsx`, `EventsTab.tsx`, `ConflictsTab.tsx`, `BooksTab.tsx`, `PoliciesTab.tsx`, `OccupationsTab.tsx`

**Charts** (`components/charts/`):
- `GDPLineChart.tsx`, `BudgetPieChart.tsx`, `MilitarySpendingChart.tsx`, `PopulationChart.tsx`, `ElectionResultsChart.tsx`, `ConflictTimelineChart.tsx`, `VotingTrendsChart.tsx`

**Visualization** (`components/visualizations/`):
- `AnimatedTimeline.tsx`, `HeatmapLayer.tsx`, `SankeyDiagram.tsx`, `NetworkGraph.tsx` (D3-based), `SettlementTimeline.tsx`

**UI** (`components/ui/`):
- `SearchBar.tsx` (debounced global search, keyboard navigation)
- `SearchAutocomplete.tsx`
- `OptimizedImage.tsx` (lazy loading with fallback)
- `Skeleton.tsx` (loading states)
- `LanguageSelector.tsx`
- `DataExport.tsx`
- `DiscussionThread.tsx`
- `CareerTimeline.tsx`
- `ParliamentHemicycle.tsx`
- `IdeologySpectrum.tsx`
- `ConnectionsGraph.tsx`

**Layout** (`components/layout/`):
- `Layout.tsx` - App shell with header + outlet
- `Header.tsx` - Navigation, search, theme toggle, user menu
- `ErrorBoundary.tsx` - React error boundary

### API Services (`api/`)

Each service exports React Query hooks:

| File | Key Hooks |
|------|-----------|
| `client.ts` | Axios instance, error handling, query presets |
| `geography.ts` | `useBordersGeoJSON`, `useCountries`, `useCountry`, `useCountryRelationships` |
| `people.ts` | `usePeople`, `usePerson`, `usePersonConnections`, `useBooks`, `useBook` |
| `events.ts` | `useEvents`, `useEvent`, `useConflicts`, `useTimeline`, `useGlobalEventsByYear` |
| `politics.ts` | `useParties`, `useElections`, `useIdeologies`, `useVotingTrends` |
| `policies.ts` | `usePolicies`, `usePolicy`, `usePolicyTopics` |
| `economic.ts` | `useGDPHistory`, `useBudgetBreakdown`, `useMilitarySpending`, `usePopulationHistory` |
| `conflicts.ts` | `getActiveConflicts`, `getAllConflicts` |
| `frontlines.ts` | `getConflictsWithFrontlines`, `getFrontlineGeoJSON` |
| `territories.ts` | Palestine/Ireland/Kashmir/Tibet/Kurdistan/WesternSahara/WestPapua GeoJSON hooks |
| `search.ts` | `globalSearch` (across all entity types) |
| `auth.ts` | `useLogin`, `useRegister`, `useLogout`, `useCurrentUser`, admin user management |

### Vite Config
```typescript
// vite.config.ts
server.proxy: /api → http://localhost:8000
build.rollupOptions.manualChunks:
  vendor-react:     react, react-dom, react-router-dom
  vendor-data:      @tanstack/react-query, zustand, axios
  vendor-maplibre:  maplibre-gl
  vendor-recharts:  recharts
  vendor-d3:        d3-selection, d3-force, d3-zoom, d3-drag
chunkSizeWarningLimit: 600KB
resolve.alias: @ → src/
```

---

## State Management

### Zustand Stores

#### ThemeStore (`stores/themeStore.ts`)
```typescript
{
  isDark: boolean,           // Default: false
  toggleTheme(): void,
  setDark(dark: boolean): void
}
// Persisted to localStorage key: 'leftist-monitor-theme'
```

#### MapStore (`stores/mapStore.ts`)
```typescript
{
  // Temporal
  selectedYear: number,      // Default: 2019 (range: 1900-current)
  isPlaying: boolean,
  playbackSpeed: number,     // Default: 2

  // Geography
  selectedCountryId: string | null,
  hoveredCountryId: string | null,
  center: [number, number],  // Default: [10, 30]
  zoom: number,              // Default: 2

  // Overlay toggles (all boolean)
  showConflicts, showCapitals, showOccupations,
  showPalestine, showKurdistan, showWesternSahara,
  showKashmir, showTibet, showIreland, showWestPapua
}
// Granular selectors exported for render optimization
```

#### AuthStore (`api/auth.ts`)
```typescript
{
  token: string | null,
  user: User | null,
  setAuth(token, user): void,
  clearAuth(): void,
  isAuthenticated(): boolean,
  hasPermission(permission: string): boolean,
  hasRole(role: string): boolean
}
// Persisted to localStorage key: 'auth-storage'
// Role hierarchy: viewer → contributor → editor → moderator → admin → superadmin
```

---

## Data Pipeline & Importers

### Data Sources
| Source | Data Type | Records |
|--------|-----------|---------|
| **Wikidata** (SPARQL) | People, events, conflicts, books, parties | 200K+ |
| **Open Library** | Books with ISBNs | 2,858+ |
| **World Bank** | GDP, population, military, education, health | 170K+ |
| **UCDP** | Armed conflicts, battle deaths | 21K+ |
| **CShapes 2.0** | Historical country borders (1886-2019) | 710 |
| **ParlGov** | European elections and parties | 12K+ |
| **OpenStreetMap** | Checkpoints, settlements, military installations | varies |
| **Custom/Manual** | Leftist literature, oral histories, curated data | varies |

### Importer Architecture (`backend/src/importers/`)
```python
class BaseImporter(ABC):
    """ETL pipeline base class"""
    def __init__(self, db: AsyncSession, batch_size: int = 1000)

    @abstractmethod
    def fetch_data(self) -> Generator[dict]     # Extract
    @abstractmethod
    def transform(self, raw) -> dict | None     # Transform (None = skip)
    @abstractmethod
    def load(self, record) -> None              # Load

    async def run(self) -> dict[str, int]       # Returns {processed, created, updated, skipped, errors}
```

### Key Import Scripts
| Script | Location | Purpose |
|--------|----------|---------|
| `import_cshapes.py` | `/scripts/` | Historical borders from CShapes-2.0 shapefiles |
| `import_leftists.py` | `/scripts/` | People + books from scraped JSON |
| `import_relationships.py` | `/scripts/` | Country relationships (alliances, treaties) |
| `import_parlgov.py` | `/backend/scripts/` | European elections + parties from ParlGov CSV |
| `seed_topics.py` | `/backend/scripts/` | Policy topic categories |
| `massive_wikidata.py` | `/backend/src/importers/` | Bulk Wikidata SPARQL import |
| `ucdp_conflicts.py` | `/backend/src/importers/` | UCDP armed conflict data |
| `frontlines_importer.py` | `/backend/src/importers/` | Military frontline geometries |
| `occupations_data.py` | `/backend/src/importers/` | Occupation classifications |
| `resistance_movements.py` | `/backend/src/importers/` | Liberation movement data |
| `liberation_figures.py` | `/backend/src/importers/` | Revolutionary leaders |
| `static_leftist_data.py` | `/backend/src/importers/` | Manual curated leftist data |

### Scraped Data Directory (`/data/scraped/`)
```
people/          → 100K+ figures (revolutionaries, communists, socialists, feminists, etc.)
books/           → 33K+ titles (theory, history, biography, manifestos) + Open Library data
events/          → 81K+ events (revolutions, elections, wars, treaties, strikes, protests, coups)
events_global/   → Comprehensive event collection
conflicts/       → Wikidata conflicts
conflicts_military/ → UCDP + military data
elections/       → 1K+ elections + party data
parties/         → Political party records
economic/        → World Bank indicators (GDP, population, military, education, health, debt, inflation)
demographics/    → Population statistics
intl_orgs/       → UN resolutions (8,665), international organizations
colonial/        → Colonial era data
ucdp/            → UCDP armed conflicts, battle deaths, non-state, one-sided violence
correlates_of_war/ → COW interstate/intrastate/extrastate wars (CSV)
liberation/      → Geospatial data by region:
  palestine/     → Checkpoints (500+), separation barrier, settlements, firing zones, Oslo areas
  ireland/       → Peace walls, border checkpoints, military installations, partition boundary
  kashmir/       → Line of control, military bases, checkpoints, mass graves
  kurdistan/     → Destroyed villages (~4K), military zones, dams
  tibet/         → Monasteries (~6K), military bases, prisons, railway
  western_sahara/→ Sand berm (2,700km), minefields (7M+ mines), refugee camps
  west_papua/    → Military bases, massacres, Freeport mine, extractive industries
  uyghur_region/ → Detention facilities, key figures, historical events
movements/       → Feminist figures/events/orgs, civil rights, decolonization
history/slavery/ → Abolitionists, slave rebellions, trade ports, plantations, colonial companies
prisoners/       → Political prisoner records
marxists_archive/→ Marx Internet Archive authors + works
parlgov/         → European parliament CSV data
```

---

## Infrastructure & Deployment

### Docker Compose (Development)
```yaml
Services:
  db:       postgis/postgis:16-3.4 (port 5432, healthcheck, persistent volume)
  redis:    redis:7-alpine (port 6379, persistent volume)
  backend:  Python 3.11 + FastAPI (port 8000, hot reload, mounts ./backend + ./data)
  frontend: Node 20 + Vite (port 5173, hot reload)
```

### Kubernetes (Production)
```
infrastructure/kubernetes/
├── namespace.yaml          → leftistmonitor namespace
├── deployment-api.yaml     → 3 replicas, rolling updates, non-root, health probes
├── deployment-frontend.yaml→ 2 replicas
├── services.yaml           → ClusterIP services
├── ingress.yaml            → TLS termination, domain routing
├── hpa.yaml                → CPU/memory autoscaling (API: 3-10, Frontend: 2-6)
├── configmap.yaml          → Non-sensitive config
└── secrets.yaml            → Secret template (fill before deploy)
```

**Key K8s Features**:
- Zero-downtime rolling updates (maxSurge=1, maxUnavailable=0)
- Liveness/readiness/startup probes
- Security context: non-root (uid 1000), read-only filesystem, dropped capabilities
- Pod anti-affinity + topology spread across availability zones
- HPA: Scale up aggressively (100% increase/15s), scale down conservatively (10%/60s after 5min)

### Monitoring Stack
```yaml
# infrastructure/docker-compose.monitoring.yml
Services:
  prometheus:    v2.47.0 (port 9090, 30-day retention)
  grafana:       v10.2.0 (port 3001, pre-provisioned dashboards)
  alertmanager:  v0.26.0 (port 9093)
  loki:          v2.9.0 (port 3100, log aggregation)
  promtail:      v2.9.0 (log shipping)
  node_exporter: v1.6.1 (port 9100, system metrics)
  cadvisor:      v0.47.2 (port 8080, container metrics)
```

**Alert Rules** (`infrastructure/prometheus/alerts.yml`):
- High error rate (>5%), high latency (p95 > 2s)
- DB connection pool exhaustion
- High CPU/memory usage
- Service down, low disk space
- Low cache hit rate

### CI/CD (`.github/workflows/`)
**CI** (`ci.yml`): pytest + vitest, ruff + eslint, mypy + tsc, Trivy + Bandit security scan, Docker build
**CD** (`cd.yml`): Auto staging on main, manual production with approval, smoke tests, rollback on failure, Sentry + Slack

---

## Authentication & Security

### User Roles (6 levels, hierarchical)
```
VIEWER       → Read public data
CONTRIBUTOR  → Suggest edits
EDITOR       → Edit data directly
MODERATOR    → Approve edits, manage content
ADMIN        → Full access except system
SUPERADMIN   → Full system access
```

### Permissions (27 granular)
- **Read**: public, private, admin
- **Write**: people, events, books, conflicts, countries, elections, parties
- **Edit**: people, events, books, conflicts, countries
- **Delete**: people, events, books, conflicts
- **Admin**: manage_users, manage_roles, manage_permissions, approve_edits, view_analytics, export_data, import_data
- **System**: config, backup, logs

### Security Features
- JWT tokens: access (15min), refresh (7 days)
- Token rotation + blacklisting (Redis)
- 2FA: TOTP + backup codes
- bcrypt password hashing
- CORS: localhost:5173, 5174
- Rate limiting: 200 requests/minute
- Security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy
- Input validation: Pydantic v2
- HTML sanitization: bleach
- Audit logging: all admin actions with old/new data (JSONB)

---

## Current Data Statistics

| Table | Records | Status |
|-------|---------|--------|
| people | 104,453 | Populated |
| events | 81,096 | Populated |
| books | 33,034 | Populated |
| conflicts | 21,045 | Populated |
| political_parties | 12,891 | Populated |
| election_results | 8,812 | Populated |
| conflict_frontlines | 1,136 | Populated |
| elections | 1,009 | Populated |
| countries | 710 | Populated |
| country_borders | 710 | Populated |
| country_capitals | 710 | Populated |
| book_authors | 364 | Partially populated |
| nakba_villages | 168 | Populated |
| **person_positions** | **0** | **NEEDS IMPORT** |
| **person_connections** | **0** | **NEEDS IMPORT** |
| **event_person_association** | **0** | **NEEDS IMPORT** |
| **party_memberships** | **0** | **NEEDS IMPORT** |
| **ideologies** | **0** | **NEEDS IMPORT** |
| **policies** | **0** | **NEEDS IMPORT** |
| **labor_organizations** | **0** | **NEEDS IMPORT** |
| **strikes** | **0** | **NEEDS IMPORT** |
| **media_resources** | **0** | **NEEDS IMPORT** |
| **research_pathways** | **0** | **NEEDS IMPORT** |
| **gaza_siege_data** | **0** | **NEEDS IMPORT** |
| **featured_collections** | **0** | **NEEDS IMPORT** |

**Database size**: 172 MB
**Scraped data size**: 655 MB (JSON/CSV/geospatial)
**Total records**: ~265,000 in DB + much more in scraped files awaiting import

---

## Known Issues & Blockers

### Critical
1. **Python 3.14 Compatibility**: Dev machine runs Python 3.14.2 but project targets 3.11+. Some packages (asyncpg, geopandas) may have issues with 3.14. The backend fails to start silently - likely a module import error. **Fix**: Either downgrade Python to 3.12/3.13 or identify and fix the specific incompatible package.

2. **slowapi missing from pyproject.toml**: `main.py` imports `slowapi` but it wasn't in the original dependencies. Already added via `uv add slowapi`.

### Data Gaps
3. **22 empty tables**: Major features (person connections, party memberships, ideologies, policies, labor data, media, research pathways) have database tables but no data. The scraped JSON files exist but haven't been imported yet.

4. **book_authors only 364 rows**: With 33,034 books and 104,453 people, the author-book linking is minimal. Need to run the relationship importer.

5. **Liberation data sparse in DB**: The scraped GeoJSON files have hundreds/thousands of records (500+ checkpoints, 4000+ destroyed Kurdish villages, 6000+ Tibetan monasteries) but the DB tables only have 15-168 rows each.

### Frontend
6. **No test runner configured**: `package.json` doesn't have a `test` script. Vitest test files exist but need config.

7. **2 npm audit vulnerabilities**: Moderate severity, fixable with `npm audit fix --force`.

### Infrastructure
8. **No .env in backend/**: The backend `config.py` defaults to `postgresql+asyncpg://leftist:leftist_dev_password@localhost:5432/leftist_monitor` but the root `.env` uses `postgresql+asyncpg://linusgollnow@localhost:5432/leftist_monitor` (peer auth). Need to ensure consistency.

---

## Future Implementation Plan

### Phase 1: Data Completion (HIGH PRIORITY)
Import all scraped data into empty tables:
- [ ] Import person_connections (relationships between 104K people)
- [ ] Import person_positions (career histories)
- [ ] Import event_person_association (link events to people)
- [ ] Import party_memberships (link people to parties)
- [ ] Import ideologies (political spectrum definitions)
- [ ] Import policies (government legislation)
- [ ] Import labor_organizations + strikes + labor_leaders
- [ ] Import media_resources (documentaries, films, podcasts)
- [ ] Import full liberation struggle data (expand from 15-168 rows to thousands)
- [ ] Import gaza_siege_data
- [ ] Import research_pathways + pathway_nodes
- [ ] Expand book_authors linking (364 → 30K+)

### Phase 2: Massive New Data Import
- [ ] Expand people to 200K+ (more Wikidata categories: environmentalists, indigenous leaders, trade unionists)
- [ ] Expand books to 50K+ (more Open Library, Marxists Internet Archive)
- [ ] Expand events to 150K+ (more Wikidata event types)
- [ ] Import full UCDP battle deaths and one-sided violence data
- [ ] Import UN resolutions from scraped data (8,665 records)
- [ ] Import colonial history data
- [ ] Import political prisoner data
- [ ] Import Correlates of War CSV data
- [ ] Expand economic data (education spending, health spending, inflation, debt, unemployment)

### Phase 3: Backend Optimization
- [ ] Fix Python 3.14 compatibility OR set up pyenv for 3.12
- [ ] Add database indexes for common query patterns
- [ ] Implement Redis cache warming on startup
- [ ] Add connection pooling tuning
- [ ] Profile and fix N+1 query patterns
- [ ] Add batch endpoints for bulk data access
- [ ] Implement cursor-based pagination for large datasets

### Phase 4: Frontend Optimization
- [ ] Audit and reduce bundle size
- [ ] Add proper loading skeletons to all pages
- [ ] Implement virtual scrolling for large lists
- [ ] Optimize map rendering for 700+ country borders
- [ ] Add service worker for offline capability
- [ ] Improve code splitting granularity
- [ ] Add React.memo to heavy components

### Phase 5: UI Modernization
- [ ] Unify card styles across all pages
- [ ] Standardize spacing, typography, and color usage
- [ ] Modernize button and form styles
- [ ] Add smooth page transitions
- [ ] Improve mobile responsiveness
- [ ] Add empty state illustrations
- [ ] Consistent dark mode across all components
- [ ] Add micro-animations for interactions

### Phase 6: New Features
- [ ] **Settlement Timeline**: Animated growth of Israeli settlements over time
- [ ] **Oral History**: Audio/video testimony archive
- [ ] **Historical Gallery**: Curated image collections
- [ ] **Colonial Extraction**: Resources stolen, companies involved
- [ ] **Refugee Flows**: Sankey diagram of displacement
- [ ] **More Liberation Struggles**: Chechnya, East Timor, Balochistan, Crimea
- [ ] **LGBTQ+ History**: Expanded timeline and figures
- [ ] **Environmental Justice**: Climate movements and activism
- [ ] **Satellite Comparisons**: Before/after imagery of destruction
- [ ] **Multi-language Expansion**: More translations beyond current 6

### Phase 7: Community & Social
- [ ] Discussion threads on every entity page
- [ ] User contribution workflow (submit → review → approve)
- [ ] Moderation dashboard
- [ ] User reputation system
- [ ] Featured/curated collections
- [ ] Research pathway guided tours
- [ ] Citation export (BibTeX, APA, MLA)

### Phase 8: Advanced Visualization
- [ ] Network analysis of movement connections
- [ ] Heatmaps for violence/protest density
- [ ] Parliament hemicycle visualizations
- [ ] Political spectrum positioning (2D compass)
- [ ] Animated conflict timelines
- [ ] Trade route / colonial extraction flow maps
- [ ] Comparative country dashboards

---

## Environment Setup (Quick Start)

### Prerequisites
- Python 3.11-3.13 (3.14 has compatibility issues)
- Node.js 20+
- PostgreSQL 15+ with PostGIS
- Redis 7+

### Local Development
```bash
# 1. Start services
brew services start postgresql@17
brew services start redis

# 2. Create database (if needed)
createdb leftist_monitor
psql -d leftist_monitor -c "CREATE EXTENSION IF NOT EXISTS postgis; CREATE EXTENSION IF NOT EXISTS pg_trgm; CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# 3. Backend
cd backend
uv sync                          # Install Python deps
uv run alembic upgrade head      # Run migrations
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

# 4. Frontend (separate terminal)
cd frontend
npm install                      # Install JS deps
npm run dev                      # Vite dev server on :5173
```

### Docker Development
```bash
docker-compose up --build        # Starts all 4 services
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/docs
```

### Configuration
- Root `.env`: `DATABASE_URL`, `REDIS_URL`, `VITE_API_URL`
- Backend `src/config.py`: Defaults for all settings
- Frontend `vite.config.ts`: Proxy `/api` → `http://localhost:8000`

---

## Key File Paths

### Backend
```
backend/src/main.py              → App entry point, 22 routers registered
backend/src/config.py            → Settings (DB, Redis, API prefix)
backend/src/database.py          → Async SQLAlchemy engine + session factory
backend/src/cache.py             → Redis connection + cache utilities
backend/src/auth/router.py       → Auth endpoints
backend/src/auth/security.py     → JWT + bcrypt + 2FA
backend/src/auth/dependencies.py → Auth middleware (get_current_user, require_role)
backend/src/admin/router.py      → Admin CRUD + audit log
backend/src/geography/models.py  → Country, CountryBorder, CountryCapital, CountryRelationship
backend/src/geography/router.py  → Country endpoints
backend/src/geography/economic_router.py → Economic data endpoints
backend/src/people/models.py     → Person, PersonConnection, PersonPosition, Book, BookAuthor
backend/src/people/router.py     → People + books endpoints
backend/src/events/models.py     → Event, Conflict, ConflictParticipant, ConflictFrontline
backend/src/events/router.py     → Events endpoints
backend/src/politics/models.py   → Ideology, PoliticalParty, Election, ElectionResult, PartyMembership
backend/src/politics/router.py   → Politics endpoints
backend/src/policies/models.py   → Policy, PolicyTopic, PolicyVote
backend/src/labor/models.py      → LaborOrganization, Strike, LaborLeader
backend/src/media/models.py      → MediaResource, MediaEntityLink
backend/src/research/models.py   → ResearchPathway, PathwayNode, FeaturedCollection, CollectionItem
backend/src/territories/router.py         → Liberation struggle endpoints
backend/src/territories/geojson_router.py → GeoJSON endpoints
backend/src/importers/base.py    → BaseImporter ETL class
backend/alembic/env.py           → Migration configuration
backend/pyproject.toml           → Python dependencies
```

### Frontend
```
frontend/src/App.tsx             → Route definitions (38 routes, lazy-loaded)
frontend/src/api/client.ts       → Axios config, error handling, query presets
frontend/src/api/geography.ts    → Country/border hooks
frontend/src/api/people.ts       → People/books hooks
frontend/src/api/events.ts       → Events/conflicts hooks
frontend/src/api/politics.ts     → Elections/parties hooks
frontend/src/api/economic.ts     → Economic data hooks
frontend/src/api/territories.ts  → Liberation struggle GeoJSON hooks
frontend/src/api/auth.ts         → Auth store + hooks
frontend/src/stores/mapStore.ts  → Map state (year, overlays, selection)
frontend/src/stores/themeStore.ts → Dark mode state
frontend/src/components/map/WorldMap.tsx    → Main map component
frontend/src/components/map/TimeSlider.tsx  → Year slider with playback
frontend/src/pages/HomePage.tsx   → Map page
frontend/src/pages/HubPage.tsx    → Landing page
frontend/src/pages/CountryPage.tsx → Country detail (10 tabs)
frontend/src/i18n.ts             → i18n configuration (6 languages)
frontend/vite.config.ts          → Build config, proxy, chunks
frontend/tailwind.config.js      → Theme, colors, RTL plugin
frontend/package.json            → Dependencies
```

### Data & Config
```
data/CShapes-2/                  → Historical border shapefiles
data/scraped/                    → 655 MB of JSON/CSV/geospatial data
docker-compose.yml               → Dev environment
.env                             → Local dev config
.env.example                     → Config template
infrastructure/kubernetes/       → K8s manifests (8 files)
infrastructure/prometheus/       → Monitoring config + alert rules
.github/workflows/ci.yml        → CI pipeline
.github/workflows/cd.yml        → CD pipeline
```
