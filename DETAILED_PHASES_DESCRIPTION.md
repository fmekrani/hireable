# Hireable AI Model - Detailed Phase Descriptions for Both People

---

## PHASE 1: Project Setup & Feature Extraction

### What is this phase about?
This is the **foundation phase** where we set up all the code infrastructure and build the tools needed to process resume and job posting data. Think of it as building the "data pipeline" - the system that transforms raw text into numbers that an AI model can understand.

### Why do we need this phase?
- AI models only understand numbers, not text
- We need a standardized way to extract information from resumes and job postings
- We need a vocabulary of tech skills to recognize and match
- We need consistent data structures to pass between different parts of the system

---

### PERSON B: ML Engineer

#### Main Goal:
Build the **data processing infrastructure** that will be used by everyone else.

#### What Person B Does:

**1. Create Project Structure**
```
Purpose: Organize the codebase logically
What: Create folders /lib/ml/, /data/, /models/
Why: So everything has a designated place and is easy to find
```

**2. Define Type System**
```
Purpose: Create TypeScript interfaces for data structures
What: Define ResumeFeatures, JobFeatures, TrainingExample, etc.
Why: Type safety - catches errors early, makes code self-documenting
Example:
  interface ResumeFeatures {
    skillCount: number
    yearsOfExperience: number
    educationLevel: number
    skillVector: number[]  ← One-hot encoded skills
  }
```

**3. Build Skill Vocabulary**
```
Purpose: Create a master list of all tech skills
What: 100+ tech skills across frontend, backend, devops, data, mobile
Why: So we recognize "React.js" and "react" as the same skill
Example:
  ['React', 'Vue', 'Angular', 'TypeScript', 'Python', 'AWS', 'Docker', ...]
  SKILL_ALIASES: {
    'react.js': 'React',
    'nodejs': 'Node.js',
    'python': 'Python'
  }
```

**4. Implement Feature Extraction**
```
Purpose: Convert human-readable data into numerical vectors
What: Extract skills, experience, education from resume/job
Why: So the AI model can process them
Example:
  Input Resume: "React, TypeScript, 3 years, Bachelor's"
  Output: {
    skillCount: 2,
    yearsOfExperience: 3,
    educationLevel: 2,
    skillVector: [1, 0, 0, 1, 0, ...]  ← 100 dimensions
  }
```

**5. Build Data Loader**
```
Purpose: Load and prepare training data
What: Functions to load JSON, preprocess, split train/val/test
Why: So Phase 4 (training) has properly formatted data ready to go
Example Flow:
  training_data.json
    ↓ loadTrainingData()
  [TrainingExample, ...]
    ↓ preprocessData()
  ProcessedData {inputs: [[...], ...], outputs: [[...], ...]}
    ↓ splitData()
  DataSplit {train, validation, test}
```

#### Key Files Person B Creates:
1. **types.ts** - All TypeScript interfaces
2. **skillVocabulary.ts** - 100+ tech skills
3. **featureExtractor.ts** - Extract features from text
4. **dataLoader.ts** - Load and prepare data
5. **tests.ts** - Test suite
6. **index.ts** - Central export point

#### Deliverable (Output):
- ✅ Ready-to-use feature extraction system
- ✅ 100+ skill vocabulary defined
- ✅ Type-safe data structures
- ✅ Data loading pipeline ready

#### How Person B Validates Success:
```
✓ Can import all functions
✓ TypeScript compiles without errors
✓ Feature extraction produces correct dimensions
✓ Tests pass
```

---

### PERSON A: Data Scientist

#### Main Goal:
*No work in Phase 1* - Get ready for Phase 2

#### What Person A Does:
- Understands the skill vocabulary that Person B created
- Prepares to generate training data in Phase 2

---

### How This Phase Connects to the Rest:

```
Phase 1 Output
    ↓
Feature Extraction Tools Ready
    ├─→ Used in Phase 2 (generate training data labels)
    ├─→ Used in Phase 4 (train model)
    ├─→ Used in Phase 5 (API predictions)
    └─→ Used in Phase 6 (UI analysis)

Everything downstream depends on this!
```

### Timeline:
**Week 1-2** - Person B only (5-7 days of work)

---

---

## PHASE 2: Model Architecture & Training Pipeline

### What is this phase about?
This phase builds the **AI model brain** and the **training automation**. We design the neural network that will learn to match resumes to jobs, and we build the code to train it.

### Why do we need this phase?
- The model is the core of our AI - it makes the predictions
- We need to design it carefully (architecture matters!)
- We need automation to train it efficiently
- We need to be ready to handle Person A's training data

---

### PERSON B: ML Engineer

#### Main Goal:
Build the **neural network** and **training system** that will learn from data.

#### What Person B Does:

**1. Design Neural Network Architecture**
```
Purpose: Create the "brain" that learns patterns
What: Build 4-layer neural network with 4 output heads
Why: 4 outputs = 4 predictions simultaneously (multi-task learning)

Architecture:
  Input (200 dims)
    ↓
  Dense Layer 1 (128 neurons) + ReLU
    ↓
  Dropout (30% dropout rate)  ← Prevents overfitting
    ↓
  Dense Layer 2 (64 neurons) + ReLU
    ↓
  Dropout (30% dropout rate)
    ↓
  Dense Layer 3 (32 neurons) + ReLU
    ↓
  Output Head 1: Readiness Score (0-100)
  Output Head 2: Missing Skills Count
  Output Head 3: Matched Skills Count
  Output Head 4: Estimated Weeks to Learn

Why 4 heads?
- Each output predicts something useful
- Learning together helps each one learn better
- Gives us all the info we need in one forward pass
```

**2. Compile Model with Optimizer & Loss**
```
Purpose: Configure how the model learns
What: Set optimizer (Adam, lr=0.001) and loss function (MSE)
Why: This tells the model "here's how to improve yourself"
Details:
  - Optimizer: Adam = smart learning rate adjustment
  - Learning rate: 0.001 = not too fast, not too slow
  - Loss: MSE = measures prediction error
```

