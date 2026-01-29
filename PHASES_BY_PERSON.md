# Hireable AI Model - Phase Plan by Person

## Overview
Person A (Data Scientist) + Person B (ML Engineer) building resume analyzer together over 6 weeks

---

# PHASE 1: Project Setup & Feature Extraction

## ✅ Status: COMPLETE

### Person B Responsibilities:
- [x] Create project structure (`/lib/ml/`, `/data/`, `/models/`)
- [x] Define TypeScript interfaces (`types.ts`)
- [x] Build skill vocabulary (100+ tech skills)
- [x] Implement feature extraction functions
- [x] Build data loader & preprocessing
- [x] Create test suite

### Person A Responsibilities:
- [ ] (Not involved in Phase 1)

### Deliverables:
```
lib/ml/
├── types.ts                 (56 lines) ✅
├── skillVocabulary.ts       (269 lines) ✅
├── featureExtractor.ts      (165 lines) ✅
├── dataLoader.ts            (197 lines) ✅
├── tests.ts                 (80 lines) ✅
└── index.ts                 (10 lines) ✅
```

### Output:
Ready to accept training data

### Timeline:
**Week 1-2** (Person B only)

---

# PHASE 2: Model Architecture & Training Pipeline

## ✅ Status: COMPLETE

### Person B Responsibilities:
- [x] Design neural network architecture (4 output heads)
- [x] Build model.ts with buildModel() & compileModel()
- [x] Implement trainer.ts with training loop & evaluation
- [x] Create trainingPipeline.ts for automation
- [x] Implement early stopping & validation
- [x] Add model save/load functionality

### Person A Responsibilities:
- [ ] Prepare training data (2,000 labeled examples)
  - [ ] Generate resume profiles
  - [ ] Generate job postings
  - [ ] Label each pair with readiness scores

### Deliverables:
```
lib/ml/
├── model.ts                 (241 lines) ✅
├── trainer.ts               (372 lines) ✅
└── trainingPipeline.ts      (250+ lines) ✅

data/
└── training_data.json       (⏳ from Person A)
```

### Architecture:
```
Input(~200) → Dense(128)+ReLU → Dropout(0.3)
            → Dense(64)+ReLU  → Dropout(0.3)
            → Dense(32)+ReLU
            → 4 Outputs: [score, missing, matched, weeks]
```

### Output:
- Person B: `runTrainingPipeline()` ready to use
- Person A: Training data ready for model

### Timeline:
**Week 3** (Parallel work)
- Person B: Phase 2 development (3-4 days)
- Person A: Data generation (full week 1-2, continues into week 3)

---

# PHASE 3: Job Scraper & Parser

## 📋 Status: TO DO

### Person A Responsibilities:
- [ ] Build job scraper orchestrator (`jobScraper.ts`)
- [ ] Create base parser class (`parsers/baseParser.ts`)
- [ ] Implement LinkedIn parser (`parsers/linkedinParser.ts`)
  - [ ] Parse LinkedIn job HTML
  - [ ] Extract title, company, description
  - [ ] Extract requirements list
- [ ] Implement Indeed parser (`parsers/indeedParser.ts`)
  - [ ] Parse Indeed job HTML
  - [ ] Extract job details
- [ ] Implement Glassdoor parser (`parsers/glassdoorParser.ts`)
  - [ ] Parse Glassdoor job HTML
  - [ ] Extract job details
- [ ] Build skill extractor from job description
- [ ] Add URL validation
- [ ] Add caching layer
- [ ] Add error handling

### Person B Responsibilities:
- [ ] (Not involved in Phase 3)

### Deliverables:
```
lib/ml/
├── jobScraper.ts
├── parsers/
│   ├── baseParser.ts
│   ├── linkedinParser.ts
│   ├── indeedParser.ts
│   ├── glassdoorParser.ts
│   └── index.ts
└── index.ts (updated exports)
```

### Key Functions:
```typescript
// Main function
async function scrapeJobPosting(url: string): Promise<{
  title: string
  company: string
  description: string
  requirements: string
  skills: string[]
  seniority: string
  location?: string
  salary?: string
}>

// Skill extraction
function extractSkillsFromDescription(text: string): string[]

// URL validation
function validateJobUrl(url: string): boolean

// Caching
async function getCachedJobOrScrape(url: string): Promise<JobData>
```

