# Leftist Monitor - Interactive Historical World Map

An interactive web application displaying a world map with clickable countries, historical border changes via time slider, and detailed country information - **with a strong focus on documenting the struggles of oppressed peoples against colonialism, occupation, and imperialism from a leftist/progressive perspective.**

## Project Vision

This project aims to be a comprehensive educational resource that:

1. **Documents the struggles of oppressed peoples** - Palestinians, Irish, Kurds, Sahrawis, Kashmiris, Tibetans, and others fighting against occupation and colonialism
2. **Provides detailed occupation infrastructure data** - Every checkpoint, settlement, wall segment, and military zone
3. **Preserves leftist history and literature** - Revolutionary figures, movements, books, and speeches
4. **Offers progressive analysis** - Historical events analyzed from an anti-colonial, anti-imperialist perspective
5. **Connects solidarity movements** - Shows links between liberation struggles worldwide

---

## Current Database Statistics

| Category | Records | Description |
|----------|---------|-------------|
| **People** | 104,453 | Politicians, activists, revolutionaries, authors, theorists |
| **Events** | 81,096 | Elections, revolutions, treaties, UN resolutions, historical events |
| **Conflicts** | 21,045 | Wars, battles, armed conflicts from UCDP and Wikidata |
| **Books** | 33,034 | Political, historical, and leftist literature |
| **Countries** | 710 | Countries and territories with historical borders |
| **Elections** | 1,009 | Global election data |
| **UN Resolutions** | 8,665 | General Assembly and Security Council resolutions |
| **Economic Data** | 170,000+ | World Bank data: GDP, population, military spending, etc. |

**Total: 430,000+ records** with global coverage

---

## Recent Changes (Latest Session - Feb 2026)

### New Pages Added
- **Hub Page** - Professional topic selection page with categorized cards (Explore, Movements & Struggles, History & Analysis)
- **Feminist Movements Page** (`/movements/feminist`) - Suffrage events, feminist figures, organizations, and feminist literature
- **Civil Rights Page** (`/movements/civil-rights`) - Civil rights activists, anti-apartheid movement, decolonization, Pan-African leaders
- **Labor Movements Page** (`/movements/labor`) - Labor unions, strikes, workers' rights movements
- **Slavery History Page** (`/history/slavery`) - Abolitionists, slave rebellions, colonial companies, trade ports, plantations
- **Elections Page** (`/elections`) - Browse elections and political parties with search

### New Scrapers Created
- `scrape_wikidata_feminists.py` - Feminist figures, suffrage events, organizations, feminist books
- `scrape_wikidata_civil_rights.py` - Civil rights activists, decolonization leaders, anti-apartheid figures
- `scrape_wikidata_slavery.py` - Abolitionists, slave rebellions, trade ports, plantations, colonial companies (7,171 records)

### Backend Improvements
- **Stats Module** - New `/api/v1/stats/overview` endpoint returning database counts
- **Events Router Fix** - Fixed `Event.name` to `Event.title` attribute
- **Politics Router Fix** - Added missing imports (`select`, `func`) and list endpoints for elections/parties
- **Admin CRUD** - Enhanced data management with create/edit/delete functionality

### Frontend Improvements
- **ErrorBoundary Component** - Catches JavaScript errors and displays user-friendly messages instead of white screens
- **Professional UI** - Hub page with SVG icons, categorized topics, live database stats
- **Admin Panel Enhancement** - EntityModal for CRUD operations on Books, People, Events, Conflicts

### Data Added
- Slavery history data: 7,171 records (abolitionists, rebellions, ports, plantations, companies)
- Feminist movements data: figures, events, organizations, books
- Politicians data: Additional scraped records

---

## User Requirements and Implementation Status

### Core Requirements (from user prompts)

> "Especially make sure you show the struggle of the Palestinians and the Irish and similar stuff"

> "Import heaps of data about those and every country with their authors, political history, climate events, etc."

> "I want data on every fence, checkpoint etc and their building development in Palestine"

> "Think of other countries where you could do the same"

> "Import heaps of data books and etc leftist all please"

> "I want as little APIs as possible" - Data stored in database/files, minimal runtime API calls

> "I want books data elections politicians and map changes from every country in the world"

> "All of those are important also their budget and how its split policies categorized etc"

> "I want a better UI and maybe a start page where you choose your topic"

> "Add feminist movements and people of color/civil rights as topics"

> "Add slavery history and economics data"

> "As an admin I want to be able to add data to the database that stays saved and edit entries"

---

