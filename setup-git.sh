#!/bin/bash

echo "🚀 Setting up Git and GitHub for BloodLink project..."
echo

echo "🔧 Checking Git installation..."
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git first:"
    echo "   - macOS: brew install git"
    echo "   - Ubuntu/Debian: sudo apt install git"
    echo "   - CentOS/RHEL: sudo yum install git"
    exit 1
else
    echo "✅ Git is already installed"
fi

echo
echo "🔧 Configuring Git..."
read -p "Enter your GitHub username: " username
read -p "Enter your GitHub email: " email

git config --global user.name "$username"
git config --global user.email "$email"

echo
echo "📁 Initializing Git repository..."
git init

echo
echo "📝 Creating .gitignore file..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory
coverage/
*.lcov

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Uploads directory
uploads/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Build directories
dist/
build/
EOF

echo
echo "📄 Adding files to Git..."
git add .

echo
echo "💾 Making initial commit..."
git commit -m "Initial commit: BloodLink blood donation management system

- React frontend with responsive design
- Node.js/Express backend with MongoDB
- Complete authentication system
- Blood request and donor management
- Admin dashboard
- Real-time notifications"

echo
echo "🌐 Creating GitHub repository..."
echo "⚠️  Please create a new repository on GitHub first:"
echo "   1. Go to https://github.com/new"
echo "   2. Repository name: bloodlink-app"
echo "   3. Description: Blood donation management system with React frontend and Node.js backend"
echo "   4. Make it public or private"
echo "   5. DON'T initialize with README, .gitignore, or license"
echo "   6. Click 'Create repository'"
echo
read -p "Press Enter when you've created the repository..."

echo
echo "🔗 Adding remote origin..."
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/bloodlink-app.git): " repourl
git remote add origin "$repourl"

echo
echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo
echo "✅ Success! Your BloodLink project is now on GitHub!"
echo "🌐 Repository URL: $repourl"
echo
