# Pocket Counsel - Environment Setup Script
# Based on comprehensive Firebase and Google Cloud audit
# This script sets up all environment variables for testing

Write-Host "Pocket Counsel Environment Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Based on Firebase and Google Cloud audit" -ForegroundColor Yellow
Write-Host ""

# Set environment variables based on audit results
Write-Host "Setting environment variables..." -ForegroundColor Yellow

# Firebase Functions Configuration (from audit)
$env:GOOGLE_API_KEY = "AIzaSyDuAN_BpMae7xsuVGKtPtGlhWIo2SUKY8U"
$env:PINECONE_API_KEY = "pcsk_VyJ6T_8EmnAkeRYTYRYpGoKhtrLU5tB8ZuKzriiad5uMWj1VbzuvGLscFdDbZcyQA7sqi"

# Google Cloud Configuration
$env:GOOGLE_CLOUD_PROJECT = "pocket-counsel"
$env:GOOGLE_CLOUD_LOCATION = "us-central1"

# Storage Configuration
$env:STORAGE_BUCKET_NAME = "pocket-counsel-rag-corpus"

# Vertex AI Configuration (from audit)
$env:VERTEX_AI_INDEX_ID = "6627418486605873152"
$env:VERTEX_AI_ENDPOINT_ID = "8138815966239784960"

# Model Configuration
$env:EMBEDDING_MODEL = "textembedding-gecko-multilingual@001"
$env:LLM_MODEL = "gemini-1.5-flash"

# Development Mode
$env:NODE_ENV = "development"

Write-Host "Environment variables set:" -ForegroundColor Green
Write-Host "   GOOGLE_API_KEY: $($env:GOOGLE_API_KEY.Substring(0,10))..." -ForegroundColor White
Write-Host "   PINECONE_API_KEY: $($env:PINECONE_API_KEY.Substring(0,10))..." -ForegroundColor White
Write-Host "   GOOGLE_CLOUD_PROJECT: $env:GOOGLE_CLOUD_PROJECT" -ForegroundColor White
Write-Host "   GOOGLE_CLOUD_LOCATION: $env:GOOGLE_CLOUD_LOCATION" -ForegroundColor White
Write-Host "   STORAGE_BUCKET_NAME: $env:STORAGE_BUCKET_NAME" -ForegroundColor White
Write-Host "   VERTEX_AI_INDEX_ID: $env:VERTEX_AI_INDEX_ID" -ForegroundColor White
Write-Host "   VERTEX_AI_ENDPOINT_ID: $env:VERTEX_AI_ENDPOINT_ID" -ForegroundColor White
Write-Host "   EMBEDDING_MODEL: $env:EMBEDDING_MODEL" -ForegroundColor White
Write-Host "   LLM_MODEL: $env:LLM_MODEL" -ForegroundColor White
Write-Host "   NODE_ENV: $env:NODE_ENV" -ForegroundColor White

Write-Host ""
Write-Host "Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Environment is ready for testing!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Start Firebase emulator: firebase emulators:start --only functions" -ForegroundColor White
    Write-Host "   2. Run tests: node test-pdf-processing.js" -ForegroundColor White
    Write-Host "   3. Or use PowerShell: .\test-powershell.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Test endpoints will be available at:" -ForegroundColor Yellow
    Write-Host "   - Functions: http://localhost:5001" -ForegroundColor White
    Write-Host "   - Emulator UI: http://127.0.0.1:4000" -ForegroundColor White
} else {
    Write-Host "Build failed! Please check for errors." -ForegroundColor Red
    exit 1
}
