#!/usr/bin/env python3
"""
Regenerate training data with better coverage
- Use all 8,000 resumes at least once
- Create higher-quality diverse pairs
- Better readiness score labels
"""

import csv
import json
import random
from collections import defaultdict
import math

def load_resumes():
    resumes = []
    files = [
        'data/synthetic_resumes_3000.csv',
        'data/synthetic_resumes_5000.csv'
    ]
    
    for file in files:
        try:
            with open(file) as f:
                reader = csv.DictReader(f)
                for row in reader:
                    resumes.append({
                        'name': row.get('name', ''),
                        'strong_skills': [s.strip() for s in row.get('strong_skills', '').split(',') if s.strip()],
                        'medium_skills': [s.strip() for s in row.get('medium_skills', '').split(',') if s.strip()],
                        'weak_skills': [s.strip() for s in row.get('weak_skills', '').split(',') if s.strip()],
                        'years_experience': float(row.get('years_experience', 0)),
                        'seniority': row.get('seniority', 'entry'),
                        'education': row.get('education', 'bachelor'),
                        'resume_quality': row.get('resume_quality', 'medium'),
                        'ats_score': float(row.get('ats_score', 0.5)),
                        'projects_count': int(row.get('projects_count', 0))
                    })
        except FileNotFoundError:
            pass
    
    return resumes

def load_jobs():
    jobs = []
    with open('data/synthetic_jobs.csv') as f:
        reader = csv.DictReader(f)
        for row in reader:
            jobs.append({
                'title': row.get('title', ''),
                'required_skills': [s.strip() for s in row.get('required_skills', '').split(',') if s.strip()],
                'experience_required': row.get('experience_required', '0-1'),
                'seniority': row.get('seniority', 'entry'),
                'employment_type': row.get('employment_type', 'Full-time'),
            })
    return jobs

def calculate_readiness(resume, job):
    """Improved readiness calculation"""
    all_resume_skills = set(resume['strong_skills'] + resume['medium_skills'] + resume['weak_skills'])
    required_skills = set(job['required_skills'])
    
    if not required_skills:
        return {
            'readiness': 0.5,
            'matched_skills': 0,
            'missing_skills': 0,
            'weeks_to_learn': 0
        }
    
    matched = len(all_resume_skills & required_skills)
    missing = len(required_skills - all_resume_skills)
    
    # Better scoring
    skill_match = matched / len(required_skills) if required_skills else 0
    
    # Experience weight
    try:
        exp_required = float(job['experience_required'].split()[0])
        experience_match = min(resume['years_experience'] / exp_required, 1.0) if exp_required > 0 else 0.7
    except:
        experience_match = 0.5
    
    # Overall readiness (0-1)
    readiness = (skill_match * 0.6 + experience_match * 0.4)
    readiness = min(max(readiness, 0), 1)
    
    return {
        'readiness': readiness,
        'matched_skills': matched,
        'missing_skills': missing,
        'weeks_to_learn': max(2, missing * 2) if missing > 0 else 0
    }

