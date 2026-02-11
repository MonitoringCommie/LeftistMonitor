# LeftistMonitor Seed Data Documentation

This directory contains comprehensive seed data for populating the LeftistMonitor database with information about leftist movements, labor struggles, liberation movements, and anti-capitalist theory and practice.

## Overview

The seed data scripts populate the database with historically accurate, well-researched information about:

- **Political ideologies** (50+ entries): Marxism, Maoism, Anarchism, Socialism, and related ideologies
- **Labor movements** (24+ organizations, 13+ strikes): Major trade unions and significant historical strikes
- **Media resources** (24+ entries): Revolutionary documentaries, films, and podcasts
- **Research pathways** (11 curated learning paths): Guided explorations of key topics
- **Featured collections** (10+ collections): Thematic groupings of resources
- **Gaza siege data** (2007-2026): Annual statistics on Palestinian conditions under blockade

## Files

### Core Seed Scripts

1. **seed_ideologies.sql**
   - 50+ political ideologies with descriptions, color coding, and political spectrum positioning
   - Includes: Marxism-Leninism, Maoism, Trotskyism, Anarcho-Communism, Democratic Socialism, etc.
   - Each entry includes left-right and libertarian-authoritarian positioning

2. **seed_labor.sql**
   - 24+ major labor organizations (unions, confederations, federations)
   - 13+ historically significant strikes and labor actions
   - International organizations (ILO, ITUC, WFTU) and country-specific unions
   - Strikes include: Pullman Strike, Flint Sit-Down, UK General Strike, Gdańsk Shipyard
   - Each strike includes demands, achievements, casualties, and progressive analysis

3. **seed_media.sql**
   - 24+ political documentaries, films, and podcasts
   - Documentaries: Manufacturing Consent, The Act of Killing, 13th, I Am Not Your Negro, The Square
   - Films: Battle of Algiers, Land and Freedom, Persepolis, The Wind That Shakes the Barley
   - Podcasts: Revolutions, Behind the Bastards, Citations Needed
   - Each resource includes metadata, links, topics, and progressive relevance analysis

4. **seed_research.sql**
   - 11 curated research pathways covering major topics
   - 10+ featured collections organized by theme
   - Pathways include: Colonialism & Imperialism, Labor Movement History, Palestinian Liberation, Feminist Theory, etc.
   - Each pathway includes difficulty level, estimated time, introduction, and conclusion

5. **seed_gaza.sql**
   - Annual statistics on Gaza (2007-2026)
   - Includes: Population, unemployment, poverty, food insecurity, electricity access, water access
   - Statistics on blocked imports/exports, aid dependency, casualties, buildings destroyed
   - Each year includes contextual description of conditions and events

### Master Script

- **seed_all.sh**: Bash script that executes all seed scripts in order with error handling and logging

## Data Quality and Accuracy

All seed data has been carefully researched from authoritative sources:

### Ideologies
- Definitions based on historical development and contemporary practice
- Political spectrum positions based on analysis of core positions
- Colors chosen to be historically and theoretically appropriate
- Descriptions emphasize material basis and practice, not just theory

### Labor Data
- Organizations: Research from ILO, ITUC, union websites, and labor history resources
- Strikes: Historical records from labor archives, documentaries, and academic sources
- Numbers and dates verified through multiple sources
- Progressive analysis contextualizes struggles within broader class movements

### Media
- All films/documentaries listed are real, widely-available works
- Synopses and relevance analyses reflect understanding of class content
- URLs point to legitimate sources where possible
- Films selected for both artistic merit and political significance

### Research Pathways
- Topics selected based on importance to anti-capitalist and liberation studies
- Difficulty levels reflect actual knowledge required
- Time estimates based on comprehensive coverage with critical analysis
- Collections group materials by theme for coherent learning

### Gaza Data
- Statistics compiled from UN OCHA, World Bank, WHO, International Committee of the Red Cross
- Palestinian Central Bureau of Statistics and human rights organizations
- Pre-2024 figures relatively stable based on UN monitoring
- 2024-2026 estimates based on reported casualty figures and humanitarian assessments
- Data presented without minimization—actual conditions are catastrophic

## Usage

### Running All Seeds

```bash
./seed_all.sh [database_name]
```

If database_name is not provided, defaults to `leftist_monitor`.

Example:
```bash
./seed_all.sh my_leftist_db
```

### Running Individual Seeds

To seed only specific tables:

```bash
psql -d leftist_monitor -f seed_ideologies.sql
psql -d leftist_monitor -f seed_labor.sql
psql -d leftist_monitor -f seed_media.sql
psql -d leftist_monitor -f seed_research.sql
psql -d leftist_monitor -f seed_gaza.sql
```

### Clearing Seeded Data

To clear data before re-seeding (use with caution):

```bash
psql -d leftist_monitor -c "TRUNCATE TABLE ideologies CASCADE;"
psql -d leftist_monitor -c "TRUNCATE TABLE labor_organizations CASCADE;"
psql -d leftist_monitor -c "TRUNCATE TABLE strikes CASCADE;"
psql -d leftist_monitor -c "TRUNCATE TABLE media_resources CASCADE;"
psql -d leftist_monitor -c "TRUNCATE TABLE research_pathways CASCADE;"
psql -d leftist_monitor -c "TRUNCATE TABLE featured_collections CASCADE;"
psql -d leftist_monitor -c "DROP TABLE IF EXISTS gaza_siege_data CASCADE;"
```

## Important Notes

### Foreign Key Dependencies

Some seed scripts reference entities that must exist in other tables:

1. **Labor Organizations** and **Strikes** reference `countries` table
   - Ensure countries are seeded first or update UUIDs in labor scripts
   - Currently uses placeholder country IDs that should be updated with actual database IDs
   - Use this query to find correct country IDs:
     ```sql
     SELECT id, name_en FROM countries WHERE name_en IN ('United States', 'United Kingdom', 'France', etc.);
     ```

2. **Media Resources** may reference media entity links
   - These can be populated manually after initial seeding

3. **Research Pathways** and **Collections** reference entity IDs
   - Pathway nodes and collection items should be added through application interface
   - Or add manually if directly extending seed scripts

### Data Extension

These seed files are starting points. Expand them by:

- Adding more ideologies (there are hundreds of variants and regional formations)
- Including additional major unions and contemporary strikes
- Adding more documentaries and radical media
- Creating additional research pathways for specific regions or topics
- Updating Gaza data as situation continues to evolve

### Progressive Analysis

All descriptions include "progressive analysis" sections that:
- Contextualize within class struggle
- Acknowledge limitations and contradictions
- Connect to broader anti-capitalist and anti-imperialist perspectives
- Emphasize working-class and oppressed peoples' agency
- Critique state and capitalist violence

This is intentional—the database is designed to serve anti-capitalist research and education.

## Schema Requirements

Ensure the following tables exist before seeding:

```
ideologies (id, name, description, color, left_right_position, libertarian_authoritarian_position)
political_parties (id, name, country_id, left_right_score, etc.)
labor_organizations (id, name, organization_type, founded, country_id, description, etc.)
strikes (id, name, strike_type, start_date, end_date, country_id, location_name, etc.)
media_resources (id, title, media_type, release_year, director, description, etc.)
research_pathways (id, title, slug, category, description, is_published, featured, etc.)
pathway_nodes (id, pathway_id, order, title, description, etc.)
featured_collections (id, title, slug, collection_type, description, is_published, featured, etc.)
collection_items (id, collection_id, entity_type, entity_id, order, etc.)
```

Also requires `countries` table for foreign key references.

## Future Enhancements

Consider adding seed data for:

- Political figures and revolutionary leaders
- Major historical events and conflicts
- Anti-imperialist organizations and networks
- Literature and theoretical works
- Regional case studies (Vietnam, Cuba, Nicaragua, China, etc.)
- Contemporary resistance movements
- Climate and environmental struggles
- Anti-racist and decolonial movements

## Contributing

When adding new seed data:

1. Ensure historical accuracy through primary and secondary sources
2. Include multiple perspectives, especially from oppressed communities
3. Provide progressive analysis contextualizing struggles
4. Use appropriate political terminology and avoid euphemisms
5. Document data sources and reasoning
6. Consider intersections of class, race, gender, imperialism, ecology
7. Emphasize agency of working class and oppressed peoples

## License and Attribution

This seed data is curated for educational purposes in service of anti-capitalist and anti-imperialist organizing and education. Sources include:

- Historical archives and primary documents
- Labor history research organizations
- UN bodies (OCHA, WHO, World Bank)
- Human rights organizations
- Academic and journalistic research
- Filmmakers and media creators (whose works are noted)

Proper attribution is provided for all films, podcasts, and documentaries.

---

Last Updated: February 2026
Curated for: LeftistMonitor Project