### Supported Sites:
- LinkedIn.com/jobs
- Indeed.com
- Glassdoor.com
- Levels.fyi
- Generic job boards

### Data Flow:
```
User: "https://linkedin.com/jobs/123"
  ↓
validateJobUrl()
  ↓
fetch HTML
  ↓
parseLinkedInJob(html)
  ↓
extract: title, company, description, requirements
  ↓
extractSkillsFromDescription(description)
  ↓
Return: { title, company, skills, description, ... }
```

### Output:
Job URL → Parsed data with extracted skills

### Timeline:
**Week 3-4** (Person A)
- Week 3: Start building scrapers (while Person B trains model)
- Week 4: Complete & test all parsers

---

# PHASE 4: Training & Model Evaluation

## ⏳ Status: WAITING FOR DATA

### Person B Responsibilities:
- [ ] Wait for training data from Person A
- [ ] Run `runTrainingPipeline()`
- [ ] Monitor training (8-24 hours)
- [ ] Evaluate on test set
- [ ] Check accuracy metrics
- [ ] Save trained model weights
- [ ] Document results

### Person A Responsibilities:
- [ ] Deliver `data/training_data.json` (2,000 labeled examples)
- [ ] (Already done in Phase 2)

### Process:
```typescript
// Person B runs:
import { runTrainingPipeline } from 'lib/ml'

const result = await runTrainingPipeline()
// 1. Load training_data.json
// 2. Preprocess & normalize
// 3. Split 70/15/15
// 4. Build model
// 5. Train 8-24 hours (with early stopping)
// 6. Evaluate on test set
// 7. Save model
```

### Expected Output:
```
Training Summary:
├── Epochs: 35 (early stopped)
├── Final Loss: 0.0821
├── Final Val Loss: 0.0934
├── Best Val Loss: 0.0876 (Epoch 30)
├── Test Metrics:
│   ├── Test Loss: 0.0945
│   ├── Test MAE: 0.1401
│   └── R² Score: 0.85+
└── Model saved: /models/resume-analyzer-model
```

### Success Criteria:
- [x] Training completes without errors
- [x] Validation loss decreases
- [x] Test accuracy > 80%
- [x] Readiness score ±10 points
- [x] Timeline ±2 weeks

### Output:
Trained model weights ready for integration

### Timeline:
**Week 3-4** (Person B)
- Week 3: Start training (background process)
- Week 4: Training completes, evaluate results

---

# PHASE 5: API Integration & Backend

## 📋 Status: TO DO

### Person A Responsibilities:
- [ ] Build API endpoint `/api/analyze-resume`
  - [ ] Accept resume text + job URL
  - [ ] Call job scraper (Phase 3)
  - [ ] Extract resume features (Phase 1)
  - [ ] Call AI model (Phase 4)
  - [ ] Format response
- [ ] Build API endpoint `/api/scrape-job`
  - [ ] Accept job URL
  - [ ] Call job scraper
  - [ ] Return parsed data
- [ ] Add resume text/PDF extraction
- [ ] Add input validation
- [ ] Add error handling
- [ ] Add response formatting
- [ ] Add caching layer
- [ ] Add rate limiting

### Person B Responsibilities:
- [ ] (Not involved in Phase 5, working on Phase 6 UI)

### Files to Create:
```
app/api/
├── analyze-resume/
│   └── route.ts
├── scrape-job/
│   └── route.ts
└── utils/
    ├── resumeAnalyzer.ts
    ├── jobScraper.ts
    └── cache.ts
```

### API Endpoints:

#### POST `/api/analyze-resume`
```typescript
Request: {
  resume: string,        // Resume text
  jobUrl: string,        // Job posting URL
  format?: 'detailed' | 'summary'
}

Response: {
  readinessScore: number,        // 0-100
  confidence: number,            // 0-1
  matchedSkills: string[],
  missingSkills: string[],
  criticalSkills: string[],
  importantSkills: string[],
  niceToHaveSkills: string[],
  estimatedWeeksToLearn: number,
  resources: [{
    skill: string,
    title: string,
    url: string,
    type: 'course' | 'documentation' | 'tutorial' | 'book',
    estimatedHours: number
  }],
  resumeSuggestions: [{
    section: string,
    current: string,
    suggested: string,
    reason: string
  }],
  nextSteps: string[]
}
```

