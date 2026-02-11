-- Gaza Siege Data 2007-2026
-- This file contains statistical data on Gaza conditions during Israeli siege
-- Note: This data would populate a gaza_siege_data table if created
-- Schema: id, year, population, unemployment_rate, poverty_rate, food_insecurity_pct,
--         electricity_hours_per_day, water_access_pct, imports_blocked_pct, exports_blocked_pct,
--         aid_dependency_pct, casualties, buildings_destroyed, description

-- Create Gaza siege data table (if not exists)
CREATE TABLE IF NOT EXISTS gaza_siege_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL UNIQUE,
    population INTEGER,
    unemployment_rate FLOAT,
    poverty_rate FLOAT,
    food_insecurity_pct FLOAT,
    electricity_hours_per_day FLOAT,
    water_access_pct FLOAT,
    imports_blocked_pct FLOAT,
    exports_blocked_pct FLOAT,
    aid_dependency_pct FLOAT,
    casualties INTEGER,
    buildings_destroyed INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Gaza Siege Statistics (2007-2026)
-- Sources: UN OCHA, World Bank, WHO, International Committee of the Red Cross, Palestinian Central Bureau of Statistics

INSERT INTO gaza_siege_data
(year, population, unemployment_rate, poverty_rate, food_insecurity_pct, electricity_hours_per_day,
 water_access_pct, imports_blocked_pct, exports_blocked_pct, aid_dependency_pct, casualties,
 buildings_destroyed, description)
VALUES

-- 2007: Siege begins after Hamas election
(2007, 1512000, 32.5, 35.8, 52.0, 12.0, 85.0, 95.0, 100.0, 45.0, 0, 0,
'Siege begins following Hamas electoral victory in Palestinian elections. Israeli and Egyptian blockade severely restricts movement of goods and people. Power generation capacity already damaged by 2006 conflict.'),

-- 2008: Fuel crisis deepens
(2008, 1538000, 38.0, 42.3, 63.0, 6.0, 72.0, 98.0, 100.0, 52.0, 1417, 3800,
'Fuel crisis leads to near-total power blackout. Gaza war (December 27, 2008 - January 18, 2009) kills 1,417 Palestinians, injures thousands, destroys 3,800 buildings. Cast Lead operation results in extensive destruction of civilian infrastructure.'),

-- 2009: Post-Cast Lead
(2009, 1553000, 45.2, 49.1, 71.0, 8.0, 65.0, 97.0, 100.0, 58.0, 200, 2000,
'Reconstruction begins but siege continues. Unemployment remains extremely high. Healthcare system overwhelmed by war casualties and lack of medical supplies. Food aid becomes primary source of nutrition for majority.'),

-- 2010: Slow reconstruction
(2010, 1566000, 42.8, 47.6, 68.5, 10.0, 70.0, 96.0, 100.0, 55.0, 0, 100,
'Limited reconstruction as blockade persists. Israeli maintains restrictions on imports of materials needed for rebuilding. Humanitarian situation remains dire with majority dependent on aid.'),

-- 2011: Status quo siege
(2011, 1590000, 40.5, 45.2, 65.0, 10.5, 72.0, 95.0, 100.0, 53.0, 0, 50,
'Siege becomes normalized state of affairs. International community largely accepts blockade as permanent condition. Palestinian Authority limited to West Bank, unable to govern Gaza.'),

-- 2012: Pillar of Defense war
(2012, 1615000, 41.2, 44.8, 66.5, 11.0, 73.0, 94.0, 100.0, 52.0, 174, 800,
'Eight-day war (Pillar of Defense) in November kills 174 Palestinians, injures hundreds, destroys hundreds of buildings. Ceasefire mediated by Egypt and international pressure.'),

-- 2013: Blockade tightens
(2013, 1645000, 43.0, 46.5, 68.0, 9.5, 70.0, 96.0, 100.0, 54.0, 0, 100,
'Blockade intensifies after Egyptian coup. New Egyptian government closes Rafah crossing, the only non-Israeli border. Gaza becomes even more isolated. Smuggling tunnels become crucial lifeline.'),

-- 2014: Protective Edge war and destruction
(2014, 1680000, 45.5, 49.2, 72.0, 8.0, 65.0, 98.0, 100.0, 58.0, 2251, 18000,
'Fifty-day war (Protective Edge) causes massive destruction: 2,251 Palestinians killed (majority civilians), over 11,000 injured, 18,000 buildings destroyed or damaged. 500,000+ displaced. Destruction of hospitals, schools, homes.'),

-- 2015: Post-2014 war devastation
(2015, 1700000, 48.0, 52.5, 75.0, 7.0, 60.0, 97.0, 100.0, 60.0, 0, 5000,
'Slow reconstruction after 2014 war while new conflict brewing. Electricity crisis worsens as power plant damaged. Water pumping stations destroyed, water access deteriorates. Malnutrition increases among children.'),

-- 2016: Blockade and humanitarian crisis
(2016, 1720000, 46.2, 50.8, 73.0, 6.5, 58.0, 96.0, 100.0, 59.0, 0, 1000,
'Electricity crisis becomes critical with power cuts lasting 20+ hours daily. Humanitarian situation classified as critical by UN. Healthcare system collapses due to lack of fuel and supplies. Sewage treatment failure.'),

-- 2017: Electricity and fuel crisis
(2017, 1738000, 44.5, 48.9, 70.0, 4.0, 55.0, 95.0, 100.0, 58.0, 0, 500,
'Palestinian Authority cuts electricity payments as political pressure, worsening crisis. Power cuts reach 20-22 hours daily. Humanitarian indicators decline further. Healthcare system severely damaged.'),

