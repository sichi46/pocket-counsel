# Pocket Counsel - Start Firebase Emulator with Environment Variables
# This script sets the required environment variables and starts the emulator

Write-Host "Starting Pocket Counsel Firebase Emulator..." -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Set required environment variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow

$env:GOOGLE_API_KEY = "AIzaSyDuAN_BpMae7xsuVGKtPtGlhWIo2SUKY8U"
$env:PINECONE_API_KEY = "pcsk_VyJ6T_8EmnAkeRYTYRYpGoKhtrLU5tB8ZuKzriiad5uMWj1VbzuvGLscFdDbZcyQA7sqi"
$env:NODE_ENV = "development"
$env:STORAGE_BUCKET_NAME = "pocket-counsel-staging"

Write-Host "Environment variables set:" -ForegroundColor Green
Write-Host "   GOOGLE_API_KEY: $($env:GOOGLE_API_KEY.Substring(0,10))..." -ForegroundColor White
Write-Host "   PINECONE_API_KEY: $($env:PINECONE_API_KEY.Substring(0,10))..." -ForegroundColor White
Write-Host "   NODE_ENV: $env:NODE_ENV" -ForegroundColor White
Write-Host "   STORAGE_BUCKET_NAME: $env:STORAGE_BUCKET_NAME" -ForegroundColor White

Write-Host ""
Write-Host "Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting Firebase emulator..." -ForegroundColor Yellow
    Write-Host "The emulator will be available at:" -ForegroundColor Cyan
    Write-Host "   - Functions: http://localhost:5001" -ForegroundColor White
    Write-Host "   - Emulator UI: http://127.0.0.1:4000" -ForegroundColor White
    Write-Host ""
    
    # Start the emulator
    firebase emulators:start --only functions
} else {
    Write-Host "Build failed! Please check for errors." -ForegroundColor Red
    exit 1
}
