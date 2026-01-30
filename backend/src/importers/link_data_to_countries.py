"""Link existing data to countries and add country associations."""
import asyncio
import uuid
from src.database import async_session_maker
from sqlalchemy import text

# Correct country name mappings based on actual database values
COUNTRY_MAPPINGS = {
    "Germany": "German Federal Republic",
    "France": "France",
    "Russia": "Russia (Soviet Union)",
    "Soviet Union": "Russia (Soviet Union)",
    "USSR": "Russia (Soviet Union)",
    "United States": "United States of America",
    "USA": "United States of America",
    "US": "United States of America",
    "UK": "United Kingdom",
    "United Kingdom": "United Kingdom",
    "Britain": "United Kingdom",
    "China": "China",
    "Cuba": "Cuba",
    "Vietnam": "Vietnam, Democratic Republic of",
    "Italy": "Italy/Sardinia",
    "Spain": "Spain",
    "Mexico": "Mexico",
    "Argentina": "Argentina",
    "Chile": "Chile",
    "Brazil": "Brazil",
    "India": "India",
    "South Africa": "South Africa",
    "Algeria": "Algeria",
    "Angola": "Angola",
    "Mozambique": "Mozambique",
    "Zimbabwe": "Zimbabwe (Rhodesia)",
    "Ghana": "Ghana",
    "Guinea-Bissau": "Guinea-Bissau",
    "Poland": "Poland",
    "Hungary": "Hungary",
    "Czechoslovakia": "Czech Republic",
    "Yugoslavia": "Yugoslavia",
    "Greece": "Greece",
    "Portugal": "Portugal",
    "Nicaragua": "Nicaragua",
    "El Salvador": "El Salvador",
    "Guatemala": "Guatemala",
    "Colombia": "Colombia",
    "Peru": "Peru",
    "Bolivia": "Bolivia",
    "Venezuela": "Venezuela",
    "Ecuador": "Ecuador",
    "Haiti": "Haiti",
    "Dominican Republic": "Dominican Republic",
    "Jamaica": "Jamaica",
    "Canada": "Canada",
    "Australia": "Australia",
    "New Zealand": "New Zealand",
    "Ireland": "Ireland",
    "Korea": "Korea, Republic of",
    "North Korea": "Korea, People's Republic of",
    "South Korea": "Korea, Republic of",
    "Japan": "Japan",
    "Indonesia": "Indonesia",
    "Philippines": "Philippines",
    "Malaysia": "Malaysia",
    "Singapore": "Singapore",
    "Thailand": "Thailand",
    "Myanmar": "Myanmar (Burma)",
    "Burma": "Myanmar (Burma)",
    "Afghanistan": "Afghanistan",
    "Iran": "Iran (Persia)",
    "Iraq": "Iraq",
    "Syria": "Syria",
    "Egypt": "Egypt",
    "Libya": "Libya",
    "Tunisia": "Tunisia",
    "Morocco": "Morocco",
    "Ethiopia": "Ethiopia",
    "Kenya": "Kenya",
    "Tanzania": "Tanzania (Tanganyika)",
    "Uganda": "Uganda",
    "Nigeria": "Nigeria",
    "Senegal": "Senegal",
    "Congo": "Congo, Democratic Republic of (Zaire)",
    "DRC": "Congo, Democratic Republic of (Zaire)",
    "Rwanda": "Rwanda",
    "Burkina Faso": "Burkina Faso (Upper Volta)",
    "Martinique": "Martinique",
    "Guyana": "Guyana",
    "Trinidad": "Trinidad and Tobago",
    "Slovenia": "Slovenia",
    "Serbia": "Serbia",
    "Croatia": "Croatia",
    "Bosnia": "Bosnia-Herzegovina",
    "Ukraine": "Ukraine",
    "Belarus": "Belarus (Byelorussia)",
    "Georgia": "Georgia",
    "Armenia": "Armenia",
    "Azerbaijan": "Azerbaijan",
    "Kazakhstan": "Kazakhstan",
    "Uzbekistan": "Uzbekistan",
    "Sweden": "Sweden",
    "Norway": "Norway",
    "Finland": "Finland",
    "Denmark": "Denmark",
    "Netherlands": "Netherlands",
    "Belgium": "Belgium",
    "Switzerland": "Switzerland",
    "Austria": "Austria",
    "Czech Republic": "Czech Republic",
    "Slovakia": "Slovakia",
    "Romania": "Rumania",
    "Bulgaria": "Bulgaria",
    "Turkey": "Turkey (Ottoman Empire)",
    "Israel": "Israel",
    "Lebanon": "Lebanon",
    "Jordan": "Jordan",
    "Saudi Arabia": "Saudi Arabia",
    "Yemen": "Yemen (Arab Republic of Yemen)",
    "Pakistan": "Pakistan",
    "Bangladesh": "Bangladesh",
    "Sri Lanka": "Sri Lanka (Ceylon)",
    "Nepal": "Nepal",
}