**3. Build Training Loop**
```
Purpose: Teach the model from data
What: For each epoch, train on batches and monitor validation
Why: So the model learns patterns in the data

Flow:
  For each epoch (iteration):
    Split data into batches
    For each batch:
      - Forward pass: make predictions
      - Calculate loss: how wrong?
      - Backward pass: adjust weights
      - Update weights: get smarter
    
    After epoch:
      - Check validation loss
      - If not improving for 10 epochs → stop (early stopping)
```

**4. Add Early Stopping**
```
Purpose: Stop training before overfitting
What: Monitor validation loss, stop if no improvement
Why: Model might start memorizing instead of learning patterns
Details:
  - Patience: 10 epochs
  - If validation loss doesn't improve for 10 epochs → STOP
  - Prevents wasting time and reduces overfitting
```

**5. Build Evaluation System**
```
Purpose: Test the model on unseen data
What: Calculate metrics: MSE, MAE, RMSE, R²
Why: See how well model really performs
Details:
  - Test set: data model never saw
  - Metrics show if model generalizes well
  - Targets: ±10 points on readiness, ±2 weeks on timeline
```

**6. Implement Model Persistence**
```
Purpose: Save and load trained model
What: Save weights to storage after training
Why: Don't want to retrain every time
Details:
  - Save to: indexeddb:// (browser storage)
  - Or file system for server
  - Load when needed for predictions
```

**7. Create Complete Training Pipeline**
```
Purpose: Automate the entire training process
What: One function that does everything
Why: Person B can just call runTrainingPipeline() and wait

Complete Flow:
  1. Load training data (from Person A)
  2. Preprocess (normalize, encode)
  3. Calculate statistics
  4. Normalize inputs to 0-1 range
  5. Split into train/val/test (70/15/15)
  6. Build neural network
  7. Compile with optimizer
  8. Train with monitoring
  9. Evaluate on test set
  10. Save model
```

#### Key Files Person B Creates:
1. **model.ts** - Neural network definition
2. **trainer.ts** - Training loop & evaluation
3. **trainingPipeline.ts** - Full automation

#### Deliverable (Output):
- ✅ Neural network architecture defined
- ✅ Training code ready to use
- ✅ Evaluation metrics set up
- ✅ `runTrainingPipeline()` function that automates everything

#### How Person B Validates Success:
```
✓ Model builds without errors
✓ Can pass sample data through model
✓ Training loop runs without crashing
✓ Early stopping logic works
✓ Model saves/loads correctly
```

---

### PERSON A: Data Scientist

#### Main Goal:
Generate **2,000 training examples** with labels

#### What Person A Does:

**1. Create Resume Profiles**
```
Purpose: Generate synthetic resume data
What: Create 2,000 unique resume profiles
Why: Need lots of examples for model to learn patterns

Example profiles:
  Profile 1:
    Skills: [React, TypeScript, Node.js, CSS]
    Experience: 3 years
    Education: Bachelor's
    Job titles: Junior Dev → Mid-level Dev
  
  Profile 2:
    Skills: [Python, Django, PostgreSQL, AWS]
    Experience: 5 years
    Education: Master's
    Job titles: Junior Dev → Senior Dev
```

**2. Create Job Postings**
```
Purpose: Generate synthetic job posting descriptions
What: Create 500 unique job postings
Why: Need varied job descriptions to train on

Example jobs:
  Job 1:
    Title: "Senior React Developer"
    Company: "Google"
    Required Skills: [React, TypeScript, Node.js, AWS, System Design]
    Required Experience: 5 years
    Seniority: Senior
  
  Job 2:
    Title: "Full Stack Developer"
    Company: "Startup"
    Required Skills: [JavaScript, React, Node.js, MongoDB, Docker]
    Required Experience: 2 years
    Seniority: Mid-level
```

**3. Combine into Training Pairs**
```
Purpose: Create 2,000 (resume, job) combinations
What: Match profiles with jobs (2,000 pairs total)
Why: Each pair is one training example

Example:
  Training Example 1:
    Resume: Profile 1 (React, TypeScript, Node.js, CSS, 3 yrs)
    Job: Job 1 (React, TypeScript, Node.js, AWS, System Design)
    Output: Training labels (see next step)
```

**4. Generate Labels (Ground Truth)**
```
Purpose: Calculate correct answers for training
What: For each (resume, job) pair, calculate 4 labels
Why: Model learns by comparing its prediction to these correct answers

Labels Calculated:
  1. Readiness Score (0-100):
     - Skill match %: 3 matched out of 5 required = 60%
     - Experience: 3 years vs 5 required = 60%
     - Education: Bachelor's for requirement = OK (+bonus)
     - Final score: ~65/100
  
  2. Missing Skills Count:
     - Skills in job but not in resume
     - AWS missing, System Design missing
     - Count: 2
  
  3. Matched Skills Count:
     - Skills in both resume and job
     - React, TypeScript, Node.js all present
     - Count: 3
  
  4. Estimated Weeks to Learn Missing Skills:
     - AWS: 4 weeks
     - System Design: 4 weeks
     - Total: 8 weeks

Final Training Example:
  {
    resumeFeatures: { skills: [...], experience: 3, education: 2, ... },
    jobFeatures: { requiredSkills: [...], experience: 5, seniority: 0.7, ... },
    labels: {
      readinessScore: 65,
      missingSkillCount: 2,
      matchedSkillCount: 3,
      estimatedWeeksToLearn: 8
    }
  }
```

**5. Create Diverse Examples**
```
Purpose: Ensure training covers all scenarios
What: Generate examples with different:
  - Skill matches (easy, medium, hard)
  - Experience levels (junior, mid, senior)
  - Education backgrounds
  - Industries

Why: Model learns to handle all types of job/resume combinations
```

**6. Save as training_data.json**
```
Purpose: Format for Phase 4 training
What: Export 2,000 examples as JSON
Why: Phase B will load this file to train the model

File structure:
  [
    { resumeFeatures: {...}, jobFeatures: {...}, labels: {...} },
    { resumeFeatures: {...}, jobFeatures: {...}, labels: {...} },
    ...
    (2,000 total)
  ]
```

