#!/usr/bin/env python3
"""
Inference script for job matching model.
Loads trained model and predicts readiness scores for resume-job pairs.
"""

import sys
import json
import numpy as np
from tensorflow.keras.models import load_model

# Path to model file
MODEL_PATH = 'models/intelligent_model.h5'

def load_trained_model():
    """Load the trained Keras model."""
    try:
        model = load_model(MODEL_PATH)
        return model
    except FileNotFoundError:
        print(f"Error: Model file not found at {MODEL_PATH}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error loading model: {e}", file=sys.stderr)
        sys.exit(1)

def predict(features: list) -> list:
    """
    Predict readiness score and other metrics for given features.
    
    Args:
        features: List of 90 numerical features
        
    Returns:
        List of 4 predictions: [readiness (0-1), matched_count, missing_count, weeks]
    """
    if len(features) != 90:
        raise ValueError(f"Expected 90 features, got {len(features)}")
    
    # Convert to numpy array and reshape for model
    features_array = np.array([features], dtype=np.float32)
    
    # Make prediction
    model = load_trained_model()
    predictions = model.predict(features_array, verbose=0)
    
    # Extract predictions (model has 4 outputs)
    readiness = float(predictions[0][0])  # 0-1 score
    matched_count = float(predictions[0][1])  # Matched skills count
    missing_count = float(predictions[0][2])  # Missing skills count
    weeks_to_learn = float(predictions[0][3])  # Weeks to learn missing skills
    
    # Clamp values to reasonable ranges
    readiness = max(0, min(1, readiness))  # 0-1
    matched_count = max(0, int(matched_count))  # >= 0
    missing_count = max(0, int(missing_count))  # >= 0
    weeks_to_learn = max(0, int(weeks_to_learn))  # >= 0
    
    return [readiness, matched_count, missing_count, weeks_to_learn]

def main():
    """Main entry point for inference."""
    if len(sys.argv) < 2:
        print("Usage: predict.py <json_features>", file=sys.stderr)
        print("Expected JSON format: {\"features\": [90 numbers]}", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Parse input features from command line
        input_data = json.loads(sys.argv[1])
        features = input_data.get('features', [])
        
        if not isinstance(features, list):
            raise ValueError("'features' must be a list")
        
        # Make prediction
        predictions = predict(features)
        
        # Output as JSON
        result = {
            "readiness": predictions[0],
            "matched": predictions[1],
            "missing": predictions[2],
            "weeks": predictions[3]
        }
        print(json.dumps(result))
        
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
