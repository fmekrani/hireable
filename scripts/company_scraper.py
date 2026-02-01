#!/usr/bin/env python3
"""
Company Job Scraper for Hireable

Scrapes job listings from company career pages and outputs structured job data.

Output format per job:
{
  "title": "Senior React Developer",
  "requiredSkills": ["React", "TypeScript", "GraphQL", "AWS"],
  "yearsRequired": "5+",
  "seniority": "Senior",
  "domain": "Frontend",
  "location": "San Francisco, CA",
  "description": "Full job description text...",
  "url": "https://..."
}

Usage:
  python3 scripts/company_scraper.py --company Google --max-pages 2
  python3 scripts/company_scraper.py --config config.json --max-pages 1
"""

import re
import json
import time
import logging
from typing import List, Dict, Optional, Tuple
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

USER_AGENT = "HireableScraper/1.0 (+https://github.com/hireable)"

# ============================================================================
# TECH SKILLS VOCABULARY
# ============================================================================

TECH_KEYWORDS = {
    # Frontend
    "react", "vue", "angular", "typescript", "javascript", "html", "css",
    "scss", "webpack", "next.js", "gatsby", "redux", "graphql", "jest",
    
    # Backend
    "node", "nodejs", "python", "django", "flask", "java", "spring boot",
    "golang", "go", "rust", "c++", "c#", "dotnet", "php", "laravel", "ruby", "rails",
    "express", "fastify", "nestjs",
    
    # Databases
    "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch",
    "dynamodb", "firebase", "cassandra", "sql",
    
    # DevOps/Cloud
    "docker", "kubernetes", "aws", "gcp", "azure", "terraform", "jenkins",
    "github actions", "gitlab ci", "circleci",
    
    # Data/ML
    "spark", "hadoop", "tensorflow", "pytorch", "ml", "machine learning"
}

SKILL_NORMALIZE = {
    "aws": "AWS", "gcp": "GCP", "sql": "SQL", "ml": "ML", "api": "API",
    "js": "JavaScript", "nodejs": "Node.js", "python": "Python",
    "typescript": "TypeScript", "golang": "Go", "graphql": "GraphQL",
    "react": "React", "vue": "Vue", "angular": "Angular",
    "postgresql": "PostgreSQL", "mongodb": "MongoDB", "docker": "Docker",
    "kubernetes": "Kubernetes"
}

# ============================================================================
# CORE SCRAPING FUNCTIONS
# ============================================================================

def fetch_page(url: str, timeout: int = 15, retries: int = 2) -> Optional[str]:
    """Fetch a web page with retry logic."""
    headers = {"User-Agent": USER_AGENT}
    for attempt in range(retries + 1):
        try:
            resp = requests.get(url, headers=headers, timeout=timeout)
            resp.raise_for_status()
            return resp.text
        except Exception as e:
            logger.debug(f"Fetch attempt {attempt + 1} failed: {e}")
            if attempt < retries:
                time.sleep(1 + attempt)
    logger.warning(f"Failed to fetch {url}")
    return None


def parse_job_list(html: str, config: Dict) -> Tuple[List[str], Optional[str]]:
    """Extract job URLs and next page URL from a listing page."""
    soup = BeautifulSoup(html, "html.parser")
    
    # Get job links
    job_links = soup.select(config["jobLinkSelector"])
    job_urls = []
    for link in job_links:
        href = link.get("href")
        if href:
            full_url = urljoin(config["careersUrl"], href.strip())
            job_urls.append(full_url)
    
    # Deduplicate
    job_urls = list(dict.fromkeys(job_urls))
    
    # Get next page
    next_page = None
    if config.get("nextPageSelector"):
        next_elem = soup.select_one(config["nextPageSelector"])
        if next_elem:
            next_href = next_elem.get("href") or next_elem.get("data-href")
            if next_href:
                next_page = urljoin(config["careersUrl"], next_href.strip())
    
    return job_urls, next_page


def parse_job_page(html: str, config: Dict, job_url: str) -> Dict:
    """Parse individual job page and extract required fields."""
    soup = BeautifulSoup(html, "html.parser")
    
    # Title
    title = ""
    title_elem = soup.select_one(config.get("titleSelector", "h1"))
    if title_elem:
        title = title_elem.get_text(strip=True)
    
    # Description
    description = ""
    desc_elem = soup.select_one(config.get("descriptionSelector", ".job-description"))
    if desc_elem:
        description = desc_elem.get_text(separator="\n", strip=True)
        desc_html = str(desc_elem)
    else:
        description = soup.get_text(separator="\n", strip=True)
        desc_html = description
    
    # Location
    location = None
    if config.get("locationSelector"):
        loc_elem = soup.select_one(config["locationSelector"])
        if loc_elem:
            location = loc_elem.get_text(strip=True)
    
    # Extract skills, years, seniority, domain
    required_skills = extract_skills(desc_html)
    years_required = extract_years(description)
    seniority = infer_seniority(title, years_required)
    domain = infer_domain(title, required_skills)
    
    return {
        "title": title or "",
        "requiredSkills": required_skills,
        "yearsRequired": years_required,
        "seniority": seniority,
        "domain": domain,
        "location": location,
        "description": description or "",
        "url": job_url
    }


# ============================================================================
# EXTRACTION HELPERS
# ============================================================================

def extract_skills(text: str) -> List[str]:
    """Extract and normalize tech skills from text."""
    if not text:
        return []
    
    text_lower = text.lower()
    found = []
    
    # Find skills
    for keyword in TECH_KEYWORDS:
        if re.search(r"\b" + re.escape(keyword) + r"\b", text_lower):
            found.append(keyword)
    
    # Normalize and deduplicate
    normalized = []
    seen = set()
    for skill in found:
        norm = SKILL_NORMALIZE.get(skill, skill.title())
        if norm not in seen:
            normalized.append(norm)
            seen.add(norm)
    
    return normalized


