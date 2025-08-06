# Production Deployment Script for Pocket Counsel RAG Application (PowerShell)
# This script sets up the production environment with all necessary configurations

Write-Host "🚀 Starting Pocket Counsel RAG Production Deployment" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if required tools are installed
function Check-Dependencies {
    Write-Status "Checking dependencies..."
    
    # Check if Firebase CLI is installed
    try {
        $firebaseVersion = firebase --version
        Write-Success "Firebase CLI found: $firebaseVersion"
    }
    catch {
        Write-Error "Firebase CLI is not installed. Please install it first:"
        Write-Host "npm install -g firebase-tools"
        exit 1
    }
    
    # Check if Node.js is installed
    try {
        $nodeVersion = node --version
        Write-Success "Node.js found: $nodeVersion"
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js 20+"
        exit 1
    }
    
    Write-Success "Dependencies check completed"
}

# Set up environment variables
function Setup-Environment {
    Write-Status "Setting up environment variables..."
    
    # Check if .env file exists
    if (-not (Test-Path ".env")) {
        Write-Warning ".env file not found. Please create it first using scripts/setup-env.ps1"
        exit 1
    }
    
    # Load environment variables
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            Set-Variable -Name $name -Value $value -Scope Global
        }
    }
    
    Write-Success "Environment variables loaded"
}

# Set up Google Cloud Storage bucket
function Setup-Storage {
    Write-Status "Setting up Google Cloud Storage..."
    
    if (-not $env:GOOGLE_CLOUD_PROJECT) {
        Write-Error "GOOGLE_CLOUD_PROJECT not set in .env file"
        exit 1
    }
    
    if (-not $env:STORAGE_BUCKET_NAME) {
        Write-Error "STORAGE_BUCKET_NAME not set in .env file"
        exit 1
    }
    
    Write-Warning "Please manually create the storage bucket using:"
    Write-Host "gsutil mb -p $env:GOOGLE_CLOUD_PROJECT gs://$env:STORAGE_BUCKET_NAME"
    Write-Host "gsutil iam ch allUsers:objectViewer gs://$env:STORAGE_BUCKET_NAME"
    
    $createBucket = Read-Host "Do you want to create the bucket now? (y/N)"
    if ($createBucket -eq "y" -or $createBucket -eq "Y") {
        try {
            gsutil mb -p $env:GOOGLE_CLOUD_PROJECT "gs://$env:STORAGE_BUCKET_NAME"
            gsutil iam ch allUsers:objectViewer "gs://$env:STORAGE_BUCKET_NAME"
            Write-Success "Storage bucket created and configured"
        }
        catch {
            Write-Error "Failed to create storage bucket. Please create it manually."
        }
    }
    else {
        Write-Warning "Please create the storage bucket manually before proceeding"
    }
}

# Set up Pinecone index
function Setup-Pinecone {
    Write-Status "Setting up Pinecone vector database..."
    
    if (-not $env:PINECONE_API_KEY) {
        Write-Error "PINECONE_API_KEY not set in .env file"
        exit 1
    }
    
    if (-not $env:PINECONE_INDEX_NAME) {
        Write-Error "PINECONE_INDEX_NAME not set in .env file"
        exit 1
    }
    
    Write-Warning "Please manually create a Pinecone index with the following specifications:"
    Write-Host "  - Name: $env:PINECONE_INDEX_NAME"
    Write-Host "  - Dimension: 768"
    Write-Host "  - Metric: cosine"
    Write-Host "  - Cloud: AWS"
    Write-Host "  - Region: us-east-1"
    Write-Host ""
    Write-Host "Visit: https://app.pinecone.io/"
    Write-Host ""
    Write-Host "See docs/PINECONE_SETUP.md for detailed instructions"
    Write-Host ""
    Read-Host "Press Enter when you have created the Pinecone index..."
    
    Write-Success "Pinecone setup completed"
}

# Install dependencies
function Install-Dependencies {
    Write-Status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install root dependencies"
        exit 1
    }
    
    # Install function dependencies
    Set-Location functions
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install function dependencies"
        exit 1
    }
    Set-Location ..
    
    Write-Success "Dependencies installed"
}

# Build the application
function Build-Application {
    Write-Status "Building application..."
    
    # Build functions
    Set-Location functions
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build functions"
        exit 1
    }
    Set-Location ..
    
    Write-Success "Application built successfully"
}

# Deploy to Firebase
function Deploy-Firebase {
    Write-Status "Deploying to Firebase..."
    
    if (-not $env:FIREBASE_PROJECT_ID) {
        Write-Error "FIREBASE_PROJECT_ID not set in .env file"
        exit 1
    }
    
    # Set Firebase project
    firebase use $env:FIREBASE_PROJECT_ID
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to set Firebase project"
        exit 1
    }
    
    # Deploy functions
    firebase deploy --only functions
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to deploy to Firebase"
        exit 1
    }
    
    Write-Success "Firebase deployment completed"
}

# Upload documents to storage
function Upload-Documents {
    Write-Status "Uploading documents to storage..."
    
    if (-not $env:STORAGE_BUCKET_NAME) {
        Write-Error "STORAGE_BUCKET_NAME not set in .env file"
        exit 1
    }
    
    # Check if documents directory exists
    if (-not (Test-Path "documents")) {
        Write-Warning "Documents directory not found. Creating empty directory..."
        New-Item -ItemType Directory -Path "documents" -Force
        Write-Warning "Please add your PDF documents to the 'documents' directory"
        return
    }
    
    # Upload documents
    $documents = Get-ChildItem "documents" -File
    if ($documents.Count -gt 0) {
        try {
            gsutil -m cp documents/* "gs://$env:STORAGE_BUCKET_NAME/"
            Write-Success "Documents uploaded to storage"
        }
        catch {
            Write-Error "Failed to upload documents. Please upload manually:"
            Write-Host "gsutil -m cp documents/* gs://$env:STORAGE_BUCKET_NAME/"
        }
    }
    else {
        Write-Warning "No documents found in 'documents' directory"
    }
}

# Run initial document processing
function Process-Documents {
    Write-Status "Processing documents for RAG system..."
    
    Write-Warning "Document processing will be triggered on first query"
    Write-Warning "This may take several minutes depending on the number of documents"
}

# Main deployment flow
function Main {
    Write-Host ""
    Write-Status "Starting deployment process..."
    
    Check-Dependencies
    Setup-Environment
    Setup-Storage
    Setup-Pinecone
    Install-Dependencies
    Build-Application
    Deploy-Firebase
    Upload-Documents
    Process-Documents
    
    Write-Host ""
    Write-Success "🎉 Production deployment completed!"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Test the application by making a query"
    Write-Host "2. Monitor the Firebase Functions logs for any issues"
    Write-Host "3. Check Pinecone dashboard for vector storage status"
    Write-Host ""
    Write-Host "Useful commands:"
    Write-Host "  - View logs: firebase functions:log"
    Write-Host "  - Test locally: firebase emulators:start"
    Write-Host "  - Monitor: firebase functions:log --follow"
    Write-Host ""
}

# Run main function
Main 