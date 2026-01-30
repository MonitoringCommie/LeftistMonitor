"""Base importer class."""
from abc import ABC, abstractmethod
from typing import Any, Generator
import logging

from sqlalchemy.ext.asyncio import AsyncSession


class BaseImporter(ABC):
    """Base class for all data importers."""
    
    def __init__(self, db: AsyncSession, batch_size: int = 1000):
        self.db = db
        self.batch_size = batch_size
        self.logger = logging.getLogger(self.__class__.__name__)
        self.stats = {
            "processed": 0,
            "created": 0,
            "updated": 0,
            "skipped": 0,
            "errors": 0,
        }
    
    @abstractmethod
    async def fetch_data(self) -> Generator[dict[str, Any], None, None]:
        """Yield raw records from the source."""
        pass
    
    @abstractmethod
    def transform(self, raw_record: dict[str, Any]) -> dict[str, Any] | None:
        """Transform raw record to our schema. Return None to skip."""
        pass
    
    @abstractmethod
    async def load(self, transformed_record: dict[str, Any]) -> None:
        """Load transformed record into database."""
        pass
    
    async def run(self) -> dict[str, int]:
        """Execute the full import pipeline."""
        self.logger.info(f"Starting import with {self.__class__.__name__}")
        
        batch = []
        async for raw_record in self.fetch_data():
            try:
                transformed = self.transform(raw_record)
                if transformed is None:
                    self.stats["skipped"] += 1
                    continue
                
                batch.append(transformed)
                
                if len(batch) >= self.batch_size:
                    await self._process_batch(batch)
                    batch = []
                    
            except Exception as e:
                self.logger.error(f"Error processing record: {e}")
                self.stats["errors"] += 1
        
        # Process remaining batch
        if batch:
            await self._process_batch(batch)
        
        await self.db.commit()
        self.logger.info(f"Import complete: {self.stats}")
        return self.stats
    
    async def _process_batch(self, batch: list[dict[str, Any]]) -> None:
        """Process a batch of records."""
        for record in batch:
            try:
                await self.load(record)
                self.stats["processed"] += 1
            except Exception as e:
                self.logger.error(f"Error loading record: {e}")
                self.stats["errors"] += 1
