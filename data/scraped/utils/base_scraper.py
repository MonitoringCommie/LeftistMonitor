#!/usr/bin/env python3
"""
Base Scraper - Abstract base class for all scrapers with rate limiting and resumption.
"""
import json
import time
import logging
import hashlib
from abc import ABC, abstractmethod
from pathlib import Path
from datetime import datetime
from typing import Generator, Any, Optional
import requests

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


class BaseScraper(ABC):
    """Base class for all scrapers with rate limiting, caching, and resumption."""
    
    def __init__(
        self,
        output_dir: str,
        name: str,
        rate_limit: float = 1.0,
        cache_dir: Optional[str] = None,
        max_retries: int = 3,
        timeout: int = 60
    ):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.name = name
        self.rate_limit = rate_limit
        self.max_retries = max_retries
        self.timeout = timeout
        
        self.cache_dir = Path(cache_dir) if cache_dir else self.output_dir / '.cache'
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        self.logger = logging.getLogger(name)
        self.stats = {'fetched': 0, 'cached': 0, 'errors': 0, 'total': 0}
        self.last_request_time = 0
        
        self.progress_file = self.output_dir / f'.{name}_progress.json'
        self.progress = self._load_progress()
    
    def _load_progress(self) -> dict:
        if self.progress_file.exists():
            with open(self.progress_file, 'r') as f:
                return json.load(f)
        return {'completed': [], 'last_run': None}
    
    def _save_progress(self):
        self.progress['last_run'] = datetime.now().isoformat()
        with open(self.progress_file, 'w') as f:
            json.dump(self.progress, f, indent=2)
    
    def _rate_limit_wait(self):
        elapsed = time.time() - self.last_request_time
        if elapsed < self.rate_limit:
            time.sleep(self.rate_limit - elapsed)
        self.last_request_time = time.time()
    
    def _get_cache_key(self, url: str, params: dict = None) -> str:
        cache_str = url + json.dumps(params or {}, sort_keys=True)
        return hashlib.md5(cache_str.encode()).hexdigest()
    
    def _get_cached(self, cache_key: str) -> Optional[dict]:
        cache_file = self.cache_dir / f'{cache_key}.json'
        if cache_file.exists():
            with open(cache_file, 'r') as f:
                return json.load(f)
        return None
    
    def _set_cached(self, cache_key: str, data: dict):
        cache_file = self.cache_dir / f'{cache_key}.json'
        with open(cache_file, 'w') as f:
            json.dump(data, f)
    
    def fetch_url(self, url: str, params: dict = None, headers: dict = None, use_cache: bool = True) -> Optional[dict]:
        cache_key = self._get_cache_key(url, params)
        
        if use_cache:
            cached = self._get_cached(cache_key)
            if cached:
                self.stats['cached'] += 1
                return cached
        
        self._rate_limit_wait()
        
        default_headers = {
            'User-Agent': f'LeftistMonitor/{self.name}/1.0 (historical research project)',
            'Accept': 'application/json'
        }
        if headers:
            default_headers.update(headers)
        
        for attempt in range(self.max_retries):
            try:
                response = requests.get(url, params=params, headers=default_headers, timeout=self.timeout)
                response.raise_for_status()
                data = response.json()
                
                if use_cache:
                    self._set_cached(cache_key, data)
                
                self.stats['fetched'] += 1
                return data
                
            except requests.exceptions.RequestException as e:
                self.logger.warning(f'Request failed (attempt {attempt + 1}): {e}')
                if attempt < self.max_retries - 1:
                    time.sleep(2 ** attempt)
                else:
                    self.stats['errors'] += 1
                    return None
    
    @abstractmethod
    def get_queries(self) -> list[dict]:
        """Return list of queries/tasks to execute."""
        pass
    
    @abstractmethod
    def execute_query(self, query: dict) -> list[dict]:
        """Execute a single query and return results."""
        pass
    
    @abstractmethod
    def transform_record(self, raw: dict) -> dict:
        """Transform raw API response to standardized format."""
        pass
    
    def run(self, resume: bool = True) -> Path:
        self.logger.info(f'Starting {self.name} scraper')
        
        queries = self.get_queries()
        all_records = []
        
        for i, query in enumerate(queries):
            query_id = query.get('id', str(i))
            
            if resume and query_id in self.progress['completed']:
                self.logger.info(f'Skipping completed query: {query_id}')
                continue
            
            self.logger.info(f'Executing query {i+1}/{len(queries)}: {query_id}')
            
            try:
                results = self.execute_query(query)
                
                for raw in results:
                    transformed = self.transform_record(raw)
                    if transformed:
                        all_records.append(transformed)
                        self.stats['total'] += 1
                
                self.progress['completed'].append(query_id)
                self._save_progress()
                
            except Exception as e:
                self.logger.error(f'Error in query {query_id}: {e}')
                self.stats['errors'] += 1
        
        output_file = self.output_dir / f'{self.name}_results.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_records, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f'Scraping complete: {self.stats}')
        self.logger.info(f'Output: {output_file}')
        
        return output_file
    
    def clear_cache(self):
        for f in self.cache_dir.glob('*.json'):
            f.unlink()
        self.logger.info('Cache cleared')
    
    def reset_progress(self):
        self.progress = {'completed': [], 'last_run': None}
        self._save_progress()
        self.logger.info('Progress reset')


class WikidataScraper(BaseScraper):
    """Specialized scraper for Wikidata SPARQL queries."""
    
    ENDPOINT = 'https://query.wikidata.org/sparql'
    
    def __init__(self, output_dir: str, name: str, rate_limit: float = 2.0, **kwargs):
        super().__init__(output_dir, name, rate_limit, **kwargs)
    
    def execute_sparql(self, query: str) -> list[dict]:
        params = {'query': query, 'format': 'json'}
        result = self.fetch_url(self.ENDPOINT, params=params)
        
        if result and 'results' in result:
            return result['results']['bindings']
        return []
    
    def execute_query(self, query: dict) -> list[dict]:
        sparql = query.get('sparql', '')
        return self.execute_sparql(sparql)


class APIScraper(BaseScraper):
    """Specialized scraper for REST APIs with pagination."""
    
    def __init__(self, output_dir: str, name: str, base_url: str, rate_limit: float = 1.0, **kwargs):
        super().__init__(output_dir, name, rate_limit, **kwargs)
        self.base_url = base_url
    
    def fetch_paginated(self, endpoint: str, params: dict = None, page_key: str = 'page', 
                       results_key: str = 'results', max_pages: int = 100) -> list[dict]:
        all_results = []
        params = params or {}
        page = 1
        
        while page <= max_pages:
            params[page_key] = page
            url = f'{self.base_url}/{endpoint}'
            
            data = self.fetch_url(url, params=params)
            if not data:
                break
            
            results = data.get(results_key, [])
            if not results:
                break
            
            all_results.extend(results)
            self.logger.info(f'Page {page}: {len(results)} results (total: {len(all_results)})')
            
            if 'next' not in data and len(results) < params.get('limit', 100):
                break
            
            page += 1
        
        return all_results


if __name__ == '__main__':
    print('Base scraper classes - import and extend to use')
