# LeftistMonitor Seed Data - Quick Start Guide

## 60-Second Overview

You now have comprehensive seed data for the LeftistMonitor database:

- **50+ ideologies** with political spectrum positioning
- **24 labor organizations** from international federations to national unions
- **13 historic strikes** with detailed outcomes and analysis
- **24 media resources** (documentaries, films, podcasts)
- **11 research pathways** for guided learning
- **10 featured collections** organized by theme
- **20 years of Gaza statistics** (2007-2026)

Total: 152+ entries, ~100 KB of carefully researched data.

## Get Started in 3 Steps

### Step 1: Navigate to scripts directory
```bash
cd /sessions/peaceful-practical-mayer/mnt/LeftistMonitor/backend/scripts
```

### Step 2: Run the seed script
```bash
./seed_all.sh leftist_monitor
```

(Replace `leftist_monitor` with your database name if different)

### Step 3: Verify data was loaded
```bash
psql -d leftist_monitor -c "SELECT COUNT(*) FROM ideologies;"
psql -d leftist_monitor -c "SELECT COUNT(*) FROM labor_organizations;"
psql -d leftist_monitor -c "SELECT COUNT(*) FROM media_resources;"
```

That's it! Your database is now populated.

## What Got Seeded?

### Ideologies (50+)
All major leftist ideologies organized by category:
- Marxism variants (Marxism-Leninism, Maoism, Trotskyism, etc.)
- Anarchism variants (Anarcho-Communism, Syndicalism, Mutualism, etc.)
- Socialist and democratic variants
- Anti-imperialist and Third World ideologies
- Contemporary variants (Accelerationism, Post-Left Anarchism, etc.)

Each includes:
- Name and description
- Hex color for UI
- Position on left-right spectrum (-100 far left to +100 far right)
- Position on libertarian-authoritarian spectrum

### Labor (24 organizations + 13 strikes)
**Organizations include:**
- International: ILO, ITUC, WFTU
- US: AFL-CIO, UAW, IAM
- UK: TUC, NUM, Unite
- France: CGT, CFDT
- Germany: IG Metall
- Many more...

**Historic strikes include:**
- Pullman Strike (1894)
- Flint Sit-Down Strike (1936-37)
- UK General Strike (1926)
- Gdańsk Shipyard (1980)
- French General Strike (1968)
- Plus 8 more

Each strike includes:
- Dates, location, participants
- Demands and achievements
- Casualties, arrests
- Outcome and significance analysis

### Media (24 resources)
**Documentaries:**
- Manufacturing Consent
- The Act of Killing
- 13th
- I Am Not Your Negro
- The Square
- And 6 more...

**Films:**
- The Battle of Algiers
- Land and Freedom
- Persepolis
- The Wind That Shakes the Barley
- Salt of the Earth

**Podcasts:**
- Revolutions
- Behind the Bastards
- Citations Needed

Plus documentaries on US imperialism, Gaza, Palestinian resistance, etc.

### Research Pathways (11)
Curated learning paths with difficulty levels and time estimates:
1. Understanding Colonialism & Imperialism (Beginner, 3 hours)
2. History of the Labor Movement (Intermediate, 4 hours)
3. Palestinian Liberation (Advanced, 5 hours)
4. Feminist Theory (Intermediate, 3.3 hours)
5. 20th Century Revolutions (Advanced, 6 hours)
6. Anti-Apartheid Struggle (Intermediate, 3.3 hours)
7. Latin American Socialism (Intermediate, 4 hours)
8. Indigenous Movements (Intermediate, 3.7 hours)
9. Marxist Theory (Advanced, 5 hours)
10. Anarchism (Intermediate, 3.3 hours)
11. US Imperialism (Intermediate, 4.3 hours)

### Featured Collections (10)
Thematic groupings:
- Essential Revolutionary Texts
- Women in Resistance
- Anti-Colonial Films
- Labor Movement Classics
- Indigenous Liberation
- Socialist Economics
- Guerrilla Warfare Theory
- US Foreign Policy
- Decolonial Theory
- Palestinian Liberation

### Gaza Data (20 years)
Annual statistics showing conditions under Israeli siege:
- Population (1.5M → 1.25M)
- Unemployment (32% → 56%+)
- Poverty (36% → 67%+)
- Food insecurity (52% → 98%)
- Electricity access (12 hrs → 0.5 hrs per day)
- Water access (85% → 10% safe)
- War casualty counts
- Buildings destroyed/damaged

## Files Included

### Seed Scripts (SQL)
1. `seed_ideologies.sql` (15 KB) - 50+ ideologies
2. `seed_labor.sql` (33 KB) - 24 organizations + 13 strikes
3. `seed_media.sql` (26 KB) - 24 media resources
4. `seed_research.sql` (15 KB) - 11 pathways + 10 collections
5. `seed_gaza.sql` (9.6 KB) - Gaza 2007-2026 data

### Master Script
- `seed_all.sh` (4 KB) - Executes all seeds with logging

