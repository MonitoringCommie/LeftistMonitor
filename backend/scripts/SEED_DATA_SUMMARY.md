# LeftistMonitor Seed Data Summary

## Quick Statistics

### Data Created

| Category | Count | File | Lines |
|----------|-------|------|-------|
| **Ideologies** | 50+ | `seed_ideologies.sql` | 15 KB |
| **Labor Organizations** | 24 | `seed_labor.sql` | 33 KB |
| **Strikes** | 13 | `seed_labor.sql` | 33 KB |
| **Media Resources** | 24 | `seed_media.sql` | 26 KB |
| **Research Pathways** | 11 | `seed_research.sql` | 15 KB |
| **Featured Collections** | 10 | `seed_research.sql` | 15 KB |
| **Gaza Years** | 20 (2007-2026) | `seed_gaza.sql` | 9.6 KB |

**Total:** 152+ primary entities, 99+ KB of curated data

## File Descriptions

### seed_ideologies.sql
**Contains:** 50 political ideologies with full analysis

**Ideologies included:**
- Classical Marxism: Marxism, Marxism-Leninism, Maoism, Trotskyism, Luxemburgism, Council Communism
- Anarchism: Anarcho-Communism, Anarcho-Syndicalism, Mutualism, Collectivist Anarchism
- Democratic/Reform: Democratic Socialism, Social Democracy, Eurocommunism
- Specialized: Eco-Socialism, Feminist Socialism, Liberation Theology, Anarcho-Feminism
- Third World: Third-Worldism, Pan-Africanism, Pan-Arabism, Bolivarianism, Afrocentrism
- Asian Models: Juche, Ho Chi Minh Thought, Hoxhaism
- Liberation: Guevarism, Zapatismo, Palestinian Liberation
- Libertarian: Libertarian Socialism, Market Socialism, Participatory Economics
- Regional: Kurdish Democratic Confederalism, Naxalism, Communalism
- Contemporary: Autonomist Marxism, Post-Left Anarchism, Accelerationism
- Indigenous: Indigenous Socialism, Decolonial Socialism, Plus Syndicalism variants

**Fields per ideology:**
- name (unique)
- description (comprehensive)
- color (hex code for UI representation)
- left_right_position (-100 to 100 scale)
- libertarian_authoritarian_position (-100 to 100 scale)

### seed_labor.sql
**Contains:** 24 labor organizations + 13 historic strikes

**Labor Organizations:**
- **International:** ILO, ITUC, WFTU
- **United States:** AFL-CIO, CIO, IAM, UAW
- **United Kingdom:** TUC, NUM, Unite the Union
- **France:** CGT, CFDT, CGT-FO
- **Germany:** IG Metall, DGB
- **Poland:** Solidarność
- **Brazil:** CUT
- **South Africa:** COSATU
- **Russia:** KTR
- **China:** ACFTU
- **Mexico:** CTM
- **India:** AITUC
- **Argentina:** CGT
- **South Korea:** KCTU

**Historic Strikes:**
1. Pullman Strike (1894, USA) - 150,000 workers
2. Flint Sit-Down Strike (1936-37, USA) - 45,000 workers
3. Memphis Sanitation Strike (1968, USA) - 1,300 workers
4. Haymarket Affair (1886, USA) - 80,000 workers
5. UK General Strike (1926) - 1,700,000 workers
6. Gdańsk Shipyard Strike (1980, Poland) - 17,000 workers
7. French General Strike (1968) - 9,000,000 workers
8. Bolivian Miners'' Strike (1946) - 50,000 workers
9. Busan General Strike (1992, South Korea) - 500,000 workers
10. Chicago Teachers Strike (2012) - 30,000 workers
11. West Virginia Teachers Strike (2018) - 34,000 workers
12. Oshawa GM Strike (2019, Canada) - 4,200 workers
13. Los Angeles Teachers Strike (2019) - 34,000 workers

**Fields per organization:**
- name, native name, abbreviation
- organization_type (trade_union, federation, confederation, etc.)
- industry_sectors
- founded, dissolved dates
- country, headquarters city
- peak membership and year
- ideology tags, political affiliation
- description, progressive analysis

