# Hireable AI Model - Complete Phase Plan

## Overview
Building an AI resume analyzer that takes a resume + job URL, scrapes the job posting, extracts skills, compares them, and provides a readiness score with learning recommendations.

---

## Phase 1: Project Setup & Feature Extraction ✅ DONE
**Duration:** Week 1-2  
**Owner:** Person B (ML Engineer)  
**Status:** Complete

### Deliverables:
- [x] Project structure (`/lib/ml/`, `/data/`, `/models/`)
- [x] Skill vocabulary (100+ tech skills)
- [x] Feature extraction functions
- [x] Data loader & preprocessing pipeline
- [x] Type definitions
- [x] Test suite

### Files Created:
- `lib/ml/types.ts` - TypeScript interfaces
- `lib/ml/skillVocabulary.ts` - 100+ skills + encodings
- `lib/ml/featureExtractor.ts` - Extract & normalize features
- `lib/ml/dataLoader.ts` - Load & preprocess data
- `lib/ml/tests.ts` - Test suite
- `lib/ml/index.ts` - Exports

### Output:
Ready to accept training data from Person A

---

## Phase 2: Model Architecture & Training Pipeline ✅ DONE
**Duration:** Week 3  
**Owner:** Person B (ML Engineer)  
**Status:** Complete

### Deliverables:
- [x] Neural network architecture (4 output heads)
- [x] Training loop with early stopping
- [x] Model evaluation functions
- [x] Complete training automation
- [x] Save/load model functionality

### Files Created:
- `lib/ml/model.ts` - Neural network (128→64→32 architecture)
- `lib/ml/trainer.ts` - Training loop & evaluation
- `lib/ml/trainingPipeline.ts` - Full automation

### Architecture:
```
Input (~200 dims)
  ↓
Dense(128) + ReLU → Dropout(0.3)
  ↓
Dense(64) + ReLU → Dropout(0.3)
  ↓
Dense(32) + ReLU
  ↓
4 Output Heads:
├─ Readiness Score (0-100)
├─ Missing Skills Count
├─ Matched Skills Count
└─ Estimated Weeks to Learn
```

### Output:
`runTrainingPipeline()` ready to train once Person A provides data

---

## Phase 3: Job Scraper & Parser 📋 TO DO
**Duration:** Week 3-4  
**Owner:** Person A (Data Scientist)  
**Status:** Not started

### Deliverables:
- [ ] Job URL scraper module
- [ ] HTML parsers for different job sites
- [ ] Job description text extractor
- [ ] Skill extractor from text
- [ ] Error handling & validation
- [ ] Caching layer

### Files to Create:
- `lib/ml/jobScraper.ts` - Main scraper orchestrator
- `lib/ml/parsers/linkedinParser.ts` - LinkedIn job parser
- `lib/ml/parsers/indeedParser.ts` - Indeed job parser
- `lib/ml/parsers/glassdoorParser.ts` - Glassdoor job parser
- `lib/ml/parsers/baseParser.ts` - Base parser class

### Supported Job Sites:
- LinkedIn (linkedin.com/jobs)
- Indeed (indeed.com/viewjob)
- Glassdoor (glassdoor.com/job)
- Levels.fyi
- Other generic job boards

### Key Functions:
```typescript
// Main entry point
async function scrapeJobPosting(url: string): Promise<{
  title: string
  company: string
  description: string
  requirements: string
  skills: string[]
  seniority: string
  location?: string
  salary?: string
  postedDate?: string
}>

// Skill extraction from text
function extractSkillsFromDescription(text: string): string[]

// URL validation
function validateJobUrl(url: string): boolean

// Caching
async function getCachedJobOrScrape(url: string): Promise<JobData>
```

### Data Flow:
```
User Input: "https://linkedin.com/jobs/7654321"
     ↓
Validate URL
     ↓
Fetch HTML
     ↓
Parse HTML (LinkedIn parser)
     ↓
Extract: title, company, description
     ↓
Extract skills from description
     ↓
Return: { title, company, skills, description, ... }
```

### Output:
Job URL → Parsed job data with extracted skills ready for model

---

