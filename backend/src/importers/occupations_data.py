"""
Occupations Data Importer
Imports data about major military occupations, settler colonialism, and territorial control worldwide.
Documents ongoing and historical cases of occupation from a progressive/anti-colonial perspective.
"""
import asyncio
from datetime import date
from decimal import Decimal
from typing import Optional
from uuid import uuid4
from sqlalchemy import text
from ..database import async_session_maker


# Country name mappings to match database values
COUNTRY_NAME_MAPPINGS = {
    "Israel": "Israel",
    "Morocco": "Morocco",
    "Turkey": "Turkey (Ottoman Empire)",
    "China": "China",
    "India": "India",
    "Indonesia": "Indonesia",
    "United Kingdom": "United Kingdom",
    "France": "France",
    "South Africa": "South Africa",
    "United States": "United States of America",
    "Russia": "Russia (Soviet Union)",
    "Australia": "Australia",
}


# Major occupations worldwide - documented from progressive/anti-colonial perspective
OCCUPATIONS_DATA = [
    # =========================================================================
    # ISRAEL / PALESTINE
    # =========================================================================
    {
        "name": "Israeli Occupation of Palestinian Territories",
        "occupier_country": "Israel",
        "occupied_territory": "West Bank, Gaza Strip, East Jerusalem, Golan Heights",
        "occupied_people": "Palestinians",
        "start_date": "1967-06-10",
        "end_date": None,  # Ongoing
        "occupation_type": "settler_colonial",
        "international_law_status": "illegal",
        "un_resolutions": [
            "242", "338", "446", "452", "465", "476", "478", "497",
            "592", "605", "607", "608", "636", "641", "672", "673",
            "681", "694", "726", "799", "904", "1322", "1397", "1402",
            "1403", "1405", "1435", "1515", "1544", "1850", "1860",
            "2334"
        ],
        "population_displaced": 750000,  # 1948 Nakba, plus ongoing displacement
        "settlements_built": 300,
        "land_confiscated_km2": Decimal("5860"),  # Approximately 60% of West Bank under full Israeli control
        "wikidata_id": "Q219060",
        "description": """The Israeli occupation of Palestinian territories began following the 1967 
Six-Day War when Israel captured the West Bank (including East Jerusalem), Gaza Strip, Sinai Peninsula, 
and Golan Heights. The occupation has continued for over 55 years, making it one of the longest 
military occupations in modern history. 

Key features include:
- Illegal settlement construction (300+ settlements housing 700,000+ settlers)
- The Separation Wall (ruled illegal by ICJ in 2004)
- 700+ checkpoints and barriers restricting Palestinian movement
- Administrative detention without trial
- Home demolitions (48,000+ structures since 1967)
- Land confiscation and resource control (including 80%+ of water)
- Blockade of Gaza (since 2007)""",
        "progressive_analysis": """From a progressive anti-colonial perspective, the Israeli occupation 
represents one of the clearest examples of ongoing settler colonialism in the 21st century. The 
occupation systematically dispossesses Palestinians through:

1. SETTLER COLONIALISM: Unlike temporary military occupation, Israel has built permanent settlements 
intended to alter the demographic composition of occupied territories, a war crime under the 
Fourth Geneva Convention (Article 49).

2. APARTHEID: Major human rights organizations (Human Rights Watch, Amnesty International, B'Tselem) 
have documented that Israeli policies constitute apartheid - a crime against humanity under 
international law.

3. ETHNIC CLEANSING: The ongoing displacement of Palestinians through home demolitions, permit 
denials, and settlement expansion continues the Nakba (catastrophe) that began in 1948.

4. COLLECTIVE PUNISHMENT: The Gaza blockade, restricting essential goods to 2.3 million people, 
constitutes collective punishment prohibited under international humanitarian law.

The Palestinian struggle for liberation connects to global movements for decolonization, racial 
justice, and indigenous rights. The BDS (Boycott, Divestment, Sanctions) movement draws inspiration 
from the anti-apartheid struggle in South Africa."""
    },

    # =========================================================================
    # MOROCCO / WESTERN SAHARA
    # =========================================================================
    {
        "name": "Moroccan Occupation of Western Sahara",
        "occupier_country": "Morocco",
        "occupied_territory": "Western Sahara (Sahrawi Arab Democratic Republic)",
        "occupied_people": "Sahrawis",
        "start_date": "1975-11-06",
        "end_date": None,  # Ongoing
        "occupation_type": "military",
        "international_law_status": "illegal",
        "un_resolutions": [
            "379", "380", "621", "658", "690", "725", "809", "907",
            "973", "995", "1002", "1017", "1033", "1042", "1056",
            "1084", "1108", "1131", "1163", "1185", "1204", "1224",
            "1238", "1251", "1263", "1292", "1301", "1309", "1324",
            "1349", "1359", "1380", "1394", "1406", "1429", "1469",
            "1495", "1513", "1523", "1541", "1570", "1598", "1634",
            "1675", "1720", "1754", "1783", "1813", "1871", "1920",
            "1979", "2044", "2099", "2152", "2218", "2285", "2351",
            "2414", "2440", "2468", "2494", "2548", "2602", "2654"
        ],
        "population_displaced": 200000,  # Sahrawi refugees in Algeria
        "settlements_built": 0,  # Morocco has encouraged settler migration but not formal settlements
        "land_confiscated_km2": Decimal("266000"),  # Entire territory
        "wikidata_id": "Q219060",
        "description": """Western Sahara was a Spanish colony until 1975. When Spain withdrew, 
Morocco invaded in the 'Green March' of November 1975 and has occupied the territory since. 
The indigenous Sahrawi people have been fighting for independence through the Polisario Front.

Key features:
- The Berm/Sand Wall: A 2,700km fortified sand wall dividing Morocco-controlled areas from Polisario-held territory
- Over 200,000 Sahrawi refugees live in camps in Algeria (Tindouf)
- Morocco controls approximately 80% of the territory
- The UN considers it a Non-Self-Governing Territory awaiting decolonization
- A 1991 ceasefire was supposed to lead to a referendum on independence, never held""",
        "progressive_analysis": """The Western Sahara occupation is Africa's last major colonial 
question and demonstrates how decolonization remains unfinished. Morocco's occupation, supported 
by France and the US, shows how imperial powers continue to enable occupation when it serves 
their interests.

The Sahrawi struggle parallels other anti-colonial movements:
1. The right to self-determination is enshrined in international law
2. Natural resource extraction (phosphates, fishing) benefits the occupier, not the occupied
3. The international community's failure to enforce its own resolutions exposes double standards
4. Women play leading roles in the Polisario Front and Sahrawi society

The Sahrawi people maintain one of the most organized refugee communities in the world, 
with high literacy rates and strong social organization, demonstrating resilience against occupation."""
    },

    # =========================================================================
    # TURKEY / KURDISTAN & NORTHERN SYRIA
    # =========================================================================
    {
        "name": "Turkish Occupation of Kurdish Regions and Northern Syria",
        "occupier_country": "Turkey",
        "occupied_territory": "Northern Syria (Afrin, Ras al-Ayn, Tell Abyad), Northern Cyprus",
        "occupied_people": "Kurds, Syrians, Cypriots",
        "start_date": "1974-07-20",  # Cyprus invasion; Syrian operations began 2016
        "end_date": None,  # Ongoing
        "occupation_type": "military",
        "international_law_status": "disputed",
        "un_resolutions": [
            "353", "354", "355", "357", "358", "359", "360", "541", "550"  # Cyprus-related
        ],
        "population_displaced": 500000,  # Combined Cyprus and Syria
        "settlements_built": 0,
        "land_confiscated_km2": Decimal("8800"),  # Approximate combined territory
        "wikidata_id": None,
        "description": """Turkey occupies two distinct territories:

1. NORTHERN CYPRUS (1974-present): Following a Greek-backed coup attempting to annex Cyprus 
to Greece, Turkey invaded and occupied the northern third of Cyprus. The 'Turkish Republic 
of Northern Cyprus' is recognized only by Turkey.

2. NORTHERN SYRIA (2016-present): Turkey has conducted multiple military operations 
(Euphrates Shield 2016, Olive Branch 2018, Peace Spring 2019) occupying Kurdish-majority 
areas in northern Syria. These operations targeted the Autonomous Administration of North 
and East Syria (Rojava), a democratic experiment in the region.

Turkey also maintains a decades-long military campaign against Kurdish regions within 
its own borders, including the PKK insurgency and suppression of Kurdish political 
and cultural rights.""",
        "progressive_analysis": """Turkey's occupations demonstrate the complexity of 
national liberation struggles:

KURDISTAN: The Kurdish people, numbering 40+ million, are the world's largest stateless 
nation, divided across Turkey, Syria, Iraq, and Iran. The Turkish state has:
- Banned Kurdish language and culture for decades
- Destroyed thousands of Kurdish villages
- Imprisoned Kurdish politicians and journalists
- Labeled all Kurdish resistance as 'terrorism'

ROJAVA: The Autonomous Administration represents a unique experiment in:
- Democratic confederalism (influenced by Murray Bookchin's libertarian municipalism)
- Women's liberation (gender parity in governance, women's militias)
- Multi-ethnic coexistence
- Ecological principles

Turkey's 2019 invasion of Rojava, with US acquiescence, betrayed Kurdish fighters 
who bore the heaviest burden defeating ISIS. This exposes how imperial powers use 
and abandon liberation movements."""
    },

    # =========================================================================
    # CHINA / TIBET
    # =========================================================================
    {
        "name": "Chinese Occupation of Tibet",
        "occupier_country": "China",
        "occupied_territory": "Tibet (Tibetan Autonomous Region and adjacent areas)",
        "occupied_people": "Tibetans",
        "start_date": "1950-10-07",
        "end_date": None,  # Ongoing
        "occupation_type": "military",
        "international_law_status": "disputed",
        "un_resolutions": ["1353", "1723", "2079"],  # General Assembly resolutions
        "population_displaced": 150000,  # Tibetans in exile, primarily in India
        "settlements_built": 0,  # Han Chinese migration encouraged but not formal settlements
        "land_confiscated_km2": Decimal("2500000"),  # Historical Tibet
        "wikidata_id": "Q17252",
        "description": """China's People's Liberation Army invaded Tibet in 1950, annexing 
a territory that had maintained de facto independence since 1913. The Dalai Lama fled 
to India in 1959 following a failed uprising, establishing a government-in-exile 
in Dharamsala.

Key features:
- Destruction of 6,000+ monasteries during Cultural Revolution
- Suppression of Tibetan language, culture, and religion
- Han Chinese migration changing demographic composition
- Extensive military and surveillance infrastructure
- Self-immolation protests by over 150 Tibetans since 2009
- 'Patriotic education' campaigns in monasteries
- Restrictions on movement and communication""",
        "progressive_analysis": """The Tibet question presents complexities for the left:

ON ONE HAND:
- Tibet was a feudal theocracy with serfdom before 1950
- China has invested in infrastructure and raised living standards
- The Dalai Lama has received CIA funding historically

ON THE OTHER HAND:
- Tibetans have the right to self-determination regardless of their previous system
- Cultural genocide is occurring through sinicization policies
- China's 'development' primarily benefits Han settlers and the state
- Religious suppression violates fundamental freedoms
- The 'feudalism' argument has been used by every colonizer

The progressive position supports Tibetan self-determination while acknowledging 
historical complexities. The struggle connects to indigenous rights globally - 
the right of peoples to determine their own future, even if that future 
is imperfect by external standards."""
    },

    # =========================================================================
    # INDIA / KASHMIR
    # =========================================================================
    {
        "name": "Indian Occupation of Kashmir",
        "occupier_country": "India",
        "occupied_territory": "Jammu and Kashmir (Indian-administered)",
        "occupied_people": "Kashmiris",
        "start_date": "1947-10-27",
        "end_date": None,  # Ongoing
        "occupation_type": "military",
        "international_law_status": "disputed",
        "un_resolutions": [
            "38", "39", "47", "51", "80", "91", "96", "98", "122",
            "123", "126", "209", "210", "211", "214", "215", "307"
        ],
        "population_displaced": 100000,  # Kashmiri Pandits and others
        "settlements_built": 0,
        "land_confiscated_km2": Decimal("101387"),  # Indian-administered Kashmir
        "wikidata_id": "Q1322768",
        "description": """Kashmir has been disputed since the 1947 partition of British India. 
India controls approximately 45% (Jammu and Kashmir, Ladakh), Pakistan controls 35% 
(Azad Kashmir, Gilgit-Baltistan), and China controls 20% (Aksai Chin).

Key developments:
- 1947: Maharaja acceded to India amid Pakistani invasion; India promised plebiscite
- 1948-1949: First Kashmir War; UN-mandated ceasefire
- 1965, 1971, 1999: Subsequent wars between India and Pakistan
- 1989-present: Armed insurgency and Indian military crackdown
- 2019: India revoked Article 370, ending Kashmir's special autonomy status

Current situation:
- 700,000+ Indian military personnel in Kashmir (world's most militarized zone)
- Communications blackouts and internet shutdowns
- Detention of political leaders
- Pellet gun injuries blinding civilians
- Enforced disappearances and extrajudicial killings""",
        "progressive_analysis": """Kashmir represents a fundamental failure of postcolonial 
nation-states to address self-determination. The promised plebiscite has never been held 
in 75+ years.

KEY ISSUES:
1. MILITARIZATION: The Indian military operates with impunity under AFSPA (Armed Forces 
Special Powers Act), enabling torture, extrajudicial killing, and rape without accountability.

2. SETTLER COLONIALISM: The 2019 revocation of Article 370 allows non-Kashmiris to buy 
land and settle, potentially changing the demographic character - a pattern seen in 
other occupations.

3. HINDU NATIONALISM: The BJP government's actions reflect Hindu nationalist ideology 
that denies Muslim-majority Kashmir's distinct identity.

4. INTERNATIONAL SILENCE: Unlike Palestine, Kashmir receives little global attention, 
partly due to India's economic importance and 'democratic' image.

Progressives must support Kashmiri self-determination while acknowledging complexities 
including: the displacement of Kashmiri Pandits, Pakistani involvement, and the 
diversity of Kashmiri political positions (independence, Pakistani integration, autonomy)."""
    },

    # =========================================================================
    # INDONESIA / WEST PAPUA
    # =========================================================================
    {
        "name": "Indonesian Occupation of West Papua",
        "occupier_country": "Indonesia",
        "occupied_territory": "West Papua (Papua and West Papua provinces)",
        "occupied_people": "Papuans",
        "start_date": "1963-05-01",
        "end_date": None,  # Ongoing
        "occupation_type": "settler_colonial",
        "international_law_status": "disputed",
        "un_resolutions": ["1752"],  # Transferred administration to Indonesia
        "population_displaced": 100000,  # Internally displaced
        "settlements_built": 0,  # Transmigration policy, not formal settlements
        "land_confiscated_km2": Decimal("421981"),  # Entire territory
        "wikidata_id": "Q431383",
        "description": """West Papua was a Dutch colony until 1962, when the Netherlands 
agreed to transfer it to Indonesia under UN supervision. The 1969 'Act of Free Choice' 
(called 'Act of No Choice' by Papuans) saw only 1,025 hand-picked representatives 
vote under Indonesian military coercion to join Indonesia.

Key features:
- Estimated 100,000-500,000 Papuans killed since 1963
- Transmigration program moving Javanese settlers to Papua
- Freeport-McMoRan mine: one of world's largest gold/copper mines
- Military operations and human rights abuses
- Internet blackouts during protests
- Arrests of independence activists
- Restrictions on foreign journalists and observers
- Melanesian population facing discrimination""",
        "progressive_analysis": """West Papua is often called a 'slow-motion genocide' - 
one of the least reported occupations despite severity of abuses.

CRITICAL ISSUES:
1. RESOURCE EXTRACTION: Freeport-McMoRan's Grasberg mine has generated $100+ billion 
while Papuans remain among Indonesia's poorest. The environmental devastation 
destroys indigenous lands.

2. DEMOGRAPHIC ENGINEERING: Transmigration and migration have made Papuans a 
minority in some urban areas. This 'Indonesianization' mirrors settler colonialism 
elsewhere.

3. RACIST DIMENSION: Melanesian Papuans face discrimination from Indonesian 
authorities and settlers - called 'monkeys' and treated as primitive.

4. MEDIA BLACKOUT: Indonesia restricts foreign journalist access, enabling 
abuses to continue unobserved.

5. INTERNATIONAL COMPLICITY: Western mining interests and Indonesia's strategic 
importance have led to silence on Papua, similar to patterns elsewhere.

The Free Papua Movement (OPM) has waged armed resistance since 1965. Pacific Island 
nations increasingly support Papuan self-determination, connecting the struggle to 
broader Pacific solidarity movements."""
    },

    # =========================================================================
    # HISTORICAL OCCUPATIONS (ENDED)
    # =========================================================================
    {
        "name": "British Occupation of Ireland",
        "occupier_country": "United Kingdom",
        "occupied_territory": "Ireland (Northern Ireland ongoing)",
        "occupied_people": "Irish",
        "start_date": "1169-05-01",  # Norman invasion; formal British rule from 1542
        "end_date": "1921-12-06",  # Irish Free State for 26 counties; 6 counties remain
        "occupation_type": "settler_colonial",
        "international_law_status": "colonial",
        "un_resolutions": [],
        "population_displaced": 2000000,  # Famine emigration and ongoing
        "settlements_built": 0,  # Plantation system
        "land_confiscated_km2": Decimal("70273"),  # All of Ireland
        "wikidata_id": "Q57695",
        "description": """British rule in Ireland began with the Norman invasion of 1169 
and was formalized under Henry VIII in 1542. Colonial rule included:

- Plantation system: Confiscating Irish land and settling Protestant colonists
- Penal Laws: Systematic discrimination against Catholics
- Great Famine (1845-1852): 1 million died, 1 million emigrated while food was exported
- Land War: Tenant farmer resistance against landlordism
- Easter Rising (1916): Republican insurrection for independence
- War of Independence (1919-1921): Guerrilla war leading to partition
- Partition (1921): Six northern counties remain under British rule

Northern Ireland (1921-present):
- Unionist/Protestant majority maintained through gerrymandering
- Civil rights movement (1960s) inspired by US civil rights
- The Troubles (1968-1998): Armed conflict, 3,500+ killed
- Good Friday Agreement (1998): Power-sharing arrangement""",
        "progressive_analysis": """Ireland was Britain's first colony and laboratory for 
techniques later used globally. The Irish experience connects to:

1. SETTLER COLONIALISM: The Plantation of Ulster (1609) created a Protestant settler 
majority in the north - the same model used in Palestine, South Africa, and elsewhere.

2. FAMINE AS POLICY: The Great Famine was not natural disaster but policy choice. 
Food exports continued while millions starved - colonial extraction at its starkest.

3. PARTITION: Britain's 'solution' of dividing Ireland to maintain control mirrors 
partitions in India, Palestine, Cyprus, and Korea.

4. THE TROUBLES: The conflict was not 'sectarian' but political - about civil rights, 
self-determination, and ending British rule.

5. ONGOING OCCUPATION: Northern Ireland remains under British sovereignty against 
the will of Irish nationalists, now complicated by Brexit.

James Connolly, a socialist executed in 1916, argued that Irish national liberation 
and socialist revolution were inseparable - a perspective shared by many liberation movements."""
    },

    {
        "name": "French Occupation of Algeria",
        "occupier_country": "France",
        "occupied_territory": "Algeria",
        "occupied_people": "Algerians",
        "start_date": "1830-07-05",
        "end_date": "1962-07-05",
        "occupation_type": "settler_colonial",
        "international_law_status": "colonial",
        "un_resolutions": [],
        "population_displaced": 2000000,  # During war of independence
        "settlements_built": 0,  # European settler communities
        "land_confiscated_km2": Decimal("2381741"),  # Entire country
        "wikidata_id": "Q126746",
        "description": """France colonized Algeria in 1830 and ruled for 132 years, making 
it France's longest-held major colony. Unlike other colonies, Algeria was legally 
considered part of France.

Key features:
- European settler population ('pieds-noirs') reached 1 million by 1960
- Indigenous Algerians denied French citizenship until 1947
- Massive land confiscation for European settlers
- Code de l'indigenat: separate legal system for Algerians
- Setif massacre (1945): 6,000-45,000 Algerians killed by French forces
- War of Independence (1954-1962): FLN liberation struggle
- Estimated 1-1.5 million Algerians killed during independence war
- Systematic use of torture by French forces
- Independence achieved July 5, 1962""",
        "progressive_analysis": """The Algerian War of Independence was a defining 
anti-colonial struggle that influenced liberation movements worldwide.

KEY ASPECTS:
1. SETTLER COLONIALISM: 1 million European settlers controlled the best land while 
8 million Algerians were marginalized - classic settler colonial structure.

2. VIOLENCE OF COLONIALISM: France's brutal counterinsurgency (torture, mass 
killings, concentration camps) exposed the violence inherent in colonialism.

3. FANON'S ANALYSIS: Frantz Fanon, the revolutionary psychiatrist, analyzed 
colonialism's psychological violence in The Wretched of the Earth, 
written during the Algerian revolution.

4. FRENCH DENIAL: France has never fully acknowledged crimes committed in 
Algeria, similar to other colonial powers' denial.

5. ONGOING EFFECTS: Algeria's post-independence challenges (authoritarianism, 
economic dependence) reflect the lasting damage of colonialism.

The FLN's victory inspired liberation movements from Palestine to South Africa 
to the Black Panthers, demonstrating that colonialism could be defeated."""
    },

    {
        "name": "Apartheid South Africa",
        "occupier_country": "South Africa",  # Internal colonialism
        "occupied_territory": "South Africa, Namibia",
        "occupied_people": "Black South Africans, Namibians, Coloured, Indian South Africans",
        "start_date": "1948-05-28",
        "end_date": "1994-04-27",
        "occupation_type": "settler_colonial",
        "international_law_status": "crime against humanity",
        "un_resolutions": [
            "616", "721", "919", "1016", "1102", "1178", "1235", "1248",
            "1252", "1331", "1375", "1402", "1457", "1503", "1597", "1672",
            "1761", "2054", "2145", "2202", "2307", "282", "418"
        ],
        "population_displaced": 3500000,  # Forced removals
        "settlements_built": 0,
        "land_confiscated_km2": Decimal("1098580"),  # 87% of land reserved for whites
        "wikidata_id": "Q83343",
        "description": """Apartheid ('apartness' in Afrikaans) was a system of institutionalized 
racial segregation and white supremacy in South Africa from 1948 to 1994.

Key features:
- Population Registration Act: Classified all by race
- Group Areas Act: Forced racial segregation in housing
- Pass Laws: Black South Africans required to carry passes
- Bantu Education: Inferior education for Black South Africans
- Bantustans: Nominal 'homelands' stripping citizenship
- Forced removals: 3.5 million people displaced
- Prohibition of interracial relationships
- Brutal suppression of resistance (Sharpeville, Soweto)
- Illegal occupation of Namibia until 1990

Resistance:
- African National Congress (ANC) and its armed wing Umkhonto we Sizwe
- Pan Africanist Congress (PAC)
- South African Communist Party (SACP)
- Trade union movement (COSATU)
- International sanctions and BDS movement""",
        "progressive_analysis": """Apartheid South Africa was the 20th century's clearest 
example of institutionalized racism and has become the reference point for understanding 
similar systems elsewhere.

LESSONS FOR TODAY:
1. INTERNATIONAL SOLIDARITY: The anti-apartheid movement showed how global pressure 
(sanctions, divestment, boycotts) could help end oppression - the model for BDS movement.

2. ARMED RESISTANCE: The ANC, labelled 'terrorist' by Western governments, is now 
celebrated. This should inform our view of resistance movements today.

3. UNFINISHED LIBERATION: Despite political change, South Africa remains one of the 
world's most unequal societies. Land remains largely in white hands. This shows the 
limits of political without economic liberation.

4. APPLICABILITY: Human rights organizations now apply the legal framework of apartheid 
to Israel/Palestine, demonstrating the concept's ongoing relevance.

5. TRUTH AND RECONCILIATION: The TRC model has been applied elsewhere but also 
criticized for prioritizing reconciliation over justice.

The anti-apartheid struggle united socialist, nationalist, and liberal forces globally, 
demonstrating the power of broad coalitions against oppression."""
    },

    {
        "name": "US Occupation and Colonization of the Philippines",
        "occupier_country": "United States",
        "occupied_territory": "Philippines",
        "occupied_people": "Filipinos",
        "start_date": "1898-12-10",
        "end_date": "1946-07-04",
        "occupation_type": "colonial",
        "international_law_status": "colonial",
        "un_resolutions": [],
        "population_displaced": 0,
        "settlements_built": 0,
        "land_confiscated_km2": Decimal("300000"),
        "wikidata_id": "Q230533",
        "description": """The United States acquired the Philippines from Spain in 1898 
after the Spanish-American War, just as Filipinos were achieving independence 
through their own revolution.

Key events:
- Philippine Revolution (1896-1898) against Spain
- Philippine-American War (1899-1902): 200,000-1,000,000 Filipino deaths
- US military used concentration camps, torture, and scorched earth tactics
- 'Benevolent assimilation' ideology masked brutal colonialism
- American companies controlled major industries
- English imposed as language of education and government
- Independence granted 1946 but with conditions (military bases, trade agreements)

Resistance:
- Katipunan revolutionary movement
- Moro resistance in Muslim south
- Socialist and communist movements""",
        "progressive_analysis": """The Philippine-American War was America's first major 
overseas colonial war and established patterns continued in Vietnam, Iraq, and elsewhere.

CRITICAL POINTS:
1. DEMOCRATIC HYPOCRISY: The US, founded on anti-colonial principles, became a 
colonial power using the same 'civilizing mission' rhetoric as European empires.

2. FORGOTTEN WAR: The Philippine-American War's atrocities (waterboarding, 
concentration camps, massacres) are largely forgotten in American memory.

3. RACISM: American soldiers referred to Filipinos using the same racist slurs 
later used in Vietnam. Colonial racism was central to the project.

4. NEOCOLONIALISM: Post-independence, the US maintained military bases and 
economic dominance, demonstrating how formal independence can mask 
continued control.

5. CONTINUITY: Tactics developed in the Philippines were later used in 
counterinsurgency campaigns globally. The 'War on Terror' echoed 
Philippine 'pacification.'

The Huk Rebellion (1942-1954), led by the Communist Party, continued anti-colonial 
and class struggle after formal independence."""
    },

    {
        "name": "US Occupation of Puerto Rico",
        "occupier_country": "United States",
        "occupied_territory": "Puerto Rico",
        "occupied_people": "Puerto Ricans",
        "start_date": "1898-07-25",
        "end_date": None,  # Ongoing - Puerto Rico remains a US territory
        "occupation_type": "colonial",
        "international_law_status": "non_self_governing_territory",
        "un_resolutions": [],  # UN Special Committee on Decolonization has addressed it
        "population_displaced": 0,
        "settlements_built": 0,
        "land_confiscated_km2": Decimal("9104"),
        "wikidata_id": "Q1183",
        "description": """Puerto Rico was invaded by the US during the Spanish-American War 
in 1898 and has remained a US territory for over 125 years - one of the world's 
oldest remaining colonies.

Current status:
- 'Commonwealth' status since 1952, but essentially a colony
- US citizens but cannot vote for President
- No voting representation in Congress
- Subject to federal laws without consent
- Jones Act restricts shipping and raises costs
- PROMESA (2016) imposed unelected fiscal control board
- Debt crisis used to justify austerity
- Hurricane Maria (2017) exposed colonial neglect: 3,000+ deaths
- Independence, statehood, and status quo all have supporters

Historical repression:
- Forced sterilization of Puerto Rican women (1930s-1970s)
- COINTELPRO targeting independence activists
- Ponce Massacre (1937): Police killed 21 at peaceful march
- Gag Law (1948-1957): Criminalized independence activism""",
        "progressive_analysis": """Puerto Rico demonstrates that US colonialism is not 
historical but ongoing. The territory's status exposes American democratic pretensions.

KEY ISSUES:
1. DEMOCRACY DENIED: 3.2 million US citizens have no meaningful self-determination. 
This is colonialism by any definition.

2. ECONOMIC EXPLOITATION: Puerto Rico's economy has been structured to benefit 
mainland capital. The Jones Act alone costs $1.5 billion annually.

3. AUSTERITY COLONIALISM: The PROMESA board imposes austerity without democratic 
consent - schools close, pensions cut, healthcare gutted.

4. ENVIRONMENTAL RACISM: Vieques was used for military bombing practice for 
decades, leaving cancer clusters. Hurricane Maria's death toll reflects 
colonial infrastructure neglect.

5. INDEPENDENCE MOVEMENT: The Puerto Rican independence movement has deep 
roots, including the Nationalist Party, Young Lords, and current movements. 
Activists have faced severe repression.

Puerto Rico should be understood alongside other US territories (Guam, US Virgin 
Islands, American Samoa) as examples of continued American empire."""
    },

    {
        "name": "US Annexation of Hawaii",
        "occupier_country": "United States",
        "occupied_territory": "Hawaii",
        "occupied_people": "Native Hawaiians (Kanaka Maoli)",
        "start_date": "1893-01-17",  # Overthrow of Hawaiian Kingdom
        "end_date": None,  # Hawaii remains a US state, but sovereignty movement continues
        "occupation_type": "settler_colonial",
        "international_law_status": "disputed",  # US apologized in 1993 but maintains control
        "un_resolutions": [],
        "population_displaced": 0,
        "settlements_built": 0,
        "land_confiscated_km2": Decimal("28311"),
        "wikidata_id": "Q782",
        "description": """The Hawaiian Kingdom was an internationally recognized sovereign 
nation until American businessmen, backed by US Marines, overthrew Queen Liliuokalani 
in 1893. Hawaii was annexed in 1898 and became a state in 1959.

Key events:
- 1778: Captain Cook's arrival begins Western contact
- 1893: Illegal overthrow of Hawaiian monarchy by US-backed coup
- 1898: Annexation during Spanish-American War
- 1993: US Congress formally apologized for overthrow
- Statehood vote (1959) did not include independence option
- Native Hawaiians: 10% of population, 50%+ of homeless
- Military controls 20% of Oahu
- Hawaiian language nearly eradicated

Sovereignty movement:
- Ka Lahui Hawaii (Hawaiian nation)
- Various independence organizations
- Mauna Kea protests (2019) against telescope construction""",
        "progressive_analysis": """Hawaii represents ongoing American settler colonialism 
and indigenous dispossession - not a historical injustice but a continuing one.

CRITICAL ISSUES:
1. ILLEGAL ANNEXATION: Even by US law, the overthrow and annexation were illegal. 
The 1993 Apology Resolution admits the US 'participated' in the overthrow.

2. SETTLER COLONIALISM: Native Hawaiians are a minority in their homeland. Land 
prices and cost of living force many to leave - economic ethnic cleansing.

3. MILITARIZATION: 20% of Oahu is military land. Pearl Harbor and Pacific Command 
make Hawaii central to US imperialism in the Pacific.

4. CULTURAL APPROPRIATION: Hawaiian culture is commodified for tourism while 
Native Hawaiians face poverty, incarceration, and health disparities.

5. SACRED SITES: The Mauna Kea movement against telescope construction connects 
indigenous rights, environmental protection, and anti-colonialism.

The Hawaiian sovereignty movement connects to global indigenous rights struggles 
and challenges assumptions that statehood resolved colonial injustice."""
    },

    # =========================================================================
    # ADDITIONAL HISTORICAL OCCUPATIONS
    # =========================================================================
    {
        "name": "Soviet Occupation of Baltic States",
        "occupier_country": "Russia",
        "occupied_territory": "Estonia, Latvia, Lithuania",
        "occupied_people": "Estonians, Latvians, Lithuanians",
        "start_date": "1940-06-15",
        "end_date": "1991-09-06",
        "occupation_type": "military",
        "international_law_status": "illegal",
        "un_resolutions": [],
        "population_displaced": 500000,  # Deportations to Siberia
        "settlements_built": 0,
        "land_confiscated_km2": Decimal("175116"),
        "wikidata_id": "Q188712",
        "description": """The Soviet Union occupied the three Baltic states (Estonia, Latvia, 
Lithuania) under the secret Molotov-Ribbentrop Pact with Nazi Germany. The occupation 
lasted 51 years until independence in 1991.

Key events:
- 1940: Soviet occupation following Nazi-Soviet pact
- 1940-1941: First Soviet occupation - mass deportations
- 1941-1944: Nazi German occupation
- 1944-1991: Second Soviet occupation
- 1949: Mass deportations to Siberia (92,000 from Baltic states)
- Forest Brothers: Armed resistance until 1950s
- 1989: Baltic Way - 2 million people formed human chain
- 1990-1991: Independence restored peacefully""",
        "progressive_analysis": """The Baltic occupation presents complications for the left:

HISTORICAL CONTEXT:
- The Soviet Union liberated the Baltics from Nazi occupation in 1944
- Some Baltic nationalists collaborated with Nazis
- The occupation included genuine social development

HOWEVER:
- Mass deportations to Siberia constituted ethnic cleansing
- Forced collectivization devastated agriculture
- Russian migration altered demographics
- Political repression targeted all dissent
- The occupation was illegal under international law

The progressive position recognizes that:
1. Soviet anti-fascism doesn't justify occupation
2. Right to self-determination applies regardless of regime ideology
3. The Baltic independence movements, while including reactionary elements, 
   were fundamentally legitimate
4. Current Baltic nationalism (including rehabilitation of Nazi collaborators) 
   doesn't retroactively justify Soviet occupation

This case shows that occupation and colonialism are not only Western phenomena."""
    },

    {
        "name": "Australian Colonization and Occupation of Aboriginal Lands",
        "occupier_country": "Australia",
        "occupied_territory": "Australian continent and Tasmania",
        "occupied_people": "Aboriginal and Torres Strait Islander peoples",
        "start_date": "1788-01-26",
        "end_date": None,  # Ongoing settler colonial structure
        "occupation_type": "settler_colonial",
        "international_law_status": "historical_colonial",
        "un_resolutions": [],
        "population_displaced": 500000,  # Estimated pre-contact population
        "settlements_built": 0,
        "land_confiscated_km2": Decimal("7692024"),  # Entire continent
        "wikidata_id": "Q408",
        "description": """British colonization of Australia began in 1788 and resulted in 
one of history's most complete settler colonial conquests. Terra nullius ('land 
belonging to no one') was used to legally deny Aboriginal land rights until 1992.

Key features:
- Frontier violence: Massacres and warfare throughout 19th century
- Stolen Generations: Aboriginal children forcibly removed (1910-1970)
- Genocide: Population declined from 500,000+ to 93,000 by 1900
- Terra nullius overturned in Mabo decision (1992)
- Native Title Act (1993) allowed limited land claims
- 2008: Prime Minister Rudd's formal apology
- Ongoing: Deaths in custody, incarceration rates, health disparities
- Constitutional recognition debate continues""",
        "progressive_analysis": """Australia represents settler colonialism in its most 
complete form - yet ongoing struggles for justice continue.

CRITICAL ISSUES:
1. TERRA NULLIUS: The legal fiction that Australia was 'empty' exemplifies 
how colonialism erases indigenous peoples from existence.

2. ONGOING COLONIALISM: Unlike America's narrative of 'past' injustice, 
Aboriginal communities face current crises: world's highest youth 
incarceration rates, deaths in custody, forced child removals continue.

3. STOLEN GENERATIONS: The forced removal of children was cultural 
genocide - destroying family structures and language transmission.

4. SOVEREIGNTY NEVER CEDED: Aboriginal peoples never signed treaties 
or ceded sovereignty - making current Australian state illegitimate 
under indigenous law.

5. INVASION DAY: January 26 (Australia Day) is called Invasion Day or 
Survival Day by Aboriginal peoples.

The Aboriginal land rights movement connects to global indigenous struggles 
and demonstrates that settler colonialism is not historical but structural."""
    },
]


