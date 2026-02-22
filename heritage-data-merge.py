#!/usr/bin/env python3
"""
Merge ethnicity-specific heritage data files into unified heritage-data.json.
Reads all heritage-data-*.json files and combines them.
"""

import json
import glob
from datetime import datetime
from pathlib import Path

def merge_heritage_data(output_file='data/heritage-data.json'):
    """Merge all ethnicity-specific files into one unified file."""
    
    # Find all ethnicity-specific data files in data/ethnic/ subdirectory
    pattern = 'data/ethnic/heritage-data-*.json'
    exclude_patterns = [
        'heritage-data.json',
        'heritage-data-manifest.json',
        'heritage-data-progress.json',
        'heritage-data-template.json',
        'heritage-data-original-backup.json',
        'heritage-data-backup.json'
    ]
    data_files = [f for f in glob.glob(pattern) 
                  if Path(f).name not in exclude_patterns]
    
    if not data_files:
        print('❌ No ethnicity-specific files found.')
        print(f'   Looking for files matching: {pattern}')
        return
    
    print(f'🔍 Found {len(data_files)} ethnicity files:\n')
    
    all_families = []
    ethnicity_stats = {}
    
    # Load and merge each file
    for filepath in sorted(data_files):
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        families = data.get('families', [])
        ethnicity = data.get('metadata', {}).get('ethnicity', 'Unknown')
        
        all_families.extend(families)
        ethnicity_stats[ethnicity] = len(families)
        
        print(f'   ✅ {Path(filepath).name:35s} {len(families):3d} families')
    
    # Sort families by date (newest first)
    all_families.sort(key=lambda x: x.get('date', ''), reverse=True)
    
    # Create unified data structure
    unified_data = {
        'metadata': {
            'version': '2.0.0',
            'lastUpdated': datetime.now().strftime('%Y-%m-%d'),
            'totalFamilies': len(all_families),
            'ethnicities': ethnicity_stats,
            'generatedFrom': sorted([Path(f).name for f in data_files])
        },
        'families': all_families
    }
    
    # Write unified file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(unified_data, f, ensure_ascii=False, indent=2)
    
    print(f'\n✅ Created {output_file}')
    print(f'\n📊 Summary:')
    print(f'   Total ethnicities: {len(ethnicity_stats)}')
    print(f'   Total families: {len(all_families)}')
    print(f'\n📋 Breakdown by ethnicity:')
    for ethnicity, count in sorted(ethnicity_stats.items(), key=lambda x: -x[1]):
        print(f'   {ethnicity:15s} {count:3d} families')

if __name__ == '__main__':
    merge_heritage_data()
