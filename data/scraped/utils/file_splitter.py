#!/usr/bin/env python3
"""
File Splitter - Splits large JSON files into <90MB chunks for GitHub.
"""
import json
import os
from pathlib import Path
from datetime import datetime


class FileSplitter:
    MAX_SIZE_MB = 90
    MAX_RECORDS = 50000
    
    def __init__(self, max_size_mb=90, max_records=50000):
        self.max_size_mb = max_size_mb
        self.max_records = max_records
    
    def split_file(self, input_path, output_dir=None, prefix=None):
        input_path = Path(input_path)
        output_dir = Path(output_dir or input_path.parent)
        prefix = prefix or input_path.stem
        
        output_dir.mkdir(parents=True, exist_ok=True)
        
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if isinstance(data, dict) and 'records' in data:
            records = data['records']
            metadata = {k: v for k, v in data.items() if k != 'records'}
        elif isinstance(data, list):
            records = data
            metadata = {}
        else:
            records = [data]
            metadata = {}
        
        parts = []
        part_num = 1
        current_batch = []
        current_size = 0
        
        for record in records:
            record_size = len(json.dumps(record, ensure_ascii=False).encode('utf-8'))
            
            if (current_size + record_size > self.max_size_mb * 1024 * 1024 or 
                len(current_batch) >= self.max_records) and current_batch:
                part_info = self._write_part(output_dir, prefix, part_num, current_batch, metadata)
                parts.append(part_info)
                part_num += 1
                current_batch = []
                current_size = 0
            
            current_batch.append(record)
            current_size += record_size
        
        if current_batch:
            part_info = self._write_part(output_dir, prefix, part_num, current_batch, metadata)
            parts.append(part_info)
        
        manifest = self._create_manifest(output_dir, prefix, parts, metadata)
        
        return manifest
    
    def _write_part(self, output_dir, prefix, part_num, records, metadata):
        filename = f"{prefix}_part_{part_num:03d}.json"
        filepath = output_dir / filename
        
        output_data = records
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False)
        
        size_mb = os.path.getsize(filepath) / (1024 * 1024)
        
        return {
            'filename': filename,
            'records': len(records),
            'size_mb': round(size_mb, 2)
        }
    
    def _create_manifest(self, output_dir, prefix, parts, metadata):
        total_records = sum(p['records'] for p in parts)
        
        manifest = {
            'data_type': prefix,
            'total_records': total_records,
            'last_updated': datetime.now().isoformat()[:10],
            'parts': parts,
        }
        
        if metadata:
            manifest['metadata'] = metadata
        
        manifest_path = output_dir / '_manifest.json'
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2)
        
        return manifest_path


def split_json_file(input_path, output_dir=None, max_size_mb=90, max_records=50000):
    splitter = FileSplitter(max_size_mb, max_records)
    return splitter.split_file(input_path, output_dir)


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        manifest = split_json_file(sys.argv[1])
        print(f"Created manifest: {manifest}")