#### Key Deliverable (Output):
- ✅ `data/training_data.json` - 2,000 labeled examples ready for training

#### How Person A Validates Success:
```
✓ 2,000 examples generated
✓ Each example has all 4 labels
✓ Labels are realistic and consistent
✓ File loads without errors
✓ Data ready for Phase 4
```

---

### How This Phase Connects:

```
Person A Output (training_data.json)
    ↓
Person B Input
    ↓
runTrainingPipeline()
    ↓
Trained Model Ready
    ├─→ Used in Phase 5 (API predictions)
    └─→ Used in Phase 6 (UI predictions)
```

### Timeline:
**Week 3**
- Person B: 3-4 days building architecture
- Person A: Full week generating data (continues from week 1-2)

---

---

## PHASE 3: Job Scraper & Parser

### What is this phase about?
This phase builds the **job posting extractor**. Instead of users copy-pasting entire job descriptions, they just paste a URL, and our system automatically scrapes and extracts the relevant data.

### Why do we need this phase?
- Better UX: Users only need to paste a URL
- Automatic extraction: No manual copy-pasting
- Consistent data: Always extract the same fields
- Multiple platforms: Support LinkedIn, Indeed, Glassdoor, etc.

---

### PERSON A: Data Scientist

#### Main Goal:
Build the **job URL scraper** that extracts job data from different websites.

#### What Person A Does:

**1. Understand Web Scraping**
```
Purpose: Learn how to extract data from websites
What: HTML parsing, finding elements, extracting text
Why: Different websites have different HTML structures

Basic process:
  1. Fetch HTML from URL
  2. Parse HTML into DOM tree
  3. Find job title element
  4. Find company name element
  5. Find job description element
  6. Find requirements list
  7. Extract text and return
```

**2. Build Job Scraper Orchestrator**
```
Purpose: Main function that handles all sites
What: Universal interface for scraping any job URL
Why: One entry point for all job sites

Main function:
  async function scrapeJobPosting(url: string): Promise<{
    title: string,
    company: string,
    description: string,
    requirements: string,
    skills: string[],
    seniority: string,
    location?: string,
    salary?: string
  }>

How it works:
  1. Validate URL
  2. Identify which site (LinkedIn? Indeed? Glassdoor?)
  3. Call appropriate parser
  4. Extract and return data
```

**3. Build Site-Specific Parsers**

**LinkedIn Parser:**
```
Purpose: Extract data from LinkedIn job pages
What: Parse LinkedIn's specific HTML structure
Why: LinkedIn uses different selectors than other sites

LinkedIn selectors:
  Job title: .show-more-less-html__markup h2
  Company: .base-main-card__title a
  Description: .show-more-less-html__markup
  Requirements: .description__job-criteria-list

Result:
  {
    title: "Senior React Developer",
    company: "Google",
    description: "Looking for experienced...",
    requirements: "5+ years experience, React, TypeScript",
    ...
  }
```

**Indeed Parser:**
```
Purpose: Extract data from Indeed job pages
What: Parse Indeed's specific HTML structure
Why: Indeed uses different selectors than LinkedIn

Indeed selectors:
  Job title: h1[class*="jobsearch-JobComponent-title"]
  Company: div[class*="jobsearch-CompanyCard-companyName"]
  Description: div[class*="jobsearch-JobComponent-description"]
  Requirements: ul[class*="jobsearch-JobComponent-jobSummary"]

Result:
  {
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    description: "Build web applications...",
    requirements: "JavaScript, React, Node.js",
    ...
  }
```

**Glassdoor Parser:**
```
Purpose: Extract data from Glassdoor job pages
What: Parse Glassdoor's specific HTML structure
Why: Each site has unique HTML structure

Result: Same format as others
```

**4. Extract Skills from Description**
```
Purpose: Find tech skills mentioned in job description
What: Match text against skill vocabulary
Why: So we get structured skill list instead of just text

Process:
  Input: "Looking for React developer with 5+ years experience using TypeScript, Node.js, and AWS"
  
  Match against vocabulary:
    - React ✓ found
    - TypeScript ✓ found
    - Node.js ✓ found
    - AWS ✓ found
  
  Output: ["React", "TypeScript", "Node.js", "AWS"]
```

**5. Add URL Validation**
```
Purpose: Check if URL is actually a job posting
What: Validate URL format and domain
Why: Prevent errors from invalid URLs

Validation checks:
  ✓ URL is valid format
  ✓ Domain is supported (linkedin.com, indeed.com, etc.)
  ✓ URL points to job posting (not homepage)
  ✓ URL is accessible (not 404, not blocked)
```

**6. Add Caching Layer**
```
Purpose: Avoid scraping same URL twice
What: Store scraped jobs temporarily
Why: Speed up subsequent requests, reduce server load

Cache structure:
  {
    "https://linkedin.com/jobs/123": {
      title: "...",
      company: "...",
      ... (scraped data)
      fetchedAt: timestamp
      expiresAt: timestamp + 24 hours
    }
  }

Logic:
  If URL in cache AND not expired:
    return cached data (instant)
  Else:
    scrape, cache, return
```

**7. Add Error Handling**
```
Purpose: Handle problems gracefully
What: Catch and handle common errors
Why: Don't crash, give user helpful messages

Error cases:
  ✗ URL not found (404)
    → "Job posting not found"
  
  ✗ Site blocks scraping
    → "Unable to fetch this job posting"
  
  ✗ Invalid URL format
    → "Invalid job URL"
  
  ✗ HTML structure changed
    → "Unable to parse job details"
```

#### Key Files Person A Creates:
1. **jobScraper.ts** - Main orchestrator
2. **parsers/baseParser.ts** - Base class for all parsers
3. **parsers/linkedinParser.ts** - LinkedIn specific
4. **parsers/indeedParser.ts** - Indeed specific
5. **parsers/glassdoorParser.ts** - Glassdoor specific

