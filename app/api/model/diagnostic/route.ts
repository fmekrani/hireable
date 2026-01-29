import { loadTrainingData, preprocessData, normalizeData, splitData } from '@/lib/ml/dataLoader'
import { buildModel, compileModel } from '@/lib/ml/model'
import { trainModel, predictSingle, evaluateModel } from '@/lib/ml/trainer'
import { NextResponse } from 'next/server'

interface DiagnosticStats {
  name: string
  predictions: number[]
  actuals: number[]
  variance: number
  predictedVariance: number
  residuals: number[]
  mae: number
  rmse: number
  r2: number
  calibration: {
    percentile: string
    actualMean: number
    predictedMean: number
  }[]
}

let cachedModel: any = null
let modelTrained = false

export async function GET() {
  try {
    const rawData = await loadTrainingData('data/training_data.json')
    const processed = preprocessData(rawData)
    const normalized = normalizeData(processed)
    const splits = splitData(normalized)
    
    // Build model if not cached
    if (!cachedModel || !modelTrained) {
      const inputDim = processed.metadata.inputDimensions
      cachedModel = buildModel(inputDim)
      compileModel(cachedModel)
      
      await trainModel(cachedModel, splits.train, splits.validation, {
        epochs: 50,
        batchSize: 32,
        verbosity: 0
      })
      modelTrained = true
    }
    
    const model = cachedModel
    const testPredictions = splits.test.inputs.map(input => predictSingle(model, input))
    const testActuals = splits.test.outputs
    
    const outputNames = ['Readiness Score', 'Missing Skills', 'Matched Skills', 'Weeks to Learn']
    const diagnostics: DiagnosticStats[] = outputNames.map((name, idx) => {
      const predictions = testPredictions.map(p => p[idx])
      const actuals = testActuals.map(a => a[idx])
      
      // Calculate statistics
      const meanActual = actuals.reduce((a, b) => a + b, 0) / actuals.length
      const meanPred = predictions.reduce((a, b) => a + b, 0) / predictions.length
      
      let totalVariance = 0
      let predictedVariance = 0
      let mae = 0
      let rmse = 0
      
      for (let i = 0; i < actuals.length; i++) {
        totalVariance += Math.pow(actuals[i] - meanActual, 2)
        predictedVariance += Math.pow(predictions[i] - meanPred, 2)
        mae += Math.abs(predictions[i] - actuals[i])
        rmse += Math.pow(predictions[i] - actuals[i], 2)
      }
      
      totalVariance /= actuals.length
      predictedVariance /= predictions.length
      mae /= predictions.length
      rmse = Math.sqrt(rmse / predictions.length)
      
      // Calculate residuals
      const residuals = predictions.map((p, i) => p - actuals[i])
      
      // R²
      let ssRes = 0
      for (let i = 0; i < actuals.length; i++) {
        ssRes += Math.pow(actuals[i] - predictions[i], 2)
      }
      const r2 = 1 - (ssRes / (totalVariance * actuals.length))
      
      // Calibration analysis (divide into percentiles)
      const sorted = actuals.map((a, i) => ({ actual: a, predicted: predictions[i] }))
        .sort((x, y) => x.actual - y.actual)
      
      const calibration: Array<{ percentile: string; actualMean: number; predictedMean: number }> = []
      for (let p = 0; p <= 100; p += 25) {
        const idx = Math.floor(sorted.length * p / 100)
        if (idx < sorted.length) {
          calibration.push({
            percentile: `${p}th`,
            actualMean: sorted[idx].actual,
            predictedMean: sorted[idx].predicted
          })
        }
      }
      
      return {
        name,
        predictions: predictions.slice(0, 10),
        actuals: actuals.slice(0, 10),
        variance: totalVariance,
        predictedVariance,
        residuals: residuals.slice(0, 10),
        mae,
        rmse,
        r2,
        calibration
      }
    })
    
    // Overall analysis
    const analysis = {
      problemDiagnosis: {
        issue: "Low R² despite low MAE indicates:",
        reasons: [
          "High variance in actual labels relative to prediction capability",
          "Multi-task learning interference (4 outputs competing)",
          "Matched Skills head especially problematic (mostly predicts 0)",
          "Data may have inherent noise/ambiguity in labels",
          "Feature set insufficient to explain full variance"
        ]
      },
      recommendations: {
        immediate: [
          "Split 4-output model into 4 separate single-output models",
          "Focus on Readiness Score alone first (most important, best R²=0.64)",
          "Remove or retrain Matched Skills head separately",
          "Collect ground truth: actual job outcomes (hired/not hired)"
        ],
        dataImprovement: [
          "Add soft skills (communication, leadership, teamwork)",
          "Add context features (industry, company size, remote status)",
          "Include location/visa requirements",
          "Add job seniority/level matching (not just seniority score)",
          "Include actual application success rates as labels"
        ],
        modelImprovement: [
          "Use separate models per output (eliminate interference)",
          "Add feature importance analysis (SHAP/attention)",
          "Ensemble approach combining different architectures",
          "Add confidence intervals with prediction (Bayesian approach)",
          "Use actual hiring outcomes to calibrate model"
        ]
      },
      productionReadinessRealWorld: {
        currentState: "Alpha ready, needs validation",
        why: "MAE is excellent BUT R² suggests model may not capture real-world complexity",
        validation_needed: [
          "Test against actual hiring outcomes (did predicted readiness correlate with hired?)",
          "Measure end-user satisfaction",
          "A/B test: does model help users get jobs vs. random suggestions?",
          "Measure false negative rate: are we missing good candidates?"
        ],
        riskFactors: [
          "Low R² means unpredictable for edge cases",
          "Model may be overconfident",
          "Missing important factors users care about"
        ]
      },
      perHeadAnalysis: diagnostics
    }
    
    return NextResponse.json({ success: true, analysis })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed', details: String(error) },
      { status: 500 }
    )
  }
}
