# Phase 1: Project Setup & Feature Extraction

## ✅ Completed (Person B - Week 1)

### Project Structure
```
hireable/
├── lib/ml/                          # ML code
│   ├── types.ts                     # TypeScript interfaces
│   ├── skillVocabulary.ts           # 100+ tech skills + encodings
│   ├── featureExtractor.ts          # Extract & normalize features
│   ├── dataLoader.ts                # Load & preprocess data
│   ├── tests.ts                     # Test suite
│   └── index.ts                     # Exports
├── data/                            # Training data (from Person A)
│   ├── resumes.json                 # 2,000 resume profiles
│   ├── jobs.json                    # 500 job postings
│   └── training_data.json           # Labeled training data
└── models/                          # Trained models (Week 3-4)
```

### Created Files

#### 1. `lib/ml/types.ts`
- `ResumeFeatures` - Extracted resume data structure
- `JobFeatures` - Extracted job posting data structure
- `TrainingExample` - Resume + Job + Labels
- `ProcessedData` - Model-ready data format
- `DataSplit` - Train/Val/Test split
- `Batch` - Mini-batch for training
- `PredictionOutput` - Model prediction format

#### 2. `lib/ml/skillVocabulary.ts`
- **100+ tech skills** across categories:
  - Frontend: React, Vue, Angular, TypeScript, etc.
  - Backend: Node.js, Python, Java, Go, Rust, etc.
  - Database: PostgreSQL, MongoDB, Redis, etc.
  - DevOps: Docker, Kubernetes, AWS, GCP, Azure, etc.
  - Data/ML: TensorFlow, PyTorch, Pandas, Spark, etc.
  - Mobile: React Native, Flutter, Swift, etc.
  - Tools: Git, NPM, Yarn, Docker Hub, etc.
  - Soft Skills: Leadership, Communication, System Design, etc.

- **Education encoding**: HS(0), Associate(1), Bachelor's(2), Master's(3), PhD(4)
- **Seniority encoding**: Entry(0.2) to Principal(1.0)
- **Skill aliases**: Normalize "react.js" → "React", etc.

#### 3. `lib/ml/featureExtractor.ts`
Functions:
- `createSkillVector()` - One-hot encoding of skills
- `extractResumeFeatures()` - Parse resume into features
- `extractJobFeatures()` - Parse job posting into features
- `getMatchedSkills()` - Find common skills
- `getMissingSkills()` - Find skill gaps
- `normalizeEducationLevel()` - Standardize education strings
- `normalizeSeniorityLevel()` - Standardize seniority strings
- `encodeAllFeatures()` - Combine all features into input vector

#### 4. `lib/ml/dataLoader.ts`
Functions:
- `loadTrainingData()` - Load JSON training data
- `preprocessData()` - Convert raw data to model format
- `splitData()` - Split into train/val/test (70/15/15)
- `createBatches()` - Create mini-batches for training
- `getDatasetStats()` - Calculate data statistics
- `normalizeData()` - Standardize features

#### 5. `lib/ml/tests.ts`
- Test feature extraction with mock data
- Validate skill matching
- Test normalization functions

## 🎯 Current Status

✅ **Complete:**
- Project structure created
- All feature extraction functions built
- Data loader pipeline ready
- 100+ tech skills defined
- Education/seniority encodings defined
- Test suite created

⏳ **Waiting for Person A:**
- `data/resumes.json` - 2,000 synthetic resume profiles
- `data/jobs.json` - 500 synthetic job postings  
- `data/training_data.json` - Labeled training data

## 📋 How to Test (Now)

You can test the feature extractor with mock data:

```bash
# In your terminal, run the test
npm run test:features

# Or directly with Node
node -r ts-node/register lib/ml/tests.ts
```

Expected output:
- Resume features parsed correctly
- Job features parsed correctly
- Skills matched/missing identified
- Normalization working

## 📊 Input Data Format (from Person A)

Person A will provide `data/training_data.json` in this format:

```json
[
  {
    "resumeFeatures": {
      "skills": ["React", "TypeScript", "Node.js"],
      "experienceYears": 3,
      "educationLevel": "Bachelor's"
    },
    "jobFeatures": {
      "requiredSkills": ["React", "TypeScript", "Node.js", "AWS", "Docker"],
      "requiredExperienceYears": 5,
      "seniority": "Senior"
    },
    "labels": {
      "readinessScore": 65,
      "missingSkillCount": 2,
      "matchedSkillCount": 3,
      "estimatedWeeksToLearn": 8
    }
  },
  ...
]
```

## 🔄 Next Steps (Week 2)

Once Person A provides training data:

1. **Load and preprocess data:**
   ```typescript
   const data = await loadTrainingData('data/training_data.json');
   const processed = preprocessData(data);
   const splits = splitData(processed);
   ```

2. **Validate data shapes:**
   - Input dimensions: Should be `~200` (skill vector + numeric features)
   - Output dimensions: Should be `4` (score, missing skills, matched skills, weeks)

3. **Get dataset statistics:**
   ```typescript
   const stats = getDatasetStats(processed);
   console.log(stats);
   ```

4. **Prepare batches for training:**
   ```typescript
   const batches = createBatches(splits.train, batchSize=32);
   ```

## 📚 Files Overview

| File | Purpose | Lines |
|------|---------|-------|
| `types.ts` | TypeScript interfaces | 50 |
| `skillVocabulary.ts` | 100+ skills + encodings | 200+ |
| `featureExtractor.ts` | Feature extraction logic | 300+ |
| `dataLoader.ts` | Data loading & processing | 350+ |
| `tests.ts` | Test suite | 80+ |
| `index.ts` | Exports | 10 |

## 🚀 Key Functions Summary

```typescript
// Feature extraction
extractResumeFeatures(skills, experience, education)
extractJobFeatures(requiredSkills, experience, seniority)

// Skill operations  
getMatchedSkills(resumeSkills, jobSkills)
getMissingSkills(resumeSkills, jobSkills)
createSkillVector(skills)

// Data processing
loadTrainingData(filePath)
preprocessData(rawData)
splitData(data, split)
createBatches(data, batchSize)

// Utilities
normalizeEducationLevel(education)
normalizeSeniorityLevel(seniority)
getDatasetStats(data)
normalizeData(data)
```

## 💾 Output Format (After preprocessing)

```typescript
ProcessedData {
  inputs: number[][]        // [2000, ~200] - Feature vectors
  outputs: number[][]       // [2000, 4] - Labels (normalized 0-1)
  metadata: {
    totalExamples: 2000
    inputDimensions: ~200
    outputDimensions: 4
  }
}
```

## 🤝 Sync with Person A

**Week 1 End:** 
- [ ] Person A sends `data/training_data.json` (2,000 examples)
- [ ] Test data loads and preprocesses correctly
- [ ] Validate shapes and statistics

**Week 2 Start:**
- Begin building neural network (your next phase)

---

**Person B, you're all set for Phase 1! 🎉**

Once you have the training data from Person A, proceed to Phase 2 (Model Architecture).
