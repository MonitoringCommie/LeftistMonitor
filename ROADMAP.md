# LeftistMonitor - Development Roadmap & Future Implementation Plan

> **Created**: February 2026
> **Priority Legend**: P0 = Critical, P1 = High, P2 = Medium, P3 = Low

---

## Current State Summary

The application is production-ready with:
- 265,000+ records in the database (across 30 populated tables)
- 655 MB of scraped data awaiting import
- 22 empty tables that need data
- 38 frontend pages, 92 components
- Full auth, monitoring, CI/CD, K8s deployment

**Biggest gaps**: Empty association tables (person_connections, event_person_association, party_memberships), missing labor/media/policy data, and only a fraction of scraped liberation struggle data imported.

---

## Phase 1: Fix Critical Blockers (P0)

### 1.1 Fix Backend Startup
- **Problem**: Backend fails to start silently on Python 3.14.2
- **Root Cause**: Likely `asyncpg`, `geopandas`, or `psycopg2-binary` incompatibility with Python 3.14
- **Solution Options**:
  - Option A: Install Python 3.12 via pyenv/asdf and use that for the backend virtual environment
  - Option B: Debug the specific import error and pin compatible package versions
  - Option C: Use Docker for backend (Dockerfile already exists with Python 3.11)
- **Files**: `backend/pyproject.toml`, `backend/src/main.py`

### 1.2 Fix Database Connection Config
- **Problem**: Root `.env` uses peer auth (`linusgollnow@localhost`) but `config.py` defaults to password auth (`leftist:leftist_dev_password@localhost`)
- **Solution**: Ensure `.env` is loaded by the backend, or update `config.py` defaults to match local setup
- **Files**: `.env`, `backend/src/config.py`

### 1.3 Add Missing Dependencies
- **Already Fixed**: `slowapi` added to pyproject.toml
- **Check**: Verify all imports in `main.py` routers resolve correctly

---

## Phase 2: Import All Existing Scraped Data (P0)

### 2.1 Fill Empty Association Tables
These tables link existing entities but have 0 rows:

| Table | Source Data | Estimated Records | Import Strategy |
|-------|-----------|-------------------|-----------------|
| `person_connections` | Wikidata relations | 50,000+ | SPARQL P26 (spouse), P40 (child), P1066 (student of), P184 (doctoral advisor) |
| `event_person_association` | Wikidata participants | 100,000+ | SPARQL P710 (participant), P1344 (participant in) |
| `person_country_association` | Wikidata nationality | 100,000+ | SPARQL P27 (country of citizenship) |
| `party_memberships` | Wikidata P102 | 30,000+ | SPARQL P102 (member of political party) with qualifiers |
| `person_positions` | Wikidata P39 | 50,000+ | SPARQL P39 (position held) with start/end date qualifiers |
| `book_authors` | Existing people + books | 30,000+ | Match books to people by Wikidata P50 (author) |

### 2.2 Fill Empty Feature Tables

| Table | Source | Estimated Records | Notes |
|-------|--------|-------------------|-------|
| `ideologies` | Manual + Wikidata | 50-100 | Communism, socialism, anarchism, social democracy, etc. with left-right positions |
| `party_ideology_association` | ParlGov + Wikidata | 15,000+ | Link 12,891 parties to ideologies |
| `policies` | Wikidata legislation | 10,000+ | Major legislation worldwide |
| `policy_topics` | Already seeded (50) | Done | Run seed_topics.py if not yet |
| `labor_organizations` | Wikidata Q178790 | 5,000+ | Trade unions worldwide |
| `strikes` | Wikidata Q49776 | 3,000+ | Historical strikes |
| `labor_leaders` | Cross-reference people with labor_orgs | 2,000+ | Link existing people to organizations |
| `media_resources` | Wikidata documentaries | 5,000+ | Political documentaries, lectures |
| `research_pathways` | Manual creation | 50-100 | Curated learning paths |
| `featured_collections` | Manual creation | 20-50 | Highlighted content sets |
| `gaza_siege_data` | OCHA, WHO, UNRWA data | 500+ | Import siege statistics by year |

### 2.3 Expand Liberation Struggle Data

Current DB has minimal data compared to scraped files:

