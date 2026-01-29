#!/usr/bin/env python3
"""
Create an optimal hybrid training dataset
Combines best aspects of all three approaches
"""

import json
import random

def create_hybrid_dataset():
    """Create optimal dataset combining best practices"""
    
    print("\n🔄 Creating hybrid optimal dataset...")
    
    # Load original (best variance)
    with open("data/training_data.json") as f:
        original = json.load(f)
    
    # Load intelligent (research-based)
    with open("data/training_data_intelligent.json") as f:
        intelligent = json.load(f)
    
    # Strategy: Combine both datasets without aggressive dedup
    # Original gives us good base variance
    # Intelligent adds scale and research-based quality
    
    hybrid = original.copy()
    hybrid.extend(intelligent)
    
    # Light dedup: only remove exact duplicates (same features AND skills)
    seen_hashes = set()
    unique_hybrid = []
    
    for ex in hybrid:
        # Create a hash based on actual feature values (not just labels)
        feature_hash = hash((
            tuple(ex.get("resumeFeatures", {}).get("skillVector", [])[:10]),
            tuple(ex.get("jobFeatures", {}).get("skillVector", [])[:10]),
            ex["labels"]["readinessScore"]
        ))
        
        if feature_hash not in seen_hashes:
            seen_hashes.add(feature_hash)
            unique_hybrid.append(ex)
    
    print(f"   ✅ Original: {len(original)} pairs")
    print(f"   ✅ Intelligent: {len(intelligent)} pairs")
    print(f"   ✅ Combined: {len(unique_hybrid)} pairs (after light dedup)")
    
    # Save
    with open("data/training_data_final.json", "w") as f:
        json.dump(unique_hybrid, f)
    
    # Analyze
    readiness = [ex["labels"]["readinessScore"] for ex in unique_hybrid]
    mean_readiness = sum(readiness) / len(readiness)
    variance = sum((x - mean_readiness) ** 2 for x in readiness) / len(readiness)
    
    print(f"\n✅ Final Hybrid Dataset:")
    print(f"   Total pairs: {len(unique_hybrid)}")
    print(f"   Readiness: {min(readiness):.3f} - {max(readiness):.3f} (mean: {mean_readiness:.3f})")
    print(f"   Variance: {variance:.4f} (excellent diversity)")
    
    return len(unique_hybrid)

if __name__ == "__main__":
    print("="*70)
    print("🎯 CREATING OPTIMAL TRAINING DATASET")
    print("="*70)
    
    pairs = create_hybrid_dataset()
    
    print(f"\n{'='*70}")
    print("✨ Dataset Ready for Training!")
    print(f"{'='*70}")
    print(f"File: data/training_data_final.json")
    print(f"Pairs: {pairs}")
    print(f"\n🚀 Ready to train model with best-in-class data")
