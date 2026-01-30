"""
Great Famine Data Importer (1845-1852)
Documents the Irish Famine by county, including population decline,
deaths, emigration, evictions, and food exports during the famine.
Data sources: Census of Ireland, Poor Law Records, Parliamentary Papers,
Cormac O Grada's research, Ciran O Murchu's work
"""
import asyncio
from uuid import uuid4
from sqlalchemy import text
from ...database import async_session_maker

# Irish counties with famine data
# Population figures from 1841 and 1851 censuses
# Death and emigration estimates from historical research
FAMINE_COUNTY_DATA = [
    # CONNACHT (West - most affected)
    {
        "county": "Galway",
        "province": "Connacht",
        "lat": 53.2707,
        "lon": -8.8650,
        "population_1841": 440915,
        "population_1851": 321684,
        "population_decline_percent": 27.0,
        "estimated_deaths": 50000,
        "estimated_emigration": 70000,
        "evictions": 14273,
        "workhouse_deaths": 8900,
        "progressive_analysis": "Galway was devastated by the famine, with mass evictions by landlords who cleared estates to convert to grazing. The Galway workhouses were overwhelmed, and thousands died on 'coffin ships' fleeing the county."
    },
    {
        "county": "Mayo",
        "province": "Connacht",
        "lat": 53.9000,
        "lon": -9.3000,
        "population_1841": 388887,
        "population_1851": 274499,
        "population_decline_percent": 29.4,
        "estimated_deaths": 45000,
        "estimated_emigration": 65000,
        "evictions": 12890,
        "workhouse_deaths": 10200,
        "progressive_analysis": "Mayo suffered some of the highest mortality rates. The landlord system here was particularly exploitative, with tenants forced onto marginal land and totally dependent on potatoes. The county never recovered its pre-famine population."
    },
    {
        "county": "Sligo",
        "province": "Connacht",
        "lat": 54.1538,
        "lon": -8.6097,
        "population_1841": 180886,
        "population_1851": 128583,
        "population_decline_percent": 28.9,
        "estimated_deaths": 20000,
        "estimated_emigration": 30000,
        "evictions": 6200,
        "workhouse_deaths": 4800,
        "progressive_analysis": "Sligo's population was decimated by famine and forced emigration. Landlords like Lord Palmerston paid to ship tenants to Canada rather than provide relief."
    },
    {
        "county": "Leitrim",
        "province": "Connacht",
        "lat": 54.0500,
        "lon": -8.0000,
        "population_1841": 155297,
        "population_1851": 111897,
        "population_decline_percent": 27.9,
        "estimated_deaths": 18000,
        "estimated_emigration": 25000,
        "evictions": 3800,
        "workhouse_deaths": 3100,
        "progressive_analysis": "Leitrim was one of the poorest counties before the famine. The colonial land system had created extreme vulnerability, and the famine was catastrophic for the peasantry."
    },
    {
        "county": "Roscommon",
        "province": "Connacht",
        "lat": 53.7500,
        "lon": -8.2667,
        "population_1841": 253591,
        "population_1851": 173446,
        "population_decline_percent": 31.6,
        "estimated_deaths": 30000,
        "estimated_emigration": 50000,
        "evictions": 7500,
        "workhouse_deaths": 6200,
        "progressive_analysis": "Roscommon had one of the highest population decline rates. The Strokestown and Roscommon workhouses became death traps, with typhus and dysentery rampant."
    },

    # MUNSTER (South)
    {
        "county": "Cork",
        "province": "Munster",
        "lat": 51.9000,
        "lon": -8.4750,
        "population_1841": 854578,
        "population_1851": 649308,
        "population_decline_percent": 24.0,
        "estimated_deaths": 90000,
        "estimated_emigration": 110000,
        "evictions": 21500,
        "workhouse_deaths": 17800,
        "progressive_analysis": "Cork, Ireland's largest county, saw massive suffering despite being a major port from which food was exported throughout the famine. Skibbereen became synonymous with famine horror, with bodies lying unburied in the streets."
    },
    {
        "county": "Kerry",
        "province": "Munster",
        "lat": 52.1545,
        "lon": -9.5669,
        "population_1841": 293880,
        "population_1851": 238254,
        "population_decline_percent": 18.9,
        "estimated_deaths": 25000,
        "estimated_emigration": 30000,
        "evictions": 5800,
        "workhouse_deaths": 5100,
        "progressive_analysis": "Kery's remote peninsulas were among the hardest hit. The Dingle Peninsula lost a huge proportion of its Irish-speaking population, contributing to language decline."
    },
    {
        "county": "Clare",
        "province": "Munster",
        "lat": 52.8417,
        "lon": -8.9833,
        "population_1841": 286394,
        "population_1851": 212440,
        "population_decline_percent": 25.8,
        "estimated_deaths": 32000,
        "estimated_emigration": 42000,
        "evictions": 9300,
        "workhouse_deaths": 7200,
        "progressive_analysis": "Clare was one of the worst-affected counties. The Kilrush Union became notorious for the cruelty of its evictions. Landlord Marcus Keane cleared thousands of tenants."
    },
    {
        "county": "Limerick",
        "province": "Munster",
        "lat": 52.5000,
        "lon": -8.7500,
        "population_1841": 330129,
        "population_1851": 262132,
        "population_decline_percent": 20.6,
        "estimated_deaths": 28000,
        "estimated_emigration": 38000,
        "evictions": 7100,
        "workhouse_deaths": 5800,
        "progressive_analysis": "Limerick's rural areas suffered heavily while food continued to be shipped from the city's port. The contrast between urban wealth and rural starvation was stark."
    },
    {
        "county": "Tipperary",
        "province": "Munster",
        "lat": 52.5000,
        "lon": -7.8333,
        "population_1841": 435563,
        "population_1851": 331567,
        "population_decline_percent": 23.9,
        "estimated_deaths": 42000,
        "estimated_emigration": 60000,
        "evictions": 11200,
        "workhouse_deaths": 8900,
        "progressive_analysis": "Tipperary, despite its fertile 'Golden Vale', saw mass starvation as grain continued to be exported. The county's agricultural wealth benefited landlords, but not the starving peasantry."
    },
    {
        "county": "Waterford",
        "province": "Munster",
        "lat": 52.2000,
        "lon": -7.5000,
        "population_1841": 196187,
        "population_1851": 164091,
        "population_decline_percent": 16.4,
        "estimated_deaths": 15000,
        "estimated_emigration": 18000,
        "evictions": 3700,
        "workhouse_deaths": 2900,
        "progressive_analysis": "Waterford's port was another exit point for Irish food during the famine. The city, ruled by Quaker and Protestant merchants, saw some charitable relief but could not stem the tide of structural injustice."
    },

    # LEINSTER (East)
    {
        "county": "Dublin",
        "province": "Leinster",
        "lat": 53.3498,
        "lon": -6.2603,
        "population_1841": 372773,
        "population_1851": 405147,
        "population_decline_percent": -8.7,
        "estimated_deaths": 25000,
        "estimated_emigration": 20000,
        "evictions": 3500,
        "workhouse_deaths": 6900,
        "progressive_analysis": "Dublin's population actually grew as refugees flooded into the city. However, thousands died in the city's slums and workhouses. Dublin's administrative class managed British policy that killed the countryside."
    },
    {
        "county": "Wicklow",
        "province": "Leinster",
        "lat": 52.9833,
        "lon": -6.3667,
        "population_1841": 126143,
        "population_1851": 98979,
        "population_decline_percent": 21.5,
        "estimated_deaths": 12000,
        "estimated_emigration": 15000,
        "evictions": 2200,
        "workhouse_deaths": 2100,
        "progressive_analysis": "Wicklow's mountain communities were devastated. Despite proximity to Dublin, relief was slow to reach remote areas."
    },
    {
        "county": "Wexford",
        "province": "Leinster",
        "lat": 52.3333,
        "lon": -6.4667,
        "population_1841": 202033,
        "population_1851": 180958,
        "population_decline_percent": 10.4,
        "estimated_deaths": 10000,
        "estimated_emigration": 12000,
        "evictions": 2100,
        "workhouse_deaths": 1800,
        "progressive_analysis": "Wexford, with its more diverse agriculture, suffered less than western counties but still saw significant mortality and emigration."
    },
    {
        "county": "Kilkenny",
        "province": "Leinster",
        "lat": 52.5833,
        "lon": -7.2500,
        "population_1841": 202420,
        "population_1851": 158748,
        "population_decline_percent": 21.6,
        "estimated_deaths": 18000,
        "estimated_emigration": 25000,
        "evictions": 4200,
        "workhouse_deaths": 3500,
        "progressive_analysis": "Kilkenny had a large Catholic laboring class that depended on the potato. The blight devastated them while the gentry continued to export grain."
    },
    {
        "county": "Carlow",
        "province": "Leinster",
        "lat": 52.8000,
        "lon": -6.9333,
        "population_1841": 86228,
        "population_1851": 68078,
        "population_decline_percent": 21.0,
        "estimated_deaths": 8000,
        "estimated_emigration": 10000,
        "evictions": 1500,
        "workhouse_deaths": 1300,
        "progressive_analysis": "Carlow's small size meant even moderate losses impacted every community. The county's laboring poor depended entirely on the potato."
    },
    {
        "county": "Laois",
        "province": "Leinster",
        "lat": 53.0500,
        "lon": -7.5500,
        "population_1841": 153930,
        "population_1851": 111664,
        "population_decline_percent": 27.5,
        "estimated_deaths": 18000,
        "estimated_emigration": 24000,
        "evictions": 3800,
        "workhouse_deaths": 3000,
        "progressive_analysis": "Laois (Queen's County) was a plantation county where the landlord system was especially harsh. Mass evictions accompanied the famine."
    },
    {
        "county": "Offaly",
        "province": "Leinster",
        "lat": 53.2333,
        "lon": -7.7167,
        "population_1841": 146857,
        "population_1851": 111986,
        "population_decline_percent": 23.7,
        "estimated_deaths": 15000,
        "estimated_emigration": 20000,
        "evictions": 3200,
        "workhouse_deaths": 2600,
        "progressive_analysis": "Offaly (King's County), another plantation county, saw similar patterns of landlord cruelty and tenant suffering."
    },
    {
        "county": "Westmeath",
        "province": "Leinster",
        "lat": 53.5333,
        "lon": -7.4500,
        "population_1841": 141100,
        "population_1851": 111405,
        "population_decline_percent": 21.0,
        "estimated_deaths": 13000,
        "estimated_emigration": 17000,
        "evictions": 2800,
        "workhouse_deaths": 2300,
        "progressive_analysis": "Westmeath saw significant displacement as landlords consolidated holdings. The Athlone workhouse was chronically overcrowded."
    },
    {
        "county": "Longford",
        "province": "Leinster",
        "lat": 53.7278,
        "lon": -7.7944,
        "population_1841": 115491,
        "population_1851": 82348,
        "population_decline_percent": 28.7,
        "estimated_deaths": 14000,
        "estimated_emigration": 19000,
        "evictions": 2900,
        "workhouse_deaths": 2400,
        "progressive_analysis": "Longford's high population decline reflects both high mortality and massive emigration. The county's landlords-including Lord Longford's family-often paid for tenants to emigrate rather than provide relief."
    },
    {
        "county": "Meath",
        "province": "Leinster",
        "lat": 53.6000,
        "lon": -6.6567,
        "population_1841": 183828,
        "population_1851": 140748,
        "population_decline_percent": 23.4,
        "estimated_deaths": 18000,
        "estimated_emigration": 25000,
        "evictions": 3900,
        "workhouse_deaths": 3100,
        "progressive_analysis": "Meath, the ancient seat of Irish kings, was now dominated by Anglo-Irish graziers. The famine accelerated the clearance of the native peasantry."
    },
    {
        "county": "Louth",
        "province": "Leinster",
        "lat": 53.9167,
        "lon": -6.4833,
        "population_1841": 128258,
        "population_1851": 108013,
        "population_decline_percent": 15.8,
        "estimated_deaths": 10000,
        "estimated_emigration": 12000,
        "evictions": 1800,
        "workhouse_deaths": 1700,
        "progressive_analysis": "Louth, Ireland's smallest county, had a more diversified economy but still saw significant suffering among the laboring poor."
    },
    {
        "county": "Kildare",
        "province": "Leinster",
        "lat": 53.1500,
        "lon": -6.9167,
        "population_1841": 114382,
        "population_1851": 95723,
        "population_decline_percent": 16.3,
        "estimated_deaths": 9000,
        "estimated_emigration": 10000,
        "evictions": 1600,
        "workhouse_deaths": 1500,
        "progressive_analysis": "Kildare, with its proximity to Dublin and mixed farming, fared better than western counties but still saw substantial losses."
    },

    # ULSTER (North)
    {
        "county": "Donegal",
        "province": "Ulster",
        "lat": 54.8333,
        "lon": -8.0000,
        "population_1841": 296448,
        "population_1851": 255808,
        "population_decline_percent": 13.7,
        "estimated_deaths": 22000,
        "estimated_emigration": 20000,
        "evictions": 4500,
        "workhouse_deaths": 4100,
        "progressive_analysis": "Donegal, the largest county in Ulster, saw significant suffering in its coastal and mountain areas. The county's Gaic-speaking regions were devastated."
    },
    {
        "county": "Cavan",
        "province": "Ulster",
        "lat": 53.9917,
        "lon": -7.3611,
        "population_1841": 243158,
        "population_1851": 174635,
        "population_decline_percent": 28.2,
        "estimated_deaths": 28000,
        "estimated_emigration": 40000,
        "evictions": 6500,
        "workhouse_deaths": 5300,
        "progressive_analysis": "Cavan, a majority-Catholic county in Ulster, suffered severely. Its landlords-many absentee-showed little concern for tenant welfare."
    },
    {
        "county": "Monaghan",
        "province": "Ulster",
        "lat": 54.2500,
        "lon": -6.9333,
        "population_1841": 200443,
        "population_1851": 141874,
        "population_decline_percent": 29.2,
        "estimated_deaths": 25000,
        "estimated_emigration": 35000,
        "evictions": 5800,
        "workhouse_deaths": 4600,
        "progressive_analysis": "Monaghan had one of the highest population decline rates in Ulster. The county's large Catholic majority was disproportionately affected."
    },
    {
        "county": "Fermanagh",
        "province": "Ulster",
        "lat": 54.3500,
        "lon": -7.6333,
        "population_1841": 156481,
        "population_1851": 116000,
        "population_decline_percent": 25.9,
        "estimated_deaths": 18000,
        "estimated_emigration": 22000,
        "evictions": 3600,
        "workhouse_deaths": 3000,
        "progressive_analysis": "Fermanagh, a border county with a large Catholic population, saw significant suffering in its rural areas."
    },
    {
        "county": "Tyrone",
        "province": "Ulster",
        "lat": 54.5000,
        "lon": -7.3000,
        "population_1841": 312956,
        "population_1851": 255821,
        "population_decline_percent": 18.3,
        "estimated_deaths": 25000,
        "estimated_emigration": 30000,
        "evictions": 5200,
        "workhouse_deaths": 4300,
        "progressive_analysis": "Tyrone, with its mixed Catholic and Protestant population, saw the poorest Catholic areas suffer most. The linen industry provided some alternative employment."
    },
    {
        "county": "Armagh",
        "province": "Ulster",
        "lat": 54.3500,
        "lon": -6.6500,
        "population_1841": 232393,
        "population_1851": 196381,
        "population_decline_percent": 15.5,
        "estimated_deaths": 16000,
        "estimated_emigration": 20000,
        "evictions": 3400,
        "workhouse_deaths": 2900,
        "progressive_analysis": "Armagh, the ecclesiastical capital of Ireland, had both industrial and agricultural areas. The poorest Catholic areas suffered most."
    },
    {
        "county": "Derry",
        "province": "Ulster",
        "lat": 54.9966,
        "lon": -7.3219,
        "population_1841": 222174,
        "population_1851": 192022,
        "population_decline_percent": 13.6,
        "estimated_deaths": 15000,
        "estimated_emigration": 16000,
        "evictions": 2700,
        "workhouse_deaths": 2400,
        "progressive_analysis": "Derry (Londonderry) was colonized by London guilds in the 17th century. During the famine, the city served as an emigration point to America."
    },
    {
        "county": "Antrim",
        "province": "Ulster",
        "lat": 54.7167,
        "lon": -6.2167,
        "population_1841": 361363,
        "population_1851": 352025,
        "population_decline_percent": 2.6,
        "estimated_deaths": 10000,
        "estimated_emigration": 8000,
        "evictions": 1900,
        "workhouse_deaths": 2100,
        "progressive_analysis": "Antrim, the most industrialized county (including Belfast), suffered far less than the rest of Ireland. This disparity shows the famine was about economic structures and colonial policy, not natural disaster."
    },
    {
        "county": "Down",
        "province": "Ulster",
        "lat": 54.3500,
        "lon": -5.7167,
        "population_1841": 361446,
        "population_1851": 320817,
        "population_decline_percent": 11.2,
        "estimated_deaths": 18000,
        "estimated_emigration": 22000,
        "evictions": 3200,
        "workhouse_deaths": 2800,
        "progressive_analysis": "Down saw varied impacts-industrial areas around Belfast fared better, while rural Catholic areas suffered seriously."
    },
]