# People to country mappings
PEOPLE_COUNTRIES = {
    "Karl Marx": "Germany",
    "Friedrich Engels": "Germany",
    "Vladimir Lenin": "Russia",
    "Leon Trotsky": "Russia",
    "Rosa Luxemburg": "Germany",
    "Antonio Gramsci": "Italy",
    "Mao Zedong": "China",
    "Che Guevara": "Argentina",
    "Fidel Castro": "Cuba",
    "Mikhail Bakunin": "Russia",
    "Peter Kropotkin": "Russia",
    "Emma Goldman": "USA",
    "Pierre-Joseph Proudhon": "France",
    "Errico Malatesta": "Italy",
    "Nestor Makhno": "Ukraine",
    "Buenaventura Durruti": "Spain",
    "Hugo Chavez": "Venezuela",
    "Evo Morales": "Bolivia",
    "Subcomandante Marcos": "Mexico",
    "Patrice Lumumba": "Congo",
    "Nelson Mandela": "South Africa",
    "Kwame Nkrumah": "Ghana",
    "Amilcar Cabral": "Guinea-Bissau",
    "Julius Nyerere": "Tanzania",
    "Thomas Sankara": "Burkina Faso",
    "Josip Broz Tito": "Yugoslavia",
    "Ho Chi Minh": "Vietnam",
    "Kim Il-sung": "North Korea",
    "Salvador Allende": "Chile",
    "Jean Jaures": "France",
    "August Bebel": "Germany",
    "Karl Kautsky": "Germany",
    "Eduard Bernstein": "Germany",
    "Karl Liebknecht": "Germany",
    "Eugene V. Debs": "USA",
    "Mother Jones": "USA",
    "Big Bill Haywood": "USA",
    "Joe Hill": "USA",
    "Cesar Chavez": "USA",
    "Dolores Huerta": "USA",
    "Clara Zetkin": "Germany",
    "Alexandra Kollontai": "Russia",
    "Nadezhda Krupskaya": "Russia",
    "Inessa Armand": "Russia",
    "Assata Shakur": "USA",
    "Angela Davis": "USA",
    "Frantz Fanon": "Martinique",
    "Aime Cesaire": "Martinique",
    "Samora Machel": "Mozambique",
    "Agostinho Neto": "Angola",
    "Cabral Amilcar": "Guinea-Bissau",
    "Walter Rodney": "Guyana",
    "Cornel West": "USA",
    "Naomi Klein": "Canada",
    "Slavoj Zizek": "Slovenia",
    "David Graeber": "USA",
    "Yanis Varoufakis": "Greece",
    "Jeremy Corbyn": "UK",
    "Jean-Luc Melenchon": "France",
    "Pablo Iglesias": "Spain",
    "Noam Chomsky": "USA",
    "Bernie Sanders": "USA",
    "Alexandria Ocasio-Cortez": "USA",
    "Martin Luther King Jr.": "USA",
    "Malcolm X": "USA",
    "W.E.B. Du Bois": "USA",
    "Frederick Douglass": "USA",
    "Harriet Tubman": "USA",
}

