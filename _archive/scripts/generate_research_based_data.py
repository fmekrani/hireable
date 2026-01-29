#!/usr/bin/env python3
"""
Research-based Dataset Generation
Best practices from HR, ATS, and recruiter analysis
"""

import json
import random
from typing import List, Dict

# RESEARCH: What makes a GOOD RESUME
RESUME_BEST_PRACTICES = {
    "structure": [
        "Contact Info (name, email, phone, location)",
        "Professional Summary (2-3 lines, impact-focused)",
        "Experience (company, title, dates, 3-5 bullet points)",
        "Skills (categorized: Technical, Tools, Soft Skills)",
        "Education (degree, university, graduation year)",
        "Certifications (relevant to role)",
        "Projects (optional but valuable)"
    ],
    "keywords_impact": {
        "action_verbs": ["Spearheaded", "Architected", "Optimized", "Scaled", "Developed", 
                        "Led", "Implemented", "Designed", "Built", "Created", "Automated"],
        "metrics": ["increased by X%", "reduced by X%", "saved $X", "managed X team", 
                   "served X users", "improved X", "delivered X projects"],
        "technical": ["API", "Database", "Cloud", "ML", "Performance", "Security", 
                     "Microservices", "DevOps", "Testing", "CI/CD"]
    },
    "red_flags": ["Typos", "Grammatical errors", "Vague descriptions", "No metrics", 
                 "Gaps in employment without explanation", "Too long (3+ pages)"]
}

# RESEARCH: What makes a GOOD JOB DESCRIPTION
JOB_DESCRIPTION_BEST_PRACTICES = {
    "structure": [
        "Job Title (clear, searchable)",
        "Company Overview (1-2 sentences)",
        "Role Summary (2-3 sentences, impact-focused)",
        "Key Responsibilities (5-8 bullets, prioritized)",
        "Required Qualifications (skills, experience, education)",
        "Nice-to-Have Qualifications",
        "Benefits & Compensation",
        "Work Environment (remote, hybrid, office)"
    ],
    "keywords_importance": {
        "must_have": ["years of experience", "required skills", "education level", 
                     "tech stack", "team size", "reporting to"],
        "high_value": ["growth opportunity", "mentorship", "learning", "impact", 
                      "autonomy", "flexibility"],
        "signals": ["fast-growing", "well-funded", "mission-driven", "technical leadership",
                   "ownership", "innovation"]
    },
    "red_flags": ["Vague requirements", "Contradictory skills", "Unrealistic expectations",
                 "No career growth path", "Unclear role", "Too many required skills (10+)"]
}

# RESEARCH-BASED SKILL TIERS
SKILL_DATABASE = {
    "tier1_foundational": [
        "Python", "JavaScript", "TypeScript", "Java", "SQL",
        "Git", "REST APIs", "HTML/CSS", "Linux", "Debugging"
    ],
    "tier2_intermediate": [
        "React", "Node.js", "PostgreSQL", "MongoDB", "AWS",
        "Docker", "System Design", "Testing (Jest/Pytest)", "CI/CD", "Agile"
    ],
    "tier3_advanced": [
        "Kubernetes", "Microservices", "Machine Learning", "TensorFlow",
        "System Architecture", "High-Scale Systems", "Performance Optimization",
        "Cloud Architecture", "Security", "DevOps"
    ],
    "soft_skills": [
        "Communication", "Leadership", "Problem-Solving", "Teamwork",
        "Time Management", "Adaptability", "Mentoring", "Critical Thinking"
    ]
}

# RESEARCH: Experience Levels & Expectations
EXPERIENCE_LEVELS = {
    "entry": {
        "years": "0-2",
        "required_skills": 4,
        "nice_to_have": 3,
        "responsibilities": "Execute assigned tasks, learn codebase, collaborate",
        "titles": ["Junior Developer", "Associate Engineer", "Software Engineer I"],
        "focus": "Learning and solid fundamentals"
    },
    "mid": {
        "years": "2-5",
        "required_skills": 6,
        "nice_to_have": 4,
        "responsibilities": "Own features, mentor juniors, improve systems",
        "titles": ["Software Engineer", "Engineer II", "Mid-Level Developer"],
        "focus": "Impact and leadership"
    },
    "senior": {
        "years": "5-10",
        "required_skills": 7,
        "nice_to_have": 5,
        "responsibilities": "Architect solutions, lead teams, set technical direction",
        "titles": ["Senior Engineer", "Staff Engineer", "Tech Lead"],
        "focus": "Architecture and strategy"
    },
    "lead": {
        "years": "10+",
        "required_skills": 8,
        "nice_to_have": 6,
        "responsibilities": "Company-wide technical strategy, hiring, culture",
        "titles": ["Principal Engineer", "Engineering Manager", "CTO"],
        "focus": "Vision and strategy"
    }
}