## Phase 4: Training & Model Evaluation ⏳ WAITING FOR DATA
**Duration:** Week 3-4  
**Owner:** Person B (ML Engineer)  
**Status:** Blocked (waiting for training data from Person A)

### Prerequisites:
- Person A delivers `data/training_data.json` (2,000 labeled examples)

### What Happens:
1. Run `runTrainingPipeline()`
2. Load 2,000 training examples
3. Preprocess & normalize data
4. Train model (8-24 hours depending on hardware)
5. Evaluate on test set
6. Calculate accuracy metrics
7. Save trained model weights

### Key Functions:
```typescript
await runTrainingPipeline()
  ↓
1. loadTrainingData('data/training_data.json')
2. preprocessData(rawData)
3. getDatasetStats(processedData)
4. normalizeData(processedData)
5. splitData(normalized) → [train, val, test]
6. buildModel(inputDimensions)
7. compileModel(model)
8. trainModel(model, splits.train, splits.validation)
9. evaluateModel(model, splits.test)
10. saveModel(model)
```

### Expected Metrics:
- Test Loss: < 0.1
- MAE: < 0.15
- Readiness Score Accuracy: ±10 points
- Missing Skills Detection: 80%+ recall
- Timeline Estimation: ±2 weeks

### Output:
Trained model weights saved to `/models/resume-analyzer-model`

---

## Phase 5: API Integration & Backend 📋 TO DO
**Duration:** Week 5  
**Owner:** Person A (Data Scientist)  
**Status:** Not started

### Prerequisites:
- Phase 3 (Job Scraper) complete
- Phase 4 (Trained Model) complete

### Deliverables:
- [ ] API endpoint `/api/analyze-resume`
- [ ] API endpoint `/api/scrape-job`
- [ ] Resume text/PDF extraction
- [ ] Input validation
- [ ] Error handling
- [ ] Response formatting
- [ ] Caching layer
- [ ] Rate limiting

### Files to Create:
- `app/api/analyze-resume/route.ts` - Main analysis endpoint
- `app/api/scrape-job/route.ts` - Job scraping endpoint
- `lib/api/resumeAnalyzer.ts` - Analysis logic

### API Endpoints:

#### POST `/api/analyze-resume`
```typescript
Request Body: {
  resume: string,           // Resume text (plain text or extracted from PDF)
  jobUrl: string,           // Job posting URL
  format?: 'detailed' | 'summary'
}

Response: {
  readinessScore: number,           // 0-100
  confidence: number,               // 0-1
  matchedSkills: string[],          // Skills you have
  missingSkills: string[],          // Skills you need
  criticalSkills: string[],         // Must-have skills
  importantSkills: string[],        // Should-have skills
  niceToHaveSkills: string[],       // Optional skills
  estimatedWeeksToLearn: number,    // Total timeline
  resources: {
    skill: string,
    title: string,
    url: string,
    type: 'course' | 'documentation' | 'tutorial' | 'book',
    estimatedHours: number
  }[],
  resumeSuggestions: {
    section: string,
    current: string,
    suggested: string,
    reason: string
  }[],
  nextSteps: string[]
}
```

#### POST `/api/scrape-job`
```typescript
Request Body: {
  url: string
}

Response: {
  title: string,
  company: string,
  location?: string,
  salary?: string,
  description: string,
  requirements: string,
  skills: string[],
  seniority: string,
  postedDate?: string
}
```

### Processing Flow:
```
User API Call
  ↓
Validate inputs
  ↓
Extract resume text (if PDF)
  ↓
Scrape job URL (or use cached data)
  ↓
Extract features from resume
  ↓
Extract features from job
  ↓
Load trained model
  ↓
Make prediction
  ↓
Format response
  ↓
Return to frontend
```

### Output:
API ready to serve predictions to frontend

---

## Phase 6: Frontend UI Component 📋 TO DO
**Duration:** Week 5  
**Owner:** Person B (ML Engineer)  
**Status:** Not started

### Prerequisites:
- Phase 5 (API) complete

