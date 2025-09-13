@echo off
echo 🚀 Setting up Git and GitHub for BloodLink project...
echo.

echo 🔧 Fixing PowerShell execution policy...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
echo ✅ PowerShell execution policy updated

echo.
echo 📦 Installing Git (if not already installed)...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Git not found. Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
) else (
    echo ✅ Git is already installed
)

echo.
echo 🔧 Configuring Git...
set /p username="Enter your GitHub username: "
set /p email="Enter your GitHub email: "

git config --global user.name "%username%"
git config --global user.email "%email%"

echo.
echo 📁 Initializing Git repository...
git init

echo.
echo 📝 Creating .gitignore file...
echo # Dependencies > .gitignore
echo node_modules/ >> .gitignore
echo npm-debug.log* >> .gitignore
echo yarn-debug.log* >> .gitignore
echo yarn-error.log* >> .gitignore
echo. >> .gitignore
echo # Environment variables >> .gitignore
echo .env >> .gitignore
echo .env.local >> .gitignore
echo .env.development.local >> .gitignore
echo .env.test.local >> .gitignore
echo .env.production.local >> .gitignore
echo. >> .gitignore
echo # Logs >> .gitignore
echo logs >> .gitignore
echo *.log >> .gitignore
echo. >> .gitignore
echo # Runtime data >> .gitignore
echo pids >> .gitignore
echo *.pid >> .gitignore
echo *.seed >> .gitignore
echo *.pid.lock >> .gitignore
echo. >> .gitignore
echo # Coverage directory >> .gitignore
echo coverage/ >> .gitignore
echo *.lcov >> .gitignore
echo. >> .gitignore
echo # Dependency directories >> .gitignore
echo node_modules/ >> .gitignore
echo jspm_packages/ >> .gitignore
echo. >> .gitignore
echo # Optional npm cache directory >> .gitignore
echo .npm >> .gitignore
echo. >> .gitignore
echo # Optional REPL history >> .gitignore
echo .node_repl_history >> .gitignore
echo. >> .gitignore
echo # Output of 'npm pack' >> .gitignore
echo *.tgz >> .gitignore
echo. >> .gitignore
echo # Yarn Integrity file >> .gitignore
echo .yarn-integrity >> .gitignore
echo. >> .gitignore
echo # dotenv environment variables file >> .gitignore
echo .env >> .gitignore
echo. >> .gitignore
echo # parcel-bundler cache >> .gitignore
echo .cache >> .gitignore
echo .parcel-cache >> .gitignore
echo. >> .gitignore
echo # next.js build output >> .gitignore
echo .next >> .gitignore
echo. >> .gitignore
echo # nuxt.js build output >> .gitignore
echo .nuxt >> .gitignore
echo. >> .gitignore
echo # vuepress build output >> .gitignore
echo .vuepress/dist >> .gitignore
echo. >> .gitignore
echo # Serverless directories >> .gitignore
echo .serverless >> .gitignore
echo. >> .gitignore
echo # FuseBox cache >> .gitignore
echo .fusebox/ >> .gitignore
echo. >> .gitignore
echo # DynamoDB Local files >> .gitignore
echo .dynamodb/ >> .gitignore
echo. >> .gitignore
echo # TernJS port file >> .gitignore
echo .tern-port >> .gitignore
echo. >> .gitignore
echo # Stores VSCode versions used for testing VSCode extensions >> .gitignore
echo .vscode-test >> .gitignore
echo. >> .gitignore
echo # Uploads directory >> .gitignore
echo uploads/ >> .gitignore
echo. >> .gitignore
echo # OS generated files >> .gitignore
echo .DS_Store >> .gitignore
echo .DS_Store? >> .gitignore
echo ._* >> .gitignore
echo .Spotlight-V100 >> .gitignore
echo .Trashes >> .gitignore
echo ehthumbs.db >> .gitignore
echo Thumbs.db >> .gitignore
echo. >> .gitignore
echo # IDE files >> .gitignore
echo .vscode/ >> .gitignore
echo .idea/ >> .gitignore
echo *.swp >> .gitignore
echo *.swo >> .gitignore
echo *~ >> .gitignore
echo. >> .gitignore
echo # Build directories >> .gitignore
echo dist/ >> .gitignore
echo build/ >> .gitignore

echo.
echo 📄 Adding files to Git...
git add .

echo.
echo 💾 Making initial commit...
git commit -m "Initial commit: BloodLink blood donation management system

- React frontend with responsive design
- Node.js/Express backend with MongoDB
- Complete authentication system
- Blood request and donor management
- Admin dashboard
- Real-time notifications"

echo.
echo 🌐 Creating GitHub repository...
echo ⚠️  Please create a new repository on GitHub first:
echo    1. Go to https://github.com/new
echo    2. Repository name: bloodlink-app
echo    3. Description: Blood donation management system with React frontend and Node.js backend
echo    4. Make it public or private
echo    5. DON'T initialize with README, .gitignore, or license
echo    6. Click 'Create repository'
echo.
pause

echo.
echo 🔗 Adding remote origin...
set /p repourl="Enter your GitHub repository URL (e.g., https://github.com/username/bloodlink-app.git): "
git remote add origin %repourl%

echo.
echo 🚀 Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Success! Your BloodLink project is now on GitHub!
echo 🌐 Repository URL: %repourl%
echo.
pause