| Region | DB Rows | Scraped Records | Gap |
|--------|---------|-----------------|-----|
| Palestine checkpoints | 18 | 500+ (GeoJSON) | Need to import ~482 more |
| Palestine settlements | 15 | 150+ (GeoJSON) | Need to import ~135 more |
| Palestine nakba_villages | 168 | 418 (GeoJSON) | Need to import ~250 more |
| Palestine separation_wall | 8 | Full wall geometry | Need full geometry import |
| Palestine massacres | 14 | 50+ events | Need more events |
| Ireland troubles_events | 16 | 100+ events | Need to import ~84 more |
| Ireland famine_data | 32 | Done | OK |
| Kurdistan destroyed villages | 0 | 4,000+ (GeoJSON) | **Full import needed** |
| Kashmir military installations | 0 | Multiple files | **Full import needed** |
| Tibet monasteries | 0 | 6,000+ (JSON) | **Full import needed** |
| Western Sahara sand berm | 0 | Full geometry | **Full import needed** |
| West Papua military/massacres | 0 | Multiple files | **Full import needed** |

**Implementation**: Create importers for each liberation struggle's GeoJSON/JSON files. The territory GeoJSON router endpoints already exist — they just need data in the DB.

---

## Phase 3: Massive New Data Import (P1)

### 3.1 Expand People (Target: 200,000+)
New Wikidata SPARQL queries to add:
- Environmental activists (P106: Q15253558 + environmental orgs)
- Indigenous rights leaders (P106: Q1734662 + indigenous context)
- Trade union leaders not yet captured
- Anti-nuclear activists
- Peace movement leaders
- Human rights lawyers and judges (ICC, ICJ)
- Journalists and war correspondents
- Artists and musicians with political significance
- Liberation theology figures

### 3.2 Expand Books (Target: 50,000+)
- Marxists Internet Archive: Parse `data/scraped/marxists_archive/` for 10K+ works
- Open Library: Continue paginated import (currently 2,858, target 20K+)
- Wikidata: Query for more political theory, history, and sociology books
- Add more book-author relationships

### 3.3 Expand Events (Target: 150,000+)
New event categories to scrape:
- Constitutional amendments and referendums
- Political assassinations
- Mass demonstrations and protests (2010s-2020s Arab Spring, Hong Kong, BLM)
- International court rulings (ICJ, ICC)
- Trade agreements and sanctions
- Nuclear tests and arms agreements
- Environmental disasters caused by corporate negligence
- Land reform events

### 3.4 Import UN Resolutions
- Source: `data/scraped/intl_orgs/un_resolutions.json` (8,665 records)
- Create `un_resolutions` table or map to events
- Include: UNGA and UNSC resolutions, voting records, topics

### 3.5 Import Economic Data Expansion
- Source: `data/scraped/economic/` (170K+ records)
- Import to geography economic endpoints:
  - Education spending % GDP
  - Health spending % GDP
  - Inflation rates
  - Debt-to-GDP ratio
  - Unemployment rates
  - Urban population %
  - Gini coefficient (inequality)

### 3.6 Import Colonial History
- Source: `data/scraped/colonial/all_colonial.json`
- Source: `data/scraped/history/slavery/`
- Data: Colonial companies, plantation data, slave trade ports, abolitionists, rebellions

### 3.7 Import Political Prisoners
- Source: `data/scraped/prisoners/political_prisoners.json`
- Create `political_prisoners` table or use existing people table with tags

---

## Phase 4: Backend Optimization (P1)

### 4.1 Query Optimization
- [ ] Add composite indexes for common filter combinations (e.g., `country_id + start_date` on events)
- [ ] Fix potential N+1 queries in routers that load relationships
- [ ] Use `selectinload` or `joinedload` strategically for nested data
- [ ] Add `EXPLAIN ANALYZE` profiling for slow queries
- [ ] Implement cursor-based pagination for tables > 10K rows

### 4.2 Caching Strategy
Current TTLs: countries (1h), economic (24h), GeoJSON (6h), search (30min), stats (5min)
- [ ] Add cache warming on startup for frequently accessed data
- [ ] Cache border GeoJSON aggressively (data rarely changes)
- [ ] Implement cache invalidation on admin CRUD operations
- [ ] Add ETags for conditional responses

### 4.3 API Performance
- [ ] Add response compression (gzip/brotli middleware)
- [ ] Implement batch endpoints for multi-entity fetching
- [ ] Add `fields` parameter to select specific columns
- [ ] Optimize GeoJSON responses (simplify geometries by zoom level)
- [ ] Connection pool tuning (currently max 50, may need adjustment)

### 4.4 Code Quality
- [ ] Run ruff lint + fix across all backend code
- [ ] Add mypy type checking
- [ ] Add more pytest tests (currently only 3 test files)
- [ ] Add API integration tests with real DB
- [ ] Document all endpoints with OpenAPI descriptions

---

## Phase 5: Frontend Optimization (P1)