#### Deliverable (Output):
- ✅ Job scraper that works with 4+ job sites
- ✅ Extracts: title, company, description, requirements, skills
- ✅ Handles errors gracefully
- ✅ Caches results
- ✅ Integrates with Phase 1 skill vocabulary

#### How Person A Validates Success:
```
✓ Can scrape real LinkedIn job URL
✓ Can scrape real Indeed job URL
✓ Can scrape real Glassdoor job URL
✓ Skill extraction finds correct skills
✓ Caching works
✓ Error handling works
```

---

### PERSON B: ML Engineer

#### Main Goal:
*Not involved in Phase 3* - Focused on Phase 4

#### Timeline:
**Week 3-4** - Person A
- Week 3: Start building parsers (while Person B trains)
- Week 4: Complete all parsers, test them

---

---

## PHASE 4: Training & Model Evaluation

### What is this phase about?
This is where the **AI model actually learns**. We feed it the 2,000 training examples from Phase 2, and it learns patterns about how to match resumes to jobs.

### Why do we need this phase?
- The model starts as random weights - not useful at all
- Training teaches it patterns: "This resume matches this job"
- Takes 8-24 hours because it processes 2,000 examples many times
- After training, the model can make predictions on new data

---

### PERSON B: ML Engineer

#### Main Goal:
Train the neural network model using the data from Person A

#### What Person B Does:

**1. Prepare for Training**
```
Purpose: Get everything ready to go
What: Verify data, set up hardware if needed
Why: Don't want to start training and find out data is missing

Checklist:
  ✓ training_data.json exists
  ✓ Model code compiles
  ✓ All dependencies installed
  ✓ Have TensorFlow.js ready
```

**2. Load Training Data**
```
Purpose: Read Person A's 2,000 examples
What: Load from training_data.json
Why: Can't train without data

Process:
  File: training_data.json (2,000 labeled examples)
    ↓
  import { loadTrainingData } from 'lib/ml'
  const data = await loadTrainingData('data/training_data.json')
    ↓
  Result: Array of 2,000 TrainingExample objects
```

**3. Preprocess Data**
```
Purpose: Convert raw data to model format
What: Extract features, encode everything
Why: Model only understands numbers, not concepts

Process:
  Raw: { skills: ["React", "Python"], experience: 3, ... }
    ↓
  Feature extraction (from Phase 1):
    - One-hot encode skills: [1, 1, 0, 0, 0, ...] (100 dims)
    - Normalize experience: 3 years → 0.06 (on 0-1 scale)
    - Encode education: Bachelor → 2 → 0.5 (on 0-1 scale)
    ↓
  Result: Input vector of ~200 numbers
```

**4. Normalize Data**
```
Purpose: Put all numbers on same scale
What: Convert to 0-1 range or standardize
Why: Neural networks learn better with normalized data

Process:
  Raw values vary wildly:
    - Skills: 0-100
    - Experience: 0-50 years
    - Education: 0-4
  
  After normalization:
    - All values between 0 and 1
    - Model learns better
```

**5. Split into Train/Validation/Test**
```
Purpose: Get data for each phase
What: Split 2,000 examples: 70% train, 15% validation, 15% test
Why: 
  - Training data: Model learns from this
  - Validation data: Check if overfitting
  - Test data: Final evaluation (model never saw this)

Result:
  - Training: 1,400 examples
  - Validation: 300 examples
  - Test: 300 examples
```

**6. Start Training**
```
Purpose: Actually train the model
What: Run the training loop for many epochs
Why: Each epoch, model learns more patterns
Duration: 8-24 hours (depending on hardware)

What happens each epoch:
  1. Split 1,400 training examples into batches (32 per batch)
  2. For each batch:
     - Forward pass: model makes prediction
     - Calculate loss: how wrong?
     - Backward pass: calculate gradients
     - Update weights: get 0.001% smarter
  3. After all batches:
     - Test on 300 validation examples
     - Check if validation loss improved
  4. If no improvement for 10 epochs → STOP (early stopping)

Progress display:
  Epoch 1/100 - Loss: 0.2543, Val Loss: 0.2401 (245ms)
  Epoch 2/100 - Loss: 0.2234, Val Loss: 0.2102 (241ms)
  ...
  Epoch 35/100 - Loss: 0.0821, Val Loss: 0.0934 ← BEST
  ⏹️ Early stopping (patience reached)
```

**7. Monitor Training**
```
Purpose: Watch for problems
What: Look at loss curves
Why: Catch overfitting, learning rate issues

Healthy training:
  ✓ Loss decreases each epoch
  ✓ Validation loss tracks training loss
  ✓ No sudden spikes

Problem signs:
  ✗ Loss increases (learning rate too high)
  ✗ Loss stays same (learning rate too low)
  ✗ Validation loss diverges from training (overfitting)
```

**8. Evaluate on Test Set**
```
Purpose: See how well model really works
What: Test on 300 examples model never saw
Why: Validation set used during training - might overfit to it

Test set evaluation:
  - Test Loss: 0.0945 (lower is better)
  - Test MAE: 0.1401
  - Accuracy metrics: MSE, RMSE, R²

Per-output metrics:
  Readiness Score:
    - RMSE: 0.0821 → ±8.2 points error
    - Target: ±10 points ✓ PASS
  
  Estimated Weeks:
    - RMSE: 0.1245 → ±1.2 weeks error
    - Target: ±2 weeks ✓ PASS
```

**9. Validate Performance**
```
Purpose: Make sure model is actually good
What: Check if metrics meet targets
Why: Don't want to deploy a bad model

Targets:
  ✓ Readiness score within ±10 points
  ✓ Missing skills detected correctly (80%+ recall)
  ✓ Timeline within ±2 weeks
  ✓ Test loss < 0.1

If targets met: Continue to Phase 5
If targets not met: Retrain with adjustments
```

**10. Save Trained Model**
```
Purpose: Save so we can use later
What: Export model weights to storage
Why: Don't want to retrain every time

Save command:
  await saveModel(model, 'indexeddb://resume-analyzer-model')

Saved to:
  - Browser storage (indexeddb)
  - Or file system
  - Size: ~2-5 MB
```

