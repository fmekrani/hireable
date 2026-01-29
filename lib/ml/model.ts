import * as tf from '@tensorflow/tfjs'
import { PredictionOutput } from './types'

/**
 * Build the neural network model for resume analysis
 * 
 * Improved Architecture with Separate Output Heads:
 * 
 * Input (200) 
 *   ↓
 * Dense(256, ReLU) → BatchNorm → Dropout(0.4)
 *   ↓
 * Dense(128, ReLU) → BatchNorm → Dropout(0.3)
 *   ↓
 * Dense(64, ReLU) → Dropout(0.2)
 *   ↓
 * ├─→ Head 1: Readiness Score (Linear, 0-1)
 * ├─→ Head 2: Missing Skills (ReLU, 0-20)
 * ├─→ Head 3: Matched Skills (ReLU, 0-20)
 * └─→ Head 4: Weeks to Learn (ReLU, 0-52)
 */
export function buildModel(inputDimensions: number): tf.LayersModel {
  const input = tf.input({ shape: [inputDimensions] })

  // Shared feature extraction layers
  let x = tf.layers.dense({
    units: 256,
    activation: 'relu',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
  }).apply(input) as tf.SymbolicTensor

  x = tf.layers.batchNormalization().apply(x) as tf.SymbolicTensor
  x = tf.layers.dropout({ rate: 0.4 }).apply(x) as tf.SymbolicTensor

  x = tf.layers.dense({
    units: 128,
    activation: 'relu',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
  }).apply(x) as tf.SymbolicTensor

  x = tf.layers.batchNormalization().apply(x) as tf.SymbolicTensor
  x = tf.layers.dropout({ rate: 0.3 }).apply(x) as tf.SymbolicTensor

  x = tf.layers.dense({
    units: 64,
    activation: 'relu',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
  }).apply(x) as tf.SymbolicTensor

  x = tf.layers.dropout({ rate: 0.2 }).apply(x) as tf.SymbolicTensor

  // Output Head 1: Readiness Score (0-1 range)
  const readinessScore = tf.layers.dense({
    units: 1,
    activation: 'sigmoid',
    name: 'readiness_score',
  }).apply(x) as tf.SymbolicTensor

  // Output Head 2: Missing Skills (0-20 range, use ReLU)
  const missingSkills = tf.layers.dense({
    units: 1,
    activation: 'relu',
    name: 'missing_skills',
  }).apply(x) as tf.SymbolicTensor

  // Output Head 3: Matched Skills (0-20 range, use ReLU)
  const matchedSkills = tf.layers.dense({
    units: 1,
    activation: 'relu',
    name: 'matched_skills',
  }).apply(x) as tf.SymbolicTensor

  // Output Head 4: Estimated Weeks (0-52 range, use ReLU)
  const estimatedWeeks = tf.layers.dense({
    units: 1,
    activation: 'relu',
    name: 'estimated_weeks',
  }).apply(x) as tf.SymbolicTensor

  // Concatenate all outputs
  const outputs = tf.layers.concatenate().apply([
    readinessScore,
    missingSkills,
    matchedSkills,
    estimatedWeeks,
  ]) as tf.SymbolicTensor

  return tf.model({ inputs: input, outputs })
}

/**
 * Compile the model with optimizer and loss function
 */
export function compileModel(model: tf.LayersModel): void {
  model.compile({
    optimizer: tf.train.adam(0.001), // Learning rate: 0.001
    loss: 'meanSquaredError', // MSE loss for regression
    metrics: ['mae'], // Mean Absolute Error metric
  })
}

/**
 * Custom multi-task loss function for weighted outputs
 */
export function createCustomLoss(): (yTrue: tf.Tensor, yPred: tf.Tensor) => tf.Tensor {
  return (yTrue: tf.Tensor, yPred: tf.Tensor): tf.Tensor => {
    return tf.tidy(() => {
      // Split outputs
      const yTrueSplit = tf.split(yTrue, 4, 1)
      const yPredSplit = tf.split(yPred, 4, 1)

      // Weights for each output (readiness score is most important)
      const weights = [0.5, 0.15, 0.15, 0.2] // score, missing, matched, weeks

      // Calculate weighted MSE
      const losses = yTrueSplit.map((yT: tf.Tensor, i: number) => {
        const yP = yPredSplit[i]
        const mse = tf.losses.meanSquaredError(yT, yP)
        return mse.mul(weights[i])
      })

      // Sum all losses
      let totalLoss = losses[0]
      for (let i = 1; i < losses.length; i++) {
        totalLoss = totalLoss.add(losses[i])
      }

      return totalLoss
    })
  }
}

/**
 * Get model summary
 */
export function printModelSummary(model: tf.LayersModel): void {
  console.log('\n=== Model Summary ===')
  model.summary()
  console.log('===\n')
}

/**
 * Denormalize predictions to original scale
 */
export function denormalizePredictions(
  predictions: number[],
  normalizeParams?: { outputStats: { min: number[]; max: number[] } }
): number[] {
  const [score, missingSkills, matchedSkills, weeks] = predictions

  // Denormalize score (was divided by 100)
  const denormScore = Math.round(score * 100)

  // Denormalize skill counts (was divided by 20)
  const denormMissing = Math.round(missingSkills * 20)
  const denormMatched = Math.round(matchedSkills * 20)

  // Denormalize weeks (was divided by 52)
  const denormWeeks = Math.round(weeks * 52)

  return [denormScore, denormMissing, denormMatched, denormWeeks]
}

/**
 * Format model predictions as PredictionOutput
 */
export function formatPrediction(
  rawPredictions: number[],
  confidence: number = 0.8
): PredictionOutput {
  const [score, missingSkills, matchedSkills, weeks] = rawPredictions

  return {
    readinessScore: Math.min(100, Math.max(0, score)),
    confidence: Math.min(1, Math.max(0, confidence)),
    missingSkillCount: Math.max(0, missingSkills),
    matchedSkillCount: Math.max(0, matchedSkills),
    estimatedWeeksToLearn: Math.max(0, weeks),
  }
}

/**
 * Save model to storage
 */
export async function saveModel(
  model: tf.LayersModel,
  savePath: string = 'indexeddb://resume-analyzer-model'
): Promise<void> {
  try {
    await model.save(savePath)
    console.log(`✅ Model saved to ${savePath}`)
  } catch (error) {
    console.error('Error saving model:', error)
    throw error
  }
}

/**
 * Load model from storage
 */
export async function loadModel(
  loadPath: string = 'indexeddb://resume-analyzer-model'
): Promise<tf.LayersModel> {
  try {
    const model = await tf.loadLayersModel(loadPath)
    console.log(`✅ Model loaded from ${loadPath}`)
    return model
  } catch (error) {
    console.error('Error loading model:', error)
    throw error
  }
}

/**
 * Get model size info
 */
export function getModelSize(model: tf.LayersModel): {
  totalParameters: number
  trainableParameters: number
  nonTrainableParameters: number
  memorySizeInBytes: number
} {
  let totalParameters = 0
  let trainableParameters = 0
  let nonTrainableParameters = 0

  model.weights.forEach((weight: any) => {
    const size = weight.val?.size || weight.size || 0
    totalParameters += size
    if (weight.trainable) {
      trainableParameters += size
    } else {
      nonTrainableParameters += size
    }
  })

  // Approximate memory in bytes (assuming float32 = 4 bytes)
  const memorySizeInBytes = totalParameters * 4

  return {
    totalParameters,
    trainableParameters,
    nonTrainableParameters,
    memorySizeInBytes,
  }
}
