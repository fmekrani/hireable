import * as tf from '@tensorflow/tfjs'
import { ProcessedData, DataSplit, Batch } from './types'
import { createBatches } from './dataLoader'

/**
 * Training configuration
 */
export interface TrainingConfig {
  epochs: number
  batchSize: number
  validationSplit: number
  earlyStoppingPatience: number
  earlyStoppingMinDelta: number
  verbosity: 0 | 1 | 2 // 0=silent, 1=progress bar, 2=one line per epoch
}

/**
 * Training history
 */
export interface TrainingHistory {
  epoch: number
  loss: number
  mae: number
  valLoss: number
  valMae: number
}

/**
 * Training result
 */
export interface TrainingResult {
  success: boolean
  epochs: number
  finalLoss: number
  finalValLoss: number
  bestValLoss: number
  bestEpoch: number
  stoppedEarly: boolean
  history: TrainingHistory[]
  duration: number // in milliseconds
}

/**
 * Default training configuration
 */
export const DEFAULT_CONFIG: TrainingConfig = {
  epochs: 50,
  batchSize: 32,
  validationSplit: 0.15,
  earlyStoppingPatience: 10,
  earlyStoppingMinDelta: 0.001,
  verbosity: 1,
}

/**
 * Train the model
 */
export async function trainModel(
  model: tf.LayersModel,
  trainingData: ProcessedData,
  validationData?: ProcessedData,
  config: Partial<TrainingConfig> = {}
): Promise<TrainingResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const startTime = Date.now()
  const history: TrainingHistory[] = []

  // Convert data to tensors
  const xTrain = tf.tensor2d(trainingData.inputs)
  const yTrain = tf.tensor2d(trainingData.outputs)

  let xVal: tf.Tensor2D | undefined
  let yVal: tf.Tensor2D | undefined

  if (validationData) {
    xVal = tf.tensor2d(validationData.inputs)
    yVal = tf.tensor2d(validationData.outputs)
  }

  let bestValLoss = Infinity
  let bestEpoch = 0
  let patienceCounter = 0

  try {
    // Training loop
    for (let epoch = 0; epoch < finalConfig.epochs; epoch++) {
      const batchStartTime = Date.now()

      // Create batches
      const batches = createBatches(trainingData, finalConfig.batchSize)

      // Train on each batch
      for (const batch of batches) {
        const xBatch = tf.tensor2d(batch.features)
        const yBatch = tf.tensor2d(batch.labels)

        const batchMetrics = await model.trainOnBatch(xBatch, yBatch)

        xBatch.dispose()
        yBatch.dispose()
      }

      // Evaluate on full training set
      const trainMetrics = model.evaluate(xTrain, yTrain, {
        verbose: 0,
      }) as tf.Tensor[]
      const trainLoss = trainMetrics[0].dataSync()[0]
      const trainMae = trainMetrics[1].dataSync()[0]

      trainMetrics.forEach(t => t.dispose())

      // Evaluate on validation set
      let valLoss = trainLoss
      let valMae = trainMae

      if (xVal && yVal) {
        const valMetrics = model.evaluate(xVal, yVal, { verbose: 0 }) as tf.Tensor[]
        valLoss = valMetrics[0].dataSync()[0]
        valMae = valMetrics[1].dataSync()[0]
        valMetrics.forEach(t => t.dispose())
      }

      history.push({
        epoch,
        loss: trainLoss,
        mae: trainMae,
        valLoss,
        valMae,
      })

      // Early stopping
      if (valLoss < bestValLoss - finalConfig.earlyStoppingMinDelta) {
        bestValLoss = valLoss
        bestEpoch = epoch
        patienceCounter = 0
      } else {
        patienceCounter++
      }

      // Logging
      if (finalConfig.verbosity >= 1) {
        const batchTime = Date.now() - batchStartTime
        console.log(
          `Epoch ${epoch + 1}/${finalConfig.epochs} - ` +
          `Loss: ${trainLoss.toFixed(4)}, ` +
          `MAE: ${trainMae.toFixed(4)}, ` +
          `Val Loss: ${valLoss.toFixed(4)}, ` +
          `Val MAE: ${valMae.toFixed(4)} ` +
          `(${batchTime}ms)`
        )
      }

      // Early stopping check
      if (patienceCounter >= finalConfig.earlyStoppingPatience) {
        console.log(
          `\n⏹️  Early stopping at epoch ${epoch + 1} ` +
          `(best: ${bestEpoch + 1}, patience: ${finalConfig.earlyStoppingPatience})`
        )
        break
      }
    }

    // Get final metrics
    const finalMetrics = model.evaluate(xTrain, yTrain, {
      verbose: 0,
    }) as tf.Tensor[]
    const finalLoss = finalMetrics[0].dataSync()[0]
    finalMetrics.forEach(t => t.dispose())

    const duration = Date.now() - startTime

    return {
      success: true,
      epochs: history.length,
      finalLoss,
      finalValLoss: bestValLoss,
      bestValLoss,
      bestEpoch,
      stoppedEarly: patienceCounter >= finalConfig.earlyStoppingPatience,
      history,
      duration,
    }
  } catch (error) {
    console.error('Error during training:', error)
    return {
      success: false,
      epochs: history.length,
      finalLoss: Infinity,
      finalValLoss: Infinity,
      bestValLoss: Infinity,
      bestEpoch: 0,
      stoppedEarly: false,
      history,
      duration: Date.now() - startTime,
    }
  } finally {
    xTrain.dispose()
    yTrain.dispose()
    xVal?.dispose()
    yVal?.dispose()
  }
}

