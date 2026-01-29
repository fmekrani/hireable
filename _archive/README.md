# Archive - Old/Deprecated Files

This directory contains previous versions of data and scripts that have been superseded by improved versions.

## Why archived?

- **Old data**: Generated with simpler algorithms; replaced by intelligent training data
- **Old scripts**: Experimental or intermediate versions; replaced by final implementations

## Active Files (in main project)

### Data Files (current)
- `data/training_data_intelligent.json` - **ACTIVE** - 6,000 training pairs with multi-factor readiness scoring
- `data/resumes_research_based.csv` - **ACTIVE** - 3,000 high-quality research-based resumes
- `data/jobs_research_based.csv` - **ACTIVE** - 200 high-quality research-based job descriptions

### Scripts (current)
- `scripts/generate_intelligent_training.py` - **ACTIVE** - Generates intelligent training data
- `scripts/generate_research_based.py` - **ACTIVE** - Generates research-based resume/job data
- `scripts/train.ts` - **ACTIVE** - Model training script

## Archive Contents

### Old Data
- `synthetic_resumes.csv`, `synthetic_resumes_3000.csv`, `synthetic_resumes_5000.csv` - Early synthetic resume versions
- `synthetic_jobs.csv` - Early synthetic job version
- `training_data.json` - Original training data (2,000 pairs)
- `training_data_enhanced.json` - Intermediate enhanced version
- `training_data_final.json` - Intermediate final version
- `resumes_research_based.json`, `jobs_research_based.json` - JSON conversions of CSVs (replaced by CSV)

### Old Scripts
- `generate_training_data.py` - Original training data generator
- `generate_training_data_enhanced.py` - Enhanced training data generator
- `generate_intelligent_training_data.py` - Early intelligent version
- `generate_research_based_data.py` - Early research-based version
- `create_hybrid_dataset.py` - Hybrid dataset experiment
- `analyze_datasets.py` - Dataset analysis tool
- `train.js` - Old JavaScript train script (replaced by train.ts)

## If you need to recover anything
Files are still available in `_archive/data/` and `_archive/scripts/` subdirectories.