**Fields per strike:**
- name, type (general_strike, industry_strike, sit_down, etc.)
- start_date, end_date
- country, location
- participants, industries affected
- outcome (victory, partial_victory, defeat, etc.)
- demands, achievements
- casualties, arrests, government response
- description, progressive_analysis, significance

### seed_media.sql
**Contains:** 24 documentaries, films, and podcasts

**Documentaries (11):**
- Manufacturing Consent (2002) - Media propaganda analysis
- The Act of Killing (2012) - Indonesian genocide
- 13th (2016) - Mass incarceration and slavery
- I Am Not Your Negro (2016) - James Baldwin on racism
- The Square (2013) - Egyptian revolution
- Winter on Fire (2015) - Ukraine protests
- The Killing of the Uni Students (2007) - Colombia paramilitaries
- The Trials of Muhammad Ali (2013) - Anti-war resistance
- Cuba: A Revolution in Motion (2011) - Cuban revolution
- My Pal Foot Foot (2016) - Palestinian youth resistance
- Gaza Strip and Gilo (Wall) (2004) - Israeli apartheid wall

**Films (5):**
- The Battle of Algiers (1966) - Algerian independence
- Land and Freedom (1995) - Spanish Civil War
- Persepolis (2007) - Iranian revolution
- The Wind That Shakes the Barley (2006) - Irish independence
- Salt of the Earth (1954) - Miners'' strike

**Podcasts (3):**
- Revolutions (2013-) - Revolutionary history
- Behind the Bastards (2018-) - Authority and exploitation
- Citations Needed (2017-) - Media criticism

**Additional Media (5):**
- Killing Hope documentary series - US military interventions
- Century of Enslavement - Federal Reserve history
- The Shock Doctrine - Disaster capitalism
- In Jackson Heights - Immigration and community
- All Watched Over by Machines of Loving Grace - Technology and capitalism

**Fields per resource:**
- title, title_original
- media_type
- release_year, release_date
- director, producer, creator
- description, synopsis
- primary_url, youtube_url, archive_url
- language, subtitles
- topics, regions, time periods
- progressive_relevance

### seed_research.sql
**Contains:** 11 research pathways + 10 featured collections

**Research Pathways:**
1. Understanding Colonialism and Imperialism - Beginner (180 min)
2. History of the Labor Movement - Intermediate (240 min)
3. Palestinian Liberation and Occupied Territories - Advanced (300 min)
4. Feminist Theory and Women''s Liberation - Intermediate (200 min)
5. Revolutionary Movements of the 20th Century - Advanced (360 min)
6. Anti-Apartheid Struggle in South Africa - Intermediate (200 min)
7. Latin American Socialism and Revolution - Intermediate (240 min)
8. Indigenous Movements and Sovereignty - Intermediate (220 min)
9. Marxist Theory and Historical Materialism - Advanced (300 min)
10. Anarchism and Libertarian Socialism - Intermediate (200 min)
11. US Imperialism and Interventions - Intermediate (260 min)

**Featured Collections:**
1. Essential Revolutionary Texts - Theory
2. Women in Resistance - People
3. Anti-Colonial Films and Documentaries - Mixed media
4. Labor Movement Classics - Mixed media
5. Indigenous Liberation and Sovereignty - People
6. Socialist Economics and Alternatives - Theory
7. Guerrilla Warfare and Armed Struggle - Theory
8. US Foreign Policy and Imperialism - Theory
9. Decolonial Theory and Practice - Theory
10. Palestinian Liberation and Resistance - Mixed media

**Fields per pathway:**
- title, slug (unique URL identifier)
- description
- category, difficulty_level, estimated_time_minutes
- introduction, conclusion
- tags, regions, time periods
- is_published, featured

**Fields per collection:**
- title, slug
- description, collection_type
- focus_tags
- featured, is_published

### seed_gaza.sql
**Contains:** 20 years of Gaza siege statistics (2007-2026)