# National-level food export data during famine
FOOD_EXPORTS = [
    {"year": 1846, "cattle_exported": 186000, "pigs_exported": 480000, "oats_cwt": 314000, "wheat_cwt": 120000, "butter_cwt": 240000},
    {"year": 1847, "cattle_exported": 190000, "pigs_exported": 106000, "oats_cwt": 324000, "wheat_cwt": 92000, "butter_cwt": 215000},
    {"year": 1848, "cattle_exported": 197000, "pigs_exported": 106000, "oats_cwt": 255000, "wheat_cwt": 68000, "butter_cwt": 195000},
    {"year": 1849, "cattle_exported": 219000, "pigs_exported": 69000, "oats_cwt": 187000, "wheat_cwt": 61000, "butter_cwt": 185000},
    {"year": 1850, "cattle_exported": 243000, "pigs_exported": 68000, "oats_cwt": 175000, "wheat_cwt": 54000, "butter_cwt": 172000},
]

# Overall analysis
FAMINE_ANALYSIS = {
    "total_deaths_estimate": "1,000,000 - 1,500,000",
    "total_emigration_1845_1855": "2,200,000",
    "population_decline_overall": "20-25%",
    "progressive_analysis": """The Great Famine was not a natural disaster but a product of British colonial policy.
    
Key factors:
1. LAND SYSTEM: The colonial land system concentrated land in the hands of Anglo-Irish and British landlords, forcing the native Irish onto marginal land where only potatoes would grow.

2. FOOD EXPORTS: Throughout the famine, Ireland continued to export vast quantities of food to Britain. Cattle, grain, butter, and other produce left Irish ports while the local population starved.

3. LAISSEZ-FAIRE IDEOLOGY: The British government, dominated by laissez-faire economics, refused to interfere with 'free trade' or provide adequate relief.

4. MORALIZING DISCOURSE: British officials blamed Irish 'character' and viewed the famine as divine punishment. Charles Trevelyan, in charge of relief, called the famine 'a mechanism for reducing surplus population.'

5. EVICTIONS: Landlords used the famine to clear tenants and consolidate holdings for grazing. Over 500,000 people were evicted between 1846 and 1854.

6. WORKHOUSES: The Poor Law system required starving people to enter workhouses to receive relief. These became death traps, with overcrowding and disease killing thousands.

The famine profoundly shaped Irish history and the Irish diaspora's political consciousness. It demonstrates how colonialism transforms natural events (potato blight) into catastrophes through extractive economic relations and racist indifference to colonized populations.""",
    "sources": [
        "Census of Ireland 1841, 1851",
        "Cormac O Grada - Black '47 and Beyond",
        "Christine Kinealy - This Great Calamity",
        "John Kelly - The Graves Are Walking",
        "Tim Pat Coogan - The Famine Plot",
        "Parliamentary Papers on Ireland",
    ]
}