### 5.1 Bundle Size Reduction
Current manual chunks: vendor-react, vendor-data, vendor-maplibre, vendor-recharts, vendor-d3
- [ ] Audit bundle with `npx vite-bundle-visualizer`
- [ ] Tree-shake unused Recharts components
- [ ] Lazy-load D3 modules only when visualization pages are accessed
- [ ] Consider lighter alternatives for single-use heavy dependencies

### 5.2 Rendering Performance
- [ ] Add React.memo to heavy chart and map components
- [ ] Implement virtual scrolling for PeoplePage (100K+ items)
- [ ] Debounce expensive map re-renders
- [ ] Optimize WorldMap layer management (avoid unnecessary redraws)
- [ ] Profile and fix unnecessary re-renders using React DevTools

### 5.3 Data Loading
- [ ] Implement infinite scroll instead of traditional pagination
- [ ] Prefetch adjacent pages of data
- [ ] Add optimistic updates for admin operations
- [ ] Implement stale-while-revalidate pattern consistently
- [ ] Add better error retry strategies

### 5.4 Asset Optimization
- [ ] Implement responsive image loading (srcset)
- [ ] Add WebP format support for images
- [ ] Lazy-load below-fold content
- [ ] Add proper loading states to all async components
- [ ] Implement route-based code splitting more aggressively

---

## Phase 6: UI Modernization (P2)

