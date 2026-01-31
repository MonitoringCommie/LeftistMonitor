#!/usr/bin/env python3
"""
Manifest Loader - Handles loading data from chunked manifest files.
"""
import json
import logging
from pathlib import Path
from typing import Generator, Any, Optional
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ManifestLoader:
    def __init__(self, manifest_path):
        self.manifest_path = Path(manifest_path)
        self.base_dir = self.manifest_path.parent
        self.manifest = self._load_manifest()
        
    def _load_manifest(self):
        if not self.manifest_path.exists():
            raise FileNotFoundError(f"Manifest not found: {self.manifest_path}")
        with open(self.manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
        required = ["data_type", "total_records", "parts"]
        for field in required:
            if field not in manifest:
                raise ValueError(f"Manifest missing: {field}")
        return manifest
    
    @property
    def data_type(self):
        return self.manifest["data_type"]
    
    @property
    def total_records(self):
        return self.manifest["total_records"]
    
    @property
    def parts(self):
        return self.manifest["parts"]
    
    def iter_records(self):
        for part in self.parts:
            part_path = self.base_dir / part["filename"]
            if not part_path.exists():
                logger.warning(f"Part file not found: {part_path}")
                continue
            logger.info(f"Loading {part['filename']}")
            with open(part_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, list):
                yield from data
            elif isinstance(data, dict) and "records" in data:
                yield from data["records"]
    
    def load_all(self):
        return list(self.iter_records())
    
    def get_stats(self):
        total_size_mb = sum(p.get("size_mb", 0) for p in self.parts)
        return {
            "data_type": self.data_type,
            "total_records": self.total_records,
            "num_parts": len(self.parts),
            "total_size_mb": total_size_mb,
        }


def load_from_manifest(manifest_path):
    loader = ManifestLoader(manifest_path)
    yield from loader.iter_records()


def create_manifest(data_type, parts, output_path, metadata=None):
    total_records = sum(p.get("records", 0) for p in parts)
    manifest = {
        "data_type": data_type,
        "total_records": total_records,
        "last_updated": datetime.now().isoformat()[:10],
        "parts": parts,
    }
    if metadata:
        manifest["metadata"] = metadata
    manifest_path = Path(output_path) / "_manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    return manifest_path


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        loader = ManifestLoader(sys.argv[1])
        print(loader.get_stats())