### Deliverables:
- [ ] Resume analyzer component
- [ ] Input forms (resume + job URL)
- [ ] Results dashboard
- [ ] Skill visualization
- [ ] Timeline visualization
- [ ] Resources display
- [ ] Loading states
- [ ] Error handling

### Component Structure:
```
<ResumeAnalyzer />
├── <InputSection />
│   ├── <ResumeInput />
│   │   ├── File upload (PDF)
│   │   └── Text area (paste text)
│   └── <JobInput />
│       ├── URL input field
│       ├── Load/Scrape button
│       └── <JobPreview />
│           ├── Title: "Senior React Developer"
│           ├── Company: "Google"
│           └── Skills: [React, TypeScript, AWS, ...]
├── <AnalysisButton />
│   └── "Analyze Resume"
└── <ResultsSection />
    ├── <ReadinessScoreCard />
    │   └── 72/100 with progress bar
    ├── <SkillsGapCard />
    │   ├── Matched: [React, Node.js, ...]
    │   ├── Missing: [TypeScript, AWS, ...]
    │   └── Critical/Important/Nice-to-have categorization
    ├── <TimelineCard />
    │   └── "8 weeks to be job-ready"
    ├── <ResourcesCard />
    │   ├── TypeScript
    │   │   ├── TypeScript Handbook (docs)
    │   │   ├── Advanced Types Course (course)
    │   │   └── Practice Project (tutorial)
    │   └── AWS
    │       ├── AWS Certification (course)
    │       └── AWS Documentation (docs)
    ├── <ResumeSuggestionsCard />
    │   ├── Add TypeScript experience
    │   ├── Highlight AWS projects
    │   └── Include system design section
    └── <ActionButtons />
        ├── Save Report
        ├── Share
        └── Try Another Job
```

### UI Flow:
```
1. User lands on page
   ↓
2. Paste resume (or upload PDF)
   ↓
3. Paste job URL
   ↓
4. Click "Load Job"
   → Shows: Title, Company, Skills preview
   ↓
5. User confirms & clicks "Analyze"
   → Loading spinner...
   ↓
6. Results dashboard appears
   ├── Readiness Score: 72/100
   ├── Missing Skills: TypeScript, AWS, Docker
   ├── Timeline: 8 weeks
   ├── Resources: [links]
   └── Resume Fixes: [suggestions]
   ↓
7. User can:
   - Save report
   - Try another job
   - Download resources list
```

### Features:
- Real-time job preview while loading
- Visual skill matching (green = matched, red = missing)
- Progress indicators
- Responsive design (mobile-friendly)
- Accessibility (a11y)
- Dark mode support

### Output:
Complete UI ready for production

---

## Phase 7: Testing & Optimization 📋 TO DO
**Duration:** Week 6  
**Owner:** Both (Person A & B)  
**Status:** Not started

### Prerequisites:
- Phase 5 (API) complete
- Phase 6 (UI) complete

### Testing Checklist:

#### Functionality Testing
- [ ] Resume upload/text input works
- [ ] Job URL scraping works for all supported sites
- [ ] Skill matching is accurate
- [ ] AI predictions are reasonable
- [ ] All API endpoints respond correctly
- [ ] Error handling works

#### Accuracy Testing
- [ ] Readiness score within ±10 points
- [ ] Missing skills detected correctly
- [ ] Timeline estimates are reasonable
- [ ] Resume suggestions are relevant

#### Performance Testing
- [ ] API response time < 2 seconds
- [ ] Model inference time < 500ms
- [ ] Job scraping time < 3 seconds
- [ ] UI renders smoothly

#### Edge Cases
- [ ] Broken URLs handled gracefully
- [ ] Invalid resume formats handled
- [ ] Non-tech job postings handled
- [ ] Empty required fields validated

#### User Experience Testing
- [ ] UI is intuitive
- [ ] Loading states clear
- [ ] Error messages helpful
- [ ] Results easy to understand

### Optimization Tasks:
- [ ] Cache frequently scraped jobs
- [ ] Optimize model inference (quantization)
- [ ] Compress API responses
- [ ] Lazy load components
- [ ] Minify JavaScript/CSS
- [ ] Add service worker for offline support

