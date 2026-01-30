"""Import liberation and revolutionary figures into the people table."""
import asyncio
from datetime import date
from typing import Dict, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import async_session_maker
from ..geography.models import Country
from ..people.models import Person


# Liberation and revolutionary figures organized by movement/region
LIBERATION_FIGURES = [
    # ==========================================================================
    # PALESTINIAN LIBERATION
    # ==========================================================================
    {
        "wikidata_id": "Q34211",
        "name": "Yasser Arafat",
        "birth_date": "1929-08-24",
        "death_date": "2004-11-11",
        "country_name": "Palestine",
        "person_types": ["politician", "revolutionary"],
        "ideology_tags": ["nationalist", "anti-colonial", "palestinian liberation"],
        "bio_short": "Palestinian political leader, chairman of the PLO from 1969 to 2004, and first president of the Palestinian National Authority.",
        "progressive_analysis": "Arafat dedicated his life to Palestinian self-determination, transforming the Palestinian struggle from scattered resistance into a unified national liberation movement. While controversial for his tactics, he brought international recognition to the Palestinian cause and represented the aspirations of a displaced people seeking their homeland."
    },
    {
        "wikidata_id": "Q234535",
        "name": "Leila Khaled",
        "birth_date": "1944-04-09",
        "death_date": None,
        "country_name": "Palestine",
        "person_types": ["revolutionary", "activist", "politician"],
        "ideology_tags": ["marxist", "feminist", "palestinian liberation", "anti-imperialist"],
        "bio_short": "Palestinian resistance fighter, member of the Popular Front for the Liberation of Palestine (PFLP), known for aircraft hijackings in 1969 and 1970.",
        "progressive_analysis": "Khaled became an icon of Palestinian resistance and women's participation in liberation struggles. Her actions, while controversial, drew global attention to the Palestinian cause at a time when it was largely ignored. She represents the intersection of feminist, anti-colonial, and class struggle within the Palestinian movement."
    },
    {
        "wikidata_id": "Q315747",
        "name": "Ghassan Kanafani",
        "birth_date": "1936-04-08",
        "death_date": "1972-07-08",
        "country_name": "Palestine",
        "person_types": ["writer", "journalist", "activist", "politician"],
        "ideology_tags": ["marxist", "palestinian liberation", "anti-imperialist"],
        "bio_short": "Palestinian writer, journalist, and spokesperson for the PFLP. His novels and short stories depicted Palestinian refugee experiences and resistance.",
        "progressive_analysis": "Kanafani used literature as a weapon of resistance, giving voice to Palestinian refugees and their struggle. His works like 'Men in the Sun' and 'Return to Haifa' remain essential texts for understanding Palestinian displacement. Assassinated by Mossad, he became a martyr of Palestinian cultural resistance."
    },
    {
        "wikidata_id": "Q44767",
        "name": "Edward Said",
        "birth_date": "1935-11-01",
        "death_date": "2003-09-25",
        "country_name": "Palestine",
        "person_types": ["academic", "writer", "activist"],
        "ideology_tags": ["anti-imperialist", "postcolonial", "palestinian liberation"],
        "bio_short": "Palestinian-American literary theorist and public intellectual. His book 'Orientalism' founded postcolonial studies and critiqued Western representations of the East.",
        "progressive_analysis": "Said revolutionized how we understand imperialism's cultural dimensions. His concept of Orientalism exposed how Western knowledge production served colonial power. As a tireless advocate for Palestinian rights, he connected the Palestinian struggle to broader anti-colonial movements worldwide."
    },
    {
        "wikidata_id": "Q123193",
        "name": "Mahmoud Darwish",
        "birth_date": "1941-03-13",
        "death_date": "2008-08-09",
        "country_name": "Palestine",
        "person_types": ["poet", "writer"],
        "ideology_tags": ["nationalist", "palestinian liberation"],
        "bio_short": "Palestinian poet and author, regarded as the Palestinian national poet. His poetry articulated Palestinian identity, exile, and resistance.",
        "progressive_analysis": "Darwish transformed Palestinian suffering into universal poetry of exile, longing, and resistance. His works like 'Identity Card' became anthems of Palestinian identity. He showed how culture and art are essential weapons in the struggle for liberation and self-determination."
    },
    {
        "wikidata_id": "Q352093",
        "name": "George Habash",
        "birth_date": "1926-08-02",
        "death_date": "2008-01-26",
        "country_name": "Palestine",
        "person_types": ["revolutionary", "politician", "physician"],
        "ideology_tags": ["marxist-leninist", "palestinian liberation", "pan-arab", "anti-imperialist"],
        "bio_short": "Palestinian physician and politician, founder of the Popular Front for the Liberation of Palestine (PFLP), advocating Marxist-Leninist approach to Palestinian liberation.",
        "progressive_analysis": "Habash brought class analysis to the Palestinian struggle, arguing that liberation required not just ending occupation but transforming Arab society. He connected Palestinian liberation to global anti-imperialist movements and advocated for a secular, democratic state."
    },
    {
        "wikidata_id": "Q232828",
        "name": "Hanan Ashrawi",
        "birth_date": "1946-10-08",
        "death_date": None,
        "country_name": "Palestine",
        "person_types": ["politician", "activist", "academic"],
        "ideology_tags": ["nationalist", "feminist", "palestinian liberation"],
        "bio_short": "Palestinian politician, diplomat, and scholar. Longtime PLO spokesperson and advocate for Palestinian rights through diplomatic and civil channels.",
        "progressive_analysis": "Ashrawi brought the Palestinian cause to international audiences through eloquent diplomacy and advocacy. As a prominent woman in Palestinian politics, she challenged both occupation and patriarchal structures within Palestinian society, representing a vision of liberation that includes gender equality."
    },
    {
        "wikidata_id": "Q313186",
        "name": "Marwan Barghouti",
        "birth_date": "1959-06-06",
        "death_date": None,
        "country_name": "Palestine",
        "person_types": ["politician", "activist"],
        "ideology_tags": ["nationalist", "palestinian liberation"],
        "bio_short": "Palestinian political leader and Fatah member, imprisoned by Israel since 2002. Widely regarded as a potential future Palestinian leader and symbol of resistance.",
        "progressive_analysis": "Barghouti represents the generation of Palestinians who grew up under occupation and turned to resistance. His imprisonment has made him a symbol of Palestinian political prisoners. He advocates for both armed resistance and diplomatic solutions, embodying the complexity of the Palestinian struggle."
    },
    {
        "wikidata_id": "Q437481",
        "name": "Izz ad-Din al-Qassam",
        "birth_date": "1882-01-01",
        "death_date": "1935-11-20",
        "country_name": "Syria",
        "person_types": ["religious leader", "revolutionary"],
        "ideology_tags": ["islamic nationalism", "anti-colonial", "palestinian liberation"],
        "bio_short": "Syrian-born Muslim preacher who led armed resistance against British Mandate and Zionist settlement in Palestine. Killed fighting British forces in 1935.",
        "progressive_analysis": "Al-Qassam was among the first to organize armed Palestinian resistance against colonization. His peasant-based movement combined religious mobilization with anti-colonial struggle. His legacy influenced subsequent generations of Palestinian resistance, though interpretations of his ideology vary widely."
    },
    {
        "wikidata_id": "Q170526",
        "name": "Sheikh Ahmed Yassin",
        "birth_date": "1937-01-01",
        "death_date": "2004-03-22",
        "country_name": "Palestine",
        "person_types": ["religious leader", "politician"],
        "ideology_tags": ["islamic nationalism", "palestinian liberation"],
        "bio_short": "Palestinian imam and politician, founder of Hamas. Paralyzed from childhood, he became a spiritual leader of Islamic resistance. Assassinated by Israel in 2004.",
        "progressive_analysis": "Yassin represented the Islamic trend within Palestinian resistance, emerging partly due to failures of secular nationalism. While his religious conservatism conflicts with progressive values, his movement gave voice to dispossessed Palestinians and maintained resistance when other factions compromised. His assassination highlighted Israeli policies of targeted killings."
    },
    # ==========================================================================
    # IRISH REPUBLICANISM
    # ==========================================================================
    {
        "wikidata_id": "Q183547",
        "name": "James Connolly",
        "birth_date": "1868-06-05",
        "death_date": "1916-05-12",
        "country_name": "Ireland",
        "person_types": ["revolutionary", "writer", "labor organizer"],
        "ideology_tags": ["socialist", "marxist", "republican", "syndicalist"],
        "bio_short": "Irish republican and socialist leader, founder of the Irish Citizen Army. Executed by British forces after the 1916 Easter Rising.",
        "progressive_analysis": "Connolly uniquely synthesized Irish nationalism with Marxist socialism, arguing that national liberation without social revolution would merely replace foreign capitalists with domestic ones. His writings on Irish history, labor organizing, and women's rights remain foundational texts for socialist republicanism."
    },
    {
        "wikidata_id": "Q311267",
        "name": "Padraig Pearse",
        "birth_date": "1879-11-10",
        "death_date": "1916-05-03",
        "country_name": "Ireland",
        "person_types": ["revolutionary", "writer", "educator"],
        "ideology_tags": ["republican", "nationalist", "gaelic revivalist"],
        "bio_short": "Irish teacher, poet, and revolutionary leader of the 1916 Easter Rising. He read the Proclamation of the Irish Republic and was executed by British forces.",
        "progressive_analysis": "Pearse's vision of Irish freedom encompassed cultural revival, language preservation, and political independence. While his mystical nationalism differed from Connolly's socialism, his sacrifice inspired generations. His educational philosophy emphasized child-centered learning and Irish cultural identity."
    },
    {
        "wikidata_id": "Q180536",
        "name": "Michael Collins",
        "birth_date": "1890-10-16",
        "death_date": "1922-08-22",
        "country_name": "Ireland",
        "person_types": ["revolutionary", "politician", "military leader"],
        "ideology_tags": ["republican", "nationalist"],
        "bio_short": "Irish revolutionary leader, intelligence director, and military commander during the War of Independence. Key negotiator of the Anglo-Irish Treaty. Killed in the Civil War.",
        "progressive_analysis": "Collins developed innovative guerrilla tactics that influenced liberation movements worldwide. His intelligence network crippled British rule in Ireland. Though he accepted partition in the Treaty, he saw it as a stepping stone, not an end. His pragmatism contrasted with more radical republicans."
    },
    {
        "wikidata_id": "Q315118",
        "name": "Bobby Sands",
        "birth_date": "1954-03-09",
        "death_date": "1981-05-05",
        "country_name": "United Kingdom",
        "person_types": ["activist", "politician", "writer"],
        "ideology_tags": ["republican", "socialist", "anti-imperialist"],
        "bio_short": "Irish republican and member of the Provisional IRA. Died on hunger strike in Long Kesh prison after 66 days. Elected to British Parliament while imprisoned.",
        "progressive_analysis": "Sands' hunger strike and death galvanized international attention to the Irish republican cause and British treatment of political prisoners. His election while dying demonstrated popular support for the republican movement. His writings from prison showed a thoughtful, principled revolutionary committed to Irish freedom."
    },
    {
        "wikidata_id": "Q462481",
        "name": "Mairead Farrell",
        "birth_date": "1957-08-03",
        "death_date": "1988-03-06",
        "country_name": "Ireland",
        "person_types": ["revolutionary", "activist"],
        "ideology_tags": ["republican", "socialist", "feminist"],
        "bio_short": "Irish republican activist and IRA volunteer. Participated in 1980 hunger strike. Killed by British SAS in Gibraltar in controversial circumstances.",
        "progressive_analysis": "Farrell represented women's central role in Irish republican struggle, challenging both British imperialism and traditional gender roles. Her killing in Gibraltar, along with two others, raised questions about British shoot-to-kill policies. She embodied the intersection of feminist and anti-colonial resistance."
    },
    {
        "wikidata_id": "Q271484",
        "name": "Bernadette Devlin",
        "birth_date": "1947-04-23",
        "death_date": None,
        "country_name": "United Kingdom",
        "person_types": ["politician", "activist"],
        "ideology_tags": ["socialist", "republican", "civil rights", "feminist"],
        "bio_short": "Irish socialist and civil rights activist. Youngest woman elected to British Parliament in 1969. Key figure in Northern Ireland civil rights movement.",
        "progressive_analysis": "Devlin connected the Irish struggle to global movements for civil rights and socialism. She challenged sectarianism, arguing for working-class unity across religious divides. Her famous confrontation with British Home Secretary Reginald Maudling after Bloody Sunday symbolized Irish defiance."
    },
    {
        "wikidata_id": "Q207916",
        "name": "Gerry Adams",
        "birth_date": "1948-10-06",
        "death_date": None,
        "country_name": "Ireland",
        "person_types": ["politician"],
        "ideology_tags": ["republican", "socialist"],
        "bio_short": "Irish republican politician, president of Sinn Fein 1983-2018. Key figure in Northern Ireland peace process and Good Friday Agreement.",
        "progressive_analysis": "Adams led the transformation of Irish republicanism from armed struggle to political process. While controversial for his alleged IRA connections, he helped end decades of conflict. His leadership brought Sinn Fein from marginalized movement to major political force in both Irish jurisdictions."
    },
    {
        "wikidata_id": "Q312515",
        "name": "Martin McGuinness",
        "birth_date": "1950-05-23",
        "death_date": "2017-03-21",
        "country_name": "United Kingdom",
        "person_types": ["politician", "revolutionary"],
        "ideology_tags": ["republican", "socialist"],
        "bio_short": "Irish republican politician and former IRA leader. Deputy First Minister of Northern Ireland 2007-2017. Key architect of the peace process.",
        "progressive_analysis": "McGuinness embodied the transition from armed resistance to peace-building. His journey from IRA commander to power-sharing with unionists demonstrated the possibilities of conflict resolution. His handshake with Queen Elizabeth II symbolized reconciliation while maintaining republican principles."
    },
    # ==========================================================================
    # ANTI-COLONIAL AFRICA
    # ==========================================================================
    {
        "wikidata_id": "Q36602",
        "name": "Patrice Lumumba",
        "birth_date": "1925-07-02",
        "death_date": "1961-01-17",
        "country_name": "Democratic Republic of the Congo",
        "person_types": ["politician", "revolutionary"],
        "ideology_tags": ["pan-africanist", "anti-colonial", "nationalist", "socialist"],
        "bio_short": "First democratically elected Prime Minister of the Congo. Overthrown in a CIA and Belgian-backed coup and assassinated. Symbol of African independence betrayed by neo-colonialism.",
        "progressive_analysis": "Lumumba's murder represents imperialism's violent response to genuine African independence. His vision of a united, sovereign Congo threatened Western control of Congolese resources. His brief leadership and tragic death exposed how colonial powers, especially Belgium and the US, undermined African self-determination."
    },
    {
        "wikidata_id": "Q166092",
        "name": "Thomas Sankara",
        "birth_date": "1949-12-21",
        "death_date": "1987-10-15",
        "country_name": "Burkina Faso",
        "person_types": ["politician", "revolutionary", "military leader"],
        "ideology_tags": ["marxist", "pan-africanist", "anti-imperialist", "feminist"],
        "bio_short": "President of Burkina Faso 1983-1987, known as 'Africa's Che Guevara.' Implemented radical social programs before being assassinated in a coup.",
        "progressive_analysis": "Sankara demonstrated what genuine revolutionary governance could achieve: mass vaccination, literacy campaigns, land reform, women's liberation, and environmental protection. His rejection of IMF debt and call for African unity threatened neo-colonial interests. His assassination, likely backed by France, cut short Africa's most promising socialist experiment."
    },
    {
        "wikidata_id": "Q188586",
        "name": "Amilcar Cabral",
        "birth_date": "1924-09-12",
        "death_date": "1973-01-20",
        "country_name": "Guinea-Bissau",
        "person_types": ["revolutionary", "writer", "agronomist"],
        "ideology_tags": ["marxist", "anti-colonial", "pan-africanist"],
        "bio_short": "Guinea-Bissauan revolutionary leader and theorist. Led the PAIGC in the independence struggle against Portugal. Assassinated before independence.",
        "progressive_analysis": "Cabral developed original Marxist theory adapted to African conditions, emphasizing culture's role in liberation and the need to 'return to the source' of African identity. His writings on revolutionary theory, particularly on class analysis in colonial societies, remain essential texts for anti-colonial movements."
    },
    {
        "wikidata_id": "Q193660",
        "name": "Kwame Nkrumah",
        "birth_date": "1909-09-21",
        "death_date": "1972-04-27",
        "country_name": "Ghana",
        "person_types": ["politician", "philosopher"],
        "ideology_tags": ["pan-africanist", "socialist", "anti-imperialist"],
        "bio_short": "First Prime Minister and President of Ghana, leading it to independence in 1957. Championed Pan-Africanism and African unity. Overthrown in 1966 coup.",
        "progressive_analysis": "Nkrumah was the prophet of Pan-Africanism, arguing that African states could only truly decolonize through continental unity. His concept of neo-colonialism explained how formal independence could coexist with continued economic domination. The CIA-backed coup against him proved his analysis correct."
    },
    {
        "wikidata_id": "Q57371",
        "name": "Julius Nyerere",
        "birth_date": "1922-04-13",
        "death_date": "1999-10-14",
        "country_name": "Tanzania",
        "person_types": ["politician", "philosopher", "teacher"],
        "ideology_tags": ["socialist", "pan-africanist", "ujamaa"],
        "bio_short": "First President of Tanzania, developed African socialism (Ujamaa). Known as 'Mwalimu' (Teacher). Led Tanzania's support for liberation movements across Africa.",
        "progressive_analysis": "Nyerere attempted to build socialism based on African traditions of communal living. While Ujamaa villages had mixed results, his commitment to education, healthcare, and supporting liberation movements across southern Africa was exemplary. Tanzania under his leadership was a haven for freedom fighters."
    },
    {
        "wikidata_id": "Q2416",
        "name": "Nelson Mandela",
        "birth_date": "1918-07-18",
        "death_date": "2013-12-05",
        "country_name": "South Africa",
        "person_types": ["politician", "activist", "lawyer"],
        "ideology_tags": ["anti-apartheid", "socialist", "pan-africanist"],
        "bio_short": "South African anti-apartheid revolutionary, political prisoner for 27 years, and first Black president of South Africa (1994-1999).",
        "progressive_analysis": "Mandela's journey from militant resistance to reconciliation shaped post-apartheid South Africa. His early commitment to armed struggle and alliance with the Communist Party reflected the necessity of diverse tactics. While criticized by some for compromises during transition, his moral authority and personal sacrifice remain inspirational."
    },
    {
        "wikidata_id": "Q188100",
        "name": "Steve Biko",
        "birth_date": "1946-12-18",
        "death_date": "1977-09-12",
        "country_name": "South Africa",
        "person_types": ["activist", "writer", "philosopher"],
        "ideology_tags": ["black consciousness", "anti-apartheid", "pan-africanist"],
        "bio_short": "South African anti-apartheid activist and founder of the Black Consciousness Movement. Died in police custody after torture.",
        "progressive_analysis": "Biko's Black Consciousness philosophy emphasized psychological liberation alongside political freedom. He argued that Black people must reject internalized inferiority before they could effectively resist apartheid. His murder by police and the regime's cover-up attempt exposed apartheid's brutality to the world."
    },
    {
        "wikidata_id": "Q378240",
        "name": "Chris Hani",
        "birth_date": "1942-06-28",
        "death_date": "1993-04-10",
        "country_name": "South Africa",
        "person_types": ["revolutionary", "politician"],
        "ideology_tags": ["communist", "anti-apartheid", "socialist"],
        "bio_short": "South African communist and anti-apartheid leader, chief of staff of Umkhonto we Sizwe and leader of the SACP. Assassinated in 1993.",
        "progressive_analysis": "Hani was the most popular leader among South African youth and township residents. His assassination by right-wing extremists nearly derailed the transition to democracy. His commitment to socialism alongside anti-apartheid struggle represented the possibility of deeper transformation that the compromise transition partially foreclosed."
    },
    {
        "wikidata_id": "Q237607",
        "name": "Winnie Mandela",
        "birth_date": "1936-09-26",
        "death_date": "2018-04-02",
        "country_name": "South Africa",
        "person_types": ["activist", "politician"],
        "ideology_tags": ["anti-apartheid", "socialist", "pan-africanist"],
        "bio_short": "South African anti-apartheid activist, known as 'Mother of the Nation.' Maintained resistance during Nelson Mandela's imprisonment despite persecution.",
        "progressive_analysis": "Winnie Mandela kept the flame of resistance burning during the darkest apartheid years while raising children alone and enduring banning, imprisonment, and torture. Though controversial for her later actions, she represented an uncompromising stance against apartheid when others counseled moderation."
    },
    # ==========================================================================
    # LATIN AMERICAN REVOLUTIONARIES
    # ==========================================================================
    {
        "wikidata_id": "Q5575",
        "name": "Che Guevara",
        "birth_date": "1928-06-14",
        "death_date": "1967-10-09",
        "country_name": "Argentina",
        "person_types": ["revolutionary", "physician", "writer", "guerrilla leader"],
        "ideology_tags": ["marxist", "communist", "anti-imperialist"],
        "bio_short": "Argentine Marxist revolutionary, key figure in Cuban Revolution. Later attempted to spread revolution in Congo and Bolivia, where he was captured and executed.",
        "progressive_analysis": "Guevara embodied revolutionary internationalism, fighting not just for his own country but wherever imperialism oppressed people. His writings on guerrilla warfare and the 'new socialist man' influenced liberation movements worldwide. His iconic image continues to symbolize resistance to injustice."
    },
    {
        "wikidata_id": "Q5752",
        "name": "Fidel Castro",
        "birth_date": "1926-08-13",
        "death_date": "2016-11-25",
        "country_name": "Cuba",
        "person_types": ["revolutionary", "politician"],
        "ideology_tags": ["communist", "marxist-leninist", "anti-imperialist"],
        "bio_short": "Cuban revolutionary and politician who led Cuba from 1959 to 2008, surviving countless CIA assassination attempts and transforming Cuban society.",
        "progressive_analysis": "Castro led the only successful socialist revolution in the Western Hemisphere, defying the United States for over half a century. Cuba's achievements in healthcare, education, and international solidarity (medical brigades, support for African liberation) contrast with criticisms of political repression. His legacy remains contested but undeniably transformative."
    },
    {
        "wikidata_id": "Q181529",
        "name": "Salvador Allende",
        "birth_date": "1908-06-26",
        "death_date": "1973-09-11",
        "country_name": "Chile",
        "person_types": ["politician", "physician"],
        "ideology_tags": ["socialist", "marxist", "democratic socialist"],
        "bio_short": "Chilean socialist physician and politician. First Marxist democratically elected president in Latin America. Died during CIA-backed military coup in 1973.",
        "progressive_analysis": "Allende demonstrated that socialism could be achieved through democratic means, implementing nationalization and social programs while respecting civil liberties. The US-backed coup that killed him and installed Pinochet's brutal dictatorship proved that imperialism would not tolerate even peaceful socialism, a lesson for progressives everywhere."
    },
    {
        "wikidata_id": "Q348528",
        "name": "Augusto Cesar Sandino",
        "birth_date": "1895-05-18",
        "death_date": "1934-02-21",
        "country_name": "Nicaragua",
        "person_types": ["revolutionary", "guerrilla leader"],
        "ideology_tags": ["anti-imperialist", "nationalist"],
        "bio_short": "Nicaraguan revolutionary who led resistance against US occupation 1927-1933. Assassinated by the Somoza-led National Guard. The Sandinistas took his name.",
        "progressive_analysis": "Sandino led a peasant army against the US Marines, becoming a symbol of Latin American resistance to Yankee imperialism. His assassination after agreeing to peace demonstrated American treachery. His legacy inspired the Sandinista revolution that finally overthrew the Somoza dynasty in 1979."
    },
    {
        "wikidata_id": "Q182658",
        "name": "Hugo Chavez",
        "birth_date": "1954-07-28",
        "death_date": "2013-03-05",
        "country_name": "Venezuela",
        "person_types": ["politician", "military officer"],
        "ideology_tags": ["socialist", "bolivarian", "anti-imperialist"],
        "bio_short": "Venezuelan politician and military officer, president 1999-2013. Led the Bolivarian Revolution, using oil wealth for social programs and challenging US hegemony.",
        "progressive_analysis": "Chavez channeled Venezuela's oil wealth to the poor through missions providing healthcare, education, and housing. He challenged US dominance in Latin America and supported leftist movements across the continent. While facing legitimate criticism over democratic backsliding, he gave voice to the marginalized and inspired a continental pink tide."
    },
    {
        "wikidata_id": "Q312190",
        "name": "Subcomandante Marcos",
        "birth_date": "1957-06-19",
        "death_date": None,
        "country_name": "Mexico",
        "person_types": ["revolutionary", "writer", "spokesperson"],
        "ideology_tags": ["zapatista", "libertarian socialist", "indigenous rights", "anti-neoliberal"],
        "bio_short": "Mexican insurgent leader and spokesperson for the Zapatista Army of National Liberation (EZLN). Led the 1994 uprising in Chiapas.",
        "progressive_analysis": "Marcos and the Zapatistas pioneered a new form of revolutionary politics, combining indigenous rights, anti-neoliberalism, and radical democracy. Their rejection of state power in favor of autonomous communities inspired global movements. Their uprising on NAFTA's first day connected local indigenous struggles to global capitalism."
    },
    # ==========================================================================
    # SOCIALIST/COMMUNIST THEORISTS
    # ==========================================================================
    {
        "wikidata_id": "Q9061",
        "name": "Karl Marx",
        "birth_date": "1818-05-05",
        "death_date": "1883-03-14",
        "country_name": "Germany",
        "person_types": ["philosopher", "economist", "writer", "revolutionary"],
        "ideology_tags": ["communist", "marxist", "socialist"],
        "bio_short": "German philosopher, economist, and revolutionary socialist. Author of Das Kapital and co-author of The Communist Manifesto. Founder of scientific socialism.",
        "progressive_analysis": "Marx provided the theoretical foundation for understanding capitalism's exploitative nature and its eventual supersession. His analysis of class struggle, commodity fetishism, and historical materialism remains essential for critiquing contemporary capitalism. His vision of a classless society continues to inspire movements for human liberation."
    },
    {
        "wikidata_id": "Q9916",
        "name": "Friedrich Engels",
        "birth_date": "1820-11-28",
        "death_date": "1895-08-05",
        "country_name": "Germany",
        "person_types": ["philosopher", "writer", "industrialist"],
        "ideology_tags": ["communist", "marxist", "socialist"],
        "bio_short": "German philosopher and Marx's closest collaborator. Co-authored The Communist Manifesto. His work 'The Condition of the Working Class in England' documented industrial capitalism's horrors.",
        "progressive_analysis": "Engels not only co-developed Marxist theory but financially supported Marx's work. His independent contributions on the family, women's oppression, and the state remain valuable. His documentation of working-class conditions pioneered social investigation methods still used today."
    },
    {
        "wikidata_id": "Q10518",
        "name": "Vladimir Lenin",
        "birth_date": "1870-04-22",
        "death_date": "1924-01-21",
        "country_name": "Russia",
        "person_types": ["revolutionary", "politician", "philosopher", "writer"],
        "ideology_tags": ["communist", "marxist", "marxist-leninist"],
        "bio_short": "Russian revolutionary and leader of the Bolshevik Revolution. Founder of the Soviet Union. Developed theories of imperialism and the vanguard party.",
        "progressive_analysis": "Lenin successfully led the first socialist revolution, demonstrating that another world was possible. His analysis of imperialism as capitalism's highest stage and his organizational theories influenced all subsequent revolutionary movements. Debates continue over his legacy, particularly regarding democracy and the party."
    },
    {
        "wikidata_id": "Q3621",
        "name": "Rosa Luxemburg",
        "birth_date": "1871-03-05",
        "death_date": "1919-01-15",
        "country_name": "Poland",
        "person_types": ["revolutionary", "philosopher", "economist", "writer"],
        "ideology_tags": ["communist", "marxist", "socialist"],
        "bio_short": "Polish-German Marxist theorist, philosopher, and revolutionary. Co-founded the Spartacist League. Murdered by right-wing militias during the German Revolution.",
        "progressive_analysis": "Luxemburg combined revolutionary commitment with insistence on workers' democracy, criticizing both reformism and Bolshevik authoritarianism. Her works on imperialism and capital accumulation developed Marxist theory. Her famous statement 'Freedom is always the freedom of those who think differently' remains a progressive touchstone."
    },
    {
        "wikidata_id": "Q5593",
        "name": "Antonio Gramsci",
        "birth_date": "1891-01-22",
        "death_date": "1937-04-27",
        "country_name": "Italy",
        "person_types": ["philosopher", "politician", "writer"],
        "ideology_tags": ["communist", "marxist"],
        "bio_short": "Italian Marxist philosopher and communist politician. Imprisoned by Mussolini, wrote his influential Prison Notebooks while incarcerated.",
        "progressive_analysis": "Gramsci's concepts of hegemony, civil society, and the organic intellectual transformed how we understand power and resistance. His Prison Notebooks, written under fascist imprisonment, developed a sophisticated Marxism attentive to culture, consciousness, and political strategy. His influence extends far beyond the left."
    },
    {
        "wikidata_id": "Q208602",
        "name": "Frantz Fanon",
        "birth_date": "1925-07-20",
        "death_date": "1961-12-06",
        "country_name": "Martinique",
        "person_types": ["philosopher", "psychiatrist", "revolutionary", "writer"],
        "ideology_tags": ["marxist", "anti-colonial", "pan-africanist"],
        "bio_short": "Martinican psychiatrist, philosopher, and revolutionary. His works 'The Wretched of the Earth' and 'Black Skin, White Masks' are foundational texts of postcolonial studies.",
        "progressive_analysis": "Fanon analyzed colonialism's psychological violence and the necessity of revolutionary violence for liberation. His work bridged psychiatry and politics, showing how colonialism deforms both colonizer and colonized. His influence on Black Power, anti-colonial movements, and critical race theory is immeasurable."
    },
    {
        "wikidata_id": "Q561",
        "name": "Angela Davis",
        "birth_date": "1944-01-26",
        "death_date": None,
        "country_name": "United States",
        "person_types": ["activist", "philosopher", "academic", "writer"],
        "ideology_tags": ["communist", "feminist", "anti-racist", "prison abolitionist"],
        "bio_short": "American political activist, philosopher, and academic. Former Communist Party leader. Pioneered intersectional analysis connecting race, class, gender, and the prison system.",
        "progressive_analysis": "Davis connected the struggles against racism, capitalism, and patriarchy before intersectionality became a buzzword. Her work on the prison-industrial complex anticipated mass incarceration's explosion. Her survival of FBI persecution and continued activism over decades makes her a living link to radical traditions."
    },
    {
        "wikidata_id": "Q297524",
        "name": "Fred Hampton",
        "birth_date": "1948-08-30",
        "death_date": "1969-12-04",
        "country_name": "United States",
        "person_types": ["revolutionary", "activist"],
        "ideology_tags": ["socialist", "black panther", "marxist-leninist"],
        "bio_short": "American activist and deputy chairman of the Illinois Black Panther Party. Organized the Rainbow Coalition. Assassinated by Chicago police and FBI at age 21.",
        "progressive_analysis": "Hampton's Rainbow Coalition united Black, Puerto Rican, and white working-class organizations, demonstrating the power of multiracial class solidarity. His assassination in his bed by police and FBI, aided by an informant, revealed the state's willingness to murder effective organizers. At 21, he had already built a movement the FBI deemed too dangerous to exist."
    },
    {
        "wikidata_id": "Q215562",
        "name": "Malcolm X",
        "birth_date": "1925-05-19",
        "death_date": "1965-02-21",
        "country_name": "United States",
        "person_types": ["activist", "minister", "writer"],
        "ideology_tags": ["black nationalist", "pan-africanist", "anti-imperialist"],
        "bio_short": "American Muslim minister and human rights activist. Advocated Black nationalism and self-defense. After leaving the Nation of Islam, embraced pan-Africanism and international solidarity.",
        "progressive_analysis": "Malcolm X articulated Black anger and pride when civil rights leaders counseled patience. His evolution from Black nationalism to revolutionary internationalism, connecting African American struggles to global anti-colonialism, was cut short by assassination. His autobiography and speeches continue to radicalize new generations."
    },
    # ==========================================================================
    # ASIAN REVOLUTIONARIES
    # ==========================================================================
    {
        "wikidata_id": "Q12749",
        "name": "Ho Chi Minh",
        "birth_date": "1890-05-19",
        "death_date": "1969-09-02",
        "country_name": "Vietnam",
        "person_types": ["revolutionary", "politician", "poet"],
        "ideology_tags": ["communist", "marxist-leninist", "nationalist", "anti-colonial"],
        "bio_short": "Vietnamese revolutionary leader who fought Japanese occupation, French colonialism, and American intervention. Founded the Democratic Republic of Vietnam.",
        "progressive_analysis": "Ho Chi Minh led one of the 20th century's most successful national liberation struggles, defeating two imperial powers. His synthesis of nationalism and communism mobilized Vietnamese across classes. His austere lifestyle and popular touch contrasted with typical authoritarian leaders. Vietnam's eventual victory vindicated his strategy."
    },
    {
        "wikidata_id": "Q7378",
        "name": "Mao Zedong",
        "birth_date": "1893-12-26",
        "death_date": "1976-09-09",
        "country_name": "China",
        "person_types": ["revolutionary", "politician", "philosopher", "writer"],
        "ideology_tags": ["communist", "marxist-leninist", "maoist"],
        "bio_short": "Chinese communist revolutionary and founding father of the People's Republic of China. Led the Communist Party to victory in the Chinese Civil War. Chairman until his death.",
        "progressive_analysis": "Mao led history's largest revolution, liberating China from feudalism and imperialism. His adaptation of Marxism to peasant societies influenced third-world liberation movements. However, the Great Leap Forward's famine and Cultural Revolution's chaos caused immense suffering. His legacy remains deeply contested, combining genuine liberation with catastrophic errors."
    },
    {
        "wikidata_id": "Q42519",
        "name": "Kim Il-sung",
        "birth_date": "1912-04-15",
        "death_date": "1994-07-08",
        "country_name": "North Korea",
        "person_types": ["revolutionary", "politician"],
        "ideology_tags": ["communist", "juche", "nationalist"],
        "bio_short": "Korean communist revolutionary and politician who led North Korea from its founding in 1948 until his death. Developed the Juche ideology of self-reliance.",
        "progressive_analysis": "Kim fought against Japanese colonial occupation, giving him genuine revolutionary credentials. However, his cult of personality, hereditary succession, and repressive system diverged sharply from socialist ideals. North Korea's trajectory illustrates the dangers of isolated socialism degenerating into authoritarian nationalism."
    },
    {
        "wikidata_id": "Q231690",
        "name": "Vo Nguyen Giap",
        "birth_date": "1911-08-25",
        "death_date": "2013-10-04",
        "country_name": "Vietnam",
        "person_types": ["military leader", "politician", "revolutionary"],
        "ideology_tags": ["communist", "marxist-leninist", "nationalist"],
        "bio_short": "Vietnamese general who commanded forces against France at Dien Bien Phu and later against the United States. One of the greatest military strategists of the 20th century.",
        "progressive_analysis": "Giap demonstrated that a determined people could defeat the world's most powerful military forces. His strategies at Dien Bien Phu and during the American War showed how revolutionary commitment could overcome technological superiority. His memoirs and analyses of people's war remain studied by military scholars and revolutionaries alike."
    },
]