**11. Document Results**
```
Purpose: Record what happened
What: Save training summary
Why: Reference for future optimization

Summary includes:
  - Total epochs trained: 35
  - Final loss: 0.0821
  - Best validation loss: 0.0876 (epoch 30)
  - Test metrics: all targets met
  - Training time: 14 hours
  - Hardware: GPU or CPU
```

#### Key Outputs:
- ✅ Trained model weights saved
- ✅ Test metrics documented
- ✅ Performance validated
- ✅ Ready for Phase 5 integration

#### How Person B Validates Success:
```
✓ Training completes without errors
✓ Loss decreases over time
✓ Validation loss tracks training loss
✓ Early stopping triggers at right time
✓ Test metrics meet targets
✓ Model saves successfully
✓ Model loads successfully
```

---

### PERSON A: Data Scientist

#### Main Goal:
*Mostly waiting* - Monitor training if interested

#### What Person A Can Do:
- Monitor training progress
- Prepare for Phase 5 (API building)
- Continue work on Phase 3 (job scraper)

---

### Timeline:
**Week 3-4**
- Person B: Training runs automatically (8-24 hours)
  - Week 3: Start training
  - Week 4: Training completes, validation done

---

---

## PHASE 5: API Integration & Backend

### What is this phase about?
This phase builds the **backend server** that serves predictions. The API is like a waiter at a restaurant - you give it a resume + job URL, it goes back to the kitchen (AI model), gets the answer, and brings it back to you.

### Why do we need this phase?
- The model is just a file on disk - not accessible to users
- Users need an endpoint to call
- The API orchestrates: scrape job → extract features → predict → format response
- Security: Control what data goes in/out

---

### PERSON A: Data Scientist

#### Main Goal:
Build the **API endpoints** that connect everything together

#### What Person A Does:

**1. Build Main Analysis Endpoint: POST /api/analyze-resume**

```
Purpose: Analyze if resume matches job
What: Accept resume + job URL, return analysis
Why: Main feature users interact with

Request Format:
  POST /api/analyze-resume
  Body: {
    resume: "string of resume text",
    jobUrl: "https://linkedin.com/jobs/123",
    format: "detailed" or "summary"
  }

Processing Pipeline:
  1. Validate inputs
     - Check resume not empty
     - Check jobUrl valid format
  
  2. Load model
     - Get trained model from storage
  
  3. Extract resume features
     - Parse resume text
     - Call extractResumeFeatures() from Phase 1
  
  4. Scrape job
     - Call scrapeJobPosting() from Phase 3
     - Get: title, company, description, required skills
  
  5. Extract job features
     - Call extractJobFeatures() from Phase 1
  
  6. Make prediction
     - Create input vector (~200 dims)
     - Feed to model
     - Get predictions: [score, missing, matched, weeks]
  
  7. Denormalize predictions
     - Convert from 0-1 scale back to original
     - Score: 0.65 → 65/100
     - Weeks: 0.15 → 8 weeks
  
  8. Generate recommendations
     - Find learning resources for each missing skill
     - Generate resume suggestions
     - Create next steps
  
  9. Format response (see below)
  
  10. Return to user

Response Format:
  {
    readinessScore: 72,                    // 0-100
    confidence: 0.85,                      // 0-1
    matchedSkills: ["React", "TypeScript"],
    missingSkills: ["AWS", "Docker"],
    criticalSkills: ["AWS"],               // Must-have
    importantSkills: ["Docker"],           // Should-have
    niceToHaveSkills: [],                  // Optional
    estimatedWeeksToLearn: 8,              // Weeks
    resources: [
      {
        skill: "AWS",
        title: "AWS Solutions Architect Course",
        url: "https://...",
        type: "course",
        estimatedHours: 40
      },
      ...
    ],
    resumeSuggestions: [
      {
        section: "Experience",
        current: "Software Developer for 3 years",
        suggested: "Senior Software Developer with AWS experience...",
        reason: "Add AWS projects to strengthen candidacy"
      },
      ...
    ],
    nextSteps: [
      "Learn AWS (priority: critical)",
      "Build AWS project for portfolio",
      "Get AWS certification",
      "Apply to jobs after 8 weeks"
    ]
  }
```

**2. Build Job Scraper Endpoint: POST /api/scrape-job**

```
Purpose: Scrape job data from URL
What: Just extract job data without model prediction
Why: Users might want to preview job before analyzing

Request:
  POST /api/scrape-job
  Body: { url: "https://linkedin.com/jobs/123" }

Response:
  {
    title: "Senior React Developer",
    company: "Google",
    location: "Mountain View, CA",
    salary: "$150k - $200k",
    description: "We are looking for...",
    requirements: "5+ years experience...",
    skills: ["React", "TypeScript", "Node.js", "AWS"],
    seniority: "Senior",
    postedDate: "2024-01-27"
  }

Processing:
  1. Validate URL
  2. Check cache (avoid re-scraping)
  3. If cached: return from cache
  4. Else: scrape (Phase 3)
  5. Cache result
  6. Return data
```

**3. Extract Resume Features**

```
Purpose: Convert resume text to model input
What: Parse resume and extract information
Why: Need structured data for model

Implementation:
  - If PDF uploaded: convert to text
  - If text pasted: use directly
  - Parse sections:
    - Skills section: "React, Python, AWS"
    - Experience section: "5 years development"
    - Education section: "Bachelor's degree"
  - Call extractResumeFeatures() from Phase 1
```

**4. Add Input Validation**

```
Purpose: Ensure data is valid
What: Check all inputs before processing
Why: Prevent crashes, give helpful errors

Validations:
  - Resume:
    ✓ Not empty
    ✓ At least 50 characters
    ✗ Report: "Resume too short"
  
  - Job URL:
    ✓ Valid URL format
    ✓ Domain is supported
    ✗ Report: "Invalid URL"
  
  - Job content:
    ✓ Page returned success
    ✓ Contains job data
    ✗ Report: "Unable to fetch job"
```

