import { runTrainingPipeline } from '../lib/ml/trainingPipeline.js';

async function main() {
  console.log('🚀 Starting Phase 4: Model Training');
  console.log('==================================================');
  
  try {
    const result = await runTrainingPipeline();
    
    console.log('\n✅ Training Complete!');
    console.log('==================================================');
    console.log('Training Results:');
    console.log(`  Final Training Loss: ${result.trainingResult.finalLoss?.toFixed(4)}`);
    console.log(`  Final Validation Loss: ${result.trainingResult.finalValLoss?.toFixed(4)}`);
    console.log(`  Best Validation Loss: ${result.trainingResult.bestValLoss?.toFixed(4)}`);
    console.log(`  Test Loss: ${result.testMetrics.testLoss?.toFixed(4)}`);
    console.log(`  Test MAE: ${result.testMetrics.testMae?.toFixed(4)}`);
    console.log(`  Total Epochs: ${result.trainingResult.epochs}`);
    console.log(`  Training Duration: ${(result.trainingResult.duration / 1000 / 60).toFixed(2)} minutes`);
    console.log('\n💾 Model saved and ready for inference!');
    
  } catch (error) {
    console.error('❌ Training failed:', error);
    process.exit(1);
  }
}

main();
