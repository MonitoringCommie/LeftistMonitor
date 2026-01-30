"""Import leftist/Marxist/anarchist figures and books from Wikidata."""
import asyncio
import httpx
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import date
import re

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import async_session_maker
from ..geography.models import Country
from .models import Person, Book, BookAuthor


WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql"

# SPARQL query to get leftist political figures
LEFTIST_FIGURES_QUERY = """
SELECT DISTINCT ?person ?personLabel ?birth ?death ?birthPlaceLabel ?deathPlaceLabel 
       ?image ?countryLabel ?occupationLabel ?ideologyLabel ?description
WHERE {
  # People who are members of or associated with leftist ideologies
  {
    ?person wdt:P106 wd:Q82955 .  # Politicians
    ?person wdt:P102 ?party .      # Member of political party
    ?party wdt:P1142 ?ideology .   # Party ideology
    VALUES ?ideology { 
      wd:Q6186       # Marxism
      wd:Q7264       # Communism
      wd:Q49892      # Democratic socialism
      wd:Q7272       # Socialism
      wd:Q6199       # Anarchism
      wd:Q182090     # Marxism-Leninism
      wd:Q183744     # Trotskyism
      wd:Q131254     # Maoism
      wd:Q201843     # Libertarian socialism
      wd:Q184950     # Social democracy
    }
  }
  UNION
  {
    # Direct ideology association
    ?person wdt:P737 ?ideology .  # Influenced by
    VALUES ?ideology { 
      wd:Q9061    # Karl Marx
      wd:Q9916    # Friedrich Engels  
      wd:Q10518   # Lenin
      wd:Q5816    # Trotsky
      wd:Q7378    # Mao
      wd:Q5593    # Antonio Gramsci
      wd:Q3621    # Rosa Luxemburg
    }
  }
  UNION
  {
    # People with specific leftist occupations/roles
    ?person wdt:P106 ?occupation .
    VALUES ?occupation {
      wd:Q1734564    # Revolutionary
      wd:Q2393388    # Communist activist
      wd:Q15978355   # Marxist
      wd:Q17124576   # Anarchist
    }
  }
  
  # Optional properties
  OPTIONAL { ?person wdt:P569 ?birth . }
  OPTIONAL { ?person wdt:P570 ?death . }
  OPTIONAL { ?person wdt:P19 ?birthPlace . }
  OPTIONAL { ?person wdt:P20 ?deathPlace . }
  OPTIONAL { ?person wdt:P18 ?image . }
  OPTIONAL { ?person wdt:P27 ?country . }
  OPTIONAL { ?person wdt:P106 ?occupation . }
  OPTIONAL { ?person wdt:P1142 ?ideology . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  
  # Filter to humans only
  ?person wdt:P31 wd:Q5 .
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
LIMIT 500
"""