def generate_resume(experience_level: str, primary_skill: str = None) -> Dict:
    """Generate a realistic, high-quality resume"""
    
    level = EXPERIENCE_LEVELS.get(experience_level, EXPERIENCE_LEVELS["mid"])
    years_str = level["years"].replace("+", "").split("-")
    years = int(years_str[-1]) if len(years_str) > 1 else int(years_str[0])
    
    # Skill composition based on level
    num_tier1 = level["required_skills"]
    num_tier2 = level["nice_to_have"]
    num_soft = random.randint(3, 5)
    
    skills_strong = random.sample(SKILL_DATABASE["tier1_foundational"], min(num_tier1, len(SKILL_DATABASE["tier1_foundational"])))
    skills_medium = random.sample(SKILL_DATABASE["tier2_intermediate"], min(num_tier2, len(SKILL_DATABASE["tier2_intermediate"])))
    skills_soft = random.sample(SKILL_DATABASE["soft_skills"], num_soft)
    
    # Better structured experience
    experiences = []
    for i in range(years // 2 + 1):
        company = random.choice(["TechCorp", "StartupXYZ", "CloudSystems", "DataAI", "DevShop"])
        title = random.choice(level["titles"])
        
        # ATS-optimized bullet points with metrics
        bullets = [
            f"Developed X using {random.choice(skills_strong)} that improved performance by 40%",
            f"Led team of {random.randint(2, 8)} engineers on critical project, delivered on time",
            f"Designed scalable architecture serving {random.randint(100, 1000)}K+ daily users",
            f"Reduced deployment time from hours to minutes using {random.choice(skills_medium)}",
            f"Mentored {random.randint(1, 5)} junior developers, 2 promoted to senior roles"
        ]
        
        experiences.append({
            "company": company,
            "title": title,
            "duration_years": random.randint(1, 3),
            "accomplishments": random.sample(bullets, random.randint(2, 4)),
            "skills_used": random.sample(skills_strong + skills_medium, random.randint(3, 5))
        })
    
    return {
        "name": f"Candidate_{random.randint(1000, 9999)}",
        "level": experience_level,
        "years_experience": years,
        "education": random.choice(["BS Computer Science", "MS CS", "BS Engineering", "Self-taught"]),
        "top_skills": skills_strong,  # Tier 1: Strong
        "secondary_skills": skills_medium,  # Tier 2: Medium
        "soft_skills": skills_soft,
        "experiences": experiences,
        "certifications": random.sample([
            "AWS Solutions Architect", "Google Cloud Professional", "Kubernetes (CKA)",
            "Security+", "Scrum Master (CSM)"
        ], random.randint(0, 2)),
        "quality_indicators": {
            "has_metrics": True,
            "has_quantifiable_impact": True,
            "well_structured": True,
            "relevant_skills": True,
            "ats_optimized": True
        }
    }

def generate_job_description(experience_level: str, industry: str = None) -> Dict:
    """Generate a well-written, specific job description"""
    
    level = EXPERIENCE_LEVELS.get(experience_level, EXPERIENCE_LEVELS["mid"])
    
    # Required skills for this level
    required_count = level["required_skills"]
    nice_to_have_count = level["nice_to_have"]
    
    exp_str = level["years"].replace("+", "").split("-")
    years_req = int(exp_str[0]) if exp_str[0].isdigit() else 0
    
    required_skills = random.sample(
        SKILL_DATABASE["tier1_foundational"] + SKILL_DATABASE["tier2_intermediate"],
        min(required_count, 10)
    )
    
    nice_to_have = random.sample(
        SKILL_DATABASE["tier2_intermediate"] + SKILL_DATABASE["tier3_advanced"],
        min(nice_to_have_count, 8)
    )
    
    # Well-structured responsibilities
    responsibilities = [
        f"Design and implement {random.choice(['scalable', 'secure', 'performant'])} solutions using {required_skills[0]}",
        f"Collaborate with cross-functional teams (Product, Design, DevOps) to deliver features",
        f"Conduct code reviews and maintain high code quality standards",
        f"Optimize application performance and reduce technical debt",
        f"Participate in architecture discussions and system design",
        f"Mentor junior developers and contribute to team growth" if experience_level in ["senior", "lead"] else "Learn from experienced engineers and grow technical skills"
    ]
    
    return {
        "title": random.choice(level["titles"]),
        "company": random.choice(["Google", "Microsoft", "Meta", "Amazon", "Startup"]),
        "experience_level": experience_level,
        "years_required": years_req,
        "description": f"We're looking for a {level['titles'][0]} to {random.choice(['lead', 'own', 'drive'])} our {random.choice(['backend', 'frontend', 'full-stack', 'platform'])} initiatives",
        "required_skills": required_skills,
        "nice_to_have_skills": nice_to_have,
        "required_soft_skills": random.sample(SKILL_DATABASE["soft_skills"], random.randint(2, 4)),
        "responsibilities": responsibilities,
        "responsibilities_priority": "Ordered by importance",
        "education_required": random.choice(["BS in CS or related", "Equivalent professional experience", "Any background"]),
        "benefits": [
            "Competitive salary + equity",
            "Health insurance (medical, dental, vision)",
            "Unlimited PTO",
            "Remote/Hybrid flexibility",
            "Learning budget $2000/year",
            "Conference attendance"
        ],
        "work_environment": random.choice(["Remote", "Hybrid (2 days office)", "On-site SF"]),
        "team_size": random.randint(3, 15),
        "reporting_to": "Engineering Manager" if experience_level != "lead" else "VP Engineering",
        "growth_path": f"Clear path to {EXPERIENCE_LEVELS[list(EXPERIENCE_LEVELS.keys())[list(EXPERIENCE_LEVELS.keys()).index(experience_level)+1]]['titles'][0] if experience_level != 'lead' else 'Principal/Director'}" if experience_level != "lead" else "Leadership positions",
        "quality_indicators": {
            "specific_skills": True,
            "clear_responsibilities": True,
            "realistic_expectations": True,
            "growth_opportunity": True,
            "well_written": True
        }
    }

def main():
    print("=" * 70)
    print("RESEARCH-BASED HIGH-QUALITY DATASET GENERATION")
    print("=" * 70)
    print()
    print("📚 BEST PRACTICES INCORPORATED:")
    print("   Resume: Action verbs, metrics, clear structure, ATS optimization")
    print("   Jobs: Specific skills, clear responsibilities, growth paths")
    print("   Data: Realistic skill matching, experience-level appropriate")
    print()
    
    # Generate balanced dataset
    resumes = []
    jobs = []
    
    print("🔄 Generating resumes by experience level...")
    for level in ["entry", "mid", "senior", "lead"]:
        count = 2000 if level == "mid" else 1500  # More mid-level resumes
        for _ in range(count):
            resumes.append(generate_resume(level))
        print(f"   ✅ {count} {level}-level resumes")
    
    print("\n🔄 Generating job descriptions by level...")
    for level in ["entry", "mid", "senior", "lead"]:
        count = 100 if level == "mid" else 75
        for _ in range(count):
            jobs.append(generate_job_description(level))
        print(f"   ✅ {count} {level}-level jobs")
    
    # Save datasets
    with open("data/resumes_research_based.json", "w") as f:
        json.dump(resumes, f, indent=2)
    
    with open("data/jobs_research_based.json", "w") as f:
        json.dump(jobs, f, indent=2)
    
    print(f"\n✅ Datasets created:")
    print(f"   Resumes: {len(resumes)} high-quality profiles")
    print(f"   Jobs: {len(jobs)} well-written descriptions")
    print(f"\nNext: Generate training data and evaluate readiness matching")

if __name__ == "__main__":
    main()