class LiberationFiguresImporter:
    """Import liberation and revolutionary figures into the people table."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.country_cache: Dict[str, UUID] = {}
        self.stats = {
            "processed": 0,
            "created": 0,
            "updated": 0,
            "skipped": 0,
            "errors": 0,
        }

    async def get_country_id(self, country_name: str) -> Optional[UUID]:
        """Get country ID by name, with caching."""
        if not country_name:
            return None

        if country_name in self.country_cache:
            return self.country_cache[country_name]

        # Try exact match first
        result = await self.db.execute(
            select(Country.id).where(Country.name_en == country_name).limit(1)
        )
        country_id = result.scalar_one_or_none()

        # Try partial match if exact fails
        if not country_id:
            result = await self.db.execute(
                select(Country.id).where(
                    Country.name_en.ilike(f"%{country_name}%")
                ).limit(1)
            )
            country_id = result.scalar_one_or_none()

        if country_id:
            self.country_cache[country_name] = country_id

        return country_id

    def parse_date(self, date_str: Optional[str]) -> Optional[date]:
        """Parse date string to date object."""
        if not date_str:
            return None
        try:
            if len(date_str) == 10:
                return date.fromisoformat(date_str)
            elif len(date_str) == 4:
                return date(int(date_str), 1, 1)
        except (ValueError, TypeError):
            pass
        return None

    async def import_figure(self, figure_data: dict) -> bool:
        """Import a single figure. Returns True if created, False if skipped."""
        wikidata_id = figure_data.get("wikidata_id")

        # Check if already exists
        existing = await self.db.execute(
            select(Person.id).where(Person.wikidata_id == wikidata_id)
        )
        if existing.scalar_one_or_none():
            print(f"  Skipping {figure_data['name']} (already exists)")
            self.stats["skipped"] += 1
            return False

        # Look up country
        primary_country_id = await self.get_country_id(
            figure_data.get("country_name", "")
        )

        # Create the person record
        person = Person(
            wikidata_id=wikidata_id,
            name=figure_data["name"],
            birth_date=self.parse_date(figure_data.get("birth_date")),
            death_date=self.parse_date(figure_data.get("death_date")),
            primary_country_id=primary_country_id,
            person_types=figure_data.get("person_types", []),
            ideology_tags=figure_data.get("ideology_tags", []),
            bio_short=figure_data.get("bio_short"),
            progressive_analysis=figure_data.get("progressive_analysis"),
        )

        self.db.add(person)
        self.stats["created"] += 1
        print(f"  Imported: {figure_data['name']}")
        return True

    async def run(self) -> dict:
        """Run the full import."""
        print("=" * 60)
        print("IMPORTING LIBERATION AND REVOLUTIONARY FIGURES")
        print("=" * 60)

        for figure_data in LIBERATION_FIGURES:
            try:
                await self.import_figure(figure_data)
                self.stats["processed"] += 1
            except Exception as e:
                print(f"  Error importing {figure_data.get('name', 'unknown')}: {e}")
                self.stats["errors"] += 1

        await self.db.commit()

        print("\n" + "=" * 60)
        print("IMPORT COMPLETE")
        print("=" * 60)
        print(f"  Processed: {self.stats['processed']}")
        print(f"  Created:   {self.stats['created']}")
        print(f"  Skipped:   {self.stats['skipped']}")
        print(f"  Errors:    {self.stats['errors']}")

        return self.stats


async def main():
    """Run the importer."""
    async with async_session_maker() as session:
        importer = LiberationFiguresImporter(session)
        await importer.run()


if __name__ == "__main__":
    asyncio.run(main())