# Famous leftist theorists to import with manual data
NOTABLE_LEFTISTS = [
    {
        "wikidata_id": "Q9061",
        "name": "Karl Marx",
        "birth_date": "1818-05-05",
        "death_date": "1883-03-14",
        "birth_place": "Trier, Germany",
        "death_place": "London, United Kingdom",
        "person_types": ["philosopher", "economist", "writer", "activist"],
        "ideology_tags": ["communist", "marxist", "socialist"],
        "bio_short": "German philosopher, economist, and revolutionary socialist. Author of Das Kapital and The Communist Manifesto.",
    },
    {
        "wikidata_id": "Q9916",
        "name": "Friedrich Engels",
        "birth_date": "1820-11-28",
        "death_date": "1895-08-05",
        "birth_place": "Wuppertal, Germany",
        "death_place": "London, United Kingdom",
        "person_types": ["philosopher", "writer", "activist"],
        "ideology_tags": ["communist", "marxist", "socialist"],
        "bio_short": "German philosopher and Marx's closest collaborator. Co-author of The Communist Manifesto.",
    },
    {
        "wikidata_id": "Q10518",
        "name": "Vladimir Lenin",
        "birth_date": "1870-04-22",
        "death_date": "1924-01-21",
        "birth_place": "Ulyanovsk, Russia",
        "death_place": "Gorki, Soviet Union",
        "person_types": ["politician", "revolutionary", "writer"],
        "ideology_tags": ["communist", "marxist", "marxist-leninist"],
        "bio_short": "Russian revolutionary and leader of the Bolshevik Revolution. First leader of Soviet Russia.",
    },
    {
        "wikidata_id": "Q5816",
        "name": "Leon Trotsky",
        "birth_date": "1879-11-07",
        "death_date": "1940-08-21",
        "birth_place": "Bereslavka, Ukraine",
        "death_place": "Mexico City, Mexico",
        "person_types": ["politician", "revolutionary", "writer"],
        "ideology_tags": ["communist", "marxist", "trotskyist"],
        "bio_short": "Marxist revolutionary and theorist. Founded the Red Army and developed theory of permanent revolution.",
    },
    {
        "wikidata_id": "Q3621",
        "name": "Rosa Luxemburg",
        "birth_date": "1871-03-05",
        "death_date": "1919-01-15",
        "birth_place": "Zamosc, Poland",
        "death_place": "Berlin, Germany",
        "person_types": ["politician", "revolutionary", "writer", "economist"],
        "ideology_tags": ["communist", "marxist", "socialist"],
        "bio_short": "Polish-German Marxist theorist and revolutionary. Key figure in European socialism.",
    },
    {
        "wikidata_id": "Q5593",
        "name": "Antonio Gramsci",
        "birth_date": "1891-01-22",
        "death_date": "1937-04-27",
        "birth_place": "Ales, Italy",
        "death_place": "Rome, Italy",
        "person_types": ["politician", "philosopher", "writer"],
        "ideology_tags": ["communist", "marxist"],
        "bio_short": "Italian Marxist philosopher. Developed theory of cultural hegemony.",
    },
    {
        "wikidata_id": "Q7378",
        "name": "Mao Zedong",
        "birth_date": "1893-12-26",
        "death_date": "1976-09-09",
        "birth_place": "Shaoshan, China",
        "death_place": "Beijing, China",
        "person_types": ["politician", "revolutionary", "writer"],
        "ideology_tags": ["communist", "marxist", "maoist"],
        "bio_short": "Chinese communist revolutionary and founder of the People's Republic of China.",
    },
    {
        "wikidata_id": "Q5575",
        "name": "Che Guevara",
        "birth_date": "1928-06-14",
        "death_date": "1967-10-09",
        "birth_place": "Rosario, Argentina",
        "death_place": "La Higuera, Bolivia",
        "person_types": ["revolutionary", "politician", "physician"],
        "ideology_tags": ["communist", "marxist", "guerrilla"],
        "bio_short": "Argentine Marxist revolutionary and key figure in the Cuban Revolution.",
    },
    {
        "wikidata_id": "Q36303",
        "name": "Mikhail Bakunin",
        "birth_date": "1814-05-30",
        "death_date": "1876-07-01",
        "birth_place": "Pryamukhino, Russia",
        "death_place": "Bern, Switzerland",
        "person_types": ["philosopher", "revolutionary", "writer"],
        "ideology_tags": ["anarchist", "socialist", "collectivist"],
        "bio_short": "Russian revolutionary anarchist and founder of collectivist anarchism.",
    },
    {
        "wikidata_id": "Q312817",
        "name": "Peter Kropotkin",
        "birth_date": "1842-12-09",
        "death_date": "1921-02-08",
        "birth_place": "Moscow, Russia",
        "death_place": "Dmitrov, Soviet Russia",
        "person_types": ["philosopher", "scientist", "writer", "activist"],
        "ideology_tags": ["anarchist", "communist", "anarcho-communist"],
        "bio_short": "Russian anarcho-communist philosopher and scientist. Author of Mutual Aid.",
    },
    {
        "wikidata_id": "Q7281",
        "name": "Emma Goldman",
        "birth_date": "1869-06-27",
        "death_date": "1940-05-14",
        "birth_place": "Kaunas, Lithuania",
        "death_place": "Toronto, Canada",
        "person_types": ["activist", "writer", "philosopher"],
        "ideology_tags": ["anarchist", "feminist", "anarcho-communist"],
        "bio_short": "Lithuanian-American anarchist activist known for writings on anarchism, feminism, and freedom.",
    },
    {
        "wikidata_id": "Q5752",
        "name": "Fidel Castro",
        "birth_date": "1926-08-13",
        "death_date": "2016-11-25",
        "birth_place": "Biran, Cuba",
        "death_place": "Havana, Cuba",
        "person_types": ["politician", "revolutionary"],
        "ideology_tags": ["communist", "marxist-leninist"],
        "bio_short": "Cuban revolutionary and politician who led Cuba for nearly five decades.",
    },
    {
        "wikidata_id": "Q12749",
        "name": "Ho Chi Minh",
        "birth_date": "1890-05-19",
        "death_date": "1969-09-02",
        "birth_place": "Nghe An, Vietnam",
        "death_place": "Hanoi, Vietnam",
        "person_types": ["politician", "revolutionary"],
        "ideology_tags": ["communist", "marxist-leninist", "nationalist"],
        "bio_short": "Vietnamese revolutionary leader who led Vietnam to independence.",
    },
    {
        "wikidata_id": "Q7743",
        "name": "Joseph Stalin",
        "birth_date": "1878-12-18",
        "death_date": "1953-03-05",
        "birth_place": "Gori, Georgia",
        "death_place": "Moscow, Soviet Union",
        "person_types": ["politician", "revolutionary"],
        "ideology_tags": ["communist", "marxist-leninist", "stalinist"],
        "bio_short": "Soviet revolutionary and political leader who led the USSR from 1924 to 1953.",
    },
    {
        "wikidata_id": "Q193459",
        "name": "Eugene V. Debs",
        "birth_date": "1855-11-05",
        "death_date": "1926-10-20",
        "birth_place": "Terre Haute, Indiana",
        "death_place": "Elmhurst, Illinois",
        "person_types": ["politician", "activist", "union organizer"],
        "ideology_tags": ["socialist", "labor"],
        "bio_short": "American socialist, labor leader, and five-time presidential candidate.",
    },
    {
        "wikidata_id": "Q166092",
        "name": "Thomas Sankara",
        "birth_date": "1949-12-21",
        "death_date": "1987-10-15",
        "birth_place": "Yako, Upper Volta",
        "death_place": "Ouagadougou, Burkina Faso",
        "person_types": ["politician", "revolutionary", "military"],
        "ideology_tags": ["marxist", "pan-africanist", "anti-imperialist"],
        "bio_short": "Burkinabe revolutionary and President of Burkina Faso, known as 'Africa's Che Guevara'.",
    },
    {
        "wikidata_id": "Q181529",
        "name": "Salvador Allende",
        "birth_date": "1908-06-26",
        "death_date": "1973-09-11",
        "birth_place": "Valparaiso, Chile",
        "death_place": "Santiago, Chile",
        "person_types": ["politician", "physician"],
        "ideology_tags": ["socialist", "marxist", "democrat"],
        "bio_short": "Chilean socialist politician and first Marxist democratically elected as president.",
    },
    {
        "wikidata_id": "Q561",
        "name": "Angela Davis",
        "birth_date": "1944-01-26",
        "death_date": None,
        "birth_place": "Birmingham, Alabama",
        "death_place": None,
        "person_types": ["activist", "philosopher", "writer", "academic"],
        "ideology_tags": ["communist", "feminist", "anti-racist"],
        "bio_short": "American political activist, philosopher, and academic. Key figure in civil rights movement.",
    },
    {
        "wikidata_id": "Q9440",
        "name": "Noam Chomsky",
        "birth_date": "1928-12-07",
        "death_date": None,
        "birth_place": "Philadelphia, Pennsylvania",
        "death_place": None,
        "person_types": ["linguist", "philosopher", "activist", "writer"],
        "ideology_tags": ["anarcho-syndicalist", "libertarian-socialist"],
        "bio_short": "American linguist and political activist. Leading critic of US foreign policy.",
    },
]

