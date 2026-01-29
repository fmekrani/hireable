#!/usr/bin/env python3
"""
Intelligent Training Data Generator
Creates realistic readiness labels based on hiring best practices
"""

import csv
import json
import random
from collections import defaultdict

def load_data():
    resumes = []
    jobs = []
    
    with open('data/resumes_research_based.csv') as f:
        reader = csv.DictReader(f)
        resumes = list(reader)
    
    with open('data/jobs_research_based.csv') as f:
        reader = csv.DictReader(f)
        jobs = list(reader)
    
    return resumes, jobs

def parse_skills(skill_str):
    """Parse skill string to list"""
    if isinstance(skill_str, str) and skill_str.startswith('['):
        import ast
        return ast.literal_eval(skill_str)
    elif isinstance(skill_str, str):
        return [s.strip() for s in skill_str.split(',')]
    return []

def calculate_realistic_readiness(resume, job):
    """
    Calculate readiness score based on best practices:
    - Skill match (50%)
    - Experience match (30%)
    - Seniority alignment (15%)
    - Domain match (5%)
    """
    
    # Parse data
    strong_skills = set(parse_skills(resume.get('strong_skills', '[]')))
    medium_skills = set(parse_skills(resume.get('medium_skills', '[]')))
    weak_skills = set(parse_skills(resume.get('weak_skills', '[]')))
    required_skills = set(parse_skills(job.get('required_skills', '[]')))
    
    all_resume_skills = strong_skills | medium_skills | weak_skills
    
    # 1. SKILL MATCH (50%)
    if not required_skills:
        skill_score = 0.5
    else:
        matched_strong = len(strong_skills & required_skills)
        matched_medium = len(medium_skills & required_skills)
        matched_weak = len(weak_skills & required_skills)
        missing = len(required_skills - all_resume_skills)
        
        # Weight: strong=1.0, medium=0.5, weak=0.25
        weighted_match = (matched_strong * 1.0 + matched_medium * 0.5 + matched_weak * 0.25)
        skill_score = weighted_match / len(required_skills)
        skill_score = min(1.0, max(0.0, skill_score))
    
    # 2. EXPERIENCE MATCH (30%)
    resume_exp = float(resume.get('years_experience', 0))
    job_exp_str = job.get('experience_required', '0-2')
    
    try:
        job_exp = float(job_exp_str.split('-')[0]) if '-' in job_exp_str else float(job_exp_str.split('+')[0])
    except:
        job_exp = 1.0
    
    if job_exp > 0:
        exp_score = min(resume_exp / job_exp, 1.2)  # Allow 20% overqualification
        exp_score = max(0, exp_score)  # Can't be negative
    else:
        exp_score = 1.0 if resume_exp > 0 else 0.5
    
    # 3. SENIORITY ALIGNMENT (15%)
    seniority_map = {"Entry": 1, "Mid": 2, "Senior": 3, "Principal": 4}
    resume_seniority = seniority_map.get(resume.get('seniority'), 1)
    job_seniority = seniority_map.get(job.get('seniority'), 1)
    
    seniority_diff = abs(resume_seniority - job_seniority)
    if seniority_diff == 0:
        seniority_score = 1.0
    elif seniority_diff == 1:
        seniority_score = 0.8 if resume_seniority > job_seniority else 0.9
    else:
        seniority_score = 0.5
    
    # 4. DOMAIN MATCH (5%)
    domain_match = 1.0 if resume.get('domain') == job.get('domain') else 0.7
    
    # FINAL SCORE
    readiness = (
        skill_score * 0.50 +
        exp_score * 0.30 +
        seniority_score * 0.15 +
        domain_match * 0.05
    )
    
    readiness = min(1.0, max(0.0, readiness))
    
    # Calculate additional metrics
    all_required = set(parse_skills(job.get('required_skills', '[]')))
    matched_skills = len(all_resume_skills & all_required)
    missing_skills = len(all_required - all_resume_skills)
    weeks_to_learn = max(2, missing_skills * 1.5) if missing_skills > 0 else 0
    
    return {
        'readinessScore': readiness,
        'matchedSkillCount': matched_skills,
        'missingSkillCount': missing_skills,
        'estimatedWeeksToLearn': int(weeks_to_learn)
    }

def generate_training_data(resumes, jobs, num_pairs=6000):
    """Generate training data with intelligent readiness scoring"""
    
    print(f"\n🔄 Generating {num_pairs} training pairs...")
    training_data = []
    random.seed(42)
    
    for i in range(num_pairs):
        resume = random.choice(resumes)
        job = random.choice(jobs)
        
        # Calculate intelligent readiness
        labels = calculate_realistic_readiness(resume, job)
        
        # Create training example
        example = {
            'resumeFeatures': {
                'skillCount': len(set(
                    parse_skills(resume.get('strong_skills', '[]')) +
                    parse_skills(resume.get('medium_skills', '[]')) +
                    parse_skills(resume.get('weak_skills', '[]'))
                )),
                'yearsOfExperience': float(resume.get('years_experience', 0)),
                'educationLevel': {'Bootcamp': 1, 'Bachelor': 2, 'Master': 3}.get(resume.get('education'), 2),
                'seniority': {'Entry': 0.2, 'Mid': 0.5, 'Senior': 0.8, 'Principal': 1.0}.get(resume.get('seniority'), 0.5),
                'projectsCount': int(resume.get('projects_count', 0)),
                'skillVector': [0] * 40
            },
            'jobFeatures': {
                'requiredSkillCount': len(parse_skills(job.get('required_skills', '[]'))),
                'requiredExperienceYears': float(job.get('experience_required', '0').split('-')[0]) if '-' in job.get('experience_required', '0') else float(job.get('experience_required', '0').split('+')[0]),
                'educationRequired': 2,
                'seniority': {'Entry': 0.2, 'Mid': 0.5, 'Senior': 0.8, 'Principal': 1.0}.get(job.get('seniority'), 0.5),
                'employmentTypeScore': 1.0 if job.get('employment_type') == 'Full-time' else 0.8,
                'skillVector': [0] * 40
            },
            'labels': labels
        }
        
        training_data.append(example)
        
        if (i + 1) % 1000 == 0:
            print(f"   Generated {i + 1}/{num_pairs}...")
    
    return training_data

if __name__ == "__main__":
    print("=" * 60)
    print("GENERATING INTELLIGENT TRAINING DATA")
    print("=" * 60)
    
    resumes, jobs = load_data()
    print(f"\n✅ Loaded {len(resumes)} resumes")
    print(f"✅ Loaded {len(jobs)} jobs")
    
    training_data = generate_training_data(resumes, jobs, 6000)
    
    # Save
    with open('data/training_data_intelligent.json', 'w') as f:
        json.dump(training_data, f)
    
    # Statistics
    readiness_scores = [ex['labels']['readinessScore'] for ex in training_data]
    print(f"\n📊 Training Data Statistics:")
    print(f"   Total pairs: {len(training_data)}")
    print(f"   Readiness min: {min(readiness_scores):.3f}")
    print(f"   Readiness max: {max(readiness_scores):.3f}")
    print(f"   Readiness mean: {sum(readiness_scores)/len(readiness_scores):.3f}")
    print(f"   Readiness std: {(sum((x - sum(readiness_scores)/len(readiness_scores))**2 for x in readiness_scores)/len(readiness_scores))**0.5:.3f}")
    
    print(f"\n✅ Training data saved: data/training_data_intelligent.json")