### 6.1 Design System Standardization
- [ ] Create a consistent color palette:
  - Primary: Red (#dc2626)
  - Accent: Varies by context (blue for politics, green for environment, purple for culture)
  - Neutral: Gray scale for text/backgrounds
  - Status: Green/yellow/red for alerts
- [ ] Standardize spacing scale (4px grid: 4, 8, 12, 16, 24, 32, 48, 64)
- [ ] Standardize typography (heading sizes, body text, captions)
- [ ] Create reusable card component with consistent padding, border radius, shadow
- [ ] Standardize button styles (primary, secondary, ghost, danger)
- [ ] Standardize form input styles

### 6.2 Modern UI Patterns
- [ ] Add subtle animations (page transitions, card hover effects)
- [ ] Implement command palette (Cmd+K) for global search
- [ ] Add breadcrumb navigation
- [ ] Improve empty states with illustrations and CTAs
- [ ] Add toast notifications for actions
- [ ] Implement filter pills/chips for search results
- [ ] Add skeleton screens to every loading state

### 6.3 Page-by-Page Review
- [ ] **HubPage**: Ensure 4 category cards are visually balanced
- [ ] **HomePage (Map)**: Clean up overlay controls, improve sidebar
- [ ] **CountryPage**: Ensure all 10 tabs have consistent layout
- [ ] **PeoplePage**: Add grid/list view toggle, improve cards
- [ ] **BooksPage**: Add cover image grid view
- [ ] **Movement Pages** (6): Ensure consistent structure and depth
- [ ] **Visualization Pages** (4): Ensure all have proper loading/error states
- [ ] **AdminPage**: Modernize table layouts and forms
- [ ] **LoginPage**: Clean, centered design with branding

### 6.4 Dark Mode Polish
- [ ] Audit every component for dark mode contrast issues
- [ ] Ensure charts and maps look good in dark mode
- [ ] Test all 38 pages in dark mode
- [ ] Ensure consistent dark mode hover/focus states

### 6.5 Mobile Responsiveness
- [ ] Test and fix all pages on mobile viewport (375px)
- [ ] Improve mobile navigation (hamburger menu, bottom tabs)
- [ ] Make map usable on touch devices
- [ ] Ensure tables scroll horizontally on mobile
- [ ] Test RTL (Arabic) layout on mobile

---

## Phase 7: Data Display Verification (P2)

### 7.1 Verify Each Page
For every page, check:
- [ ] Data loads correctly from API
- [ ] Pagination works
- [ ] Search/filter works
- [ ] Sort works
- [ ] Empty states show properly
- [ ] Error states show properly
- [ ] Links to detail pages work
- [ ] Back navigation works

### 7.2 Charts & Visualizations
- [ ] GDP charts show real data (not placeholder)
- [ ] Election results render correctly with real party data
- [ ] Conflict timeline displays date ranges properly
- [ ] Population charts scale correctly
- [ ] Military spending comparisons are accurate
- [ ] Voting trends show party colors correctly

### 7.3 Map Verification
- [ ] Borders render correctly for each year (1886-2019)
- [ ] Country clicking navigates to detail page
- [ ] Time slider animation is smooth
- [ ] All 7 liberation overlays display data
- [ ] Conflict markers appear at correct locations
- [ ] GeoJSON layers don't overlap incorrectly

### 7.4 Search Verification
- [ ] Search returns results across all entity types
- [ ] Autocomplete shows relevant suggestions
- [ ] Search handles special characters and non-Latin scripts
- [ ] Empty search shows helpful message

---

## Phase 8: New Feature Development (P2-P3)

### 8.1 Oral History Archive
- Integrate audio/video testimonies
- Create dedicated OralHistoryPage with media player
- Tag testimonies by topic, region, time period
- Transcription support (multi-language)

### 8.2 Settlement Timeline Animation
- Animated map showing settlement growth over time
- Data: Settlement founding dates, population growth
- Slider from 1967 to present
- Overlay with Palestinian land loss

### 8.3 Colonial Extraction Visualization
- Sankey diagram: Resources extracted → Colonial power
- Data: Colonial companies, resources, monetary values
- Timeline: Pre-colonial → colonial → post-colonial
- Connect to modern corporate exploitation

### 8.4 Refugee Flow Visualization
- Sankey diagram of refugee displacement
- Data: UNHCR displacement statistics
- Origins, transit, destination countries
- Interactive time slider

### 8.5 Network Analysis
- D3 force-directed graph of movement connections
- Show how political movements influenced each other
- Filter by ideology, time period, region
- Node size = importance, edge thickness = connection strength

### 8.6 More Liberation Struggles
- Chechnya: Conflict documentation, casualties
- East Timor: Indonesian occupation history
- Balochistan: Pakistani military operations
- Crimea/Donbas: Conflict documentation
- Amazonian indigenous: Deforestation and displacement
- Native American: Reservation system, broken treaties

### 8.7 Community Features
- Discussion threads on every entity page
- User-submitted contributions with review workflow
- Moderation dashboard with flagging system
- User reputation and badges
- Citation export (BibTeX, APA, MLA, Chicago)

### 8.8 Advanced Search
- Full-text search with highlighting
- Faceted search (filter by type, country, date range, ideology)
- Saved searches
- Search history
- Related entity suggestions

---

## Phase 9: Testing & Quality (P2)

### 9.1 Backend Tests
- [ ] Add pytest fixtures for all models
- [ ] Test every API endpoint (happy path + error cases)
- [ ] Test authentication and authorization
- [ ] Test pagination, search, and filtering
- [ ] Test cache invalidation
- [ ] Add load testing with locust
- [ ] Target: 80%+ code coverage

### 9.2 Frontend Tests
- [ ] Configure Vitest properly in package.json
- [ ] Add component tests for all major components
- [ ] Add integration tests for key user flows
- [ ] Test dark mode rendering
- [ ] Test i18n language switching
- [ ] Test responsive layouts
- [ ] Add E2E tests with Playwright

### 9.3 CI/CD Improvements
- [ ] Add test coverage reporting to CI
- [ ] Add performance budget checks
- [ ] Add accessibility scanning (axe-core)
- [ ] Add visual regression testing
- [ ] Improve staging environment parity with production

---

## Phase 10: Production Deployment (P3)

### 10.1 Domain & Hosting
- [ ] Set up domain name
- [ ] Configure DNS
- [ ] Set up Kubernetes cluster (GKE/EKS/DO)
- [ ] Deploy database (managed PostgreSQL with PostGIS)
- [ ] Deploy Redis (managed)
- [ ] Set up CDN for static assets

### 10.2 Security Hardening
- [ ] Generate production JWT secret key
- [ ] Set up TOTP encryption key
- [ ] Configure HTTPS (cert-manager + Let's Encrypt)
- [ ] Set up WAF rules
- [ ] Configure proper CORS for production domain
- [ ] Set up rate limiting per-user
- [ ] Database backup automation
- [ ] Secret rotation strategy

### 10.3 Observability
- [ ] Deploy monitoring stack (Prometheus + Grafana)
- [ ] Set up Sentry for error tracking
- [ ] Configure alert routing (email, Slack)
- [ ] Set up log retention policies
- [ ] Create operational runbooks

---

## Technical Debt

1. **Duplicate search router**: `main.py` includes both `search` and `search_advanced` on the same prefix `/search/`. Should consolidate.
2. **Router imports at module level**: All router imports are at the bottom of `main.py` rather than top-level. Should reorganize.
3. **Inconsistent model locations**: Some models are in `people/models.py` (Book, BookAuthor) but semantically belong elsewhere.
4. **No database seed command**: Need a single `make seed` or `python -m scripts.seed_all` command.
5. **Missing API response types**: Some endpoints return raw dicts instead of Pydantic response models.
6. **Frontend npm audit**: 2 moderate vulnerabilities need fixing.
7. **No proper error logging**: Backend uses `print()` statements instead of structured logging in some places.
8. **Hard-coded pagination defaults**: Should be configurable via settings.
