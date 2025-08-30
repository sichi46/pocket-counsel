@echo off
REM Pocket Counsel Vector Search Test Runner for Windows
REM This script runs the vector search test to verify vectors were uploaded

echo 🚀 Starting Pocket Counsel Vector Search Test
echo ==============================================

REM Check if we're in the right directory
if not exist "scripts\test_vector_search.py" (
    echo ❌ Error: Please run this script from the project root directory
    echo    Current directory: %CD%
    echo    Expected: scripts\test_vector_search.py
    pause
    exit /b 1
)

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python is not installed or not in PATH
    echo    Please install Python and add it to your PATH
    pause
    exit /b 1
)

REM Check if virtual environment exists and activate it
if exist ".venv\Scripts\activate.bat" (
    echo 🔧 Activating virtual environment...
    call .venv\Scripts\activate.bat
    echo ✅ Virtual environment activated
) else (
    echo ⚠️  No virtual environment found. Using system Python.
)

REM Check if required packages are installed
echo 🔍 Checking required packages...
python -c "import vertexai, google.cloud.aiplatform, google.cloud.storage; print('✅ All required packages are available')" 2>nul
if errorlevel 1 (
    echo ❌ Missing required packages. Installing...
    pip install google-cloud-aiplatform google-cloud-storage vertexai
)

REM Set environment variables (you can override these)
set GOOGLE_CLOUD_PROJECT=%GOOGLE_CLOUD_PROJECT%
if "%GOOGLE_CLOUD_PROJECT%"=="" set GOOGLE_CLOUD_PROJECT=pocket-counsel

set VERTEX_AI_LOCATION=%VERTEX_AI_LOCATION%
if "%VERTEX_AI_LOCATION%"=="" set VERTEX_AI_LOCATION=us-central1

set VERTEX_AI_INDEX_ID=%VERTEX_AI_INDEX_ID%
if "%VERTEX_AI_INDEX_ID%"=="" set VERTEX_AI_INDEX_ID=849546455294148608

echo 📋 Configuration:
echo    Project ID: %GOOGLE_CLOUD_PROJECT%
echo    Location: %VERTEX_AI_LOCATION%
echo    Index ID: %VERTEX_AI_INDEX_ID%
echo.

REM Check if user is authenticated with Google Cloud
echo 🔐 Checking Google Cloud authentication...
gcloud auth list --filter=status:ACTIVE --format="value(account)" >nul 2>&1
if errorlevel 1 (
    echo ❌ Not authenticated with Google Cloud. Please run:
    echo    gcloud auth login
    echo    gcloud config set project %GOOGLE_CLOUD_PROJECT%
    pause
    exit /b 1
)

echo ✅ Authenticated with Google Cloud
echo.

REM Run the test
echo 🧪 Running Vector Search Test...
echo ==================================

cd scripts
python test_vector_search.py

REM Check exit code
if errorlevel 1 (
    echo.
    echo ❌ Test failed. Check the output above for details.
    pause
    exit /b 1
) else (
    echo.
    echo 🎉 Test completed successfully!
    echo 📄 Check the generated results file for detailed information
)

pause
