#!/usr/bin/env python3

"""
Validate heritage data schema and check for duplicate IDs.
"""

import json
import sys
from pathlib import Path
from collections import Counter

# Define the required schema structure
REQUIRED_SCHEMA = {
    'id': str,
    'date': str,
    'gender': str,
    'familyName': {
        'main': {
            'native': (str, type(None)),
            'english': (str, type(None)),
            'russian': (str, type(None))
        },
        'pre': {
            'native': (str, type(None)),
            'english': (str, type(None)),
            'russian': (str, type(None))
        }
    },
    'ethnicity': {
        'main': {
            'native': (str, type(None)),
            'english': (str, type(None)),
            'russian': (str, type(None)),
            'sub': {
                'native': (str, type(None)),
                'english': (str, type(None)),
                'russian': (str, type(None))
            }
        },
        'pre': {
            'native': (str, type(None)),
            'english': (str, type(None)),
            'russian': (str, type(None)),
            'sub': {
                'native': (str, type(None)),
                'english': (str, type(None)),
                'russian': (str, type(None))
            }
        }
    },
    'location': {
        'coordinates': {
            'main': {
                'latitude': (float, int, type(None)),
                'longitude': (float, int, type(None))
            },
            'pre': {
                'latitude': (float, int, type(None)),
                'longitude': (float, int, type(None))
            }
        },
        'village': {
            'main': {
                'native': (str, type(None)),
                'russian': (str, type(None)),
                'english': (str, type(None))
            },
            'pre': {
                'native': (str, type(None)),
                'russian': (str, type(None)),
                'english': (str, type(None))
            }
        },
        'region': {
            'main': {
                'native': (str, type(None)),
                'russian': (str, type(None)),
                'english': (str, type(None))
            },
            'pre': {
                'native': (str, type(None)),
                'russian': (str, type(None)),
                'english': (str, type(None))
            }
        },
        'state': {
            'main': {
                'native': (str, type(None)),
                'russian': (str, type(None)),
                'english': (str, type(None))
            },
            'pre': {
                'native': (str, type(None)),
                'russian': (str, type(None)),
                'english': (str, type(None))
            }
        }
    },
    'yDnaHaplogroup': {
        'root': (str, type(None)),
        'clade': (str, type(None)),
        'subclade': (str, type(None)),
        'terminalSnp': (str, type(None)),
        'SnpList': (str, type(None))
    },
    'mtDnaHaplogroup': {
        'root': (str, type(None)),
        'clade': (str, type(None)),
        'terminalSnp': (str, type(None))
    }
}

# Optional fields that may not exist in all records
OPTIONAL_FIELDS = ['lab', 'urls']

def check_schema(data, schema, path='', optional_fields=None):
    """Recursively check if data matches schema."""
    errors = []
    optional_fields = optional_fields or []
    
    for key, expected_type in schema.items():
        current_path = f"{path}.{key}" if path else key
        
        # Skip optional fields if they don't exist
        if key in optional_fields and key not in data:
            continue
        
        # Check if key exists
        if key not in data:
            errors.append(f"Missing key: {current_path}")
            continue
        
        value = data[key]
        
        # If expected_type is a dict, recurse
        if isinstance(expected_type, dict):
            if value is not None and not isinstance(value, dict):
                errors.append(f"Wrong type at {current_path}: expected dict, got {type(value).__name__}")
            elif value is not None:
                errors.extend(check_schema(value, expected_type, current_path, optional_fields))
        else:
            # Check if value type matches expected
            if not isinstance(value, expected_type):
                expected_names = expected_type if isinstance(expected_type, tuple) else (expected_type,)
                expected_str = ' or '.join(t.__name__ for t in expected_names)
                errors.append(f"Wrong type at {current_path}: expected {expected_str}, got {type(value).__name__}")
    
    return errors

