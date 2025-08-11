@echo off
REM Pocket Counsel - Start Firebase Emulator with Environment Variables
REM This script sets the required environment variables and starts the emulator

echo 🚀 Starting Pocket Counsel Firebase Emulator...
echo ===============================================

REM Set required environment variables
echo 🔐 Setting environment variables...

set GOOGLE_API_KEY=AIzaSyDuAN_BpMae7xsuVGKtPtGlhWIo2SUKY8U
set PINECONE_API_KEY=pcsk_VyJ6T_8EmnAkeRYTYRYpGoKhtrLU5tB8ZuKzriiad5uMWj1VbzuvGLscFdDbZcyQA7sqi
set NODE_ENV=development
set STORAGE_BUCKET_NAME=pocket-counsel-staging

echo ✅ Environment variables set:
echo    GOOGLE_API_KEY: %GOOGLE_API_KEY:~0,10%...
echo    PINECONE_API_KEY: %PINECONE_API_KEY:~0,10%...
echo    NODE_ENV: %NODE_ENV%
echo    STORAGE_BUCKET_NAME: %STORAGE_BUCKET_NAME%

echo.
echo 🔧 Building project...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    echo.
    echo 🔥 Starting Firebase emulator...
    echo 💡 The emulator will be available at:
    echo    - Functions: http://localhost:5001
    echo    - Emulator UI: http://127.0.0.1:4000
    echo.
    
    REM Start the emulator
    firebase emulators:start --only functions
) else (
    echo ❌ Build failed! Please check for errors.
    pause
    exit /b 1
)
