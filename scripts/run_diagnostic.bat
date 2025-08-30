@echo off
echo 🔍 Pocket Counsel RAG API Diagnostic
echo ======================================
echo.
echo Installing dependencies...
pip install -r requirements_diagnostic.txt
echo.
echo Running diagnostic script...
python diagnose_api.py
echo.
echo Press any key to exit...
pause >nul