## Implementation Progress

### Data Sources Integrated

| Source | Status | Data Type |
|--------|--------|-----------|
| **Wikidata** | ✅ Complete | People, events, conflicts, books, parties, elections |
| **Open Library** | ✅ Complete | 2,858+ political/historical books |
| **World Bank** | ✅ Complete | GDP, population, military spending, education, health |
| **UCDP** | ✅ Complete | Armed conflicts, battle deaths, non-state conflicts |
| **CShapes 2.0** | ✅ Complete | Historical country borders 1886-2019 |
| **ParlGov** | ✅ Complete | European elections and parties |

### Map Overlays - Liberation Struggles

| Region | Status | Data Available |
|--------|--------|----------------|
| **Palestine** | ✅ Complete | Nakba villages (418), settlements (150+), checkpoints (500+), separation wall, massacres |
| **Ireland** | ✅ Complete | Troubles events (100+), Great Famine data by county, collusion documentation |
| **Kurdistan** | ✅ Complete | Destroyed villages (~4,000), military installations, dam projects, massacres |
| **Kashmir** | ✅ Complete | Military installations, checkpoints, massacres, mass graves (700,000+ troops) |
| **Tibet** | ✅ Complete | Destroyed monasteries (~6,000), military installations, self-immolations |
| **Western Sahara** | ✅ Complete | Sand berm (2,700km), settlements, minefields (7M+), refugee camps |

### Visualization Charts

- **GDP Line Chart** - Historical GDP trends with real World Bank data
- **Budget Pie Chart** - Government spending breakdown
- **Military Spending Chart** - Defense expenditure comparisons
- **Population Chart** - Demographic trends
- **Election Results Chart** - Electoral outcomes
- **Conflict Timeline** - Armed conflict visualization
- **Voting Trends** - Political party support over time

### Pages Implemented

| Page | Status | Description |
|------|--------|-------------|
| **Hub Page** | ✅ Complete | Topic selection with categories: Explore, Movements, History |
| **World Map** | ✅ Complete | Interactive map with time slider, liberation struggle overlays |
| **Country Pages** | ✅ Complete | Overview, elections, parties, people, events, conflicts, books, occupations |
| **Frontlines View** | ✅ Complete | Historical conflict frontlines visualization |
| **Country Comparison** | ✅ Complete | Compare political trends across countries |
| **Books Browse** | ✅ Complete | Browse leftist literature with filters |
| **People Browse** | ✅ Complete | Browse political figures |
| **Feminist Movements** | ✅ Complete | Suffrage, feminist figures, organizations |
| **Civil Rights** | ✅ Complete | Civil rights, anti-apartheid, decolonization |
| **Labor Movements** | ✅ Complete | Labor unions, strikes, workers' rights |
| **Slavery History** | ✅ Complete | Abolitionists, rebellions, colonial economics |
| **Elections** | ✅ Complete | Browse global elections and parties |
| **Global Stats** | ✅ Complete | Country rankings and statistics |
| **Glossary** | ✅ Complete | 25+ terms: Nakba, apartheid, settler colonialism, BDS, etc. |
| **About** | ✅ Complete | Project mission and documentation |
| **Admin Dashboard** | ✅ Complete | User management, data CRUD, role-based access |

### UI Features

- [x] Dark mode toggle with persistence
- [x] Mobile-responsive hamburger navigation
- [x] Liberation struggles checkbox panel on map
- [x] Legend overlays for each region's data
- [x] Global search functionality
- [x] Authentication system with JWT
- [x] Role-based permissions (viewer, contributor, editor, admin)
- [x] ErrorBoundary for graceful error handling
- [x] Professional hub page with topic categories
- [x] Admin CRUD for database entities

---

## Future Goals / Roadmap

### Phase 5: Movement & Social History (In Progress)
- [x] Feminist movements page with suffrage data
- [x] Civil rights and racial justice page
- [x] Labor movements page
- [x] Slavery and colonial economics page
- [ ] LGBTQ+ movements page
- [ ] Environmental movements page
- [ ] Indigenous peoples' movements page

### Phase 6: Expanded Data Collection
- [ ] More detailed settlement timeline data (yearly population growth)
- [ ] Historical images and documents
- [ ] Oral history integration
- [ ] Additional leftist books (target: 100,000+)
- [ ] Speeches and manifestos database
- [ ] Documentary/film database
- [ ] Political prisoner database (current and historical)
- [ ] Colonial extraction data (resources stolen)

