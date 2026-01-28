import {
  TrainingExample,
  ProcessedData,
  DataSplit,
  Batch,
} from './types'
import { encodeAllFeatures, TECH_SKILL_VOCABULARY } from './featureExtractor'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Load raw training data from JSON
 */
export async function loadTrainingData(filePath: string): Promise<TrainingExample[]> {
  try {
    // Try to load from file system first (Node.js environment)
    let data: TrainingExample[]
    
    try {
      // Resolve path relative to project root
      const absolutePath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(process.cwd(), filePath)
      
      const fileContent = fs.readFileSync(absolutePath, 'utf-8')
      data = JSON.parse(fileContent) as TrainingExample[]
    } catch (fsError) {
      // Fallback to fetch if file system fails (browser environment)
      const response = await fetch(filePath)
      data = await response.json() as TrainingExample[]
    }
    
    return data
  } catch (error) {
    console.error('Error loading training data:', error)
    return []
  }
}

/**
 * Preprocess raw training data into model-ready format
 */
export function preprocessData(rawData: TrainingExample[]): ProcessedData {
  const inputs: number[][] = []
  const outputs: number[][] = []

  rawData.forEach(example => {
    // Encode all features
    const inputVector = encodeAllFeatures(example.resumeFeatures, example.jobFeatures)
    inputs.push(inputVector)

    // Normalize output labels to 0-1 range
    // Note: readinessScore is already normalized (0-1) from training data generation
    const outputVector = [
      example.labels.readinessScore, // Already 0-1
      example.labels.missingSkillCount / 20, // Assume max 20 missing skills
      example.labels.matchedSkillCount / 20, // Assume max 20 matched skills
      example.labels.estimatedWeeksToLearn / 52, // Normalize weeks to 0-1 (assume max 52 weeks)
    ]
    outputs.push(outputVector)
  })

  return {
    inputs,
    outputs,
    metadata: {
      totalExamples: rawData.length,
      inputDimensions: inputs[0]?.length || 0,
      outputDimensions: outputs[0]?.length || 0,
    },
  }
}

/**
 * Split data into train/validation/test sets
 */
export function splitData(
  data: ProcessedData,
  split: { train: number; validation: number; test: number } = {
    train: 0.7,
    validation: 0.15,
    test: 0.15,
  }
): DataSplit {
  const total = data.inputs.length
  const trainSize = Math.floor(total * split.train)
  const valSize = Math.floor(total * split.validation)

  // Shuffle indices
  const indices = Array.from({ length: total }, (_, i) => i)
  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  const trainIndices = indices.slice(0, trainSize)
  const valIndices = indices.slice(trainSize, trainSize + valSize)
  const testIndices = indices.slice(trainSize + valSize)

  return {
    train: extractSubset(data, trainIndices),
    validation: extractSubset(data, valIndices),
    test: extractSubset(data, testIndices),
  }
}

/**
 * Extract subset of data by indices
 */
function extractSubset(data: ProcessedData, indices: number[]): ProcessedData {
  const inputs = indices.map(i => data.inputs[i])
  const outputs = indices.map(i => data.outputs[i])

  return {
    inputs,
    outputs,
    metadata: {
      totalExamples: indices.length,
      inputDimensions: data.metadata.inputDimensions,
      outputDimensions: data.metadata.outputDimensions,
    },
  }
}

/**
 * Create batches for training
 */
export function createBatches(data: ProcessedData, batchSize: number = 32): Batch[] {
  const batches: Batch[] = []
  const totalBatches = Math.ceil(data.inputs.length / batchSize)

  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize
    const end = Math.min(start + batchSize, data.inputs.length)

    const features = data.inputs.slice(start, end)
    const labels = data.outputs.slice(start, end)

    batches.push({
      features,
      labels,
      size: end - start,
    })
  }

  return batches
}

/**
 * Get dataset statistics
 */
export function getDatasetStats(data: ProcessedData): {
  totalExamples: number
  inputDimensions: number
  outputDimensions: number
  inputStats: {
    min: number[]
    max: number[]
    mean: number[]
    std: number[]
  }
} {
  const { inputs } = data
  const numDimensions = inputs[0]?.length || 0

  const min = new Array(numDimensions).fill(Infinity)
  const max = new Array(numDimensions).fill(-Infinity)
  const sum = new Array(numDimensions).fill(0)
  const sumSquares = new Array(numDimensions).fill(0)

  inputs.forEach(input => {
    input.forEach((value, idx) => {
      min[idx] = Math.min(min[idx], value)
      max[idx] = Math.max(max[idx], value)
      sum[idx] += value
      sumSquares[idx] += value * value
    })
  })

  const mean = sum.map(s => s / inputs.length)
  const variance = sumSquares.map((sq, idx) => sq / inputs.length - mean[idx] * mean[idx])
  const std = variance.map(v => Math.sqrt(Math.max(0, v)))

  return {
    totalExamples: inputs.length,
    inputDimensions: data.metadata.inputDimensions,
    outputDimensions: data.metadata.outputDimensions,
    inputStats: { min, max, mean, std },
  }
}

/**
 * Normalize input data using statistics
 */
export function normalizeData(
  data: ProcessedData,
  stats?: ReturnType<typeof getDatasetStats>['inputStats']
): ProcessedData {
  const useStats = stats || getDatasetStats(data).inputStats

  const normalizedInputs = data.inputs.map(input =>
    input.map((value, idx) => {
      const std = useStats.std[idx]
      if (std === 0) return 0
      return (value - useStats.mean[idx]) / std
    })
  )

  return {
    inputs: normalizedInputs,
    outputs: data.outputs,
    metadata: data.metadata,
  }
}