**5. Add Error Handling**

```
Purpose: Handle all possible failures
What: Catch errors and respond helpfully
Why: Don't crash, inform user what went wrong

Error scenarios:
  - Job URL not found (404)
    Response: { error: "Job posting not found" }
  
  - Can't scrape site
    Response: { error: "Unable to parse job details" }
  
  - Resume too short
    Response: { error: "Resume must be at least 50 characters" }
  
  - Model not loaded
    Response: { error: "System error, try again later" }
```

**6. Add Caching Layer**

```
Purpose: Speed up repeated requests
What: Cache scraped jobs and predictions
Why: Don't want to scrape/predict same job twice

Cache strategy:
  - Scrape result cache: 24 hours
  - Prediction cache: 1 hour (resume might change)
  - Keys: URL for scrape, (resume hash + URL) for prediction

Benefit:
  - User asks about same job twice → instant response
  - Reduces load on scraper
  - Reduces model inference time
```

**7. Add Rate Limiting**

```
Purpose: Prevent abuse
What: Limit requests per user/IP
Why: Don't want users spamming API

Limits:
  - Per IP: 100 requests per hour
  - Per user: 1000 requests per month
  - Response when limited:
    { error: "Rate limit exceeded", retryAfter: 3600 }
```

**8. Integrate Everything Together**

```
Flow:
  Request → Validation
           ↓
           Load Model
           ↓
           Extract Resume Features
           ↓
           Scrape Job (Phase 3)
           ↓
           Extract Job Features
           ↓
           Model Prediction
           ↓
           Format Response
           ↓
           Cache Result
           ↓
           Return to User
```

#### Key Files Person A Creates:
1. **app/api/analyze-resume/route.ts** - Main endpoint
2. **app/api/scrape-job/route.ts** - Scraper endpoint
3. **lib/api/resumeAnalyzer.ts** - Analysis logic
4. **lib/api/cache.ts** - Caching layer
5. **lib/api/validators.ts** - Input validation

#### Deliverable (Output):
- ✅ `/api/analyze-resume` endpoint working
- ✅ `/api/scrape-job` endpoint working
- ✅ Input validation
- ✅ Error handling
- ✅ Caching
- ✅ Rate limiting

#### How Person A Validates Success:
```
✓ Can POST to /api/analyze-resume with real data
✓ Get back analysis JSON
✓ Can POST to /api/scrape-job with URL
✓ Get back job data
✓ Error handling works
✓ Caching works (same request is instant)
```

---

### PERSON B: ML Engineer

#### Main Goal:
*Not involved in Phase 5* - Focused on Phase 6

#### Timeline:
**Week 5** - Person A
- Build both API endpoints
- Test with Phase 3 scrapers
- Test with Phase 4 model

---

---

## PHASE 6: Frontend UI Component

### What is this phase about?
This phase builds the **user interface** - the website that users see and interact with. It's the pretty face on top of all the backend work.

### Why do we need this phase?
- Users don't interact with APIs directly
- UI needs to be intuitive and nice
- Need real-time feedback and visualizations
- Mobile-responsive so it works on phones too

---

### PERSON B: ML Engineer

#### Main Goal:
Build the **frontend components** that users interact with

#### What Person B Does:

**1. Build Main Component: ResumeAnalyzer**

```
Purpose: Container for entire analysis flow
What: Main React component that orchestrates everything
Why: Central component that connects all sub-components

Structure:
  <ResumeAnalyzer>
    <InputSection />    ← Resume + Job URL input
    <ResultsSection />  ← Display analysis
  </ResumeAnalyzer>
```

**2. Build InputSection Component**

```
Purpose: Let users enter resume and job URL
What: Resume upload/text area, job URL input
Why: Users need a way to provide data

Sub-components:
  <ResumeInput>
    - File upload (PDF)
    - Text area (paste text)
    - Character counter
    - Validation message
  
  <JobInput>
    - URL input field
    - "Load Job" button
    - Loading spinner while scraping
    - Validation message
  
  <JobPreview>
    - Shows: Title, Company, Skills
    - Helps user confirm correct job
    - "Confirm" button

User Flow:
  1. Paste resume text (or upload PDF)
     "✓ 2,847 characters"
  
  2. Paste job URL
     "https://linkedin.com/jobs/123"
  
  3. Click "Load Job"
     Shows loading spinner...
  
  4. Job preview appears:
     Title: "Senior React Developer"
     Company: "Google"
     Skills: [React, TypeScript, Node.js, AWS, ...]
  
  5. Click "Analyze"
     → Calls API
     → Shows results
```

**3. Build AnalysisButton Component**

```
Purpose: Trigger the analysis
What: Beautiful button to start analysis
Why: Needs to be obvious where to click

Features:
  - Disabled while loading
  - Shows "Analyzing..." while processing
  - Disabled until resume + job entered
  - Loading spinner animation
```

**4. Build ResultsSection Component**

```
Purpose: Display all analysis results
What: Main dashboard showing all information
Why: Users need to understand the results

Layout:
  <ResultsSection>
    <ReadinessScoreCard />      ← Score visualization
    <SkillsGapCard />           ← Matched vs missing
    <TimelineCard />            ← Learning timeline
    <ResourcesCard />           ← Learning resources
    <ResumeSuggestionsCard />   ← Resume improvements
    <ActionButtons />           ← Save, share, try again
  </ResultsSection>
```

**5. Build ReadinessScoreCard Component**

```
Purpose: Show readiness score beautifully
What: Large visual display of score
Why: Gives user instant understanding

Display:
  ╔═══════════════════╗
  ║                   ║
  ║     72/100        ║
  ║  MODERATELY READY ║
  ║  ████████░░░░     ║  ← Progress bar
  ║                   ║
  ║  Confidence: 85%  ║
  ║                   ║
  ╚═══════════════════╝

Features:
  - Large number display
  - Progress bar (visual)
  - Color coding:
    - 0-30: Red (not ready)
    - 30-60: Orange (somewhat ready)
    - 60-80: Light green (mostly ready)
    - 80-100: Dark green (very ready)
  - Confidence score
```