# Events to country mappings
EVENTS_COUNTRIES = {
    "Haymarket Affair": "USA",
    "Triangle Shirtwaist Factory Fire": "USA",
    "Ludlow Massacre": "USA",
    "Seattle General Strike": "USA",
    "Winnipeg General Strike": "Canada",
    "Battle of Blair Mountain": "USA",
    "UK General Strike": "UK",
    "Flint Sit-Down Strike": "USA",
    "Memphis Sanitation Strike": "USA",
    "Delano Grape Strike": "USA",
    "Haitian Revolution": "Haiti",
    "Revolutions of 1848": "France",
    "Hungarian Revolution of 1956": "Hungary",
    "Prague Spring": "Czech Republic",
    "Portuguese Carnation Revolution": "Portugal",
    "Iranian Revolution": "Iran",
    "Sandinista Revolution": "Nicaragua",
    "Solidarity Movement Founded": "Poland",
    "Zapatista Uprising": "Mexico",
    "Arab Spring Begins": "Tunisia",
    "Indian Independence": "India",
    "Indonesian Independence": "Indonesia",
    "Algerian Independence": "Algeria",
    "Angolan Independence": "Angola",
    "Mozambique Independence": "Mozambique",
    "Zimbabwe Independence": "Zimbabwe",
    "March on Washington": "USA",
    "Stonewall Riots": "USA",
    "Wounded Knee Occupation": "USA",
    "Soweto Uprising": "South Africa",
    "Tiananmen Square Protests": "China",
    "Battle of Seattle": "USA",
    "Occupy Wall Street": "USA",
    "Black Lives Matter Founded": "USA",
    "Great Depression Begins": "USA",
    "Bretton Woods Conference": "USA",
    "Chilean Economic Crisis": "Chile",
    "Global Financial Crisis": "USA",
    "Russian Revolution": "Russia",
    "October Revolution": "Russia",
    "Paris Commune": "France",
    "French Revolution": "France",
    "Spanish Civil War": "Spain",
    "Cuban Revolution": "Cuba",
    "Chinese Revolution": "China",
    "May 1968": "France",
}

# Conflicts to countries
CONFLICTS_COUNTRIES = {
    "Syrian Civil War": ["Syria"],
    "Yemen Civil War": ["Yemen"],
    "Russo-Ukrainian War": ["Ukraine", "Russia"],
    "Ethiopian Civil War": ["Ethiopia"],
    "Myanmar Civil War": ["Myanmar"],
    "Korean War": ["South Korea", "North Korea", "USA", "China"],
    "Vietnam War": ["Vietnam", "USA"],
    "Angolan Civil War": ["Angola"],
    "Mozambican Civil War": ["Mozambique"],
    "Afghan-Soviet War": ["Afghanistan", "Russia"],
    "Salvadoran Civil War": ["El Salvador"],
    "Nicaraguan Contra War": ["Nicaragua", "USA"],
    "Guatemalan Civil War": ["Guatemala"],
    "Yugoslav Wars": ["Yugoslavia"],
    "Rwandan Civil War & Genocide": ["Rwanda"],
    "First Chechen War": ["Russia"],
    "Second Chechen War": ["Russia"],
    "War in Afghanistan": ["Afghanistan", "USA"],
    "Iraq War": ["Iraq", "USA"],
    "Libyan Civil War": ["Libya"],
    "Colombian Conflict": ["Colombia"],
    "Peruvian Internal Conflict": ["Peru"],
    "Spanish Civil War": ["Spain"],
    "Chinese Civil War": ["China"],
    "Greek Civil War": ["Greece"],
}

async def get_country_id(session, country_name: str) -> str:
    """Get country ID from name."""
    result = await session.execute(
        text("""
            SELECT id FROM countries 
            WHERE name_en = :name 
            AND (valid_to IS NULL OR valid_to > '2000-01-01')
            ORDER BY valid_to DESC NULLS FIRST
            LIMIT 1
        """),
        {"name": country_name}
    )
    row = result.fetchone()
    if row:
        return str(row[0])
    return None