# Important leftist books
NOTABLE_BOOKS = [
    {
        "wikidata_id": "Q133641",
        "title": "The Communist Manifesto",
        "publication_year": 1848,
        "book_type": "manifesto",
        "topics": ["communism", "class struggle", "capitalism"],
        "description": "Political pamphlet written by Marx and Engels, presenting their theory of history and class struggle.",
        "significance": "One of the most influential political documents in history, laying the foundation for communist movements worldwide.",
        "marxists_archive_url": "https://www.marxists.org/archive/marx/works/1848/communist-manifesto/",
        "authors": ["Q9061", "Q9916"],  # Marx and Engels
    },
    {
        "wikidata_id": "Q214947",
        "title": "Das Kapital",
        "publication_year": 1867,
        "book_type": "political_theory",
        "topics": ["capitalism", "economics", "labor", "class"],
        "description": "Marx's foundational theoretical text analyzing capitalism and its critique.",
        "significance": "The foundational work of Marxist economics, essential for understanding capitalism's contradictions.",
        "marxists_archive_url": "https://www.marxists.org/archive/marx/works/1867-c1/",
        "authors": ["Q9061"],
    },
    {
        "wikidata_id": "Q720891",
        "title": "State and Revolution",
        "publication_year": 1917,
        "book_type": "political_theory",
        "topics": ["state", "revolution", "marxism"],
        "description": "Lenin's work on the Marxist theory of the state.",
        "significance": "Key text for understanding Marxist-Leninist theory of revolutionary transformation.",
        "marxists_archive_url": "https://www.marxists.org/archive/lenin/works/1917/staterev/",
        "authors": ["Q10518"],
    },
    {
        "wikidata_id": "Q1231529",
        "title": "The Conquest of Bread",
        "publication_year": 1892,
        "book_type": "political_theory",
        "topics": ["anarchism", "communism", "economics"],
        "description": "Kropotkin's principal work on anarcho-communism.",
        "significance": "Foundational text of anarcho-communist thought.",
        "marxists_archive_url": "https://www.marxists.org/reference/archive/kropotkin-peter/1892/conquest-bread.htm",
        "authors": ["Q312817"],
    },
    {
        "wikidata_id": "Q830105",
        "title": "Mutual Aid: A Factor of Evolution",
        "publication_year": 1902,
        "book_type": "philosophy",
        "topics": ["anarchism", "evolution", "cooperation"],
        "description": "Kropotkin's argument for cooperation as a factor in evolution.",
        "significance": "Important work challenging Social Darwinism and supporting anarchist theory.",
        "marxists_archive_url": "https://www.marxists.org/reference/archive/kropotkin-peter/1902/mutual-aid/",
        "authors": ["Q312817"],
    },
    {
        "wikidata_id": "Q1200988",
        "title": "Prison Notebooks",
        "publication_year": 1948,
        "book_type": "political_theory",
        "topics": ["marxism", "hegemony", "culture", "philosophy"],
        "description": "Gramsci's notebooks written in prison, developing theory of cultural hegemony.",
        "significance": "Revolutionary contribution to Marxist theory, introducing concept of cultural hegemony.",
        "marxists_archive_url": "https://www.marxists.org/archive/gramsci/prison_notebooks/",
        "authors": ["Q5593"],
    },
    {
        "wikidata_id": "Q3057",
        "title": "What Is to Be Done?",
        "publication_year": 1902,
        "book_type": "political_theory",
        "topics": ["revolution", "party", "organization"],
        "description": "Lenin's pamphlet on revolutionary organization.",
        "significance": "Blueprint for revolutionary party organization that influenced global communist movements.",
        "marxists_archive_url": "https://www.marxists.org/archive/lenin/works/1901/witbd/",
        "authors": ["Q10518"],
    },
    {
        "wikidata_id": "Q1066778",
        "title": "Reform or Revolution",
        "publication_year": 1899,
        "book_type": "political_theory",
        "topics": ["socialism", "revolution", "reform"],
        "description": "Rosa Luxemburg's critique of reformist socialism.",
        "significance": "Classic text arguing for revolutionary transformation over gradual reform.",
        "marxists_archive_url": "https://www.marxists.org/archive/luxemburg/1900/reform-revolution/",
        "authors": ["Q3621"],
    },
    {
        "wikidata_id": "Q2368312",
        "title": "The Wretched of the Earth",
        "publication_year": 1961,
        "book_type": "political_theory",
        "topics": ["colonialism", "decolonization", "violence", "psychology"],
        "description": "Fanon's analysis of decolonization and the psychology of colonized peoples.",
        "significance": "Essential text on anti-colonial struggle and third world liberation.",
        "authors": ["Q208602"],  # Frantz Fanon
    },
    {
        "wikidata_id": "Q1066694",
        "title": "Pedagogy of the Oppressed",
        "publication_year": 1968,
        "book_type": "philosophy",
        "topics": ["education", "liberation", "praxis"],
        "description": "Freire's influential work on critical pedagogy.",
        "significance": "Revolutionary approach to education as a tool for liberation.",
        "authors": ["Q211182"],  # Paulo Freire
    },
]


