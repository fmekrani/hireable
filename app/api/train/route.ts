import { runTrainingPipeline } from '@/lib/ml/trainingPipeline'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('Starting training pipeline...')
    const result = await runTrainingPipeline()
    
    return NextResponse.json({
      success: true,
      message: 'Training completed successfully',
      result: {
        epochs: result.trainingResult.epochs,
        finalLoss: result.trainingResult.finalLoss,
        finalValLoss: result.trainingResult.finalValLoss,
        bestValLoss: result.trainingResult.bestValLoss,
        testLoss: result.testMetrics.testLoss,
        testMae: result.testMetrics.testMae,
        duration: result.trainingResult.duration,
      }
    })
  } catch (error) {
    console.error('Training failed:', error)
    return NextResponse.json(
      { error: 'Training failed', details: String(error) },
      { status: 500 }
    )
  }
}
