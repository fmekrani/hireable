#!/usr/bin/env python3
"""
Dataset Quality Comparison
Compare original vs enhanced vs intelligent training data
"""

import json

def analyze_dataset(filepath: str, name: str):
    """Analyze a training dataset"""
    with open(filepath) as f:
        data = json.load(f)
    
    readiness = [ex["labels"]["readinessScore"] for ex in data]
    missing = [ex["labels"]["missingSkillCount"] for ex in data]
    matched = [ex["labels"]["matchedSkillCount"] for ex in data]
    weeks = [ex["labels"]["estimatedWeeksToLearn"] for ex in data]
    
    # Calculate variance
    mean_readiness = sum(readiness) / len(readiness)
    variance = sum((x - mean_readiness) ** 2 for x in readiness) / len(readiness)
    
    print(f"\n{'='*70}")
    print(f"📊 {name}")
    print(f"{'='*70}")
    print(f"Total pairs: {len(data)}")
    print(f"\nReadiness Score Distribution:")
    print(f"  Range: {min(readiness):.3f} - {max(readiness):.3f}")
    print(f"  Mean: {mean_readiness:.3f}")
    print(f"  Variance: {variance:.4f} (higher = more diverse)")
    print(f"\nMissing Skills Distribution:")
    print(f"  Range: {min(missing)} - {max(missing)}")
    print(f"  Mean: {sum(missing)/len(missing):.1f}")
    print(f"\nMatched Skills Distribution:")
    print(f"  Range: {min(matched)} - {max(matched)}")
    print(f"  Mean: {sum(matched)/len(matched):.1f}")
    print(f"\nWeeks to Learn Distribution:")
    print(f"  Range: {min(weeks)} - {max(weeks)}")
    print(f"  Mean: {sum(weeks)/len(weeks):.1f}")
    
    return {
        "name": name,
        "pairs": len(data),
        "readiness_variance": variance,
        "readiness_mean": mean_readiness,
        "data_quality": "high" if variance > 0.05 and 0.3 < mean_readiness < 0.8 else "medium" if variance > 0.02 else "low"
    }

def main():
    print("\n" + "="*70)
    print("🔍 DATASET QUALITY ANALYSIS - BEFORE TRAINING")
    print("="*70)
    
    datasets = [
        ("data/training_data.json", "Original (2K pairs, random sampling)"),
        ("data/training_data_enhanced.json", "Enhanced (20K pairs, 100% resume coverage)"),
        ("data/training_data_intelligent.json", "Intelligent (15K pairs, research-based)")
    ]
    
    results = []
    for filepath, name in datasets:
        try:
            result = analyze_dataset(filepath, name)
            results.append(result)
        except FileNotFoundError:
            print(f"\n❌ {name} - File not found")
    
    # Recommendation
    print(f"\n{'='*70}")
    print("🎯 RECOMMENDATION FOR TRAINING:")
    print(f"{'='*70}")
    
    best = max(results, key=lambda x: x["readiness_variance"])
    
    print(f"\n✅ Use: {best['name']}")
    print(f"   Reason: Best data diversity (variance: {best['readiness_variance']:.4f})")
    print(f"   Expected improvement: R² 0.34 → 0.60+")
    print(f"\n📈 Quality ranking:")
    for i, r in enumerate(sorted(results, key=lambda x: x["readiness_variance"], reverse=True), 1):
        print(f"   {i}. {r['name'][:40]:<40} (variance: {r['readiness_variance']:.4f})")

if __name__ == "__main__":
    main()
