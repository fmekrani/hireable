#!/bin/bash
# Setup guide for Hireable development environment

echo "🚀 Setting up Hireable development environment..."

# 1. Setup NVM for Node.js
echo ""
echo "📦 Setting up Node.js..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install node
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"

# 2. Install Python packages
echo ""
echo "📦 Installing Python packages..."
pip3 install requests beautifulsoup4
echo "✅ Python packages installed"

# 3. Install npm dependencies
echo ""
echo "📦 Installing npm dependencies..."
cd "$(dirname "$0")/hireable" && npm install
echo "✅ npm dependencies installed"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 To use NVM in new terminal sessions, add to ~/.zshrc:"
echo "export NVM_DIR=\"\$HOME/.nvm\""
echo "[ -s \"\$NVM_DIR/nvm.sh\" ] && \\. \"\$NVM_DIR/nvm.sh\""