def validate_file(filepath, check_duplicates=True):
    """Validate a single JSON file."""
    print(f"\n{'='*70}")
    print(f"Validating: {filepath}")
    print('='*70)
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
        return False
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return False
    
    families = data.get('families', [])
    print(f"\n📊 Found {len(families)} families")
    
    # Check for duplicate IDs
    if check_duplicates:
        print("\n🔍 Checking for duplicate IDs...")
        ids = [f.get('id') for f in families]
        id_counts = Counter(ids)
        duplicates = {id_val: count for id_val, count in id_counts.items() if count > 1}
        
        if duplicates:
            print(f"❌ Found {len(duplicates)} duplicate IDs:")
            for id_val, count in duplicates.items():
                print(f"   - ID '{id_val}' appears {count} times")
            return False
        else:
            print(f"✅ All {len(ids)} IDs are unique")
    
    # Validate schema for each family
    print("\n🔍 Validating schema for each family...")
    all_errors = []
    
    for i, family in enumerate(families):
        family_id = family.get('id', f'index-{i}')
        errors = check_schema(family, REQUIRED_SCHEMA, optional_fields=OPTIONAL_FIELDS)
        
        if errors:
            all_errors.append((family_id, errors))
    
    if all_errors:
        print(f"\n❌ Schema validation failed for {len(all_errors)} families:\n")
        for family_id, errors in all_errors:
            print(f"Family ID: {family_id}")
            for error in errors[:5]:  # Show first 5 errors
                print(f"  - {error}")
            if len(errors) > 5:
                print(f"  ... and {len(errors) - 5} more errors")
            print()
        return False
    else:
        print(f"✅ All families have correct schema")
    
    return True

def validate_ethnic_files():
    """Validate all ethnic data files."""
    ethnic_dir = Path('data/ethnic')
    
    if not ethnic_dir.exists():
        print(f"❌ Ethnic directory not found: {ethnic_dir}")
        return False
    
    files = sorted(ethnic_dir.glob('heritage-data-*.json'))
    
    if not files:
        print(f"❌ No ethnic data files found in {ethnic_dir}")
        return False
    
    all_valid = True
    for filepath in files:
        if not validate_file(filepath, check_duplicates=True):
            all_valid = False
    
    return all_valid

def validate_unified_file():
    """Validate the unified heritage-data.json file."""
    return validate_file('data/heritage-data.json', check_duplicates=True)

def check_cross_file_duplicates():
    """Check for duplicate IDs across all ethnic files."""
    print(f"\n{'='*70}")
    print("Checking for duplicate IDs across all ethnic files")
    print('='*70)
    
    ethnic_dir = Path('data/ethnic')
    files = sorted(ethnic_dir.glob('heritage-data-*.json'))
    
    all_ids = []
    file_ids = {}
    
    for filepath in files:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        ids = [f.get('id') for f in data.get('families', [])]
        file_ids[filepath.name] = ids
        all_ids.extend(ids)
    
    id_counts = Counter(all_ids)
    duplicates = {id_val: count for id_val, count in id_counts.items() if count > 1}
    
    if duplicates:
        print(f"\n❌ Found {len(duplicates)} IDs duplicated across files:")
        for id_val, count in duplicates.items():
            print(f"\n   ID '{id_val}' appears {count} times in:")
            for filename, ids in file_ids.items():
                if id_val in ids:
                    print(f"      - {filename}")
        return False
    else:
        print(f"\n✅ All {len(all_ids)} IDs are unique across all files")
        return True

def main():
    """Main validation function."""
    print("🔍 Heritage Data Validation\n")
    
    results = []
    
    # Validate ethnic files
    print("\n" + "="*70)
    print("VALIDATING ETHNIC FILES")
    print("="*70)
    results.append(("Ethnic files", validate_ethnic_files()))
    
    # Check cross-file duplicates
    results.append(("Cross-file duplicates", check_cross_file_duplicates()))
    
    # Validate unified file
    print("\n" + "="*70)
    print("VALIDATING UNIFIED FILE")
    print("="*70)
    results.append(("Unified file", validate_unified_file()))
    
    # Summary
    print("\n" + "="*70)
    print("VALIDATION SUMMARY")
    print("="*70)
    
    all_passed = True
    for name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status:12s} - {name}")
        if not passed:
            all_passed = False
    
    print("="*70)
    
    if all_passed:
        print("\n🎉 All validations passed!")
        sys.exit(0)
    else:
        print("\n❌ Some validations failed. Please fix the errors above.")
        sys.exit(1)

if __name__ == '__main__':
    main()