### Phase 7: Additional Liberation Struggles
- [ ] West Papua occupation data (Indonesian occupation)
- [ ] Uyghur Region documentation (Chinese occupation)
- [ ] Chechnya conflict data
- [ ] East Timor historical occupation
- [ ] Historical occupations:
  - Apartheid South Africa (completed historical)
  - French Algeria (historical)
  - Vietnam War infrastructure
  - Belgian Congo atrocities

### Phase 8: Advanced Features
- [ ] Network analysis for movements/people connections
- [ ] Full-text search with relevance ranking
- [ ] Redis caching for performance
- [ ] Export/download features (CSV, PDF)
- [ ] Refresh tokens + email verification + 2FA
- [ ] API rate limiting and security hardening
- [ ] Multi-language support (Arabic, Spanish, French, etc.)

### Phase 9: Data Visualization Enhancements
- [ ] Animated settlement growth over time
- [ ] Sankey diagrams for refugee displacement flows
- [ ] Network graphs for movement connections
- [ ] Heatmaps for violence/protest events
- [ ] Before/after satellite imagery comparisons
- [ ] Interactive timelines for each liberation struggle

### Phase 10: Community Features
- [ ] User contributions with moderation
- [ ] Crowdsourced data verification
- [ ] Discussion forums for each topic
- [ ] Educational resources and lesson plans
- [ ] Printable materials for activism

---

## Tech Stack

- **Backend**: Python + FastAPI + PostgreSQL/PostGIS + SQLAlchemy (async)
- **Frontend**: React + TypeScript + Vite + MapLibre GL JS
- **State Management**: Zustand + React Query
- **Styling**: Tailwind CSS with dark mode
- **Charts**: Recharts
- **Database**: PostgreSQL with PostGIS for geospatial queries
- **Auth**: JWT with bcrypt password hashing

---

## Quick Start

### Using Docker (Recommended)

```bash
cd LeftistMonitor
cp .env.example .env
docker-compose up -d
```

Access:
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Start PostgreSQL
uvicorn src.main:app --reload
```

**Frontend:**
```bash
cd frontend && npm install && npm run dev
```

---

## Importing Data

```bash
cd backend
source venv/bin/activate

# Import all scraped data
python src/importers/import_all_scraped.py

# Liberation struggles
python -m src.importers.liberation_figures
python -m src.importers.occupations_data
python -m src.importers.resistance_movements