/**
 * Evaluate model on test set
 */
export function evaluateModel(
  model: tf.LayersModel,
  testData: ProcessedData
): {
  testLoss: number
  testMae: number
} {
  const xTest = tf.tensor2d(testData.inputs)
  const yTest = tf.tensor2d(testData.outputs)

  const metrics = model.evaluate(xTest, yTest, { verbose: 0 }) as tf.Tensor[]
  const testLoss = metrics[0].dataSync()[0]
  const testMae = metrics[1].dataSync()[0]

  metrics.forEach(t => t.dispose())
  xTest.dispose()
  yTest.dispose()

  return {
    testLoss,
    testMae,
  }
}

/**
 * Make predictions on new data
 */
export function predict(
  model: tf.LayersModel,
  inputs: number[][]
): number[][] {
  return tf.tidy(() => {
    const xInput = tf.tensor2d(inputs)
    const predictions = model.predict(xInput) as tf.Tensor2D
    const result = predictions.dataSync()

    // Convert to 2D array
    const outputs: number[][] = []
    for (let i = 0; i < inputs.length; i++) {
      const row: number[] = []
      for (let j = 0; j < 4; j++) {
        row.push(result[i * 4 + j])
      }
      outputs.push(row)
    }

    return outputs
  })
}

/**
 * Make single prediction
 */
export function predictSingle(
  model: tf.LayersModel,
  input: number[]
): number[] {
  const predictions = predict(model, [input])
  return predictions[0]
}

/**
 * Calculate accuracy metrics
 */
export function calculateMetrics(
  yTrue: number[][],
  yPred: number[][]
): {
  mse: number[]
  mae: number[]
  rmse: number[]
  r2: number[]
} {
  const numOutputs = 4

  const mse = new Array(numOutputs).fill(0)
  const mae = new Array(numOutputs).fill(0)

  // Calculate MSE and MAE for each output
  for (let i = 0; i < yTrue.length; i++) {
    for (let j = 0; j < numOutputs; j++) {
      const diff = yTrue[i][j] - yPred[i][j]
      mse[j] += diff * diff
      mae[j] += Math.abs(diff)
    }
  }

  // Average
  const n = yTrue.length
  for (let j = 0; j < numOutputs; j++) {
    mse[j] /= n
    mae[j] /= n
  }

  // Calculate RMSE
  const rmse = mse.map(m => Math.sqrt(m))

  // Calculate R² (simplified)
  const yMean = new Array(numOutputs).fill(0)
  for (let i = 0; i < yTrue.length; i++) {
    for (let j = 0; j < numOutputs; j++) {
      yMean[j] += yTrue[i][j]
    }
  }
  for (let j = 0; j < numOutputs; j++) {
    yMean[j] /= n
  }

  const ssTot = new Array(numOutputs).fill(0)
  const ssRes = new Array(numOutputs).fill(0)

  for (let i = 0; i < yTrue.length; i++) {
    for (let j = 0; j < numOutputs; j++) {
      ssTot[j] += (yTrue[i][j] - yMean[j]) ** 2
      ssRes[j] += (yTrue[i][j] - yPred[i][j]) ** 2
    }
  }

  const r2 = ssTot.map((tot, j) => (tot === 0 ? 0 : 1 - ssRes[j] / tot))

  return {
    mse,
    mae,
    rmse,
    r2,
  }
}

/**
 * Print training summary
 */
export function printTrainingSummary(result: TrainingResult): void {
  console.log('\n=== Training Summary ===')
  console.log(`✅ Training completed in ${(result.duration / 1000).toFixed(2)}s`)
  console.log(`📊 Epochs: ${result.epochs}`)
  console.log(`🎯 Final Loss: ${result.finalLoss.toFixed(4)}`)
  console.log(`🎯 Final Val Loss: ${result.finalValLoss.toFixed(4)}`)
  console.log(`⭐ Best Val Loss: ${result.bestValLoss.toFixed(4)} (Epoch ${result.bestEpoch + 1})`)
  console.log(`🛑 Early Stopped: ${result.stoppedEarly ? 'Yes' : 'No'}`)
  console.log('===\n')
}

/**
 * Print evaluation summary
 */
export function printEvaluationSummary(
  testMetrics: ReturnType<typeof evaluateModel>,
  metrics: ReturnType<typeof calculateMetrics>
): void {
  const outputNames = ['Readiness Score', 'Missing Skills', 'Matched Skills', 'Weeks to Learn']

  console.log('\n=== Test Set Evaluation ===')
  console.log(`Test Loss: ${testMetrics.testLoss.toFixed(4)}`)
  console.log(`Test MAE: ${testMetrics.testMae.toFixed(4)}\n`)

  console.log('Per-Output Metrics:')
  outputNames.forEach((name, i) => {
    console.log(`\n${name}:`)
    console.log(`  MSE: ${metrics.mse[i].toFixed(4)}`)
    console.log(`  RMSE: ${metrics.rmse[i].toFixed(4)}`)
    console.log(`  MAE: ${metrics.mae[i].toFixed(4)}`)
    console.log(`  R²: ${metrics.r2[i].toFixed(4)}`)
  })
  console.log('===\n')
}