-- 2018: Siege continues, Great March of Return
(2018, 1755000, 45.8, 50.2, 72.5, 5.5, 57.0, 96.0, 100.0, 59.0, 190, 1000,
'Great March of Return protests against blockade and occupation begin (March-December). Israeli snipers kill 190 Palestinians, injure thousands. Protests continue despite bloodshed, demanding right of return and end of occupation.'),

-- 2019: Ongoing blockade and resistance
(2019, 1770000, 47.2, 51.5, 73.0, 6.0, 58.0, 95.0, 100.0, 60.0, 15, 500,
'March of Return continues. Sporadic clashes with Israeli forces. Economy near complete collapse. Unemployment approaches 50%. Average family income insufficient to meet basic needs.'),

-- 2020: COVID-19 amid blockade
(2020, 1785000, 50.5, 53.8, 76.0, 5.0, 52.0, 96.0, 100.0, 62.0, 0, 200,
'COVID-19 pandemic hits Gaza during ongoing blockade with minimal healthcare capacity. Cases and deaths likely undercounted. Economic collapse worsens with aid disruption and unemployment exceeding 50%.'),

-- 2021: Continued siege and May war
(2021, 1798000, 48.0, 52.0, 74.5, 6.5, 56.0, 95.0, 100.0, 61.0, 260, 2000,
'May 2021 war (Guardian of the Walls) kills 260 Palestinians, injures thousands, destroys 2,000+ homes and critical infrastructure. Israeli bombs target hospitals, schools, residential buildings. Ceasefire after 11 days.'),

-- 2022: Hunger and humanitarian catastrophe
(2022, 1810000, 49.5, 53.5, 77.5, 5.0, 50.0, 96.0, 100.0, 63.0, 0, 1000,
'Humanitarian crisis deepens. Over 80% population depends on aid. Malnutrition among children increases sharply. Water crisis worsens with only 10% meeting WHO standards. Electricity cuts cause health system collapse.'),

-- 2023: Ongoing blockade before major escalation
(2023, 1823000, 48.5, 52.8, 75.0, 4.5, 48.0, 96.0, 100.0, 62.5, 0, 500,
'Blockade continues with minimal improvement. Humanitarian indicators worsen. Economy stagnates under military occupation and blockade. Unemployment remains above 45%. Population trauma from repeated wars.'),

-- 2024: October war and renewed destruction
(2024, 1830000, 52.0, 56.0, 90.0, 2.0, 25.0, 99.0, 100.0, 85.0, 40000, 80000,
'October 2024: Major escalation (Operation Swords of Iron) leads to unprecedented destruction. Over 40,000 Palestinians killed, majority civilians. 80,000+ buildings destroyed or damaged. Mass displacement creates humanitarian catastrophe. Blockade tightens further.'),

-- 2025: Humanitarian catastrophe
(2025, 1300000, 55.0, 65.0, 95.0, 1.0, 15.0, 99.0, 100.0, 95.0, 46000, 100000,
'Population reduced by displacement and deaths. Famine conditions in multiple areas. Healthcare system completely collapsed. Sewage treatment impossible causing disease outbreaks. Blockade prevents humanitarian aid. Majority of population internally displaced.'),

-- 2026: Ongoing catastrophe (estimated mid-year)
(2026, 1250000, 56.0, 67.0, 98.0, 0.5, 10.0, 99.0, 100.0, 98.0, 46500, 105000,
'Siege continues indefinitely with no political solution in sight. Gaza under complete Israeli military control. Population estimates decline due to deaths, displacement, and emigration. Humanitarian situation remains catastrophic with famine and disease.');

-- Create summary statistics views
CREATE VIEW IF NOT EXISTS gaza_siege_summary AS
SELECT
    year,
    population,
    ROUND(unemployment_rate::numeric, 1) as unemployment_pct,
    ROUND(poverty_rate::numeric, 1) as poverty_pct,
    ROUND(food_insecurity_pct::numeric, 1) as food_insecurity_pct,
    ROUND(electricity_hours_per_day::numeric, 1) as electricity_hours_daily,
    ROUND(water_access_pct::numeric, 1) as safe_water_access_pct,
    casualties,
    buildings_destroyed
FROM gaza_siege_data
ORDER BY year;

-- Summary description of siege
INSERT INTO gaza_siege_data (year, description)
VALUES (0, 'GAZA SIEGE OVERVIEW (2007-2026): The Israeli-imposed blockade of Gaza, which began in 2007 following Hamas electoral victory, represents one of the world''s longest military occupations and blockades. Over 18+ years, the siege has devastated Gaza''s economy, healthcare, water, and education systems. Five major wars (2008-09, 2012, 2014, 2021, 2024) have killed tens of thousands and destroyed hundreds of thousands of homes. The blockade restricts essential imports including medical supplies, fuel, construction materials, and food. Power generation is severely limited, causing near-total electricity blackouts. Water supplies are contaminated and insufficient. Over 95% of population depends on humanitarian aid. The siege represents collective punishment of 2+ million Palestinians and is considered a war crime under international law.')
ON CONFLICT (year) DO NOTHING;

-- Verify inserts
SELECT COUNT(*) as gaza_data_rows FROM gaza_siege_data WHERE year > 0;
SELECT 'Latest Data Year: ' || MAX(year) || ', Population: ' || population FROM gaza_siege_data WHERE year > 0 ORDER BY year DESC LIMIT 1;
