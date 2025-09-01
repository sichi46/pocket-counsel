@echo off
echo 🚀 Running Vertex AI Vector Search API Test...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "test_vertex_ai_api.py" (
    echo ❌ test_vertex_ai_api.py not found in current directory
    echo Please run this script from the scripts/ directory
    pause
    exit /b 1
)

REM Install requirements if needed
echo 📦 Installing Python dependencies...
pip install -r requirements_vertex_ai_test.txt

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🔧 Running Vertex AI API test...
echo.

REM Run the test script
python test_vertex_ai_api.py

echo.
echo ✅ Test completed!
pause