def extract_years(text: str) -> str:
    """Extract years of experience requirement."""
    if not text:
        return "0"
    
    text_lower = text.lower()
    
    # Range: "3-5 years" or "3 to 5 years"
    match = re.search(r"(\d+)\s*(?:-|to)\s*(\d+)\s*years?", text_lower)
    if match:
        return f"{match.group(1)}-{match.group(2)}"
    
    # Plus: "3+ years"
    match = re.search(r"(\d+)\s*\+\s*years?", text_lower)
    if match:
        return f"{match.group(1)}+"
    
    # At least: "at least 5 years"
    match = re.search(r"at least\s+(\d+)\s*years?", text_lower)
    if match:
        return f"{match.group(1)}+"
    
    # Simple: "5 years"
    match = re.search(r"(\d+)\s+years?", text_lower)
    if match:
        return match.group(1)
    
    # Entry level signals
    if re.search(r"\b(entry|junior|intern|new grad)\b", text_lower):
        return "0"
    
    return "0"


def infer_seniority(title: str, years: str) -> str:
    """Infer seniority from title and years."""
    title_lower = (title or "").lower()
    
    # Title signals
    if re.search(r"\b(principal)\b", title_lower):
        return "Principal"
    if re.search(r"\b(staff|senior|lead)\b", title_lower):
        return "Senior"
    if re.search(r"\b(mid|associate)\b", title_lower):
        return "Mid"
    if re.search(r"\b(intern|junior|entry|graduate)\b", title_lower):
        return "Entry"
    
    # Years signals
    if years == "0":
        return "Entry"
    
    match = re.match(r"^(\d+)(?:-(\d+))?\+?$", years)
    if match:
        min_y = int(match.group(1))
        
        if min_y <= 2:
            return "Entry"
        if 3 <= min_y <= 4:
            return "Mid"
        if 5 <= min_y <= 7:
            return "Senior"
        if min_y >= 8:
            return "Principal"
    
    return "Entry"


def infer_domain(title: str, skills: List[str]) -> str:
    """Infer domain from title and skills."""
    title_lower = (title or "").lower()
    skills_lower = [s.lower() for s in skills]
    
    frontend_kw = ["react", "vue", "angular", "typescript", "javascript", "html", "css", "ui"]
    backend_kw = ["node", "python", "java", "golang", "rust", "c++", "c#", "express", "api"]
    devops_kw = ["aws", "gcp", "azure", "docker", "kubernetes", "terraform", "sre"]
    data_kw = ["sql", "spark", "hadoop", "ml", "machine learning", "tensorflow"]
    
    frontend_match = any(k in skills_lower for k in frontend_kw) or "frontend" in title_lower
    backend_match = any(k in skills_lower for k in backend_kw) or "backend" in title_lower
    devops_match = any(k in skills_lower for k in devops_kw) or "devops" in title_lower
    data_match = any(k in skills_lower for k in data_kw) or "data" in title_lower
    
    if frontend_match and backend_match:
        return "Full-Stack"
    if frontend_match:
        return "Frontend"
    if backend_match:
        return "Backend"
    if devops_match:
        return "DevOps"
    if data_match:
        return "Data"
    
    return "Backend"  # Default


# ============================================================================
# MAIN SCRAPER
# ============================================================================

def scrape_company(config: Dict, max_pages: int = 2, verbose: bool = False) -> List[Dict]:
    """Scrape all jobs from a company."""
    jobs = []
    next_url = config["careersUrl"]
    page_num = 0
    seen = set()
    
    logger.info(f"Starting scrape for {config.get('name', 'Company')}...")
    
    while next_url and page_num < max_pages:
        if verbose:
            logger.info(f"  Page {page_num + 1}: {next_url}")
        
        html = fetch_page(next_url)
        if not html:
            break
        
        job_urls, next_page = parse_job_list(html, config)
        page_num += 1
        
        logger.info(f"  Found {len(job_urls)} jobs")
        
        for job_url in job_urls:
            if job_url in seen:
                continue
            seen.add(job_url)
            
            job_html = fetch_page(job_url)
            if not job_html:
                continue
            
            job = parse_job_page(job_html, config, job_url)
            jobs.append(job)
        
        next_url = next_page
        time.sleep(1)
    
    logger.info(f"✅ Found {len(jobs)} total jobs")
    return jobs


# ============================================================================
# CLI
# ============================================================================

if __name__ == "__main__":
    import argparse
    import sys
    
    parser = argparse.ArgumentParser(description="Scrape company job postings")
    parser.add_argument("--company", help="Company name (e.g., Google)")
    parser.add_argument("--config", help="Path to company config JSON")
    parser.add_argument("--max-pages", type=int, default=2, help="Max pages to scrape")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    parser.add_argument("--output", help="Output file (default: stdout)")
    
    args = parser.parse_args()
    
    # Load config
    config = None
    if args.config:
        with open(args.config) as f:
            config = json.load(f)
    elif args.company:
        # Load from companies.json
        try:
            with open("lib/scrapers/companies.json") as f:
                companies = json.load(f)
            matches = [c for c in companies if c.get("name", "").lower() == args.company.lower()]
            if matches:
                config = matches[0]
        except:
            pass
    
    if not config:
        logger.error("Provide --company or --config")
        sys.exit(1)
    
    # Run scraper
    jobs = scrape_company(config, max_pages=args.max_pages, verbose=args.verbose)
    
    # Output
    output = json.dumps(jobs, indent=2)
    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
        logger.info(f"Saved to {args.output}")
    else:
        print(output)
