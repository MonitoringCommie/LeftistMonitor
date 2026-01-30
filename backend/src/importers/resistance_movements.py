"""
Liberation/Resistance Movements Importer

Documents resistance movements, liberation organizations, and national liberation fronts
fighting against colonialism, occupation, and imperialism worldwide.

These movements represent the organized response of oppressed peoples to occupation
and settler colonialism. This database tracks them for educational purposes and to
document the history of anti-colonial resistance.

Note on "terrorist" designations: We track which imperial powers have designated
these movements as "terrorist" organizations. Such designations are political tools
often used to delegitimize resistance to occupation. International law recognizes
the right of peoples under occupation to resist, including through armed struggle.
"""
import asyncio
from datetime import date
from uuid import uuid4
from sqlalchemy import text
from ..database import async_session_maker


# First define occupations that these movements resist
OCCUPATIONS = [
    {
        "name": "Israeli occupation of Palestine",
        "occupied_territory": "Palestine (West Bank, Gaza Strip, East Jerusalem)",
        "occupied_people": "Palestinians",
        "start_date": "1967-06-05",
        "occupation_type": "settler_colonial",
        "international_law_status": "Illegal occupation under international law",
        "un_resolutions": ["242", "338", "446", "452", "465", "476", "478", "2334"],
        "description": "Israeli military occupation of Palestinian territories captured in 1967 Six-Day War, accompanied by ongoing settler colonialism, land confiscation, and population transfer.",
        "progressive_analysis": "The occupation represents a continuation of the Zionist settler colonial project begun before 1948. It is maintained through military force, apartheid policies, and the systematic denial of Palestinian self-determination. International law is clear: the occupation is illegal and Palestinians have the right to resist.",
    },
    {
        "name": "Historic British occupation of Palestine",
        "occupied_territory": "Mandatory Palestine",
        "occupied_people": "Palestinians",
        "start_date": "1920-07-01",
        "end_date": "1948-05-14",
        "occupation_type": "colonial_mandate",
        "international_law_status": "League of Nations Mandate",
        "un_resolutions": ["181"],
        "description": "British Mandate over Palestine following WWI, during which Britain facilitated Zionist colonization through the Balfour Declaration.",
        "progressive_analysis": "British colonialism enabled Zionist settler colonialism, laying the groundwork for the Nakba and ongoing dispossession of Palestinians.",
    },
    {
        "name": "British occupation of Ireland",
        "occupied_territory": "Ireland / Northern Ireland",
        "occupied_people": "Irish",
        "start_date": "1169-01-01",
        "occupation_type": "settler_colonial",
        "international_law_status": "Partition recognized by treaty (contested)",
        "description": "Centuries of British colonial rule over Ireland, including plantation of settlers, penal laws, famines caused by colonial extraction, and partition.",
        "progressive_analysis": "British colonialism in Ireland established the template for later settler colonial projects. The ongoing partition of Ireland and British rule in the North represents unfinished decolonization.",
    },
    {
        "name": "Moroccan occupation of Western Sahara",
        "occupied_territory": "Western Sahara",
        "occupied_people": "Sahrawi",
        "start_date": "1975-11-06",
        "occupation_type": "military_occupation",
        "international_law_status": "Non-Self-Governing Territory under UN",
        "un_resolutions": ["3458"],
        "description": "Moroccan military occupation of Western Sahara following Spanish withdrawal, including construction of a 2,700km sand wall and displacement of Sahrawi people.",
        "progressive_analysis": "Western Sahara represents Africa's last colony. Morocco's occupation, supported by France and the US, denies the Sahrawi people their right to self-determination despite ICJ advisory opinion.",
    },
    {
        "name": "Turkish occupation of Kurdistan",
        "occupied_territory": "North Kurdistan (Southeast Turkey)",
        "occupied_people": "Kurds",
        "start_date": "1923-07-24",
        "occupation_type": "internal_colonialism",
        "international_law_status": "Disputed - Turkey denies Kurdish national rights",
        "description": "Turkish state suppression of Kurdish national identity, language, and political expression, including military operations against Kurdish areas.",
        "progressive_analysis": "Kurdish struggle represents resistance to internal colonialism and the denial of national self-determination. The Turkish state has waged war against Kurdish civilians and political movements.",
    },
    {
        "name": "Apartheid South Africa",
        "occupied_territory": "South Africa",
        "occupied_people": "Black South Africans",
        "start_date": "1948-05-26",
        "end_date": "1994-04-27",
        "occupation_type": "settler_colonial_apartheid",
        "international_law_status": "Crime against humanity (apartheid)",
        "un_resolutions": ["1761", "181"],
        "description": "Systematic racial segregation and white minority rule over the Black majority population.",
        "progressive_analysis": "Apartheid South Africa was a settler colonial state that maintained white supremacy through violence and legal discrimination. International solidarity and armed resistance combined to end it.",
    },
    {
        "name": "US-backed dictatorships in Latin America",
        "occupied_territory": "Various Latin American countries",
        "occupied_people": "Latin American peoples",
        "start_date": "1954-06-18",
        "occupation_type": "neo_colonial",
        "international_law_status": "Violations of sovereignty",
        "description": "US-supported coups and military dictatorships across Latin America as part of Cold War policy and protection of US economic interests.",
        "progressive_analysis": "US imperialism in Latin America has overthrown democratic governments, supported death squads, and maintained economic exploitation. Resistance movements arose in response.",
    },
]


