"""
Master importer for all Palestine occupation data.
"""
import asyncio
from .nakba_villages import NakbaVillagesImporter
from .nakba_villages_extended import NakbaVillagesExtendedImporter
from .settlements import SettlementsImporter
from .settlements_comprehensive import SettlementsComprehensiveImporter
from .massacres import MassacresImporter
from .separation_wall import SeparationWallImporter
from .checkpoints import CheckpointsImporter
from .checkpoints_comprehensive import CheckpointsComprehensiveImporter


async def import_all_palestine_data():
    """Run all Palestine data importers in sequence."""
    print("=" * 60)
    print("IMPORTING PALESTINE OCCUPATION DATA")
    print("=" * 60)

    importers = [
        ("Nakba Villages (Core)", NakbaVillagesImporter),
        ("Nakba Villages (Extended)", NakbaVillagesExtendedImporter),
        ("Settlements (Basic)", SettlementsImporter),
        ("Settlements (Comprehensive)", SettlementsComprehensiveImporter),
        ("Massacres", MassacresImporter),
        ("Separation Wall", SeparationWallImporter),
        ("Checkpoints (Basic)", CheckpointsImporter),
        ("Checkpoints (Comprehensive)", CheckpointsComprehensiveImporter),
    ]

    results = {}
    for name, ImporterClass in importers:
        print(f"\n--- Importing {name} ---")
        try:
            importer = ImporterClass()
            count = await importer.run()
            results[name] = count
            print(f"  {name}: {count} records imported")
        except Exception as e:
            print(f"  ERROR importing {name}: {e}")
            results[name] = f"ERROR: {e}"

    print("\n" + "=" * 60)
    print("IMPORT SUMMARY")
    print("=" * 60)
    for name, count in results.items():
        print(f"  {name}: {count}")

    return results


async def main():
    await import_all_palestine_data()

if __name__ == "__main__":
    asyncio.run(main())
