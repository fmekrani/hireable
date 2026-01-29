#!/bin/zsh
# Quick Reference - Copy & paste these commands

# ============================================================================
# SETUP (Run once)
# ============================================================================

# 1. Add NVM to ~/.zshrc (permanent Node.js setup)
cat >> ~/.zshrc << 'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
EOF

# 2. Reload shell
source ~/.zshrc

# ============================================================================
# DAILY USAGE
# ============================================================================

# Navigate to project
cd /Users/hanushgupta/Desktop/Hireable/hireable

# Test Python scraper (Google jobs)
python3 scripts/company_scraper.py --company Google --max-pages 1

# Test Python scraper (Amazon jobs) with verbose output
python3 scripts/company_scraper.py --company Amazon --max-pages 1 --verbose

# Save scraper output to file
python3 scripts/company_scraper.py --company Meta --output jobs.json

# Start development server
npm run dev

# Test API endpoint (in another terminal after npm run dev)
curl -X POST http://localhost:3000/api/scrape/jobs \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Google", "maxPages": 1}'

# Build for production
npm run build

# Start production server
npm start

# Lint TypeScript
npm run lint

# ============================================================================
# VERIFY INSTALLATIONS
# ============================================================================

# Check Python version
python3 --version

# Check Python packages
python3 -c "import requests, bs4; print('✅ Python packages OK')"

# Check Node.js version
node --version

# Check npm version
npm --version

# Check npm packages installed
npm list

# ============================================================================
# HELPFUL INFO
# ============================================================================

# List available companies for scraping
python3 << 'SCRIPT'
import json
with open('lib/scrapers/companies.json') as f:
    companies = json.load(f)
    for c in companies:
        print(f"  • {c['name']}")
SCRIPT

# Get API documentation
curl http://localhost:3000/api/scrape/jobs