class FamineDataImporter:
    async def run(self):
        async with async_session_maker() as session:
            # Get Ireland country ID
            result = await session.execute(
                text("SELECT id FROM countries WHERE name_en ILIKE '%ireland%' LIMIT 1")
            )
            row = result.first()
            ireland_id = str(row[0]) if row else None

            imported = 0
            for county in FAMINE_COUNTY_DATA:
                try:
                    # Check if county data already exists
                    existing = await session.execute(
                        text("SELECT id FROM famine_data WHERE county = :county"),
                        {"county": county["county"]}
                    )
                    if existing.first():
                        print(f"Skipping existing: {county['county']}")
                        continue

                    # Create geometry from lat/lon (county centroid)
                    geom = f"SRID=4326;POINT({county['lon']} {county['lat']})" if county.get("lat") else None

                    await session.execute(
                        text("""
                            INSERT INTO famine_data (
                                id, county, province, country_id, geometry,
                                population_1841, population_1851,
                                population_decline_percent, estimated_deaths,
                                estimated_emigration, evictions, workhouse_deaths,
                                progressive_analysis, sources
                            ) VALUES (
                                :id, :county, :province, :country_id,
                                ST_GeomFromEWKT(:geometry),
                                :population_1841, :population_1851,
                                :population_decline_percent, :estimated_deaths,
                                :estimated_emigration, :evictions, :workhouse_deaths,
                                :progressive_analysis, :sources
                            )
                        """),
                        {
                            "id": str(uuid4()),
                            "county": county["county"],
                            "province": county["province"],
                            "country_id": ireland_id,
                            "geometry": geom,
                            "population_1841": county["population_1841"],
                            "population_1851": county["population_1851"],
                            "population_decline_percent": county["population_decline_percent"],
                            "estimated_deaths": county["estimated_deaths"],
                            "estimated_emigration": county["estimated_emigration"],
                            "evictions": county["evictions"],
                            "workhouse_deaths": county["workhouse_deaths"],
                            "progressive_analysis": county["progressive_analysis"],
                            "sources": FAMINE_ANALYSIS["sources"],
                        }
                    )
                    imported += 1
                    print(f"Imported: {county['county']}")
                except Exception as e:
                    print(f"Error importing {county.get('county')}: {e}")

            await session.commit()
            print(f"Successfully imported {imported} county famine records")
            return imported


async def main():
    importer = FamineDataImporter()
    await importer.run()


if __name__ == "__main__":
    asyncio.run(main())
