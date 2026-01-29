import { loadTrainingData, preprocessData, normalizeData, splitData } from '@/lib/ml/dataLoader'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const rawData = await loadTrainingData('data/training_data.json')
    const processed = preprocessData(rawData)
    const normalized = normalizeData(processed)
    
    // Get statistics on the normalized data
    const outputNames = ['Readiness Score', 'Missing Skills', 'Matched Skills', 'Weeks to Learn']
    
    const stats = {
      rawDataSample: {
        firstThreeExamples: rawData.slice(0, 3).map(ex => ({
          labels: ex.labels,
          resumeSkillCount: ex.resumeFeatures.skillCount,
          jobSkillCount: ex.jobFeatures.requiredSkillCount
        }))
      },
      processedDataStats: {
        totalExamples: processed.inputs.length,
        inputDimensions: processed.metadata.inputDimensions,
        outputDimensions: processed.metadata.outputDimensions,
        firstExampleInput: processed.inputs[0].slice(0, 10),
        firstExampleOutput: processed.outputs[0]
      },
      normalizedDataStats: {
        perOutput: outputNames.map((name, idx) => {
          const values = normalized.outputs.map((out: number[]) => out[idx])
          const min = Math.min(...values)
          const max = Math.max(...values)
          const mean = values.reduce((a: number, b: number) => a + b, 0) / values.length
          return {
            name,
            min: min.toFixed(6),
            max: max.toFixed(6),
            mean: mean.toFixed(6),
            count: values.length
          }
        })
      }
    }
    
    return NextResponse.json({ success: true, statistics: stats })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed', details: String(error) },
      { status: 500 }
    )
  }
}