#### POST `/api/scrape-job`
```typescript
Request: { url: string }

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
POST /api/analyze-resume
  ↓
Validate inputs
  ↓
Load trained model
  ↓
Extract resume features
  ↓
Scrape job (via Phase 3)
  ↓
Extract job features
  ↓
Model prediction
  ↓
Format response
  ↓
Return JSON
```

### Output:
- API ready to serve predictions
- Connected to model
- Connected to job scraper
- Connected to feature extractor

### Timeline:
**Week 5** (Person A)
- Build both endpoints
- Test with Phase 3 scrapers
- Test with Phase 4 model

---

# PHASE 6: Frontend UI Component

## 📋 Status: TO DO

### Person B Responsibilities:
- [ ] Build ResumeAnalyzer component
- [ ] Build InputSection with resume upload
- [ ] Build JobInput with URL input
- [ ] Build JobPreview (shows title, company, skills)
- [ ] Build AnalysisButton
- [ ] Build ResultsSection
- [ ] Build ReadinessScoreCard (visual score display)
- [ ] Build SkillsGapCard (matched vs missing)
- [ ] Build TimelineCard (weeks visualization)
- [ ] Build ResourcesCard (learning resources)
- [ ] Build ResumeSuggestionsCard (fixes)
- [ ] Add loading states
- [ ] Add error handling
- [ ] Make responsive (mobile)
- [ ] Add accessibility

### Person A Responsibilities:
- [ ] (Not involved in Phase 6, working on Phase 5 API)

### Files to Create:
```
components/
├── ResumeAnalyzer.tsx
├── InputSection.tsx
├── ResumeInput.tsx
├── JobInput.tsx
├── JobPreview.tsx
├── AnalysisButton.tsx
├── ResultsSection.tsx
├── ReadinessScoreCard.tsx
├── SkillsGapCard.tsx
├── TimelineCard.tsx
├── ResourcesCard.tsx
├── ResumeSuggestionsCard.tsx
└── LoadingState.tsx
```

### Component Structure:
```
<ResumeAnalyzer />
├── <InputSection />
│   ├── <ResumeInput />
│   │   ├── File upload (PDF)
│   │   └── Text area (paste)
│   ├── <JobInput />
│   │   ├── URL input
│   │   ├── Load button
│   │   └── <JobPreview />
│   │       ├── Title: "Senior React Developer"
│   │       ├── Company: "Google"
│   │       └── Skills preview
│   └── <AnalysisButton />
│       └── "Analyze Resume"
└── <ResultsSection />
    ├── <ReadinessScoreCard />
    │   └── 72/100 (progress bar)
    ├── <SkillsGapCard />
    │   ├── ✅ Matched: [React, Node.js]
    │   ├── ❌ Missing: [TypeScript, AWS]
    │   └── By importance: Critical/Important/Nice-to-have
    ├── <TimelineCard />
    │   └── "8 weeks to be job-ready"
    ├── <ResourcesCard />
    │   └── For each skill: courses, docs, tutorials
    ├── <ResumeSuggestionsCard />
    │   └── Specific improvements
    └── <ActionButtons />
        ├── Save Report
        ├── Share
        └── Try Another
```

### UI Flow:
```
1. User visits page
2. Pastes resume (or uploads PDF)
3. Pastes job URL
4. Clicks "Load Job"
   → Shows: Title, Company, Skills
5. Clicks "Analyze"
   → Loading spinner
6. Results appear:
   - Readiness: 72/100
   - Skills gap visualized
   - Timeline: 8 weeks
   - Resources linked
   - Resume suggestions
7. User can download, share, or try another
```

### Features:
- Real-time job preview
- Visual skill matching (green/red)
- Responsive design
- Mobile-friendly
- Dark mode support
- Accessible (a11y)
- Loading states
- Error messages

### Output:
Complete working UI

### Timeline:
**Week 5** (Person B)
- Build components
- Connect to API endpoints
- Test with Phase 5 API

---

# PHASE 7: Testing & Optimization

## 📋 Status: TO DO

### Person A & B Responsibilities:
Both collaborate on:

