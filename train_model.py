#!/usr/bin/env python3
"""
Standalone Training Script
Trains the model using TensorFlow with intelligent training data
"""

import json
import numpy as np
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

print("🚀 Starting Model Training (Python Backend)")
print("=" * 60)

try:
    # Import TensorFlow
    print("\n📦 Loading TensorFlow...")
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers, callbacks
    print(f"✅ TensorFlow {tf.__version__} loaded")

    # Load training data
    print("\n📥 Loading intelligent training data...")
    with open('data/training_data_intelligent.json') as f:
        training_data = json.load(f)
    print(f"✅ Loaded {len(training_data)} training pairs")

    # Extract features and labels
    print("\n🔄 Preparing data...")
    X = []
    y_readiness = []
    y_matched = []
    y_missing = []
    y_weeks = []

    for example in training_data:
        # Resume features
        features = [
            example['resumeFeatures']['skillCount'] / 20,  # normalize
            example['resumeFeatures']['yearsOfExperience'] / 20,
            example['resumeFeatures']['educationLevel'] / 3,
            example['resumeFeatures']['seniority'] / 4,
            example['resumeFeatures']['projectsCount'] / 10,
        ]
        
        # Job features
        features.extend([
            example['jobFeatures']['requiredSkillCount'] / 10,
            example['jobFeatures']['requiredExperienceYears'] / 20,
            example['jobFeatures']['educationRequired'] / 3,
            example['jobFeatures']['seniority'] / 4,
            example['jobFeatures']['employmentTypeScore'] / 3,
        ])
        
        # Add skill vectors (exactly 40 each to total 90 features)
        features.extend(example['resumeFeatures']['skillVector'][:40])  # first 40
        features.extend(example['jobFeatures']['skillVector'][:40])     # first 40
        
        X.append(features)
        
        # Labels
        y_readiness.append(example['labels']['readinessScore'])
        y_matched.append(example['labels']['matchedSkillCount'] / 5)  # normalize
        y_missing.append(example['labels']['missingSkillCount'] / 5)  # normalize
        y_weeks.append(example['labels']['estimatedWeeksToLearn'] / 12)  # normalize

    X = np.array(X, dtype=np.float32)
    print(f"✅ Input shape: {X.shape}")
    print(f"✅ Features: {X.shape[1]}")

    # Split data
    n_samples = len(X)
    train_idx = int(n_samples * 0.7)
    val_idx = int(n_samples * 0.85)

    X_train = X[:train_idx]
    y_train_readiness = np.array(y_readiness[:train_idx], dtype=np.float32)

    X_val = X[train_idx:val_idx]
    y_val_readiness = np.array(y_readiness[train_idx:val_idx], dtype=np.float32)

    X_test = X[val_idx:]
    y_test_readiness = np.array(y_readiness[val_idx:], dtype=np.float32)

    print(f"\n✂️  Data split:")
    print(f"  Train: {X_train.shape[0]} ({X_train.shape[0]/n_samples*100:.1f}%)")
    print(f"  Val:   {X_val.shape[0]} ({X_val.shape[0]/n_samples*100:.1f}%)")
    print(f"  Test:  {X_test.shape[0]} ({X_test.shape[0]/n_samples*100:.1f}%)")

    # Build model
    print("\n🏗️  Building neural network...")
    model = keras.Sequential([
        layers.Dense(256, activation='relu', input_shape=(X.shape[1],)),
        layers.BatchNormalization(),
        layers.Dropout(0.4),
        
        layers.Dense(128, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        
        layers.Dense(64, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.2),
        
        # Multi-output heads
        layers.Dense(32, activation='relu'),
        layers.Dense(4, activation='sigmoid')  # 4 outputs: readiness, matched, missing, weeks
    ])

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='mse',
        metrics=['mae']
    )

    print("✅ Model built")
    model.summary()

    # Prepare all outputs
    y_train_all = np.column_stack([
        y_readiness[:train_idx],
        [y_matched[i] for i in range(train_idx)],
        [y_missing[i] for i in range(train_idx)],
        [y_weeks[i] for i in range(train_idx)]
    ]).astype(np.float32)

    y_val_all = np.column_stack([
        y_readiness[train_idx:val_idx],
        [y_matched[i] for i in range(train_idx, val_idx)],
        [y_missing[i] for i in range(train_idx, val_idx)],
        [y_weeks[i] for i in range(train_idx, val_idx)]
    ]).astype(np.float32)

    y_test_all = np.column_stack([
        y_readiness[val_idx:],
        [y_matched[i] for i in range(val_idx, n_samples)],
        [y_missing[i] for i in range(val_idx, n_samples)],
        [y_weeks[i] for i in range(val_idx, n_samples)]
    ]).astype(np.float32)

    # Train model
    print("\n🎓 Training model...")
    history = model.fit(
        X_train, y_train_all,
        validation_data=(X_val, y_val_all),
        epochs=100,
        batch_size=32,
        verbose=1,
        callbacks=[
            callbacks.EarlyStopping(
                monitor='val_loss',
                patience=15,
                restore_best_weights=True
            )
        ]
    )

    # Evaluate
    print("\n🧪 Evaluating on test set...")
    test_loss, test_mae = model.evaluate(X_test, y_test_all, verbose=0)

    # Calculate R² 
    predictions = model.predict(X_test, verbose=0)
    y_test_readiness_only = y_test_all[:, 0]  # first output is readiness
    pred_readiness_only = predictions[:, 0]

    ss_res = np.sum((y_test_readiness_only - pred_readiness_only) ** 2)
    ss_tot = np.sum((y_test_readiness_only - np.mean(y_test_readiness_only)) ** 2)
    r2 = 1 - (ss_res / ss_tot)

    print("\n" + "=" * 60)
    print("✅ TRAINING COMPLETE!")
    print("=" * 60)
    print("\n📊 Results:")
    print(f"  Test Loss: {test_loss:.6f}")
    print(f"  Test MAE:  {test_mae:.6f}")
    print(f"  R² Score:  {r2:.4f}")
    print(f"  Epochs:    {len(history.history['loss'])}")
    print(f"\n🎯 Expected Improvement:")
    print(f"  Before: R² = 0.3368")
    print(f"  After:  R² = {r2:.4f}")
    print(f"  Gain:   {(r2 - 0.3368) / 0.3368 * 100:+.1f}%")

    # Save model
    print(f"\n💾 Saving model...")
    model.save('models/intelligent_model.h5')
    print(f"✅ Model saved to models/intelligent_model.h5")

    print("\n" + "=" * 60)
    print("🎉 Training pipeline completed successfully!")
    print("=" * 60)

except Exception as e:
    print(f"\n❌ Error during training: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
