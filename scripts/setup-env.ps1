# Environment Setup Script for Pocket Counsel RAG (PowerShell)
# This script helps you create the .env file with required variables

Write-Host "🔧 Setting up environment variables for Pocket Counsel RAG" -ForegroundColor Blue
Write-Host "==========================================================" -ForegroundColor Blue

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "[WARNING] .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "[INFO] Keeping existing .env file" -ForegroundColor Blue
        exit 0
    }
}

Write-Host "[INFO] Creating .env file..." -ForegroundColor Blue

# Create .env file content
$envContent = @"
# Google Cloud Configuration
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CLOUD_PROJECT=your_project_id_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=pocket-counsel-rag

# Storage Configuration
STORAGE_BUCKET_NAME=pocket-counsel-rag-corpus

# Model Configuration
EMBEDDING_MODEL=textembedding-gecko-multilingual@001
LLM_MODEL=gemini-1.5-flash

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id_here
"@

# Write content to .env file
$envContent | Out-File -FilePath ".env" -Encoding utf8

Write-Host "[SUCCESS] .env file created successfully!" -ForegroundColor Green

Write-Host ""
Write-Host "[INFO] Next steps:" -ForegroundColor Blue
Write-Host "1. Edit the .env file and replace the placeholder values with your actual API keys"
Write-Host "2. Get your API keys from:"
Write-Host "   - Google AI API Key: https://makersuite.google.com/app/apikey"
Write-Host "   - Pinecone API Key: https://app.pinecone.io/"
Write-Host "3. Set your Firebase project ID and Google Cloud project ID"
Write-Host ""
Write-Host "[WARNING] Never commit the .env file to version control!" -ForegroundColor Yellow
Write-Host "" 