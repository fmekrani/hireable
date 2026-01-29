// ML Model Types

export interface ResumeFeatures {
  skillCount: number
  yearsOfExperience: number
  educationLevel: number // 0=HS, 1=Bachelor, 2=Master, 3=PhD
  skillVector: number[] // One-hot encoded skills
  jobTitles: string[]
}

export interface JobFeatures {
  requiredSkillCount: number
  requiredExperienceYears: number
  seniority: number // 0-1 (entry to senior)
  skillVector: number[] // One-hot encoded required skills
  jobTitle: string
}

export interface TrainingExample {
  resumeFeatures: ResumeFeatures
  jobFeatures: JobFeatures
  labels: {
    readinessScore: number // 0-100
    missingSkillCount: number
    matchedSkillCount: number
    estimatedWeeksToLearn: number
  }
}

export interface ProcessedData {
  inputs: number[][] // Feature vectors for all examples
  outputs: number[][] // Labels for all examples
  metadata: {
    totalExamples: number
    inputDimensions: number
    outputDimensions: number
  }
}

export interface DataSplit {
  train: ProcessedData
  validation: ProcessedData
  test: ProcessedData
}

export interface Batch {
  features: number[][]
  labels: number[][]
  size: number
}

export interface PredictionOutput {
  readinessScore: number
  confidence: number
  missingSkillCount: number
  matchedSkillCount: number
  estimatedWeeksToLearn: number
}