**6. Build SkillsGapCard Component**

```
Purpose: Show skill matching
What: Matched vs missing skills with importance
Why: User needs to see exactly what they need

Display:
  ╔════════════════════╗
  ║  Skills Gap        ║
  ║                    ║
  ║ ✅ Matched (3)     ║
  ║    • React         ║
  ║    • TypeScript    ║
  ║    • Node.js       ║
  ║                    ║
  ║ ❌ Missing (3)     ║
  ║    🔴 AWS          ║  ← Critical (red)
  ║    🟠 Docker       ║  ← Important (orange)
  ║    🟡 GraphQL      ║  ← Nice-to-have (yellow)
  ║                    ║
  ╚════════════════════╝

Features:
  - Check marks for matched skills
  - X marks for missing skills
  - Color-coded importance
  - Interactive: hover for more info
```

**7. Build TimelineCard Component**

```
Purpose: Show how long to learn
What: Timeline and breakdown per skill
Why: User needs to know commitment

Display:
  ╔════════════════════╗
  ║  Learning Timeline ║
  ║                    ║
  ║  Total: 8 weeks    ║
  ║  ════════════  ← 8 weeks  ║
  ║                    ║
  ║  Breakdown:        ║
  ║  • AWS: 4 weeks    ║
  ║  • Docker: 2 weeks ║
  ║  • GraphQL: 2 wks  ║
  ║                    ║
  ║  Ready by: Mar 26  ║
  ║                    ║
  ╚════════════════════╝

Features:
  - Visual timeline bar
  - Weeks for each skill
  - Target ready date
  - Can be toggled to month view
```

**8. Build ResourcesCard Component**

```
Purpose: Provide learning resources
What: Links to courses, docs, tutorials
Why: User knows where to learn

Display:
  ╔════════════════════╗
  ║  Learning Resources║
  ║                    ║
  ║  AWS               ║
  ║  📚 AWS Handbook   ║  ← Documentation
  ║     Official docs  ║
  ║  🎓 AWS Architect  ║  ← Course
  ║     4-week course  ║
  ║  🛠️  Hands-on Lab  ║  ← Tutorial
  ║     Build project  ║
  ║                    ║
  ║  Docker            ║
  ║  📚 Docker Docs    ║
  ║  🎓 Container      ║
  ║     Mastery        ║
  ║  🛠️  Build app     ║
  ║                    ║
  ╚════════════════════╝

Features:
  - Resource type icons
  - Links are clickable
  - Estimated time per resource
  - "Add to learning plan" checkbox
```

**9. Build ResumeSuggestionsCard Component**

```
Purpose: Suggest resume improvements
What: Specific changes to boost candidacy
Why: User can improve their resume

Display:
  ╔════════════════════╗
  ║  Resume Suggestions║
  ║                    ║
  ║  1. Add AWS Skills ║
  ║  Current:          ║
  ║    "DevOps team"   ║
  ║                    ║
  ║  Suggested:        ║
  ║    "AWS DevOps     ║
  ║     engineer..."   ║
  ║                    ║
  ║  Reason:           ║
  ║    AWS is critical ║
  ║    skill for job   ║
  ║                    ║
  ║  2. Highlight      ║
  ║     Projects       ║
  ║  ...               ║
  ║                    ║
  ╚════════════════════╝

Features:
  - Show current text
  - Show suggested text
  - Explain reasoning
  - Copy suggestion button
```

**10. Build ActionButtons Component**

```
Purpose: Let user do something with results
What: Save, share, try another job
Why: User might want to save or compare

Buttons:
  - 💾 Download Report (PDF)
  - 📤 Share with Friend (link)
  - 🔄 Try Another Job (clear and start over)
  - 📋 Copy All Resources (to clipboard)
```

**11. Add Loading States**

```
Purpose: Show progress while waiting
What: Spinners, progress bars
Why: User knows something is happening

States:
  - Loading job posting...
    → Spinner
  
  - Analyzing resume...
    → Progress: "Extracting features..."
    → Progress: "Loading model..."
    → Progress: "Making predictions..."
    → Progress: "Formatting results..."
  
  - Results ready!
    → Show all cards
```

**12. Add Error Handling UI**

```
Purpose: Show errors nicely
What: Error messages and recovery
Why: User needs to know what went wrong

Error displays:
  ❌ Invalid resume
     "Resume too short (50 chars min)"
     [Try again]
  
  ❌ Job URL not found
     "Unable to fetch job. Job may have been deleted."
     [Try different URL]
  
  ❌ System error
     "Something went wrong. Try again later."
     [Retry]
```

**13. Make Responsive Design**

```
Purpose: Work on mobile phones
What: Responsive layout that adapts
Why: Users browse on phones too

Breakpoints:
  - Mobile (< 640px):
    Cards stack vertically
    Buttons full width
    Text larger
  
  - Tablet (640-1024px):
    2-column layout
    Buttons normal size
  
  - Desktop (> 1024px):
    3-column layout
    Side-by-side cards
```

**14. Add Accessibility Features**

```
Purpose: Make usable for everyone
What: Screen reader support, keyboard nav
Why: Include people with disabilities

Features:
  - ARIA labels for screen readers
  - Keyboard navigation (Tab, Enter)
  - Color contrast (WCAG AA)
  - Alt text for icons
  - Semantic HTML
```

**15. Add Dark Mode Support**

```
Purpose: Nice dark theme option
What: Toggle dark/light mode
Why: Users prefer based on time of day

Theme colors:
  Light:
    Background: White
    Text: Black
    Accent: Blue
  
  Dark:
    Background: Dark gray
    Text: Light gray
    Accent: Light blue
```