# Liberation and resistance movements
RESISTANCE_MOVEMENTS = [
    # PALESTINIAN MOVEMENTS
    {
        "name": "Palestine Liberation Organization",
        "name_native": "Munazzamat at-Tahrir al-Filastiniyya",
        "abbreviation": "PLO",
        "region": "Palestine",
        "occupation_name": "Israeli occupation of Palestine",
        "founded_date": "1964-06-02",
        "ideology_tags": ["nationalist", "anti-colonial", "secular", "third-worldist"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": ["Israel (historically)", "US (removed 1991)"],
        "wikidata_id": "Q133800",
        "description": "Umbrella organization for Palestinian national movement, recognized by UN as sole legitimate representative of Palestinian people. Founded in Cairo with support from Arab League.",
        "progressive_analysis": "The PLO united various Palestinian factions in the struggle for national liberation. Its recognition by the UN affirmed Palestinian right to self-determination. The Oslo Accords transformed it into the Palestinian Authority, which critics argue compromised the liberation struggle.",
    },
    {
        "name": "Fatah",
        "name_native": "Harakat al-Tahrir al-Watani al-Filastini",
        "abbreviation": "Fatah",
        "region": "Palestine",
        "occupation_name": "Israeli occupation of Palestine",
        "founded_date": "1959-10-10",
        "ideology_tags": ["nationalist", "anti-colonial", "secular"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": ["Israel"],
        "wikidata_id": "Q79846",
        "description": "Largest faction of PLO, founded by Yasser Arafat and others. Name is reverse acronym meaning conquest or opening. Became dominant force in Palestinian politics.",
        "progressive_analysis": "Fatah pioneered armed struggle for Palestinian liberation and internationalized the Palestinian cause. After Oslo, it evolved into the governing party of the PA, leading some to criticize its accommodation with occupation.",
    },
    {
        "name": "Popular Front for the Liberation of Palestine",
        "name_native": "al-Jabha al-Shabiyya li-Tahrir Filastin",
        "abbreviation": "PFLP",
        "region": "Palestine",
        "occupation_name": "Israeli occupation of Palestine",
        "founded_date": "1967-12-11",
        "ideology_tags": ["marxist-leninist", "anti-colonial", "anti-imperialist", "socialist", "secular"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": ["US", "EU", "Canada", "Israel"],
        "wikidata_id": "Q207514",
        "description": "Marxist-Leninist Palestinian faction founded by George Habash. Second-largest PLO faction. Combined Palestinian national liberation with broader anti-imperialist analysis.",
        "progressive_analysis": "The PFLP brought class analysis to Palestinian struggle, linking Palestinian liberation to global anti-imperialist movements. It opposed Oslo as capitulation and maintains that armed resistance is legitimate under occupation.",
    },
    {
        "name": "Democratic Front for the Liberation of Palestine",
        "name_native": "al-Jabha al-Dimuqratiyya li-Tahrir Filastin",
        "abbreviation": "DFLP",
        "region": "Palestine",
        "occupation_name": "Israeli occupation of Palestine",
        "founded_date": "1969-02-22",
        "ideology_tags": ["marxist", "anti-colonial", "democratic_socialist", "secular"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": ["US", "Israel"],
        "wikidata_id": "Q696029",
        "description": "Split from PFLP, led by Nayef Hawatmeh. First Palestinian faction to call for two-state solution and dialogue with Israeli left.",
        "progressive_analysis": "The DFLP represents the Marxist democratic tradition within Palestinian politics, emphasizing mass mobilization and political organizing alongside armed struggle.",
    },
    {
        "name": "Hamas",
        "name_native": "Harakat al-Muqawama al-Islamiyya",
        "abbreviation": "Hamas",
        "region": "Palestine",
        "occupation_name": "Israeli occupation of Palestine",
        "founded_date": "1987-12-14",
        "ideology_tags": ["islamist", "nationalist", "anti-colonial"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": ["US", "EU", "UK", "Canada", "Israel", "Japan", "Australia"],
        "wikidata_id": "Q29322",
        "description": "Palestinian Islamic resistance movement founded during First Intifada. Grew from Muslim Brotherhood. Governs Gaza Strip since 2007.",
        "progressive_analysis": "Hamas emerged from frustration with PLO compromise and secular nationalism failure to end occupation. While Islamist, it represents authentic Palestinian resistance. Imperial terrorist designations serve to delegitimize all Palestinian resistance and justify collective punishment of Gaza.",
    },
    {
        "name": "Palestinian Islamic Jihad",
        "name_native": "Harakat al-Jihad al-Islami fi Filastin",
        "abbreviation": "PIJ",
        "region": "Palestine",
        "occupation_name": "Israeli occupation of Palestine",
        "founded_date": "1981-01-01",
        "ideology_tags": ["islamist", "anti-colonial", "anti-zionist"],
        "has_armed_wing": True,
        "has_political_wing": False,
        "designated_terrorist_by": ["US", "EU", "UK", "Israel", "Canada", "Australia", "Japan"],
        "wikidata_id": "Q223855",
        "description": "Palestinian Islamist movement focused on armed resistance. Founded by Fathi Shaqaqi. Smaller than Hamas but significant military capability.",
        "progressive_analysis": "PIJ maintains focus on armed resistance without political compromise, representing continued Palestinian refusal to accept occupation.",
    },

    # IRISH MOVEMENTS
    {
        "name": "Irish Republican Brotherhood",
        "name_native": "Brawthreachas Phoibliocht na hEireann",
        "abbreviation": "IRB",
        "region": "Ireland",
        "occupation_name": "British occupation of Ireland",
        "founded_date": "1858-03-17",
        "dissolved_date": "1924-01-01",
        "ideology_tags": ["republican", "nationalist", "anti-colonial"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": ["British Empire"],
        "wikidata_id": "Q468093",
        "description": "Secret revolutionary organization dedicated to establishing an independent Irish republic. Also known as the Fenians. Organized 1916 Easter Rising.",
        "progressive_analysis": "The IRB represented the revolutionary tradition in Irish politics, maintaining the goal of complete independence through physical force when constitutional methods failed.",
    },
    {
        "name": "Irish Volunteers",
        "name_native": "Oglaigh na hEireann",
        "abbreviation": None,
        "region": "Ireland",
        "occupation_name": "British occupation of Ireland",
        "founded_date": "1913-11-25",
        "dissolved_date": "1919-01-01",
        "ideology_tags": ["republican", "nationalist", "anti-colonial"],
        "has_armed_wing": True,
        "has_political_wing": False,
        "designated_terrorist_by": ["British Empire"],
        "wikidata_id": "Q1192511",
        "description": "Irish nationalist military organization formed in response to Ulster Volunteers. Carried out 1916 Easter Rising. Became the IRA.",
        "progressive_analysis": "The Irish Volunteers represented the militarization of the independence movement in response to unionist threats and British intransigence.",
    },
    {
        "name": "Irish Republican Army",
        "name_native": "Oglaigh na hEireann",
        "abbreviation": "IRA",
        "region": "Ireland",
        "occupation_name": "British occupation of Ireland",
        "founded_date": "1919-01-21",
        "dissolved_date": "1969-12-01",
        "ideology_tags": ["republican", "nationalist", "anti-colonial", "socialist"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": ["UK", "Ireland (after civil war)"],
        "wikidata_id": "Q177477",
        "description": "Military arm of the Irish independence movement. Fought War of Independence (1919-1921) against British forces. Split over Anglo-Irish Treaty.",
        "progressive_analysis": "The IRA waged a successful guerrilla war against British colonialism, forcing Britain to negotiate. The civil war split reflected tensions between pragmatic compromise and principled republicanism.",
    },
    {
        "name": "Provisional Irish Republican Army",
        "name_native": "Oglaigh na hEireann",
        "abbreviation": "PIRA",
        "region": "Ireland",
        "occupation_name": "British occupation of Ireland",
        "founded_date": "1969-12-01",
        "dissolved_date": "2005-07-28",
        "ideology_tags": ["republican", "nationalist", "socialist", "anti-colonial"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": ["UK", "Ireland", "US"],
        "wikidata_id": "Q241749",
        "description": "Split from Official IRA in 1969. Conducted armed campaign against British rule in Northern Ireland until 1997 ceasefire and 2005 decommissioning.",
        "progressive_analysis": "The Provisional IRA emerged in response to British state violence against nationalist communities during the Troubles. While the armed campaign was controversial, it forced Britain to negotiate and ultimately led to the Good Friday Agreement.",
    },
    {
        "name": "Irish National Liberation Army",
        "name_native": "Arm Saoirse Naisiunta na hEireann",
        "abbreviation": "INLA",
        "region": "Ireland",
        "occupation_name": "British occupation of Ireland",
        "founded_date": "1974-12-08",
        "dissolved_date": "2009-10-11",
        "ideology_tags": ["republican", "marxist", "socialist", "anti-colonial"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": ["UK", "Ireland", "US"],
        "wikidata_id": "Q722406",
        "description": "Marxist paramilitary group split from Official IRA. Armed wing of Irish Republican Socialist Party. Conducted armed campaign until ceasefire.",
        "progressive_analysis": "The INLA combined Irish republicanism with explicit Marxism, arguing that national liberation required socialist transformation of Irish society.",
    },
    {
        "name": "Sinn Fein",
        "name_native": "Sinn Fein",
        "abbreviation": "SF",
        "region": "Ireland",
        "occupation_name": "British occupation of Ireland",
        "founded_date": "1905-11-28",
        "ideology_tags": ["republican", "socialist", "nationalist", "anti-colonial", "democratic_socialist"],
        "has_armed_wing": False,
        "has_political_wing": True,
        "designated_terrorist_by": [],
        "wikidata_id": "Q215478",
        "description": "Irish republican political party. Name means We Ourselves. Historically linked to IRA. Now largest nationalist party in both Irish jurisdictions.",
        "progressive_analysis": "Sinn Fein evolved from revolutionary organization to constitutional political party while maintaining goal of Irish unity. Its electoral success shows that republican politics can achieve gains through peaceful means after armed struggle forced British compromise.",
    },

    # WESTERN SAHARA
    {
        "name": "Polisario Front",
        "name_native": "Frente Popular de Liberacion de Saguia el Hamra y Rio de Oro",
        "abbreviation": "POLISARIO",
        "region": "Western Sahara",
        "occupation_name": "Moroccan occupation of Western Sahara",
        "founded_date": "1973-05-10",
        "ideology_tags": ["nationalist", "anti-colonial", "socialist", "secular"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": ["Morocco"],
        "wikidata_id": "Q187879",
        "description": "Liberation movement of Sahrawi people seeking independence from Morocco. Governs Sahrawi Arab Democratic Republic in exile and liberated territories.",
        "progressive_analysis": "Polisario represents one of Africa last anti-colonial struggles. Despite UN recognition of Sahrawi right to self-determination, Morocco occupation continues with Western support, showing the limits of international law when imperial interests are at stake.",
    },

    # KURDISH MOVEMENTS
    {
        "name": "Kurdistan Workers Party",
        "name_native": "Partiya Karkeren Kurdistane",
        "abbreviation": "PKK",
        "region": "Kurdistan",
        "occupation_name": "Turkish occupation of Kurdistan",
        "founded_date": "1978-11-27",
        "ideology_tags": ["socialist", "marxist-leninist", "democratic_confederalism", "feminist", "anti-colonial"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": ["Turkey", "US", "EU", "UK", "NATO"],
        "wikidata_id": "Q208061",
        "description": "Kurdish militant and political organization founded by Abdullah Ocalan. Initially Marxist-Leninist, evolved toward democratic confederalism. Fights for Kurdish rights in Turkey.",
        "progressive_analysis": "The PKK emerged from Turkish state repression of Kurdish identity. Its evolution toward democratic confederalism and women liberation offers an alternative model of revolutionary politics beyond nation-state formation.",
    },
    {
        "name": "Peoples Protection Units / Womens Protection Units",
        "name_native": "Yekineyen Parastina Gel / Yekineyen Parastina Jin",
        "abbreviation": "YPG/YPJ",
        "region": "Kurdistan",
        "occupation_name": "Turkish occupation of Kurdistan",
        "founded_date": "2004-01-01",
        "ideology_tags": ["democratic_confederalism", "feminist", "socialist", "anti-fascist", "secular"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": ["Turkey"],
        "wikidata_id": "Q862393",
        "description": "Armed forces of Rojava (Autonomous Administration of North and East Syria). YPG is mixed-gender, YPJ is all-women units. Defeated ISIS with minimal international support.",
        "progressive_analysis": "The YPG/YPJ represents a revolutionary experiment in democratic confederalism, women liberation, and multi-ethnic coexistence. Their victory over ISIS while building a feminist, ecological, democratic society offers hope for alternative futures.",
    },

    # SOUTH AFRICAN MOVEMENTS
    {
        "name": "African National Congress",
        "name_native": None,
        "abbreviation": "ANC",
        "region": "South Africa",
        "occupation_name": "Apartheid South Africa",
        "founded_date": "1912-01-08",
        "ideology_tags": ["nationalist", "anti-apartheid", "social_democratic", "anti-colonial"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": ["US (until 2008)", "UK (until 1990)", "Apartheid South Africa"],
        "wikidata_id": "Q83162",
        "description": "South African liberation movement founded 1912. Led anti-apartheid struggle. Nelson Mandela was key leader. Governing party since 1994.",
        "progressive_analysis": "The ANC united African resistance to apartheid and settler colonialism. Its designation as terrorist by the US and UK while apartheid continued shows how imperial powers use the label to delegitimize liberation movements.",
    },
    {
        "name": "Umkhonto we Sizwe",
        "name_native": "Umkhonto we Sizwe",
        "abbreviation": "MK",
        "region": "South Africa",
        "occupation_name": "Apartheid South Africa",
        "founded_date": "1961-12-16",
        "dissolved_date": "1994-04-27",
        "ideology_tags": ["nationalist", "socialist", "anti-apartheid", "anti-colonial"],
        "has_armed_wing": True,
        "has_political_wing": False,
        "designated_terrorist_by": ["Apartheid South Africa", "US", "UK"],
        "wikidata_id": "Q583523",
        "description": "Armed wing of ANC founded by Nelson Mandela. Name means Spear of the Nation. Conducted sabotage campaign against apartheid infrastructure.",
        "progressive_analysis": "MK was formed after Sharpeville massacre demonstrated that peaceful protest would be met with state violence. Armed resistance was a legitimate response to apartheid terror.",
    },
    {
        "name": "Pan Africanist Congress",
        "name_native": None,
        "abbreviation": "PAC",
        "region": "South Africa",
        "occupation_name": "Apartheid South Africa",
        "founded_date": "1959-04-06",
        "ideology_tags": ["pan-africanist", "anti-apartheid", "nationalist", "anti-colonial"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": ["Apartheid South Africa"],
        "wikidata_id": "Q1326830",
        "description": "Pan-Africanist liberation movement split from ANC. Organized Sharpeville protest. More radical African nationalist position than ANC.",
        "progressive_analysis": "PAC represented the Africanist current in South African liberation politics, emphasizing African leadership and land reclamation over multiracial coalition.",
    },

    # LATIN AMERICAN MOVEMENTS
    {
        "name": "Sandinista National Liberation Front",
        "name_native": "Frente Sandinista de Liberacion Nacional",
        "abbreviation": "FSLN",
        "region": "Latin America",
        "occupation_name": "US-backed dictatorships in Latin America",
        "founded_date": "1961-07-23",
        "ideology_tags": ["socialist", "anti-imperialist", "nationalist", "liberation_theology"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": ["US (Reagan era)"],
        "wikidata_id": "Q188941",
        "description": "Nicaraguan revolutionary movement that overthrew Somoza dictatorship in 1979. Named after Augusto Sandino. Governed Nicaragua 1979-1990 and 2007-present.",
        "progressive_analysis": "The Sandinista revolution showed that Central American peoples could defeat US-backed dictatorships. Despite US-funded Contra terrorism, the revolution survived and implemented literacy, healthcare, and land reform programs.",
    },
    {
        "name": "Revolutionary Armed Forces of Colombia",
        "name_native": "Fuerzas Armadas Revolucionarias de Colombia - Ejercito del Pueblo",
        "abbreviation": "FARC-EP",
        "region": "Latin America",
        "occupation_name": "US-backed dictatorships in Latin America",
        "founded_date": "1964-05-27",
        "dissolved_date": "2017-06-27",
        "ideology_tags": ["marxist-leninist", "anti-imperialist", "agrarian"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": ["US", "EU", "Colombia"],
        "wikidata_id": "Q184536",
        "description": "Colombian Marxist-Leninist guerrilla movement. Emerged from peasant self-defense. After 2016 peace agreement, transformed into political party Comunes.",
        "progressive_analysis": "FARC emerged from state violence against peasant communities. The conflict must be understood in context of Colombian state terror, US intervention, and extreme land inequality. Peace process represents attempt to address root causes.",
    },
    {
        "name": "Zapatista Army of National Liberation",
        "name_native": "Ejercito Zapatista de Liberacion Nacional",
        "abbreviation": "EZLN",
        "region": "Latin America",
        "occupation_name": "US-backed dictatorships in Latin America",
        "founded_date": "1983-11-17",
        "ideology_tags": ["indigenous_rights", "libertarian_socialist", "anti-neoliberal", "autonomist", "feminist"],
        "has_armed_wing": True,
        "has_political_wing": True,
        "designated_terrorist_by": [],
        "wikidata_id": "Q188958",
        "description": "Indigenous revolutionary movement in Chiapas, Mexico. Rose up on January 1, 1994 against NAFTA. Practices autonomous governance in liberated territories.",
        "progressive_analysis": "The Zapatistas pioneered new forms of revolutionary politics emphasizing autonomy, indigenous rights, and prefigurative politics. Their slogan Para todos todo, para nosotros nada (Everything for everyone, nothing for ourselves) represents radical democratic commitment.",
    },
]



class ResistanceMovementsImporter:
    """Imports liberation and resistance movements data."""

    async def run(self):
        """Run the import process."""
        async with async_session_maker() as session:
            # First import occupations
            occupation_ids = await self._import_occupations(session)

            # Then import movements
            movements_imported = await self._import_movements(session, occupation_ids)

            await session.commit()
            print(f"Import complete: {len(occupation_ids)} occupations, {movements_imported} movements")
            return {"occupations": len(occupation_ids), "movements": movements_imported}

    async def _import_occupations(self, session) -> dict:
        """Import occupation records and return mapping of name to ID."""
        occupation_ids = {}

        for occ in OCCUPATIONS:
            try:
                # Check if exists
                existing = await session.execute(
                    text("SELECT id FROM occupations WHERE name = :name"),
                    {"name": occ["name"]}
                )
                row = existing.first()
                if row:
                    occupation_ids[occ["name"]] = str(row[0])
                    continue

                # Get occupier country ID if applicable
                occupier_id = None
                if "Israel" in occ["name"]:
                    result = await session.execute(
                        text("SELECT id FROM countries WHERE name_en = 'Israel' LIMIT 1")
                    )
                    row = result.first()
                    occupier_id = str(row[0]) if row else None
                elif "British" in occ["name"]:
                    result = await session.execute(
                        text("SELECT id FROM countries WHERE name_en = 'United Kingdom' LIMIT 1")
                    )
                    row = result.first()
                    occupier_id = str(row[0]) if row else None
                elif "Moroccan" in occ["name"]:
                    result = await session.execute(
                        text("SELECT id FROM countries WHERE name_en = 'Morocco' LIMIT 1")
                    )
                    row = result.first()
                    occupier_id = str(row[0]) if row else None
                elif "Turkish" in occ["name"]:
                    result = await session.execute(
                        text("SELECT id FROM countries WHERE name_en = 'Turkey' LIMIT 1")
                    )
                    row = result.first()
                    occupier_id = str(row[0]) if row else None

                occ_id = str(uuid4())
                start_date = date.fromisoformat(occ["start_date"]) if occ.get("start_date") else None
                end_date = date.fromisoformat(occ["end_date"]) if occ.get("end_date") else None

                await session.execute(
                    text("""
                        INSERT INTO occupations (
                            id, name, occupier_country_id, occupied_territory,
                            occupied_people, start_date, end_date, occupation_type,
                            international_law_status, un_resolutions,
                            description, progressive_analysis
                        ) VALUES (
                            :id, :name, :occupier_country_id, :occupied_territory,
                            :occupied_people, :start_date, :end_date, :occupation_type,
                            :international_law_status, :un_resolutions,
                            :description, :progressive_analysis
                        )
                    """),
                    {
                        "id": occ_id,
                        "name": occ["name"],
                        "occupier_country_id": occupier_id,
                        "occupied_territory": occ["occupied_territory"],
                        "occupied_people": occ.get("occupied_people"),
                        "start_date": start_date,
                        "end_date": end_date,
                        "occupation_type": occ.get("occupation_type"),
                        "international_law_status": occ.get("international_law_status"),
                        "un_resolutions": occ.get("un_resolutions"),
                        "description": occ.get("description"),
                        "progressive_analysis": occ.get("progressive_analysis"),
                    }
                )
                occupation_ids[occ["name"]] = occ_id
                print(f"  Imported occupation: {occ['name']}")

            except Exception as e:
                print(f"Error importing occupation {occ.get('name')}: {e}")

        return occupation_ids


    async def _import_movements(self, session, occupation_ids: dict) -> int:
        """Import resistance movement records."""
        imported = 0

        # Get country IDs for linking
        country_ids = {}
        for region in ["Palestine", "Ireland", "Western Sahara", "Kurdistan", "South Africa", "Latin America"]:
            country_name = {
                "Palestine": "Palestine",
                "Ireland": "Ireland",
                "Western Sahara": "Western Sahara",
                "Kurdistan": "Turkey",  # Link to Turkey for now
                "South Africa": "South Africa",
                "Latin America": None,  # Multiple countries
            }.get(region)

            if country_name:
                result = await session.execute(
                    text("SELECT id FROM countries WHERE name_en ILIKE :name LIMIT 1"),
                    {"name": f"%{country_name}%"}
                )
                row = result.first()
                if row:
                    country_ids[region] = str(row[0])

        for mv in RESISTANCE_MOVEMENTS:
            try:
                # Check if exists
                existing = await session.execute(
                    text("SELECT id FROM resistance_movements WHERE name = :name"),
                    {"name": mv["name"]}
                )
                if existing.first():
                    continue

                # Get occupation ID
                occupation_id = occupation_ids.get(mv.get("occupation_name"))

                # Get country ID
                country_id = country_ids.get(mv.get("region"))

                # Handle special cases for Latin America
                if mv["region"] == "Latin America":
                    country_map = {
                        "FSLN": "Nicaragua",
                        "FARC-EP": "Colombia",
                        "EZLN": "Mexico",
                    }
                    country_name = country_map.get(mv.get("abbreviation"))
                    if country_name:
                        result = await session.execute(
                            text("SELECT id FROM countries WHERE name_en = :name LIMIT 1"),
                            {"name": country_name}
                        )
                        row = result.first()
                        if row:
                            country_id = str(row[0])

                mv_id = str(uuid4())
                founded = date.fromisoformat(mv["founded_date"]) if mv.get("founded_date") else None
                dissolved = date.fromisoformat(mv["dissolved_date"]) if mv.get("dissolved_date") else None

                await session.execute(
                    text("""
                        INSERT INTO resistance_movements (
                            id, name, name_native, abbreviation,
                            country_id, occupation_id,
                            founded_date, dissolved_date,
                            ideology_tags, has_armed_wing, has_political_wing,
                            designated_terrorist_by, wikidata_id,
                            description, progressive_analysis
                        ) VALUES (
                            :id, :name, :name_native, :abbreviation,
                            :country_id, :occupation_id,
                            :founded_date, :dissolved_date,
                            :ideology_tags, :has_armed_wing, :has_political_wing,
                            :designated_terrorist_by, :wikidata_id,
                            :description, :progressive_analysis
                        )
                    """),
                    {
                        "id": mv_id,
                        "name": mv["name"],
                        "name_native": mv.get("name_native"),
                        "abbreviation": mv.get("abbreviation"),
                        "country_id": country_id,
                        "occupation_id": occupation_id,
                        "founded_date": founded,
                        "dissolved_date": dissolved,
                        "ideology_tags": mv.get("ideology_tags"),
                        "has_armed_wing": mv.get("has_armed_wing", False),
                        "has_political_wing": mv.get("has_political_wing", False),
                        "designated_terrorist_by": mv.get("designated_terrorist_by"),
                        "wikidata_id": mv.get("wikidata_id"),
                        "description": mv.get("description"),
                        "progressive_analysis": mv.get("progressive_analysis"),
                    }
                )
                imported += 1
                print(f"  Imported movement: {mv['name']}")

            except Exception as e:
                print(f"Error importing movement {mv.get('name')}: {e}")

        return imported



async def main():
    """Main entry point."""
    print("=" * 60)
    print("Liberation/Resistance Movements Importer")
    print("Documenting anti-colonial resistance worldwide")
    print("=" * 60)

    importer = ResistanceMovementsImporter()
    result = await importer.run()

    print("")
    print("Import complete!")
    print(f"  Occupations: {result['occupations']}")
    print(f"  Movements: {result['movements']}")


if __name__ == "__main__":
    asyncio.run(main())
