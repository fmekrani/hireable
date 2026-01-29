#!/usr/bin/env python3
"""
Verification script - Run this to confirm all dependencies are installed
"""

import subprocess
import sys

def check_python_packages():
    """Verify Python packages are installed"""
    print("\n📦 Checking Python packages...")
    packages = {
        'requests': 'HTTP client',
        'bs4': 'BeautifulSoup - HTML parsing',
    }
    
    all_ok = True
    for pkg, desc in packages.items():
        try:
            __import__(pkg)
            print(f"  ✅ {pkg:20} - {desc}")
        except ImportError:
            print(f"  ❌ {pkg:20} - {desc} [MISSING]")
            all_ok = False
    
    return all_ok

def check_node_packages():
    """Verify Node.js is installed"""
    print("\n🟢 Checking Node.js setup...")
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  ✅ Node.js: {result.stdout.strip()}")
        else:
            print(f"  ❌ Node.js not found")
            return False
        
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  ✅ npm: {result.stdout.strip()}")
        else:
            print(f"  ❌ npm not found")
            return False
        
        return True
    except FileNotFoundError:
        print("  ❌ Node.js or npm not in PATH")
        return False

def check_files():
    """Verify created files exist"""
    print("\n📂 Checking created files...")
    import os
    
    files = [
        'scripts/company_scraper.py',
        'lib/scrapers/companies.ts',
        'lib/scrapers/companies.json',
        'app/api/scrape/jobs/route.ts',
        'requirements.txt',
        'INSTALLATION_GUIDE.md',
    ]
    
    all_ok = True
    for file in files:
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"  ✅ {file:45} ({size:6} bytes)")
        else:
            print(f"  ❌ {file:45} [NOT FOUND]")
            all_ok = False
    
    return all_ok

if __name__ == '__main__':
    print("=" * 70)
    print("🔍 HIREABLE DEPENDENCY VERIFICATION")
    print("=" * 70)
    
    py_ok = check_python_packages()
    node_ok = check_node_packages()
    files_ok = check_files()
    
    print("\n" + "=" * 70)
    if py_ok and node_ok and files_ok:
        print("✅ ALL SYSTEMS GO! No errors found.")
        print("=" * 70)
        print("\n🚀 Ready to run:")
        print("   python3 scripts/company_scraper.py --company Google")
        print("   npm run dev")
        sys.exit(0)
    else:
        print("❌ SOME ISSUES FOUND - See above for details")
        print("=" * 70)
        sys.exit(1)