async def link_people_to_countries():
    count = 0
    async with async_session_maker() as session:
        for person_name, country_key in PEOPLE_COUNTRIES.items():
            country_name = COUNTRY_MAPPINGS.get(country_key, country_key)
            country_id = await get_country_id(session, country_name)
            
            if not country_id:
                print(f"  [SKIP] Country not found: {country_name} for {person_name}")
                continue
            
            result = await session.execute(
                text("UPDATE people SET primary_country_id = :country_id WHERE name = :name AND primary_country_id IS NULL"),
                {"country_id": country_id, "name": person_name}
            )
            if result.rowcount > 0:
                count += 1
                print(f"  Linked: {person_name} -> {country_name}")
        
        await session.commit()
    return count

async def link_events_to_countries():
    count = 0
    async with async_session_maker() as session:
        for event_title, country_key in EVENTS_COUNTRIES.items():
            country_name = COUNTRY_MAPPINGS.get(country_key, country_key)
            country_id = await get_country_id(session, country_name)
            
            if not country_id:
                print(f"  [SKIP] Country not found: {country_name} for {event_title}")
                continue
            
            result = await session.execute(
                text("SELECT id FROM events WHERE title = :title"),
                {"title": event_title}
            )
            row = result.fetchone()
            if not row:
                continue
            
            event_id = str(row[0])
            
            result = await session.execute(
                text("SELECT 1 FROM event_country_association WHERE event_id = :event_id AND country_id = :country_id"),
                {"event_id": event_id, "country_id": country_id}
            )
            if result.fetchone():
                continue
            
            await session.execute(
                text("INSERT INTO event_country_association (event_id, country_id, role) VALUES (:event_id, :country_id, 'primary')"),
                {"event_id": event_id, "country_id": country_id}
            )
            
            await session.execute(
                text("UPDATE events SET primary_country_id = :country_id WHERE id = :event_id AND primary_country_id IS NULL"),
                {"country_id": country_id, "event_id": event_id}
            )
            
            count += 1
            print(f"  Linked: {event_title} -> {country_name}")
        
        await session.commit()
    return count

async def link_conflicts_to_countries():
    count = 0
    async with async_session_maker() as session:
        for conflict_name, countries in CONFLICTS_COUNTRIES.items():
            result = await session.execute(
                text("SELECT id FROM conflicts WHERE name = :name"),
                {"name": conflict_name}
            )
            row = result.fetchone()
            if not row:
                continue
            
            conflict_id = str(row[0])
            
            for i, country_key in enumerate(countries):
                country_name = COUNTRY_MAPPINGS.get(country_key, country_key)
                country_id = await get_country_id(session, country_name)
                
                if not country_id:
                    print(f"  [SKIP] Country not found: {country_name} for {conflict_name}")
                    continue
                
                result = await session.execute(
                    text("SELECT 1 FROM conflict_participants WHERE conflict_id = :conflict_id AND country_id = :country_id"),
                    {"conflict_id": conflict_id, "country_id": country_id}
                )
                if result.fetchone():
                    continue
                
                side = "side_a" if i == 0 else "side_b"
                await session.execute(
                    text("""
                        INSERT INTO conflict_participants (id, conflict_id, country_id, actor_name, side, role)
                        VALUES (:id, :conflict_id, :country_id, :actor_name, :side, 'belligerent')
                    """),
                    {
                        "id": str(uuid.uuid4()),
                        "conflict_id": conflict_id,
                        "country_id": country_id,
                        "actor_name": country_name,
                        "side": side
                    }
                )
                count += 1
                print(f"  Linked: {conflict_name} -> {country_name}")
        
        await session.commit()
    return count

async def main():
    print("=" * 60)
    print("LINKING DATA TO COUNTRIES")
    print("=" * 60)
    
    print("\n1. Linking people to countries...")
    people_count = await link_people_to_countries()
    print(f"   Linked {people_count} people")
    
    print("\n2. Linking events to countries...")
    events_count = await link_events_to_countries()
    print(f"   Linked {events_count} events")
    
    print("\n3. Linking conflicts to countries...")
    conflicts_count = await link_conflicts_to_countries()
    print(f"   Linked {conflicts_count} conflict participants")
    
    print("\n" + "=" * 60)
    print(f"TOTAL: {people_count + events_count + conflicts_count} links created")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