class LeftistDataImporter:
    """Import leftist figures and books from Wikidata and other sources."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.country_cache: Dict[str, UUID] = {}

    async def get_country_by_name(self, name: str) -> Optional[UUID]:
        """Get country ID by name, with caching."""
        if name in self.country_cache:
            return self.country_cache[name]
        
        # Try to find country
        result = await self.db.execute(
            select(Country.id).where(
                Country.name_en.ilike(f"%{name}%")
            ).limit(1)
        )
        country = result.scalar_one_or_none()
        if country:
            self.country_cache[name] = country
        return country

    def parse_date(self, date_str: Optional[str]) -> Optional[date]:
        """Parse date string to date object."""
        if not date_str:
            return None
        try:
            # Handle various formats
            if len(date_str) == 10:
                return date.fromisoformat(date_str)
            elif len(date_str) == 4:
                return date(int(date_str), 1, 1)
        except (ValueError, TypeError):
            pass
        return None

    async def import_notable_leftists(self) -> int:
        """Import the curated list of notable leftist figures."""
        imported = 0
        
        for person_data in NOTABLE_LEFTISTS:
            # Check if already exists
            existing = await self.db.execute(
                select(Person.id).where(Person.wikidata_id == person_data["wikidata_id"])
            )
            if existing.scalar_one_or_none():
                print(f"  Skipping {person_data['name']} (already exists)")
                continue
            
            # Find primary country
            primary_country_id = None
            if person_data.get("birth_place"):
                # Extract country from birth place
                parts = person_data["birth_place"].split(", ")
                if parts:
                    country_name = parts[-1]
                    primary_country_id = await self.get_country_by_name(country_name)
            
            person = Person(
                wikidata_id=person_data["wikidata_id"],
                name=person_data["name"],
                birth_date=self.parse_date(person_data.get("birth_date")),
                death_date=self.parse_date(person_data.get("death_date")),
                birth_place=person_data.get("birth_place"),
                death_place=person_data.get("death_place"),
                person_types=person_data.get("person_types", []),
                ideology_tags=person_data.get("ideology_tags", []),
                bio_short=person_data.get("bio_short"),
                primary_country_id=primary_country_id,
            )
            
            self.db.add(person)
            imported += 1
            print(f"  Imported: {person_data['name']}")
        
        await self.db.commit()
        return imported

    async def import_notable_books(self) -> int:
        """Import the curated list of notable leftist books."""
        imported = 0
        
        for book_data in NOTABLE_BOOKS:
            # Check if already exists
            existing = await self.db.execute(
                select(Book.id).where(Book.wikidata_id == book_data["wikidata_id"])
            )
            if existing.scalar_one_or_none():
                print(f"  Skipping '{book_data['title']}' (already exists)")
                continue
            
            book = Book(
                wikidata_id=book_data["wikidata_id"],
                title=book_data["title"],
                publication_year=book_data.get("publication_year"),
                book_type=book_data.get("book_type"),
                topics=book_data.get("topics", []),
                description=book_data.get("description"),
                significance=book_data.get("significance"),
                marxists_archive_url=book_data.get("marxists_archive_url"),
            )
            
            self.db.add(book)
            await self.db.flush()  # Get the book ID
            
            # Link authors
            for author_wikidata_id in book_data.get("authors", []):
                # Find the person
                result = await self.db.execute(
                    select(Person.id).where(Person.wikidata_id == author_wikidata_id)
                )
                person_id = result.scalar_one_or_none()
                
                if person_id:
                    book_author = BookAuthor(
                        book_id=book.id,
                        person_id=person_id,
                        role="author"
                    )
                    self.db.add(book_author)
            
            imported += 1
            print(f"  Imported: '{book_data['title']}'")
        
        await self.db.commit()
        return imported

    async def run(self):
        """Run the full import."""
        print("Importing leftist figures and books...")
        
        print("\n1. Importing notable leftist figures...")
        people_count = await self.import_notable_leftists()
        print(f"   Imported {people_count} people")
        
        print("\n2. Importing notable leftist books...")
        books_count = await self.import_notable_books()
        print(f"   Imported {books_count} books")
        
        print(f"\nImport complete! Total: {people_count} people, {books_count} books")


async def main():
    """Run the importer."""
    async with async_session_maker() as session:
        importer = LeftistDataImporter(session)
        await importer.run()


if __name__ == "__main__":
    asyncio.run(main())
