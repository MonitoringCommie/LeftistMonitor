import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/historical_map")

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def run_all_importers():
    from .kashmir.kashmir_importer import KashmirImporter
    from .tibet.tibet_importer import TibetImporter
    from .kurdistan.kurdistan_importer import KurdistanImporter
    from .west_papua.west_papua_importer import WestPapuaImporter
    
    print("=" * 60)
    print("RUNNING LIBERATION STRUGGLE IMPORTERS")
    print("=" * 60)
    
    importers = [
        ("Kashmir", KashmirImporter),
        ("Tibet", TibetImporter),
        ("Kurdistan", KurdistanImporter),
        ("West Papua", WestPapuaImporter),
    ]
    
    results = {}
    
    async with async_session() as session:
        for name, ImporterClass in importers:
            print(f"
--- Importing {name} data ---")
            try:
                importer = ImporterClass(db=session)
                stats = await importer.run(session)
                results[name] = stats
                print(f"  {name}: {stats}")
            except Exception as e:
                print(f"  ERROR importing {name}: {e}")
                import traceback
                traceback.print_exc()
                results[name] = f"ERROR: {e}"
    
    print("
" + "=" * 60)
    print("IMPORT SUMMARY")
    print("=" * 60)
    for name, stats in results.items():
        print(f"  {name}: {stats}")
    
    return results


async def main():
    await run_all_importers()


if __name__ == "__main__":
    asyncio.run(main())