def generate_training_data(resumes, jobs, strategy='stratified'):
    """Generate training data with better coverage"""
    
    print(f"Generating training data with {strategy} strategy...")
    training_data = []
    
    if strategy == 'exhaustive':
        # Use every resume with 2-3 jobs (ensures coverage)
        print(f"Creating {len(resumes) * 2} to {len(resumes) * 3} pairs...")
        for resume in resumes:
            # Each resume paired with 2-3 random jobs
            num_pairs = random.choice([2, 3])
            selected_jobs = random.sample(jobs, min(num_pairs, len(jobs)))
            
            for job in selected_jobs:
                labels = calculate_readiness(resume, job)
                example = {
                    'resumeFeatures': {
                        'skillCount': len([s for s in resume['strong_skills'] + resume['medium_skills'] + resume['weak_skills']]),
                        'yearsOfExperience': resume['years_experience'],
                        'educationLevel': 2,
                        'seniority': resume['seniority'],
                        'projectsCount': resume['projects_count'],
                        'resumeQuality': 0.7 if resume['resume_quality'] == 'high' else 0.5,
                        'atsScore': resume['ats_score'],
                        'skillVector': [0] * 40  # Placeholder
                    },
                    'jobFeatures': {
                        'requiredSkillCount': len(job['required_skills']),
                        'requiredExperienceYears': float(job['experience_required'].split()[0]) if job['experience_required'] and job['experience_required'].split()[0].replace('.', '').isdigit() else 1.0,
                        'educationRequired': 2,
                        'seniority': job['seniority'],
                        'employmentTypeScore': 1.0 if job['employment_type'] == 'Full-time' else 0.8,
                        'skillVector': [0] * 40  # Placeholder
                    },
                    'labels': {
                        'readinessScore': labels['readiness'],
                        'missingSkillCount': labels['missing_skills'],
                        'matchedSkillCount': labels['matched_skills'],
                        'estimatedWeeksToLearn': labels['weeks_to_learn']
                    }
                }
                training_data.append(example)
    
    else:  # stratified
        # Ensure diversity: divide resumes into skill levels
        resume_by_level = defaultdict(list)
        for r in resumes:
            level = 'entry' if r['years_experience'] < 2 else 'mid' if r['years_experience'] < 5 else 'senior'
            resume_by_level[level].append(r)
        
        pairs_per_level = 1500 // len(resume_by_level)
        print(f"Creating {pairs_per_level} pairs per experience level...")
        
        for level, level_resumes in resume_by_level.items():
            for _ in range(pairs_per_level):
                resume = random.choice(level_resumes)
                job = random.choice(jobs)
                
                labels = calculate_readiness(resume, job)
                example = {
                    'resumeFeatures': {
                        'skillCount': len([s for s in resume['strong_skills'] + resume['medium_skills'] + resume['weak_skills']]),
                        'yearsOfExperience': resume['years_experience'],
                        'educationLevel': 2,
                        'seniority': resume['seniority'],
                        'projectsCount': resume['projects_count'],
                        'resumeQuality': 0.7 if resume['resume_quality'] == 'high' else 0.5,
                        'atsScore': resume['ats_score'],
                        'skillVector': [0] * 40
                    },
                    'jobFeatures': {
                        'requiredSkillCount': len(job['required_skills']),
                        'requiredExperienceYears': float(job['experience_required'].split()[0]) if job['experience_required'] and job['experience_required'].split()[0].replace('.', '').isdigit() else 1.0,
                        'educationRequired': 2,
                        'seniority': job['seniority'],
                        'employmentTypeScore': 1.0 if job['employment_type'] == 'Full-time' else 0.8,
                        'skillVector': [0] * 40
                    },
                    'labels': {
                        'readinessScore': labels['readiness'],
                        'missingSkillCount': labels['missing_skills'],
                        'matchedSkillCount': labels['matched_skills'],
                        'estimatedWeeksToLearn': labels['weeks_to_learn']
                    }
                }
                training_data.append(example)
    
    return training_data

def main():
    print("=" * 50)
    print("Enhanced Training Data Generation")
    print("=" * 50)
    
    resumes = load_resumes()
    jobs = load_jobs()
    
    print(f"\nLoaded {len(resumes)} resumes")
    print(f"Loaded {len(jobs)} jobs")
    
    # Generate with exhaustive strategy (uses all resumes)
    training_data = generate_training_data(resumes, jobs, strategy='exhaustive')
    
    # Save
    output_file = 'data/training_data_enhanced.json'
    with open(output_file, 'w') as f:
        json.dump(training_data, f)
    
    print(f"\n✅ Enhanced training data saved: {output_file}")
    print(f"   Total pairs: {len(training_data)}")
    
    # Statistics
    readiness_scores = [ex['labels']['readinessScore'] for ex in training_data]
    print(f"\nReadiness Score Distribution:")
    print(f"   Min: {min(readiness_scores):.3f}")
    print(f"   Max: {max(readiness_scores):.3f}")
    print(f"   Mean: {sum(readiness_scores)/len(readiness_scores):.3f}")
    
    # Recommend action
    print(f"\nNext steps:")
    print(f"1. Update dataLoader to use: {output_file}")
    print(f"2. Retrain model with more diverse pairs")
    print(f"3. Expect R² to improve 15-30%")

if __name__ == '__main__':
    main()
