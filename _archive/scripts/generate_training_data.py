#!/usr/bin/env python3
"""
Generate training data from resume and job CSVs.
Pairs resumes with jobs randomly and calculates readiness scores.
"""

import csv
import json
import random
from collections import defaultdict

# Load resumes from all CSV files
def load_resumes():
    resumes = []
    for filename in ['data/synthetic_resumes.csv', 'data/synthetic_resumes_3000.csv', 'data/synthetic_resumes_5000.csv']:
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    resumes.append({
                        'id': row.get('resume_id', ''),
                        'role': row.get('role', ''),
                        'seniority': row.get('seniority', 'Junior'),
                        'strong_skills': [s.strip() for s in row.get('strong_skills', '').split(';') if s.strip()],
                        'medium_skills': [s.strip() for s in row.get('medium_skills', '').split(';') if s.strip()],
                        'weak_skills': [s.strip() for s in row.get('weak_skills', '').split(';') if s.strip()],
                        'missing_skills': [s.strip() for s in row.get('missing_skills', '').split(';') if s.strip()],
                        'years_experience': float(row.get('years_experience', 0)) if row.get('years_experience') else 0,
                        'projects_count': int(row.get('projects_count', 0)) if row.get('projects_count') else 0,
                        'resume_quality': row.get('resume_quality', 'medium'),
                        'ats_score': float(row.get('ats_score', 0.5)) if row.get('ats_score') else 0.5
                    })
        except FileNotFoundError:
            print(f"Warning: {filename} not found")
    
    print(f"Loaded {len(resumes)} resumes")
    return resumes

# Load jobs from CSV
def load_jobs():
    jobs = []
    with open('data/synthetic_jobs.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            jobs.append({
                'id': row.get('job_id', ''),
                'title': row.get('job_title', ''),
                'seniority': row.get('seniority', 'Junior'),
                'required_skills': [s.strip() for s in row.get('skills', '').split(',') if s.strip()],
                'experience_required': row.get('experience_required', '0-1 years'),
                'employment_type': row.get('employment_type', 'Full-time'),
                'domain': row.get('domain', ''),
            })
    
    print(f"Loaded {len(jobs)} job postings")
    return jobs

# Parse experience requirement
def parse_experience(exp_str):
    """Parse experience requirement string to number"""
    exp_str = exp_str.lower().strip()
    if 'intern' in exp_str or '0' in exp_str:
        return 0
    elif '1-3' in exp_str or 'junior' in exp_str:
        return 1.5
    elif '3-5' in exp_str or 'mid' in exp_str:
        return 4
    elif '5+' in exp_str or 'senior' in exp_str:
        return 7
    else:
        return 1

# Seniority levels
SENIORITY_LEVELS = {
    'New Grad': 0,
    'Intern': 0.2,
    'Junior': 0.4,
    'Mid': 0.6,
    'Mid-Level': 0.6,
    'Senior': 0.8,
    'Lead': 0.9
}

def get_seniority_score(level):
    level = level.strip() if level else 'Junior'
    return SENIORITY_LEVELS.get(level, 0.4)

# Calculate readiness score
def calculate_readiness(resume, job):
    """Calculate readiness score (0-100) for resume vs job"""
    
    # Extract all skills from resume
    resume_skills = set(resume['strong_skills'] + resume['medium_skills'] + resume['weak_skills'])
    required_skills = set(job['required_skills'])
    
    # Skill matching
    matched_skills = resume_skills & required_skills
    missing_skills = required_skills - resume_skills
    
    matched_count = len(matched_skills)
    missing_count = len(missing_skills)
    required_count = len(required_skills)
    
    skill_match = matched_count / required_count if required_count > 0 else 0
    
    # Experience matching
    resume_exp = resume['years_experience']
    job_exp = parse_experience(job['experience_required'])
    
    experience_match = min(resume_exp / job_exp, 1.0) if job_exp > 0 else 0.8
    
    # Seniority matching
    resume_seniority = get_seniority_score(resume['seniority'])
    job_seniority = get_seniority_score(job['seniority'])
    
    seniority_match = 1.0 if resume_seniority >= job_seniority * 0.8 else 0.6
    
    # Overall readiness (weighted average)
    readiness = (skill_match * 0.5 + experience_match * 0.3 + seniority_match * 0.2) * 100
    readiness = min(max(readiness, 0), 100)
    
    # Estimate weeks to learn missing skills
    weeks_to_learn = 0
    if missing_count > 0:
        weeks_to_learn = max(2, missing_count * 2) if missing_count <= 3 else int(missing_count * 1.5)
    
    return {
        'readiness_score': round(readiness),
        'matched_skills': matched_count,
        'missing_skills': missing_count,
        'weeks_to_learn': weeks_to_learn
    }

