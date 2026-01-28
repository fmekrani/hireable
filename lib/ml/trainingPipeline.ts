/**
 * Model Training Pipeline
 * Run this after Person A provides training data
 */

import * as tf from '@tensorflow/tfjs'
import {
  loadTrainingData,
  preprocessData,
  splitData,
  normalizeData,
  getDatasetStats,
} from './dataLoader'
import { buildModel, compileModel, printModelSummary, saveModel } from './model'
import {
  trainModel,
  evaluateModel,
  predictSingle,
  calculateMetrics,
  printTrainingSummary,
  printEvaluationSummary,
  DEFAULT_CONFIG,
} from './trainer'
import { denormalizePredictions, formatPrediction } from './model'

/**
 * Complete training pipeline
 */
export async function runTrainingPipeline() {
  console.log('🚀 Starting ML Training Pipeline\n')

  try {
    // Step 1: Load data (using intelligent training data with 6,000 pairs)
    console.log('📥 Loading training data (intelligent dataset)...')
    const rawData = await loadTrainingData('data/training_data_intelligent.json')
    console.log(`✅ Loaded ${rawData.length} training examples\n`)

    // Step 2: Preprocess
    console.log('🔄 Preprocessing data...')
    const processedData = preprocessData(rawData)
    console.log(`✅ Input dimensions: ${processedData.metadata.inputDimensions}`)
    console.log(`✅ Output dimensions: ${processedData.metadata.outputDimensions}\n`)

    // Step 3: Get statistics for normalization
    console.log('📊 Calculating statistics...')
    const stats = getDatasetStats(processedData)
    console.log(`✅ Total examples: ${stats.totalExamples}\n`)

    // Step 4: Normalize data
    console.log('📐 Normalizing data...')
    const normalizedData = normalizeData(processedData)
    console.log('✅ Data normalized\n')

    // Step 5: Split data
    console.log('✂️  Splitting data (70/15/15)...')
    const splits = splitData(normalizedData)
    console.log(`✅ Train: ${splits.train.metadata.totalExamples}`)
    console.log(`✅ Val: ${splits.validation.metadata.totalExamples}`)
    console.log(`✅ Test: ${splits.test.metadata.totalExamples}\n`)

    // Step 6: Build model
    console.log('🏗️  Building neural network...')
    const inputDim = processedData.metadata.inputDimensions
    const model = buildModel(inputDim)
    compileModel(model)
    printModelSummary(model)

    // Step 7: Train model
    console.log('🎓 Training model...')
    const trainingResult = await trainModel(model, splits.train, splits.validation, {
      epochs: 100,
      batchSize: 32,
      earlyStoppingPatience: 15,
      verbosity: 1,
    })

    printTrainingSummary(trainingResult)

    // Step 8: Evaluate on test set
    console.log('🧪 Evaluating on test set...')
    const testMetrics = evaluateModel(model, splits.test)

    // Make predictions on test set
    const testPredictions = predictSingle(model, splits.test.inputs[0])
    const testMetricsDetailed = calculateMetrics(
      splits.test.outputs,
      splits.test.inputs.map(x => predictSingle(model, x))
    )

    printEvaluationSummary(testMetrics, testMetricsDetailed)

    // Step 9: Save model (skip in Node.js environment - just keep in memory)
    console.log('💾 Model ready (in-memory)')
    if (typeof window !== 'undefined') {
      try {
        console.log('Saving to IndexedDB...')
        await saveModel(model, 'indexeddb://resume-analyzer-model')
      } catch (error) {
        console.warn('Could not save model to IndexedDB:', error)
      }
    }

    console.log('✅ Training pipeline completed!')

    return {
      model,
      trainingResult,
      testMetrics,
      normalizedData,
    }
  } catch (error) {
    console.error('❌ Error in training pipeline:', error)
    throw error
  }
}

/**
 * Test prediction on single example
 */
export async function testPrediction() {
  try {
    console.log('🧪 Testing single prediction...\n')

    // Load and preprocess data (using intelligent dataset)
    const rawData = await loadTrainingData('data/training_data_intelligent.json')
    const processed = preprocessData(rawData)
    const normalized = normalizeData(processed)
    const splits = splitData(normalized)

    // Build and train model (or load if exists)
    const inputDim = processed.metadata.inputDimensions
    const model = buildModel(inputDim)
    compileModel(model)

    // Train quickly on small subset for testing
    const smallTrain = {
      inputs: splits.train.inputs.slice(0, 100),
      outputs: splits.train.outputs.slice(0, 100),
      metadata: splits.train.metadata,
    }

    await trainModel(model, smallTrain, undefined, {
      epochs: 10,
      batchSize: 16,
      verbosity: 0,
    })

    // Make prediction
    const testInput = splits.test.inputs[0]
    const prediction = predictSingle(model, testInput)
    const denormalized = denormalizePredictions(prediction)
    const formatted = formatPrediction(denormalized)

    console.log('📊 Prediction Output:')
    console.log(`  Readiness Score: ${formatted.readinessScore}/100`)
    console.log(`  Confidence: ${(formatted.confidence * 100).toFixed(1)}%`)
    console.log(`  Missing Skills: ${formatted.missingSkillCount}`)
    console.log(`  Matched Skills: ${formatted.matchedSkillCount}`)
    console.log(`  Estimated Weeks: ${formatted.estimatedWeeksToLearn}`)

    return formatted
  } catch (error) {
    console.error('Error in test prediction:', error)
    throw error
  }
}

// Export for use in scripts
export { DEFAULT_CONFIG }
