-- Gaza Siege Data 2007-2026
-- Actual table schema: id (uuid), date (date), electricity_hours_per_day (numeric 4,1),
-- water_access_percent (numeric 5,2), food_insecurity_percent (numeric 5,2),
-- unemployment_percent (numeric 5,2), casualties_month (integer), source (varchar 255), created_at

-- Insert Gaza Siege Statistics (one entry per year, using Jan 1 as date)
-- Sources: UN OCHA, World Bank, WHO, ICRC, Palestinian Central Bureau of Statistics

INSERT INTO gaza_siege_data
(date, electricity_hours_per_day, water_access_percent, food_insecurity_percent, unemployment_percent, casualties_month, source)
VALUES
('2007-01-01', 12.0, 85.00, 52.00, 32.50, 0, 'UN OCHA - Siege begins after Hamas election'),
('2008-01-01', 6.0, 72.00, 63.00, 38.00, 118, 'UN OCHA - Cast Lead operation, 1417 killed'),
('2009-01-01', 8.0, 65.00, 71.00, 45.20, 17, 'UN OCHA - Post-Cast Lead reconstruction'),
('2010-01-01', 10.0, 70.00, 68.50, 42.80, 0, 'UN OCHA - Limited reconstruction under blockade'),
('2011-01-01', 10.5, 72.00, 65.00, 40.50, 0, 'UN OCHA - Siege normalized'),
('2012-01-01', 11.0, 73.00, 66.50, 41.20, 15, 'UN OCHA - Pillar of Defense, 174 killed'),
('2013-01-01', 9.5, 70.00, 68.00, 43.00, 0, 'UN OCHA - Egyptian coup closes Rafah crossing'),
('2014-01-01', 8.0, 65.00, 72.00, 45.50, 188, 'UN OCHA - Protective Edge, 2251 killed'),
('2015-01-01', 7.0, 60.00, 75.00, 48.00, 0, 'UN OCHA - Post-2014 war devastation'),
('2016-01-01', 6.5, 58.00, 73.00, 46.20, 0, 'UN OCHA - Electricity crisis, 20+ hour cuts'),
('2017-01-01', 4.0, 55.00, 70.00, 44.50, 0, 'UN OCHA - PA cuts electricity payments'),
('2018-01-01', 5.5, 57.00, 72.50, 45.80, 16, 'UN OCHA - Great March of Return, 190 killed'),
('2019-01-01', 6.0, 58.00, 73.00, 47.20, 1, 'UN OCHA - March of Return continues'),
('2020-01-01', 5.0, 52.00, 76.00, 50.50, 0, 'UN OCHA - COVID-19 amid blockade'),
('2021-01-01', 6.5, 56.00, 74.50, 48.00, 22, 'UN OCHA - Guardian of the Walls, 260 killed'),
('2022-01-01', 5.0, 50.00, 77.50, 49.50, 0, 'UN OCHA - Over 80% dependent on aid'),
('2023-01-01', 4.5, 48.00, 75.00, 48.50, 0, 'UN OCHA - Blockade continues'),
('2024-01-01', 2.0, 25.00, 90.00, 52.00, 3333, 'UN OCHA - Swords of Iron, 40000+ killed'),
('2025-01-01', 1.0, 15.00, 95.00, 55.00, 3833, 'UN OCHA - Famine conditions, healthcare collapsed'),
('2026-01-01', 0.5, 10.00, 98.00, 56.00, 42, 'UN OCHA - Ongoing catastrophe, ceasefire')
ON CONFLICT (date) DO NOTHING;

-- Verify inserts
SELECT COUNT(*) as gaza_data_rows FROM gaza_siege_data;