# Generate training data
def generate_training_data(resumes, jobs, num_pairs=2000):
    """Generate training data by pairing resumes and jobs"""
    
    training_data = []
    random.seed(42)  # For reproducibility
    
    print(f"Generating {num_pairs} resume-job pairs...")
    
    # Common skills vocabulary (matching the TypeScript vocabulary)
    COMMON_SKILLS = [
        'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust',
        'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'FastAPI',
        'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'AWS', 'Azure', 'GCP',
        'Docker', 'Kubernetes', 'Git', 'REST', 'GraphQL', 'SQL', 'HTML', 'CSS',
        'Tailwind', 'Bootstrap', 'Webpack', 'Vite', 'TensorFlow', 'PyTorch',
        'Machine Learning', 'Deep Learning', 'Data Analysis', 'Pandas', 'NumPy',
        'Linux', 'Windows', 'MacOS', 'DevOps', 'CI/CD', 'Jenkins', 'GitHub Actions'
    ]
    
    def encode_skills(skill_list, vocab):
        """Create a one-hot encoded vector for skills"""
        vector = [0] * len(vocab)
        for skill in skill_list:
            # Try exact match first, then partial match
            for i, vocab_skill in enumerate(vocab):
                if vocab_skill.lower() in skill.lower() or skill.lower() in vocab_skill.lower():
                    vector[i] = 1
                    break
        return vector
    
    for i in range(num_pairs):
        resume = random.choice(resumes)
        job = random.choice(jobs)
        
        # Calculate labels
        labels = calculate_readiness(resume, job)
        
        # Combine all skills for encoding
        all_resume_skills = resume['strong_skills'] + resume['medium_skills'] + resume['weak_skills']
        
        # Extract resume features
        resume_features = {
            'skillCount': len(all_resume_skills),
            'yearsOfExperience': resume['years_experience'],
            'educationLevel': 2,  # Assume Bachelor's by default
            'seniority': get_seniority_score(resume['seniority']),
            'projectsCount': resume['projects_count'],
            'resumeQuality': 0.7 if resume['resume_quality'] == 'high' else 0.5 if resume['resume_quality'] == 'medium' else 0.3,
            'atsScore': resume['ats_score'],
            'skillVector': encode_skills(all_resume_skills, COMMON_SKILLS)
        }
        
        # Extract job features
        job_features = {
            'requiredSkillCount': len(job['required_skills']),
            'requiredExperienceYears': parse_experience(job['experience_required']),
            'educationRequired': 2,  # Assume Bachelor's by default
            'seniority': get_seniority_score(job['seniority']),
            'employmentTypeScore': 1.0 if job['employment_type'] == 'Full-time' else 0.8,
            'skillVector': encode_skills(job['required_skills'], COMMON_SKILLS)
        }
        
        # Create training example
        example = {
            'resumeFeatures': resume_features,
            'jobFeatures': job_features,
            'labels': {
                'readinessScore': min(100, max(0, labels['readiness_score'])) / 100,  # Normalize to 0-1
                'missingSkillCount': labels['missing_skills'],
                'matchedSkillCount': labels['matched_skills'],
                'estimatedWeeksToLearn': labels['weeks_to_learn']
            }
        }
        
        training_data.append(example)
        
        if (i + 1) % 500 == 0:
            print(f"  Generated {i + 1} pairs...")
    
    return training_data

# Main
def main():
    print("Generating training data...")
    print("=" * 50)
    
    # Load data
    resumes = load_resumes()
    jobs = load_jobs()
    
    if not resumes or not jobs:
        print("ERROR: Could not load resumes or jobs!")
        return
    
    # Generate training data
    training_data = generate_training_data(resumes, jobs, num_pairs=2000)
    
    # Save to JSON
    output_file = 'data/training_data.json'
    with open(output_file, 'w') as f:
        json.dump(training_data, f, indent=2)
    
    print("=" * 50)
    print(f"✅ Training data saved to {output_file}")
    print(f"   Total examples: {len(training_data)}")
    print(f"   Ready for Phase 4 training!")

if __name__ == '__main__':
    main()
