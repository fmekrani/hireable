# 🚀 Hireable Development Environment Setup

## ✅ What Has Been Installed

### Python Packages (for Web Scraper)
```
✅ requests==2.32.5        - HTTP client for fetching web pages
✅ beautifulsoup4==4.14.3  - HTML/XML parsing
✅ json                     - Built-in JSON support
✅ re                       - Built-in regex support
```

### Node.js & npm
```
✅ Node.js v25.5.0
✅ npm v11.8.0
```

### npm Dependencies (Next.js project)
```
✅ @tensorflow/tfjs ^4.22.0     - ML inference
✅ next ^15.0.0                 - Web framework
✅ react ^19.0.0                - UI library
✅ react-dom ^19.0.0            - React DOM
✅ lucide-react ^0.563.0        - Icons
✅ typescript ^5.3.3            - Type checking
✅ tailwindcss ^3.4.1           - Styling
```

---

## 🛠️ How to Use

### Run the Python Scraper (CLI)
```bash
# Scrape Google jobs
python3 scripts/company_scraper.py --company Google --max-pages 2

# Scrape with custom config
python3 scripts/company_scraper.py --config config.json --output jobs.json

# Verbose mode for debugging
python3 scripts/company_scraper.py --company Amazon --verbose
```

### Use the API (Next.js)
```bash
# Start dev server
npm run dev

# Then in another terminal:
curl -X POST http://localhost:3000/api/scrape/jobs \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Google", "maxPages": 2}'
```

### Build for production
```bash
npm run build
npm start
```

---

## ⚠️ Important: NVM Setup for New Terminal Sessions

**NVM (Node Version Manager) was installed but requires terminal configuration.**

### Add to `~/.zshrc` (or `~/.bashrc` if using Bash):

```bash
# Add these lines to the end of your ~/.zshrc file
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
```

### Then reload your shell:
```bash
source ~/.zshrc
```

### Verify it works:
```bash
node --version   # Should output: v25.5.0
npm --version    # Should output: 11.8.0
```

---

## 📋 Installed Files Created

### Web Scraper (Phase 5B)
- `scripts/company_scraper.py` - Core scraper with extraction logic
- `lib/scrapers/companies.ts` - TypeScript company configurations
- `lib/scrapers/companies.json` - JSON company configurations
- `app/api/scrape/jobs/route.ts` - REST API endpoint for scraping

### Setup & Config
- `requirements.txt` - Python dependencies list
- `SETUP.sh` - Automated setup script
- `package.json` - npm dependencies (already had some)

---

## 🐛 No More Import Errors

All import warnings are now resolved:

✅ `import requests` - ✅ Installed
✅ `from bs4 import BeautifulSoup` - ✅ Installed
✅ `import { NextResponse } from 'next/server'` - ✅ Available
✅ `import { spawn } from 'child_process'` - ✅ Built-in Node.js
✅ `import { promises as fs } from 'fs'` - ✅ Built-in Node.js
✅ TypeScript compilation - ✅ Ready

---

## 🚀 Quick Start (Fresh Terminal)

```bash
# 1. Make sure NVM is loaded (or add to ~/.zshrc)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2. Navigate to project
cd /Users/hanushgupta/Desktop/Hireable/hireable

# 3. Test scraper
python3 scripts/company_scraper.py --company Google --verbose

# 4. Start dev server
npm run dev

# 5. In another terminal, test API
curl -X POST http://localhost:3000/api/scrape/jobs \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Google", "maxPages": 1}'
```

---

## 📞 Troubleshooting

### Command not found: npm
**Solution:** Run `export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"`

### Command not found: python3
**Solution:** Install Python 3 via Homebrew: `brew install python3`

### SSL Warning for urllib3
**This is safe to ignore** - It's a LibreSSL warning but scraper works fine.

### npm install fails
**Solution:** Delete `package-lock.json` and `node_modules/`, then run `npm install` again

---

## ✨ You're All Set!

All packages and extensions are installed. No more import errors. Ready to:
- ✅ Scrape company job postings
- ✅ Extract skills, years, seniority, domain
- ✅ Serve via REST API
- ✅ Build ML prediction models
