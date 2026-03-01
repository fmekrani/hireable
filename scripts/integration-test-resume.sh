#!/usr/bin/env bash
#
# Resume Scraper Integration Test Suite
# Tests all endpoints: upload, parse, extract, and skill matching
#
# Usage:
#   bash scripts/integration-test-resume.sh [--resume /path/to/resume.pdf] [--no-auth]
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="${BASE_URL:-http://localhost:3000}"
RESUME_FILE="${1:-}"
NO_AUTH="${NO_AUTH:-false}"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

function log_test() {
  echo -e "${BLUE}[TEST]${NC} $1"
}

function log_pass() {
  echo -e "${GREEN}✓ PASS${NC} $1"
  ((TESTS_PASSED++))
}

function log_fail() {
  echo -e "${RED}✗ FAIL${NC} $1"
  ((TESTS_FAILED++))
}

function log_info() {
  echo -e "${YELLOW}[INFO]${NC} $1"
}

# Check if server is running
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Resume Scraper Integration Test Suite${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

log_test "Checking if server is running at ${BASE_URL}"
HEALTH_RESPONSE=$(curl -sS "${BASE_URL}/api/health" 2>/dev/null || echo "{}")
if echo "$HEALTH_RESPONSE" | grep -q '"ok":true'; then
  log_pass "Server is running"
else
  log_fail "Server not running at ${BASE_URL}"
  log_info "Start dev server with: npm run dev"
  exit 1
fi

# ============================================================================
# TEST 1: Resume Upload API - Health Check
# ============================================================================
echo -e "\n${BLUE}[TEST SUITE 1]${NC} Resume Upload API\n"

log_test "GET /api/upload/resume - Health check"
RESPONSE=$(curl -sS "${BASE_URL}/api/upload/resume")
if echo "$RESPONSE" | grep -q '"ok":true'; then
  log_pass "Upload endpoint is ready"
else
  log_fail "Upload endpoint health check failed"
fi

# ============================================================================
# TEST 2: Resume Extract API - Health Check
# ============================================================================
echo -e "\n${BLUE}[TEST SUITE 2]${NC} Resume Extract API\n"

log_test "GET /api/resume/extract - Health check"
RESPONSE=$(curl -sS "${BASE_URL}/api/resume/extract")
if echo "$RESPONSE" | grep -q '"ok":true'; then
  log_pass "Extract endpoint is ready"
else
  log_fail "Extract endpoint health check failed"
fi

# ============================================================================
# TEST 3: Resume Parse API - Health Check
# ============================================================================
echo -e "\n${BLUE}[TEST SUITE 3]${NC} Resume Parse API\n"

log_test "GET /api/resume/parse - Health check"
RESPONSE=$(curl -sS "${BASE_URL}/api/resume/parse")
if echo "$RESPONSE" | grep -q '"ok":true'; then
  log_pass "Parse endpoint is ready"
else
  log_fail "Parse endpoint health check failed"
fi

# ============================================================================
# TEST 4: Job Match API - Health Check
# ============================================================================
echo -e "\n${BLUE}[TEST SUITE 4]${NC} Job Match API\n"

log_test "GET /api/job/match - Health check"
RESPONSE=$(curl -sS "${BASE_URL}/api/job/match")
if echo "$RESPONSE" | grep -q '"ok":true'; then
  log_pass "Job match endpoint is ready"
else
  log_fail "Job match endpoint health check failed"
fi

# ============================================================================
# TEST 5: Skill Matching with Direct Arrays
# ============================================================================
echo -e "\n${BLUE}[TEST SUITE 5]${NC} Skill Matching (No Auth Required)\n"

log_test "POST /api/job/match - Match resume skills vs job skills"
RESPONSE=$(curl -sS -X POST "${BASE_URL}/api/job/match" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_skills": ["Python", "SQL", "Docker", "AWS", "Node.js"],
    "job_skills": ["Python", "SQL", "Docker", "Kubernetes", "Google Cloud"]
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
  log_pass "Skill matching works"
  
  # Extract match percentage
  MATCH_PCT=$(echo "$RESPONSE" | grep -o '"match_percentage":[0-9]*' | cut -d: -f2)
  log_info "Match percentage: ${MATCH_PCT}%"
  
  MATCHED=$(echo "$RESPONSE" | grep -o '"matched_skills":\[[^]]*\]')
  log_info "Matched skills: $MATCHED"
else
  log_fail "Skill matching failed"
fi

# ============================================================================
# TEST 6: Skill Matching - Invalid Request
# ============================================================================
echo -e "\n${BLUE}[TEST SUITE 6]${NC} Error Handling\n"

log_test "POST /api/job/match - Missing job_skills (should fail)"
RESPONSE=$(curl -sS -X POST "${BASE_URL}/api/job/match" \
  -H "Content-Type: application/json" \
  -d '{"resume_skills": ["Python"]}')

if echo "$RESPONSE" | grep -q '"success":false'; then
  log_pass "Error handling works - rejects missing required fields"
else
  log_fail "Should reject missing job_skills"
fi

# ============================================================================
# TEST 7: Resume Extract API - Without File (should fail)
# ============================================================================
log_test "POST /api/resume/extract - Missing file (should fail)"
RESPONSE=$(curl -sS -X POST "${BASE_URL}/api/resume/extract" \
  -F "dummy=@/dev/null")

if echo "$RESPONSE" | grep -q '"success":false'; then
  log_pass "Extract endpoint properly validates file input"
else
  log_fail "Should reject missing file"
fi

# ============================================================================
# TEST 8: Create Sample Resume File if Needed
# ============================================================================
if [[ -z "$RESUME_FILE" ]]; then
  log_info "No resume file provided - skipping upload/parse tests"
  log_info "To test upload/parse, run:"
  log_info "  BASE_URL=http://localhost:3000 bash scripts/integration-test-resume.sh /path/to/resume.pdf"
else
  if [[ ! -f "$RESUME_FILE" ]]; then
    log_fail "Resume file not found: $RESUME_FILE"
  else
    echo -e "\n${BLUE}[TEST SUITE 7]${NC} Resume Upload & Parse Flow\n"
    
    log_test "POST /api/resume/extract - Extract text from sample resume"
    EXTRACT_RESPONSE=$(curl -sS -X POST "${BASE_URL}/api/resume/extract" \
      -F "file=@${RESUME_FILE}")
    
    if echo "$EXTRACT_RESPONSE" | grep -q '"success":true'; then
      log_pass "Resume text extraction successful"
      
      # Show extracted text length
      TEXT_LENGTH=$(echo "$EXTRACT_RESPONSE" | grep -o '"text":"[^"]*' | wc -c)
      log_info "Extracted text length: ~${TEXT_LENGTH} characters"
      
      # Check if skills were detected
      if echo "$EXTRACT_RESPONSE" | grep -q '"skills":\['; then
        log_pass "Skills were detected in resume"
      else
        log_info "No skills detected in resume (or empty)"
      fi
    else
      log_fail "Resume extraction failed"
      log_info "Response: $(echo "$EXTRACT_RESPONSE" | head -c 200)"
    fi
  fi
fi

# ============================================================================
# SUMMARY
# ============================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

TOTAL=$((TESTS_PASSED + TESTS_FAILED))
echo "Total Tests: $TOTAL"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

if [[ $TESTS_FAILED -eq 0 ]]; then
  echo -e "\n${GREEN}✓ All tests passed!${NC}\n"
  exit 0
else
  echo -e "\n${RED}✗ Some tests failed${NC}\n"
  exit 1
fi
