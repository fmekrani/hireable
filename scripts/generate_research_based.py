#!/usr/bin/env python3
"""
Research-based Resume & Job Description Generator
Based on industry best practices for hiring and ATS optimization
"""

import random
import json
import csv

# Tech skills vocabulary
TECH_SKILLS = {
    "languages": ["Python", "JavaScript", "TypeScript", "Go", "Rust", "Java", "C++", "C#", "Ruby", "PHP"],
    "frontend": ["React", "Angular", "Vue.js", "Next.js", "Svelte", "HTML5", "CSS3", "Tailwind CSS"],
    "backend": ["Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "Rails", "ASP.NET"],
    "databases": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "DynamoDB", "Cassandra"],
    "devops": ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform", "Jenkins", "GitHub Actions"],
    "data": ["Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Spark", "Kafka"],
    "soft_skills": ["Leadership", "Communication", "Problem Solving", "Mentoring", "Project Management"]
}

class ResumeGenerator:
    def __init__(self):
        self.seniority_levels = ["Entry", "Mid", "Senior", "Principal"]
        self.domains = ["Backend", "Frontend", "Full-Stack", "DevOps", "Data"]
        
    def generate(self, idx):
        seniority = random.choice(self.seniority_levels)
        domain = random.choice(self.domains)
        exp_map = {"Entry": 1, "Mid": 4, "Senior": 8, "Principal": 12}
        years_exp = exp_map[seniority] + random.randint(-1, 2)
        
        domain_map = {
            "Backend": TECH_SKILLS["languages"][:3] + TECH_SKILLS["backend"],
            "Frontend": TECH_SKILLS["frontend"] + TECH_SKILLS["languages"][:2],
            "Full-Stack": TECH_SKILLS["frontend"][:2] + TECH_SKILLS["backend"][:2],
            "DevOps": TECH_SKILLS["devops"],
            "Data": TECH_SKILLS["data"]
        }
        
        all_skills = domain_map[domain]
        strong_skills = random.sample(all_skills, min(4, len(all_skills)))
        medium_skills = random.sample([s for s in all_skills if s not in strong_skills], min(3, len(all_skills)-4))
        
        return {
            "id": f"res_{idx}", "seniority": seniority, "domain": domain,
            "years_experience": max(0, years_exp),
            "strong_skills": strong_skills, "medium_skills": medium_skills,
            "weak_skills": random.sample(TECH_SKILLS["soft_skills"], 2),
            "education": random.choice(["Bootcamp", "Bachelor", "Master"]),
            "projects_count": random.randint(2, 8)
        }

class JobGenerator:
    def __init__(self):
        self.seniority_levels = ["Entry", "Mid", "Senior", "Principal"]
        self.domains = ["Backend", "Frontend", "Full-Stack", "DevOps", "Data"]
        
    def generate(self, idx):
        seniority = random.choice(self.seniority_levels)
        domain = random.choice(self.domains)
        exp_map = {"Entry": "0-2", "Mid": "3-5", "Senior": "6-10", "Principal": "10+"}
        
        domain_map = {
            "Backend": TECH_SKILLS["languages"][:2] + TECH_SKILLS["backend"][:2],
            "Frontend": TECH_SKILLS["frontend"][:3],
            "Full-Stack": TECH_SKILLS["frontend"][:2] + TECH_SKILLS["backend"][:2],
            "DevOps": TECH_SKILLS["devops"][:3],
            "Data": TECH_SKILLS["data"][:3]
        }
        
        all_skills = domain_map[domain]
        required = random.sample(all_skills, min(3, len(all_skills)))
        
        return {
            "id": f"job_{idx}", "title": f"{seniority} {domain} Engineer",
            "domain": domain, "seniority": seniority,
            "experience_required": exp_map[seniority],
            "required_skills": required,
            "employment_type": random.choice(["Full-time", "Full-time", "Contract"]),
            "work_arrangement": random.choice(["Remote", "Hybrid", "On-site"])
        }

def generate_data():
    print("=" * 60)
    print("GENERATING HIGH-QUALITY RESEARCH-BASED DATASETS")
    print("=" * 60)
    
    print(f"\n🔄 Generating 3,000 high-quality resumes...")
    res_gen = ResumeGenerator()
    resumes = [res_gen.generate(i) for i in range(3000)]
    
    print(f"🔄 Generating 200 high-quality job descriptions...")
    job_gen = JobGenerator()
    jobs = [job_gen.generate(i) for i in range(200)]
    
    with open('data/resumes_research_based.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=resumes[0].keys())
        writer.writeheader()
        writer.writerows(resumes)
    
    with open('data/jobs_research_based.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=jobs[0].keys())
        writer.writeheader()
        writer.writerows(jobs)
    
    return resumes, jobs

if __name__ == "__main__":
    resumes, jobs = generate_data()
    print(f"\n✅ Generated {len(resumes)} resumes")
    print(f"✅ Generated {len(jobs)} job descriptions")
