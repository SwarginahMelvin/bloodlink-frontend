@echo off
echo Setting up BloodLink Backend Environment...

REM Create .env file from template
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo Please update the .env file with your specific configuration:
    echo - JWT_SECRET: Use a strong secret key
    echo - JWT_REFRESH_SECRET: Use a different strong secret key
    echo.
    echo The MongoDB connection string is already configured.
    echo.
) else (
    echo .env file already exists.
)

echo Environment setup complete!
pause
