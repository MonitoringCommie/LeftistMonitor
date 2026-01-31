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
| **Books** | 21,036 | Political, historical, and leftist literature |
| **Countries** | 710 | Countries and territories with historical borders |
| **UN Resolutions** | 8,665 | General Assembly and Security Council resolutions |
| **Economic Data** | 170,000+ | World Bank data: GDP, population, military spending, etc. |

**Total: 230,000+ records** with global coverage

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
| **World Map** | ✅ Complete | Interactive map with time slider, liberation struggle overlays |
| **Country Pages** | ✅ Complete | Overview, elections, parties, people, events, conflicts, books, occupations |
| **Frontlines View** | ✅ Complete | Historical conflict frontlines visualization |
| **Country Comparison** | ✅ Complete | Compare political trends across countries |
| **Books Browse** | ✅ Complete | Browse leftist literature with filters |
| **Glossary** | ✅ Complete | 25+ terms: Nakba, apartheid, settler colonialism, BDS, etc. |
| **About** | ✅ Complete | Project mission and documentation |
| **Admin Dashboard** | ✅ Complete | User management, role-based access |

### UI Features

- [x] Dark mode toggle with persistence
- [x] Mobile-responsive hamburger navigation
- [x] Liberation struggles checkbox panel on map
- [x] Legend overlays for each region's data
- [x] Global search functionality
- [x] Authentication system with JWT
- [x] Role-based permissions (viewer, contributor, editor, admin)

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
- `GET /api/countries` - List all countries
- `GET /api/countries/{id}` - Country details
- `GET /api/events` - Historical events
- `GET /api/people` - Political figures
- `GET /api/books` - Leftist literature
- `GET /api/conflicts` - Armed conflicts

### Economic Data (Real World Bank Data)
- `GET /api/economic/{country_code}/gdp` - GDP history
- `GET /api/economic/{country_code}/budget` - Budget breakdown
- `GET /api/economic/{country_code}/military` - Military spending
- `GET /api/economic/{country_code}/population` - Population data

### Liberation Struggles
- `GET /territories/palestine/nakba-villages/geojson`
- `GET /territories/palestine/settlements/geojson`
- `GET /territories/palestine/checkpoints/geojson`
- `GET /territories/palestine/separation-wall/geojson`
- `GET /territories/ireland/troubles/geojson`
- `GET /territories/kashmir/events/geojson`
- `GET /territories/tibet/events/geojson`
- `GET /territories/kurdistan/events/geojson`
- `GET /territories/western-sahara/events/geojson`

---

## Project Structure

```
LeftistMonitor/
├── backend/
│   ├── src/
│   │   ├── auth/               # JWT authentication
│   │   ├── importers/          # Data importers
│   │   │   ├── palestine/      # Nakba, settlements, checkpoints
│   │   │   ├── ireland/        # Troubles, famine
│   │   │   ├── kashmir/        # Military installations
│   │   │   ├── tibet/          # Monasteries, self-immolations
│   │   │   ├── kurdistan/      # Destroyed villages
│   │   │   └── western_sahara/ # Sand berm, minefields
│   │   ├── geography/          # Economic data router
│   │   ├── territories/        # Liberation API routes
│   │   └── books/              # Books API
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/         # Recharts visualizations
│   │   │   ├── map/            # Map overlays
│   │   │   └── ui/             # Shared UI components
│   │   ├── pages/              # React pages
│   │   └── api/                # API hooks
├── data/
│   └── scraped/                # All scraped data (JSON)
│       ├── books/              # 21,000+ books
│       ├── people/             # 100,000+ political figures
│       ├── events/             # 80,000+ events
│       ├── economic/           # World Bank data
│       ├── conflicts/          # UCDP conflicts
│       ├── elections/          # Global elections
│       └── intl_orgs/          # UN resolutions, treaties
└── docker-compose.yml
```

---

## Roadmap

### Phase 1: Foundation ✅ COMPLETE
- [x] Interactive map with historical borders
- [x] Basic Palestine overlay
- [x] Country pages with tabs
- [x] Search functionality

### Phase 2: Liberation Struggles Data ✅ COMPLETE
- [x] Complete Palestine infrastructure
- [x] Complete Ireland data
- [x] Kashmir, Tibet, Kurdistan, Western Sahara

### Phase 3: Global Data Collection ✅ COMPLETE
- [x] 100,000+ political figures
- [x] 80,000+ historical events
- [x] 21,000+ books
- [x] 21,000+ conflicts
- [x] World Bank economic data
- [x] UN resolutions (8,665)

### Phase 4: Visualization ✅ COMPLETE
- [x] GDP charts with real data
- [x] Budget breakdown charts
- [x] Military spending visualization
- [x] Population trends
- [x] Election results charts

### Phase 5: In Progress
- [ ] More detailed settlement timeline data
- [ ] Historical images and documents
- [ ] Oral history integration
- [ ] Additional leftist books

### Phase 6: Future
- [ ] West Papua occupation data
- [ ] Uyghur Region documentation
- [ ] Historical occupations (Apartheid SA, French Algeria)
- [ ] Documentary/film database
- [ ] Political prisoner database

---

## Contributing

This is a solidarity project. Contributions welcome for:
- Additional occupation/oppression data
- Leftist literature recommendations
- Translations
- Historical research and fact-checking
- UI/UX improvements

---

## Acknowledgments

This project stands in solidarity with all peoples fighting against colonialism, occupation, and imperialism.

**From the river to the sea, Palestine will be free.**

**Tiocfaidh ár lá.** (Our day will come.)

**Bijî Kurdistan.** (Long live Kurdistan.)