#### Key Files Person B Creates:
1. **components/ResumeAnalyzer.tsx** - Main component
2. **components/InputSection.tsx** - Resume + Job input
3. **components/ResumeInput.tsx** - Resume upload/text
4. **components/JobInput.tsx** - Job URL input
5. **components/JobPreview.tsx** - Job preview
6. **components/AnalysisButton.tsx** - Analyze button
7. **components/ResultsSection.tsx** - Results container
8. **components/ReadinessScoreCard.tsx** - Score display
9. **components/SkillsGapCard.tsx** - Skills comparison
10. **components/TimelineCard.tsx** - Timeline display
11. **components/ResourcesCard.tsx** - Resources list
12. **components/ResumeSuggestionsCard.tsx** - Suggestions
13. **components/ActionButtons.tsx** - Save/share buttons
14. **components/LoadingState.tsx** - Loading indicator
15. **styles/ResumeAnalyzer.module.css** - All styling

#### Deliverable (Output):
- ✅ Complete working UI
- ✅ Connected to API endpoints
- ✅ Responsive design
- ✅ Accessible
- ✅ Dark mode support

#### How Person B Validates Success:
```
✓ Can upload resume
✓ Can input job URL
✓ Can see job preview
✓ Can click analyze
✓ See results displayed nicely
✓ Works on mobile
✓ Works on desktop
✓ Loading states show
✓ Error messages display
```

---

### PERSON A: Data Scientist

#### Main Goal:
*Not involved in Phase 6* - Focused on Phase 5

#### Timeline:
**Week 5** - Person B
- Build all components
- Connect to API endpoints
- Test entire flow

---

---

## PHASE 7: Testing & Optimization

### What is this phase about?
The final phase where we make sure everything works together perfectly. Testing finds bugs, optimization makes it fast.

### Why do we need this phase?
- All phases connected for first time
- Need to verify everything works end-to-end
- Performance optimization
- Before public launch

---

### PERSON A & B: Both Collaborate

#### Main Goal:
Ensure **everything works perfectly** together

#### What They Do:

**1. Functional Testing**
```
Test that all features work:
  ✓ Resume upload works
  ✓ Job URL scraping works (all 4 sites)
  ✓ Skill extraction works
  ✓ Model prediction works
  ✓ API responses correct
  ✓ UI displays correctly
  ✓ All buttons work
```

**2. Accuracy Testing**
```
Verify predictions are accurate:
  ✓ Readiness score ±10 points
  ✓ Missing skills identified correctly
  ✓ Timeline estimates accurate
  ✓ Resume suggestions helpful
  ✓ Manually verify 10+ real resumes
```

**3. Performance Testing**
```
Measure speed:
  ✓ Page loads < 3 seconds
  ✓ API responds < 2 seconds
  ✓ Job scraping < 3 seconds
  ✓ Model prediction < 500ms
  ✓ No network requests blocked
```

**4. Edge Case Testing**
```
Test unusual scenarios:
  ✓ Broken job URLs
  ✓ Non-tech job postings
  ✓ Very short resumes
  ✓ Very long resumes
  ✓ PDFs with images
  ✓ Job sites that changed HTML
```

**5. Security Testing**
```
Check for vulnerabilities:
  ✓ No SQL injection
  ✓ No XSS attacks
  ✓ Rate limiting works
  ✓ No exposed secrets
  ✓ HTTPS enforced
```

**6. Browser Compatibility**
```
Test in different browsers:
  ✓ Chrome
  ✓ Firefox
  ✓ Safari
  ✓ Edge
  ✓ Mobile browsers
```

**7. Performance Optimization**
```
Speed things up:
  ✓ Cache job scraping
  ✓ Cache model predictions
  ✓ Compress images
  ✓ Minify JavaScript
  ✓ Lazy load components
  ✓ Optimize database queries
```

**8. Monitor & Document**
```
Track everything:
  ✓ Set up error logging
  ✓ Monitor API performance
  ✓ Monitor model accuracy
  ✓ Create documentation
  ✓ Create user guide
```

**9. Deploy to Production**
```
Make it live:
  ✓ Deploy to cloud (AWS/GCP/Heroku)
  ✓ Set up domain name
  ✓ Enable HTTPS
  ✓ Monitor performance
  ✓ Have backup plan
```

#### Success Criteria:
```
✓ All tests passing
✓ Performance targets met
✓ No critical bugs
✓ Users can use it smoothly
✓ Ready for public launch
```

---

### Timeline:
**Week 6** - Both
- Full week of testing
- Optimization
- Final deployment

---

---

## Complete Picture: How Everything Fits Together

```
User Story:
1. User lands on website (Phase 6 UI)
2. Pastes resume text (Phase 6 Input)
3. Pastes job URL (Phase 6 Input)
4. Clicks "Analyze" (Phase 6 Button)

Backend Processing:
5. API receives request (Phase 5)
6. Validates inputs (Phase 5)
7. Loads trained model (Phase 4)
8. Extracts resume features (Phase 1)
9. Scrapes job posting (Phase 3)
10. Extracts job features (Phase 1)
11. Model makes prediction (Phase 4)
12. Formats response (Phase 5)
13. Caches result (Phase 5)

User Sees:
14. Results displayed beautifully (Phase 6)
15. Readiness score: 72/100
16. Missing skills with importance
17. Learning timeline
18. Resource recommendations
19. Resume suggestions
20. "Apply after 8 weeks" button

Everything orchestrated by:
- Person A: Phases 2-3, 5
- Person B: Phases 1-2, 4, 6
- Both: Phase 7
```

---

## Timeline Overview

```
WEEK 1-2:   Person B: Phase 1 ✅
            Person A: Prepare Phase 2

WEEK 2-3:   Person B: Phase 2 ✅
            Person A: Phase 2 data generation

WEEK 3:     Person B: Phase 2 ✅
            Person A: Phase 3 scraper start

WEEK 3-4:   Person B: Phase 4 training (automated)
            Person A: Phase 3 scraper continue

WEEK 4-5:   Person B: Phase 6 UI
            Person A: Phase 5 API

WEEK 5-6:   Both: Phase 7 testing & optimization

WEEK 6:     ✅ LAUNCH TO PRODUCTION 🚀
```

---

**Everything is connected and orchestrated. Each phase builds on the previous one. Both people working in parallel, syncing at key points.**

**You've got a complete picture now! Ready to start?**