# Regional data
python -m src.importers.palestine.import_all
python -m src.importers.ireland.troubles_events
python -m src.importers.kashmir
python -m src.importers.tibet
python -m src.importers.kurdistan
python -m src.importers.western_sahara
```

---

## API Endpoints

### Core APIs
- `GET /api/v1/geography/countries` - List all countries
- `GET /api/v1/geography/countries/{id}` - Country details
- `GET /api/v1/events/` - Historical events
- `GET /api/v1/people/` - Political figures
- `GET /api/v1/books/` - Leftist literature
- `GET /api/v1/conflicts/` - Armed conflicts
- `GET /api/v1/politics/elections` - Elections
- `GET /api/v1/politics/parties` - Political parties
- `GET /api/v1/stats/overview` - Database statistics

### Economic Data (Real World Bank Data)
- `GET /api/v1/geography/countries/{id}/economic/gdp` - GDP history
- `GET /api/v1/geography/countries/{id}/economic/budget` - Budget breakdown
- `GET /api/v1/geography/countries/{id}/economic/military` - Military spending
- `GET /api/v1/geography/countries/{id}/demographics/population` - Population data

### Liberation Struggles
- `GET /api/v1/territories/palestine/nakba-villages/geojson`
- `GET /api/v1/territories/palestine/settlements/geojson`
- `GET /api/v1/territories/palestine/checkpoints/geojson`
- `GET /api/v1/territories/palestine/separation-wall/geojson`
- `GET /api/v1/territories/ireland/troubles/geojson`
- `GET /api/v1/territories/kashmir/events/geojson`
- `GET /api/v1/territories/tibet/events/geojson`
- `GET /api/v1/territories/kurdistan/events/geojson`
- `GET /api/v1/territories/western-sahara/events/geojson`

---

## Project Structure

```
LeftistMonitor/
├── backend/
│   ├── src/
│   │   ├── auth/               # JWT authentication
│   │   ├── admin/              # Admin CRUD operations
│   │   ├── stats/              # Statistics endpoints
│   │   ├── importers/          # Data importers
│   │   │   ├── palestine/      # Nakba, settlements, checkpoints
│   │   │   ├── ireland/        # Troubles, famine
│   │   │   ├── kashmir/        # Military installations
│   │   │   ├── tibet/          # Monasteries, self-immolations
│   │   │   ├── kurdistan/      # Destroyed villages
│   │   │   └── western_sahara/ # Sand berm, minefields
│   │   ├── geography/          # Countries, borders, economic data
│   │   ├── politics/           # Elections, parties
│   │   ├── people/             # Political figures
│   │   ├── events/             # Historical events
│   │   ├── conflicts/          # Armed conflicts
│   │   ├── books/              # Literature
│   │   ├── territories/        # Liberation API routes
│   │   └── core/               # Shared utilities
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/         # Recharts visualizations
│   │   │   ├── map/            # Map overlays
│   │   │   ├── country/        # Country page tabs
│   │   │   ├── layout/         # Header, Layout
│   │   │   └── ui/             # Shared UI components
│   │   ├── pages/              # React pages
│   │   │   ├── HubPage.tsx     # Topic selection
│   │   │   ├── HomePage.tsx    # World map
│   │   │   ├── CountryPage.tsx # Country details
│   │   │   ├── FeministMovementsPage.tsx
│   │   │   ├── CivilRightsPage.tsx
│   │   │   ├── LaborMovementsPage.tsx
│   │   │   ├── SlaveryHistoryPage.tsx
│   │   │   ├── ElectionsPage.tsx
│   │   │   └── ...
│   │   ├── api/                # API hooks (React Query)
│   │   └── stores/             # Zustand stores
├── data/
│   ├── scraped/                # All scraped data (JSON)
│   │   ├── books/              # 33,000+ books
│   │   ├── people/             # 100,000+ political figures
│   │   ├── events/             # 80,000+ events
│   │   ├── economic/           # World Bank data
│   │   ├── conflicts/          # UCDP conflicts
│   │   ├── elections/          # Global elections
│   │   ├── movements/          # Feminist, civil rights data
│   │   │   ├── feminist/
│   │   │   └── civil_rights/
│   │   ├── history/            # Historical data
│   │   │   └── slavery/        # Slavery and colonial data
│   │   └── intl_orgs/          # UN resolutions, treaties
│   └── scrapers/               # Python scrapers
│       ├── scrape_wikidata_feminists.py
│       ├── scrape_wikidata_civil_rights.py
│       ├── scrape_wikidata_slavery.py
│       └── ...
└── docker-compose.yml
```

---

## Completed Features Checklist

### Core Features
- [x] Interactive world map with MapLibre GL JS
- [x] Historical borders via time slider (1886-2019)
- [x] Country click navigation to detail pages
- [x] Search functionality across all data types
- [x] Dark mode support
- [x] Mobile responsive design
- [x] Error boundary for graceful error handling

### Data Features
- [x] 710 countries with historical borders
- [x] 104,453 political figures
- [x] 81,096 historical events
- [x] 33,034 books
- [x] 21,045 conflicts
- [x] 1,009 elections
- [x] World Bank economic data (GDP, population, military spending)
- [x] UN resolutions (8,665)

### Liberation Struggles
- [x] Palestine: Nakba villages, settlements, checkpoints, wall, massacres
- [x] Ireland: Troubles events, Great Famine, collusion
- [x] Kurdistan: Destroyed villages, military zones
- [x] Kashmir: Military installations, mass graves
- [x] Tibet: Destroyed monasteries, self-immolations
- [x] Western Sahara: Sand berm, minefields, refugees

### Movement Pages
- [x] Feminist movements (suffrage, figures, organizations)
- [x] Civil rights (activists, anti-apartheid, decolonization)
- [x] Labor movements (unions, strikes)
- [x] Slavery history (abolitionists, rebellions, colonial economics)

### Admin Features
- [x] User authentication (JWT)
- [x] Role-based access control
- [x] User management (list, edit role, enable/disable, delete)
- [x] Data CRUD for Books, People, Events, Conflicts

---

## Contributing

This is a solidarity project. Contributions welcome for:
- Additional occupation/oppression data
- Leftist literature recommendations
- Translations
- Historical research and fact-checking
- UI/UX improvements
- New scrapers for additional data sources

---

## Acknowledgments

This project stands in solidarity with all peoples fighting against colonialism, occupation, and imperialism.

**From the river to the sea, Palestine will be free.**

**Tiocfaidh ár lá.** (Our day will come.)

**Bijî Kurdistan.** (Long live Kurdistan.)

**Black Lives Matter.**

**Workers of the world, unite!**