#### Testing:
- [ ] Functionality testing
  - [ ] Resume upload works
  - [ ] Job scraping works (all 4 sites)
  - [ ] AI predictions generated
  - [ ] API endpoints respond
  - [ ] UI displays correctly
- [ ] Accuracy testing
  - [ ] Readiness score within ±10 points
  - [ ] Missing skills detected
  - [ ] Timeline estimates reasonable
  - [ ] Resume suggestions relevant
- [ ] Performance testing
  - [ ] API response < 2 seconds
  - [ ] Model inference < 500ms
  - [ ] Job scraping < 3 seconds
  - [ ] UI loads < 2 seconds
- [ ] Edge cases
  - [ ] Broken URLs
  - [ ] Invalid resume formats
  - [ ] Non-tech jobs
  - [ ] Empty fields

#### Optimization:
- [ ] Cache scraped jobs
- [ ] Optimize model inference (quantization)
- [ ] Compress API responses
- [ ] Lazy load components
- [ ] Minify assets
- [ ] Add service worker

#### Deployment:
- [ ] Deploy to production
- [ ] Monitor performance
- [ ] Set up error logging
- [ ] Create user documentation

### Targets:
- Page load: < 3 seconds
- API response: < 2 seconds
- Model inference: < 500ms
- Total flow: < 5 seconds
- Test passing: 100%

### Output:
Production-ready, tested, deployed application

### Timeline:
**Week 6** (Both)

---

# Timeline Summary

```
WEEK 1-2:
├─ Person B: Phase 1 (Project Setup)
└─ Person A: Start Phase 2 data generation

WEEK 2-3:
├─ Person B: Phase 2 (Model Architecture) ✅
├─ Person A: Finish Phase 2 data, start Phase 3 scraper
└─ SYNC: Person A delivers training_data.json

WEEK 3-4:
├─ Person B: Phase 4 (Train Model) - runs 8-24 hours
├─ Person A: Phase 3 (Job Scraper) - build parsers
└─ SYNC: Model trained, ready for integration

WEEK 4-5:
├─ Person B: Phase 6 (Frontend UI)
├─ Person A: Phase 5 (API Endpoints)
└─ SYNC: Connect API to UI

WEEK 5-6:
├─ Person A & B: Phase 7 (Testing & Optimization)
└─ Deploy to production ✅
```

---

# Work Split Matrix

| Phase | Person A | Person B | Status |
|-------|----------|----------|--------|
| 1 | - | ✅ DONE | ✅ Complete |
| 2 | Data gen | ✅ DONE | ✅ Complete |
| 3 | 📋 TODO | - | Not started |
| 4 | - | 📋 TODO | Waiting data |
| 5 | 📋 TODO | - | Not started |
| 6 | - | 📋 TODO | Not started |
| 7 | 📋 TODO | 📋 TODO | Not started |

---

# Handoff Points

```
End of Week 1-2:
  Person B → Person A
  Deliverable: Phases 1-2 complete, ready for training

End of Week 2:
  Person A → Person B
  Deliverable: training_data.json (2,000 labeled examples)

End of Week 3-4:
  Person B → Person A
  Deliverable: Trained model ready for integration

End of Week 4-5:
  Person A & B → Integration
  Deliverable: API connected to UI

End of Week 6:
  Person A & B → Production
  Deliverable: Live application 🚀
```

---

# Current Status

✅ **Phase 1:** Complete (Person B)
✅ **Phase 2:** Complete (Person B)
⏳ **Phase 3:** Waiting to start (Person A)
⏳ **Phase 4:** Waiting for training data (Person B)
📋 **Phase 5:** Waiting for Phase 3 & 4 (Person A)
📋 **Phase 6:** Waiting for Phase 5 (Person B)
📋 **Phase 7:** Waiting for Phase 5 & 6 (Both)

---

# Next Actions

**Person A (Data Scientist):**
1. ✅ Start Phase 2 if not done (generate 2,000 training examples)
2. 📋 Begin Phase 3 (build job scraper for LinkedIn, Indeed, Glassdoor)

**Person B (ML Engineer):**
1. ✅ Phase 1 & 2 complete
2. ⏳ Wait for training data
3. 📋 Once data arrives → Phase 4 (train model)
4. Then → Phase 6 (build UI)

**Ready? Let's go! 🚀**