class OccupationsDataImporter:
    """Importer for major world occupations data."""

    async def get_country_id(self, session, country_name: str) -> Optional[str]:
        """Look up country ID by name."""
        db_name = COUNTRY_NAME_MAPPINGS.get(country_name, country_name)
        result = await session.execute(
            text("SELECT id FROM countries WHERE name_en = :name OR name_short = :name LIMIT 1"),
            {"name": db_name}
        )
        row = result.first()
        return str(row[0]) if row else None

    async def run(self):
        """Import all occupations data."""
        print("=" * 60)
        print("IMPORTING OCCUPATIONS DATA")
        print("Documenting military occupations and settler colonialism worldwide")
        print("=" * 60)

        async with async_session_maker() as session:
            imported = 0
            skipped = 0
            errors = 0

            for occ in OCCUPATIONS_DATA:
                try:
                    # Check if already exists
                    existing = await session.execute(
                        text("SELECT id FROM occupations WHERE name = :name"),
                        {"name": occ["name"]}
                    )
                    if existing.first():
                        print(f"  Skipping (exists): {occ['name']}")
                        skipped += 1
                        continue

                    # Look up occupier country ID
                    occupier_id = await self.get_country_id(session, occ["occupier_country"])
                    if not occupier_id:
                        print(f"  Warning: Country not found: {occ['occupier_country']}")

                    # Parse dates
                    start_date = date.fromisoformat(occ["start_date"]) if occ.get("start_date") else None
                    end_date = date.fromisoformat(occ["end_date"]) if occ.get("end_date") else None

                    # Insert occupation
                    await session.execute(
                        text("""
                            INSERT INTO occupations (
                                id, name, occupier_country_id, occupied_territory,
                                occupied_people, start_date, end_date, occupation_type,
                                international_law_status, un_resolutions,
                                population_displaced, settlements_built, land_confiscated_km2,
                                wikidata_id, description, progressive_analysis
                            ) VALUES (
                                :id, :name, :occupier_country_id, :occupied_territory,
                                :occupied_people, :start_date, :end_date, :occupation_type,
                                :international_law_status, :un_resolutions,
                                :population_displaced, :settlements_built, :land_confiscated_km2,
                                :wikidata_id, :description, :progressive_analysis
                            )
                        """),
                        {
                            "id": str(uuid4()),
                            "name": occ["name"],
                            "occupier_country_id": occupier_id,
                            "occupied_territory": occ["occupied_territory"],
                            "occupied_people": occ.get("occupied_people"),
                            "start_date": start_date,
                            "end_date": end_date,
                            "occupation_type": occ.get("occupation_type"),
                            "international_law_status": occ.get("international_law_status"),
                            "un_resolutions": occ.get("un_resolutions", []),
                            "population_displaced": occ.get("population_displaced"),
                            "settlements_built": occ.get("settlements_built"),
                            "land_confiscated_km2": occ.get("land_confiscated_km2"),
                            "wikidata_id": occ.get("wikidata_id"),
                            "description": occ.get("description"),
                            "progressive_analysis": occ.get("progressive_analysis"),
                        }
                    )
                    print(f"  Imported: {occ['name']}")
                    imported += 1

                except Exception as e:
                    print(f"  Error importing {occ.get('name')}: {e}")
                    errors += 1

            await session.commit()

            print("\n" + "-" * 60)
            print(f"OCCUPATIONS IMPORT COMPLETE")
            print(f"  Imported: {imported}")
            print(f"  Skipped:  {skipped}")
            print(f"  Errors:   {errors}")
            print("-" * 60)

            return {"imported": imported, "skipped": skipped, "errors": errors}


async def import_occupations_data():
    """Main entry point for importing occupations data."""
    importer = OccupationsDataImporter()
    return await importer.run()


async def main():
    """CLI entry point."""
    await import_occupations_data()


if __name__ == "__main__":
    asyncio.run(main())
