#!/bin/bash

# Test script for analysis scoring

echo "=========================================="
echo "Testing Analysis Score Calculation"
echo "=========================================="
echo ""

# Sample resume data
RESUME_DATA='{
  "contact": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-123-4567",
    "linkedin": "linkedin.com/in/john",
    "github": "github.com/john",
    "location": "San Francisco, CA"
  },
  "summary": "Experienced software engineer with 5 years of full-stack development",
  "experience": [
    {
      "title": "Senior Software Engineer",
      "company": "TechCorp",
      "startDate": "2022-01",
      "endDate": null,
      "current": true,
      "highlights": ["Led team of 3 engineers", "Reduced latency by 40%"]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science",
      "institution": "UC Berkeley",
      "startDate": "2018-09",
      "endDate": "2022-05",
      "gpa": "3.8"
    }
  ],
  "skills": {
    "technical": ["Python", "JavaScript", "SQL"],
    "languages": ["English", "Spanish"],
    "frameworks": ["React", "Node.js", "Django"],
    "tools": ["Docker", "Git", "AWS"],
    "all": ["Python", "JavaScript", "SQL", "React", "Node.js", "Django", "Docker", "Git", "AWS"]
  },
  "certifications": ["AWS Solutions Architect Associate"],
  "projects": [
    {
      "name": "E-commerce Platform",
      "description": "Built a full-stack e-commerce platform",
      "technologies": ["React", "Node.js", "PostgreSQL"],
      "highlights": ["5000+ users", "99.9% uptime"]
    }
  ],
  "yearsExperience": 5,
  "seniority": "Mid",
  "domain": "Full-Stack"
}'

# Sample job data
JOB_DATA='{
  "title": "Senior Full Stack Engineer",
  "requiredSkills": ["Python", "JavaScript", "React", "Node.js", "PostgreSQL", "Docker"],
  "yearsRequired": "5",
  "seniority": "Senior",
  "domain": "Full-Stack",
  "description": "Looking for a senior full stack engineer with 5+ years of experience",
  "url": "https://example.com/jobs/123"
}'

echo "📝 Test Case 1: Good Match (5 of 6 skills matched)"
echo "Resume Skills: Python, JavaScript, React, Node.js, Docker, AWS"
echo "Required Skills: Python, JavaScript, React, Node.js, PostgreSQL, Docker"
echo "Expected: ~70-80% match"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d "{\"resume\": $RESUME_DATA, \"job\": $JOB_DATA}")

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

# Extract the score
SCORE=$(echo "$RESPONSE" | jq '.data.readiness.score // empty')
INTERPRETATION=$(echo "$RESPONSE" | jq -r '.data.readiness.interpretation // empty')
MATCHED=$(echo "$RESPONSE" | jq '.data.skillMatch.matched | length // empty')
MISSING=$(echo "$RESPONSE" | jq '.data.skillMatch.missing | length // empty')
MATCH_PERCENTAGE=$(echo "$RESPONSE" | jq '.data.skillMatch.matchPercentage // empty')

if [ -z "$SCORE" ]; then
  echo "❌ FAILED: Score not returned"
  echo "Full response:"
  echo "$RESPONSE" | jq '.'
  exit 1
fi

echo "✅ Analysis completed"
echo "   Overall Score: $SCORE%"
echo "   Interpretation: $INTERPRETATION"
echo "   Matched Skills: $MATCHED"
echo "   Missing Skills: $MISSING"
echo "   Skill Match %: $MATCH_PERCENTAGE%"
echo ""

# Test Case 2: Different skills
echo "📝 Test Case 2: Testing with different skill set"
RESUME_DATA_2='{
  "contact": {"name": "Jane Smith", "email": "jane@example.com", "phone": "555-987-6543", "linkedin": null, "github": null, "location": "New York, NY"},
  "summary": "Data scientist with 3 years of experience",
  "experience": [{"title": "Data Scientist", "company": "DataCorp", "startDate": "2021-01", "endDate": null, "current": true, "highlights": ["10% accuracy improvement"]}],
  "education": [{"degree": "Master of Science", "institution": "MIT", "startDate": "2021-09", "endDate": "2023-05", "gpa": "3.9"}],
  "skills": {"technical": ["Python", "SQL", "R"], "languages": ["English"], "frameworks": ["TensorFlow", "Pandas"], "tools": ["Jupyter", "Git"], "all": ["Python", "SQL", "R", "TensorFlow", "Pandas", "Jupyter", "Git"]},
  "certifications": [],
  "projects": [],
  "yearsExperience": 3,
  "seniority": "Mid",
  "domain": "Data"
}'

JOB_DATA_2='{
  "title": "Senior Full Stack Engineer",
  "requiredSkills": ["Python", "JavaScript", "React", "Node.js", "PostgreSQL", "Docker"],
  "yearsRequired": "5",
  "seniority": "Senior",
  "domain": "Full-Stack",
  "description": "Looking for a senior full stack engineer with 5+ years of experience",
  "url": "https://example.com/jobs/123"
}'

RESPONSE_2=$(curl -s -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d "{\"resume\": $RESUME_DATA_2, \"job\": $JOB_DATA_2}")

echo "Response:"
echo "$RESPONSE_2" | jq '.data | {readiness, skillMatch, experienceGap}'
echo ""

SCORE_2=$(echo "$RESPONSE_2" | jq '.data.readiness.score // empty')
MATCH_PERCENTAGE_2=$(echo "$RESPONSE_2" | jq '.data.skillMatch.matchPercentage // empty')

echo "✅ Analysis completed"
echo "   Overall Score: $SCORE_2%"
echo "   Skill Match %: $MATCH_PERCENTAGE_2%"
echo ""

echo "=========================================="
echo "Test Complete!"
echo "=========================================="
