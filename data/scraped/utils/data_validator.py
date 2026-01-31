#!/usr/bin/env python3
"""
Data Validator - Validates scraped data before import.
"""
import json
import logging
from pathlib import Path
from typing import Any, Optional
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


SCHEMA_DEFINITIONS = {
    'person': {
        'required': ['name'],
        'optional': ['wikidata_id', 'birth_date', 'death_date', 'birth_place', 'country', 'description', 'categories', 'occupation'],
        'types': {'name': str, 'wikidata_id': str, 'categories': list}
    },
    'book': {
        'required': ['title'],
        'optional': ['wikidata_id', 'author', 'authors', 'publication_year', 'publisher', 'isbn', 'subjects', 'description', 'language', 'url'],
        'types': {'title': str, 'authors': list, 'subjects': list, 'publication_year': (int, str)}
    },
    'event': {
        'required': ['name'],
        'optional': ['wikidata_id', 'date', 'start_date', 'end_date', 'location', 'country', 'description', 'event_type', 'coordinates'],
        'types': {'name': str, 'coordinates': (list, dict)}
    },
    'election': {
        'required': ['country'],
        'optional': ['wikidata_id', 'date', 'election_type', 'winner', 'results', 'turnout', 'seats'],
        'types': {'country': str, 'results': (list, dict)}
    },
    'party': {
        'required': ['name'],
        'optional': ['wikidata_id', 'country', 'founded', 'dissolved', 'ideology', 'position', 'colors', 'leaders'],
        'types': {'name': str, 'ideology': (str, list)}
    },
    'conflict': {
        'required': ['name'],
        'optional': ['wikidata_id', 'start_date', 'end_date', 'location', 'countries', 'parties', 'casualties', 'outcome', 'description'],
        'types': {'name': str, 'countries': list, 'casualties': (int, dict)}
    },
    'economic': {
        'required': ['country', 'year'],
        'optional': ['gdp', 'gdp_per_capita', 'inflation', 'unemployment', 'debt', 'trade_balance', 'currency'],
        'types': {'year': int, 'gdp': (int, float)}
    },
    'budget': {
        'required': ['country', 'year'],
        'optional': ['total', 'military', 'education', 'health', 'social', 'infrastructure', 'currency'],
        'types': {'year': int}
    },
    'movement': {
        'required': ['name'],
        'optional': ['wikidata_id', 'start_date', 'end_date', 'country', 'countries', 'goals', 'methods', 'outcome', 'leaders'],
        'types': {'name': str, 'countries': list}
    },
    'policy': {
        'required': ['name', 'country'],
        'optional': ['date', 'policy_type', 'category', 'description', 'effects', 'status'],
        'types': {'name': str, 'category': str}
    },
    'demographic': {
        'required': ['country', 'year'],
        'optional': ['population', 'urban_population', 'rural_population', 'age_distribution', 'ethnic_composition'],
        'types': {'year': int, 'population': (int, float)}
    }
}


class DataValidator:
    def __init__(self, schema_type: str, strict: bool = False):
        if schema_type not in SCHEMA_DEFINITIONS:
            raise ValueError(f'Unknown schema type: {schema_type}. Available: {list(SCHEMA_DEFINITIONS.keys())}')
        
        self.schema_type = schema_type
        self.schema = SCHEMA_DEFINITIONS[schema_type]
        self.strict = strict
        self.errors = []
        self.warnings = []
        self.stats = {'valid': 0, 'invalid': 0, 'fixed': 0}
    
    def validate_record(self, record: dict) -> tuple[bool, Optional[dict]]:
        errors = []
        warnings = []
        fixed_record = record.copy()
        
        for field in self.schema['required']:
            if field not in record or record[field] is None or record[field] == '':
                errors.append(f'Missing required field: {field}')
        
        type_specs = self.schema.get('types', {})
        for field, expected_type in type_specs.items():
            if field in record and record[field] is not None:
                if not isinstance(record[field], expected_type):
                    if not self.strict:
                        try:
                            if expected_type == str:
                                fixed_record[field] = str(record[field])
                            elif expected_type == int:
                                fixed_record[field] = int(record[field])
                            elif expected_type == list and isinstance(record[field], str):
                                fixed_record[field] = [record[field]]
                            self.stats['fixed'] += 1
                        except (ValueError, TypeError):
                            errors.append(f'Field {field} has wrong type: expected {expected_type}, got {type(record[field])}')
                    else:
                        errors.append(f'Field {field} has wrong type')
        
        all_fields = set(self.schema['required'] + self.schema.get('optional', []))
        for field in record.keys():
            if field not in all_fields and not field.startswith('_'):
                warnings.append(f'Unknown field: {field}')
        
        if errors:
            self.errors.extend(errors)
            self.stats['invalid'] += 1
            return False, None
        
        if warnings:
            self.warnings.extend(warnings)
        
        self.stats['valid'] += 1
        return True, fixed_record
    
    def validate_batch(self, records: list[dict]) -> tuple[list[dict], list[dict]]:
        valid_records = []
        invalid_records = []
        
        for i, record in enumerate(records):
            is_valid, fixed = self.validate_record(record)
            if is_valid and fixed:
                valid_records.append(fixed)
            else:
                record['_validation_index'] = i
                invalid_records.append(record)
        
        return valid_records, invalid_records
    
    def validate_file(self, file_path: Path) -> dict:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if isinstance(data, list):
            records = data
        elif isinstance(data, dict) and 'records' in data:
            records = data['records']
        else:
            records = [data]
        
        valid, invalid = self.validate_batch(records)
        
        return {
            'file': str(file_path),
            'schema_type': self.schema_type,
            'total_records': len(records),
            'valid_records': len(valid),
            'invalid_records': len(invalid),
            'fixed_records': self.stats['fixed'],
            'errors': self.errors[:10],
            'warnings': self.warnings[:10]
        }
    
    def get_report(self) -> dict:
        return {
            'schema_type': self.schema_type,
            'stats': self.stats,
            'error_count': len(self.errors),
            'warning_count': len(self.warnings),
            'sample_errors': self.errors[:5],
            'sample_warnings': self.warnings[:5]
        }


def validate_records(records: list[dict], schema_type: str) -> tuple[list[dict], list[dict]]:
    validator = DataValidator(schema_type)
    return validator.validate_batch(records)


def validate_json_file(file_path: str, schema_type: str) -> dict:
    validator = DataValidator(schema_type)
    return validator.validate_file(Path(file_path))


if __name__ == '__main__':
    import sys
    if len(sys.argv) > 2:
        result = validate_json_file(sys.argv[1], sys.argv[2])
        print(json.dumps(result, indent=2))
    else:
        print('Usage: python data_validator.py <file.json> <schema_type>')
        print(f'Schema types: {list(SCHEMA_DEFINITIONS.keys())}')