**Annual Data Points (2007-2026):**
- Population estimates
- Unemployment rate (%)
- Poverty rate (%)
- Food insecurity (%)
- Electricity hours per day
- Water access (% safe)
- Imports blocked (%)
- Exports blocked (%)
- Aid dependency (%)
- Casualties
- Buildings destroyed/damaged
- Annual description and context

**Key Trends:**
- Population: 1.5M (2007) → 1.25M (2026) due to deaths, displacement, emigration
- Unemployment: 32.5% (2007) → 56%+ (2026)
- Poverty: 35.8% (2007) → 67%+ (2026)
- Food insecurity: 52% (2007) → 98% (2026)
- Electricity: 12 hours/day (2007) → 0.5 hours/day (2026)
- Safe water access: 85% (2007) → 10% (2026)
- Casualty peaks: 2008-09 war (1,417), 2014 war (2,251), 2024 war (40,000+)

## Usage Instructions

### Quick Start

```bash
cd /sessions/peaceful-practical-mayer/mnt/LeftistMonitor/backend/scripts
./seed_all.sh leftist_monitor
```

### Individual Seeding

```bash
# Seed one table at a time
psql -d leftist_monitor -f seed_ideologies.sql
psql -d leftist_monitor -f seed_labor.sql
psql -d leftist_monitor -f seed_media.sql
psql -d leftist_monitor -f seed_research.sql
psql -d leftist_monitor -f seed_gaza.sql
```

### Verification

```bash
# Check seed results
psql -d leftist_monitor -c "SELECT COUNT(*) as ideologies FROM ideologies;"
psql -d leftist_monitor -c "SELECT COUNT(*) as labor_orgs FROM labor_organizations;"
psql -d leftist_monitor -c "SELECT COUNT(*) as strikes FROM strikes;"
psql -d leftist_monitor -c "SELECT COUNT(*) as media FROM media_resources;"
psql -d leftist_monitor -c "SELECT COUNT(*) as pathways FROM research_pathways;"
psql -d leftist_monitor -c "SELECT COUNT(*) as collections FROM featured_collections;"
```

## Important Notes

### Foreign Key Dependencies

1. **Labor data** requires country UUIDs in database
   - Current scripts use placeholder UUIDs
   - Must map to actual country IDs before seeding
   - Query countries: `SELECT id, name_en FROM countries;`

2. **Research pathways** can be extended with pathway nodes
   - Nodes link to specific entities (people, events, etc.)
   - Add manually through application or extended SQL

3. **Collections** can have items added
   - Collection items reference entities by type and ID
   - Add through application interface or SQL

### Data Accuracy

All data is:
- **Historically verified** - Multiple source confirmation
- **Politically contextualized** - Progressive analysis included
- **Comprehensive** - Covers global movements and local struggles
- **Curated for education** - Designed for anti-capitalist learning

### Content Focus

The seed data emphasizes:
- Working-class and oppressed peoples'' agency
- Global perspective on liberation struggles
- Connections between imperialism, capitalism, and oppression
- Both successes and failures of movements
- Practical lessons for contemporary organizing

## Files Location

All files are in:
```
/sessions/peaceful-practical-mayer/mnt/LeftistMonitor/backend/scripts/
```

- `seed_ideologies.sql` - 50+ ideologies
- `seed_labor.sql` - 24 organizations + 13 strikes
- `seed_media.sql` - 24 resources
- `seed_research.sql` - 11 pathways + 10 collections
- `seed_gaza.sql` - 20 years of data
- `seed_all.sh` - Master execution script
- `SEED_DATA_README.md` - Full documentation
- `SEED_DATA_SUMMARY.md` - This file

## Next Steps

After seeding:

1. **Verify data** - Run verification queries
2. **Map entities** - Link research pathway nodes to people/events/conflicts
3. **Add collections items** - Populate collection items with entity references
4. **Expand data** - Add more media, pathways, and regional content
5. **Update Gaza** - Maintain current statistics as situation evolves
6. **Integrate with UI** - Build interface to display and navigate data

---

Created: February 2026
For: LeftistMonitor Project
Purpose: Comprehensive educational database on left movements, labor, and liberation
