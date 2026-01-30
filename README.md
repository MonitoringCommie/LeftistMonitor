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

## User Requirements and Implementation Status

### Core Requirements (from user prompts)

> "Especially make sure you show the struggle of the Palestinians and the Irish and similar stuff"

> "Import heaps of data about those and every country with their authors, political history, climate events, etc."

> "I want data on every fence, checkpoint etc and their building development in Palestine"

> "Think of other countries where you could do the same"

> "Import heaps of data books and etc leftist all please"

---

## Implementation Progress

### Map Overlays - Liberation Struggles

| Region | Status | Data Available | Notes |
|--------|--------|----------------|-------|
| **Palestine** | ✅ Complete | Nakba villages, settlements, checkpoints, separation wall, massacres | Full GeoJSON overlay working |
| **Ireland** | ✅ Complete | Troubles events, Great Famine data by county | Includes state collusion documentation |
| **Kurdistan** | ✅ Complete | Destroyed villages, military installations, dam projects, massacres | ~4,000 villages destroyed by Turkey |
| **Kashmir** | ✅ Complete | Military installations, checkpoints, massacres, mass graves | 700,000+ Indian troops documented |
| **Tibet** | ✅ Complete | Destroyed monasteries, military installations, self-immolations, massacres | ~6,000 monasteries destroyed |
| **Western Sahara** | ✅ Complete | Sand berm, settlements, minefields, refugee camps | Africa's last colony |

### Backend API Endpoints

All liberation struggle data is served via the `/territories/` API:

- `/territories/palestine/nakba-villages/geojson`
- `/territories/palestine/settlements/geojson`
- `/territories/palestine/checkpoints/geojson`
- `/territories/palestine/separation-wall/geojson`
- `/territories/palestine/massacres/geojson`
- `/territories/ireland/troubles/geojson`
- `/territories/ireland/famine`
- `/territories/kashmir/events/geojson`
- `/territories/tibet/events/geojson`
- `/territories/kurdistan/events/geojson`
- `/territories/western-sahara/events/geojson`

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

### UI Features

- [x] Dark mode toggle with persistence
- [x] Mobile-responsive hamburger navigation
- [x] Liberation struggles checkbox panel on map
- [x] Legend overlays for each region's data
- [x] Search functionality

---

## Features

### Current Features
- **Interactive World Map**: Click on countries to see details
- **Historical Time Slider**: Slide through history from 1900 to present
- **Liberation Struggles Overlays**: Toggle to see occupation data for:
  - Palestine (Nakba villages, settlements, checkpoints, wall, massacres)
  - Ireland (Troubles events, Great Famine by county)
  - Kurdistan (destroyed villages, dam projects, massacres)
  - Kashmir (military installations, checkpoints, mass graves)
  - Tibet (destroyed monasteries, self-immolations, massacres)
  - Western Sahara (sand berm, minefields, refugee camps)
- **Country Pages**: Tabs for overview, elections, parties, people, events, conflicts, books, occupations
- **Frontlines View**: Historical conflict frontlines
- **Country Comparison**: Compare political trends across countries
- **Books Page**: Browse leftist literature with search and filters
- **Glossary**: Educational definitions of key terms
- **Dark Mode**: Toggle for comfortable viewing
- **Global Search**: Search across people, events, books, countries

---

## Tech Stack

- **Backend**: Python + FastAPI + PostgreSQL/PostGIS + SQLAlchemy (async)
- **Frontend**: React + TypeScript + Vite + MapLibre GL JS
- **State Management**: Zustand + React Query
- **Styling**: Tailwind CSS with dark mode
- **Database**: PostgreSQL with PostGIS for geospatial queries

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
cd backend && uv sync
docker-compose up -d db redis
uv run alembic upgrade head
uv run uvicorn src.main:app --reload
```

**Frontend:**
```bash
cd frontend && npm install && npm run dev
```

---

## Importing Data

```bash
cd backend

# Core data
uv run python -m src.importers.liberation_figures
uv run python -m src.importers.occupations_data
uv run python -m src.importers.resistance_movements

# Palestine
uv run python -m src.importers.palestine.import_all

# Ireland  
uv run python -m src.importers.ireland.troubles_events
uv run python -m src.importers.ireland.famine_data

# Other liberation struggles
uv run python -m src.importers.kashmir
uv run python -m src.importers.tibet
uv run python -m src.importers.kurdistan
uv run python -m src.importers.western_sahara
```

### Data Sources
- **Palestine**: OCHA, B'Tselem, Peace Now, Zochrot, ARIJ
- **Ireland**: CAIN Archive, Sutton Index, Census records
- **Kurdistan**: Human Rights Watch, Amnesty International
- **Kashmir**: State Human Rights Commission, JKCCS
- **Tibet**: International Campaign for Tibet, Free Tibet
- **Western Sahara**: MINURSO, Western Sahara Resource Watch
- **Books**: Marxists Internet Archive, Haymarket Books

---

## Project Structure

```
LeftistMonitor/
├── backend/
│   ├── src/
│   │   ├── importers/           # Data importers
│   │   │   ├── palestine/       # Nakba, settlements, checkpoints
│   │   │   ├── ireland/         # Troubles, famine
│   │   │   ├── kashmir/         # Military installations, massacres
│   │   │   ├── tibet/           # Monasteries, self-immolations
│   │   │   ├── kurdistan/       # Destroyed villages
│   │   │   └── western_sahara/  # Sand berm, minefields
│   │   ├── territories/         # Occupation/liberation API routes
│   │   ├── books/               # Books API
│   │   └── ...
│   └── alembic/                 # Database migrations
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── map/             # Map overlays for each region
│   │   ├── pages/               # React pages
│   │   ├── api/                 # API hooks
│   │   └── stores/              # Zustand stores
│   └── ...
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
- [x] Complete Palestine infrastructure (villages, settlements, checkpoints, wall)
- [x] Complete Ireland data (Troubles events, Great Famine)
- [x] Kashmir occupation data
- [x] Tibet occupation data
- [x] Kurdistan oppression data
- [x] Western Sahara occupation data
- [x] Map overlay toggles for all regions

### Phase 3: UI/UX Improvements ✅ COMPLETE
- [x] Dark mode toggle
- [x] Mobile navigation
- [x] Books browse page
- [x] Glossary page
- [x] About page

### Phase 4: In Progress
- [ ] More detailed population timeline data for settlements
- [ ] Historical images and documents
- [ ] Additional leftist books (target: 500+)
- [ ] Oral history/testimony integration
- [ ] Timeline visualizations

### Phase 5: Future
- [ ] West Papua occupation data
- [ ] Uyghur Region documentation
- [ ] Historical occupations (Apartheid South Africa, French Algeria, US Vietnam)
- [ ] Documentary/film database
- [ ] Political prisoner database
- [ ] Current events integration

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