### Performance Targets:
- Page load: < 3 seconds
- API response: < 2 seconds
- Model inference: < 500ms
- Total flow: < 5 seconds

### Output:
Production-ready, tested, optimized application deployed

---

## Complete Timeline

```
Week 1-2: Phase 1 (Person B)
  ✅ Project setup & features

Week 2-3: Phase 1 → 2 (Sync)
  Person A: Starts data generation
  Person B: Completes Phase 2

Week 3: Phase 2 (Person B) ✅ Done
  Phase 3 (Person A) - Starts job scraper
  Person B: Starts Phase 4 training

Week 3-4: Phase 4 (Person B)
  Training running (8-24 hours)
  Person A: Completes Phase 3 scraper

Week 4: Phase 4 → 5 (Sync)
  Model trained & saved
  Person A: Starts Phase 5 API

Week 5: Phase 5-6 (Both)
  Person A: API endpoints
  Person B: Frontend UI
  Integration: Connect API to UI

Week 6: Phase 7 (Both)
  Testing all components
  Optimization
  Bug fixes
  Deployment
  ✅ Production ready!
```

---

## Work Split Summary

### Person A (Data Science):
- **Phase 3:** Job scraper & parsers
- **Phase 5:** API endpoints & backend logic
- **Phase 6:** Assist with testing
- **Phase 7:** Testing & optimization

### Person B (ML Engineering):
- **Phase 1:** Project structure & features ✅
- **Phase 2:** Neural network ✅
- **Phase 4:** Model training & evaluation
- **Phase 6:** Frontend UI & components
- **Phase 7:** Testing & optimization

### Together:
- **Phase 7:** Final testing, optimization, deployment

---

## Success Criteria

### By End of Week 6:

✅ **Functionality:**
- Resume upload working
- Job URL scraping working
- AI predictions generated
- API endpoints responding
- UI displaying results

✅ **Accuracy:**
- Readiness scores within ±10 points
- Missing skills detected correctly
- Timeline estimates accurate

✅ **Performance:**
- API response < 2 seconds
- Model inference < 500ms
- UI loads smoothly

✅ **User Experience:**
- Intuitive interface
- Clear error messages
- Mobile responsive
- Accessible

✅ **Deployment:**
- Production ready
- All tests passing
- Performance optimized

---

## Key Files by Phase

```
Phase 1:
├── lib/ml/types.ts
├── lib/ml/skillVocabulary.ts
├── lib/ml/featureExtractor.ts
├── lib/ml/dataLoader.ts
└── lib/ml/index.ts

Phase 2:
├── lib/ml/model.ts
├── lib/ml/trainer.ts
├── lib/ml/trainingPipeline.ts
└── PHASE2_STATUS.md

Phase 3:
├── lib/ml/jobScraper.ts
├── lib/ml/parsers/baseParser.ts
├── lib/ml/parsers/linkedinParser.ts
├── lib/ml/parsers/indeedParser.ts
└── lib/ml/parsers/glassdoorParser.ts

Phase 4:
└── data/training_data.json (from Person A)

Phase 5:
├── app/api/analyze-resume/route.ts
├── app/api/scrape-job/route.ts
└── lib/api/resumeAnalyzer.ts

Phase 6:
├── components/ResumeAnalyzer.tsx
├── components/InputSection.tsx
├── components/JobPreview.tsx
├── components/ResultsSection.tsx
├── components/ReadinessScoreCard.tsx
├── components/SkillsGapCard.tsx
├── components/TimelineCard.tsx
├── components/ResourcesCard.tsx
└── components/ResumeSuggestionsCard.tsx

Phase 7:
├── __tests__/integration.test.ts
├── __tests__/accuracy.test.ts
└── DEPLOYMENT.md
```

---

## Next Steps

**Person A:**
1. Start Phase 3 (Job Scraper)
2. Support job sites: LinkedIn, Indeed, Glassdoor

**Person B:**
1. Wait for training data from Person A
2. Once received, run Phase 4 (training)
3. Then start Phase 6 (UI components)

**Sync Point:** Week 2 end - Person A delivers `data/training_data.json`

---

**Ready to begin? 🚀**