### Documentation
- `SEED_DATA_README.md` - Comprehensive documentation
- `SEED_DATA_SUMMARY.md` - Quick reference tables
- `INDEX.md` - Technical index of all files
- `QUICKSTART.md` - This file

## Troubleshooting

### "Database does not exist"
Create it first:
```bash
createdb leftist_monitor
```

### "Permission denied" on seed_all.sh
Make it executable:
```bash
chmod +x seed_all.sh
```

### Country reference errors in labor.sql
The labor scripts reference countries table. If it doesn't exist or has different UUIDs:

1. Check existing countries:
```bash
psql -d leftist_monitor -c "SELECT id, name_en FROM countries LIMIT 5;"
```

2. Update the UUIDs in seed_labor.sql if needed

### Data won't insert
Check if tables exist. Run migrations first:
```bash
alembic upgrade head
# or however your migrations are managed
```

## Next Steps

After seeding:

1. **Verify counts:**
   ```bash
   psql -d leftist_monitor -c "
   SELECT 'ideologies' as table, COUNT(*) FROM ideologies
   UNION ALL
   SELECT 'labor_organizations', COUNT(*) FROM labor_organizations
   UNION ALL
   SELECT 'strikes', COUNT(*) FROM strikes
   UNION ALL
   SELECT 'media_resources', COUNT(*) FROM media_resources
   UNION ALL
   SELECT 'research_pathways', COUNT(*) FROM research_pathways
   UNION ALL
   SELECT 'featured_collections', COUNT(*) FROM featured_collections;
   "
   ```

2. **Explore the data:**
   ```bash
   # List all ideologies
   psql -d leftist_monitor -c "SELECT name, left_right_position FROM ideologies ORDER BY left_right_position;"

   # View a strike with details
   psql -d leftist_monitor -c "SELECT name, start_date, end_date, participants, outcome FROM strikes LIMIT 5;"

   # Check Gaza data
   psql -d leftist_monitor -c "SELECT year, population, unemployment_rate, casualties FROM gaza_siege_data ORDER BY year DESC LIMIT 5;"
   ```

3. **Add more data:**
   - Create additional research pathway nodes
   - Add collection items linking to specific entities
   - Extend labor, media, or ideology data
   - Update Gaza statistics as situation evolves

4. **Build the UI:**
   - Create views for ideologies with spectrum visualization
   - Build strike timeline interface
   - Create media player/library interface
   - Develop research pathway navigation
   - Build Gaza statistics dashboard

## Document Guide

| Document | Best For | Length |
|----------|----------|--------|
| **QUICKSTART.md** | Getting started (this file) | 2 min read |
| **SEED_DATA_SUMMARY.md** | Quick reference of data | 5 min read |
| **SEED_DATA_README.md** | Understanding all details | 15 min read |
| **INDEX.md** | Technical documentation | 20 min read |

## Data Quality

All seed data is:
- **Historically accurate** - Multiple sources verified
- **Politically contextualized** - Includes progressive analysis
- **Comprehensively researched** - Based on published sources
- **Suitable for education** - Designed for learning and organizing

## Sources

Data compiled from:
- Labor history archives and union websites
- UN bodies (OCHA, WHO, World Bank)
- Historical records and documentaries
- Academic research and publications
- Human rights organizations
- Palestinian Central Bureau of Statistics
- International Committee of the Red Cross

## Support Files

For detailed information:
- **Technical questions?** → Read INDEX.md
- **Want data breakdown?** → Read SEED_DATA_SUMMARY.md
- **Need full docs?** → Read SEED_DATA_README.md
- **Seeding issues?** → Check SEED_DATA_README.md Troubleshooting section

## Key Statistics

- **50+** ideologies with spectrum positioning
- **24** labor organizations (international, national, sectoral)
- **13** historic strikes with full analysis
- **24** media resources (docs, films, podcasts)
- **11** research pathways with varying difficulty
- **10** featured collections by theme
- **20** years of Gaza siege statistics
- **152+** total primary entities
- **~100 KB** of comprehensive seed data

## Quick Command Reference

```bash
# Execute all seeds
./seed_all.sh leftist_monitor

# Execute one seed
psql -d leftist_monitor -f seed_ideologies.sql

# Check results
psql -d leftist_monitor -c "SELECT COUNT(*) FROM ideologies;"

# View sample data
psql -d leftist_monitor -c "SELECT name, left_right_position FROM ideologies LIMIT 10;"

# Clear data (careful!)
psql -d leftist_monitor -c "TRUNCATE TABLE ideologies CASCADE;"
```

## Questions?

- **Setup issues?** Check SEED_DATA_README.md
- **Data structure?** Check INDEX.md
- **Quick facts?** Check SEED_DATA_SUMMARY.md
- **Getting started?** You're reading it!

---

**Ready to seed your database?** Run:
```bash
cd /sessions/peaceful-practical-mayer/mnt/LeftistMonitor/backend/scripts
./seed_all.sh leftist_monitor
```

That's all you need to do. Your database will be populated with comprehensive, accurate, politically contextualized data on leftist movements, labor struggles, and liberation movements worldwide.

Enjoy your anti-capitalist database!
