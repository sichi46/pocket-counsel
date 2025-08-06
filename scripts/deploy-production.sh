#!/bin/bash

# Production Deployment Script for Pocket Counsel RAG Application
# This script sets up the production environment with all necessary configurations

set -e

echo "🚀 Starting Pocket Counsel RAG Production Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed. Please install it first:"
        echo "npm install -g firebase-tools"
        exit 1
    fi
    
    if ! command -v gcloud &> /dev/null; then
        print_warning "Google Cloud CLI is not installed. Some features may not work."
    fi
    
    print_success "Dependencies check completed"
}

# Set up environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating template..."
        cat > .env << EOF
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
EOF
        print_warning "Please edit .env file with your actual API keys and configuration"
        exit 1
    fi
    
    # Load environment variables
    export $(cat .env | grep -v '^#' | xargs)
    
    print_success "Environment variables loaded"
}

# Set up Google Cloud Storage bucket
setup_storage() {
    print_status "Setting up Google Cloud Storage..."
    
    if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
        print_error "GOOGLE_CLOUD_PROJECT not set in .env file"
        exit 1
    fi
    
    if [ -z "$STORAGE_BUCKET_NAME" ]; then
        print_error "STORAGE_BUCKET_NAME not set in .env file"
        exit 1
    fi
    
    # Create bucket if it doesn't exist
    if ! gsutil ls -b "gs://$STORAGE_BUCKET_NAME" &> /dev/null; then
        print_status "Creating storage bucket: $STORAGE_BUCKET_NAME"
        gsutil mb -p "$GOOGLE_CLOUD_PROJECT" "gs://$STORAGE_BUCKET_NAME"
        
        # Set bucket permissions
        gsutil iam ch allUsers:objectViewer "gs://$STORAGE_BUCKET_NAME"
        
        print_success "Storage bucket created and configured"
    else
        print_success "Storage bucket already exists"
    fi
}

# Set up Pinecone index
setup_pinecone() {
    print_status "Setting up Pinecone vector database..."
    
    if [ -z "$PINECONE_API_KEY" ]; then
        print_error "PINECONE_API_KEY not set in .env file"
        exit 1
    fi
    
    if [ -z "$PINECONE_INDEX_NAME" ]; then
        print_error "PINECONE_INDEX_NAME not set in .env file"
        exit 1
    fi
    
    print_warning "Please manually create a Pinecone index with the following specifications:"
    echo "  - Name: $PINECONE_INDEX_NAME"
    echo "  - Dimension: 768"
    echo "  - Metric: cosine"
    echo "  - Cloud: AWS"
    echo "  - Region: us-east-1"
    echo ""
    echo "Visit: https://app.pinecone.io/"
    echo ""
    read -p "Press Enter when you have created the Pinecone index..."
    
    print_success "Pinecone setup completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install function dependencies
    cd functions
    npm install
    cd ..
    
    print_success "Dependencies installed"
}

# Build the application
build_application() {
    print_status "Building application..."
    
    # Build functions
    cd functions
    npm run build
    cd ..
    
    print_success "Application built successfully"
}

# Deploy to Firebase
deploy_firebase() {
    print_status "Deploying to Firebase..."
    
    if [ -z "$FIREBASE_PROJECT_ID" ]; then
        print_error "FIREBASE_PROJECT_ID not set in .env file"
        exit 1
    fi
    
    # Set Firebase project
    firebase use "$FIREBASE_PROJECT_ID"
    
    # Deploy functions
    firebase deploy --only functions
    
    print_success "Firebase deployment completed"
}

# Upload documents to storage
upload_documents() {
    print_status "Uploading documents to storage..."
    
    if [ -z "$STORAGE_BUCKET_NAME" ]; then
        print_error "STORAGE_BUCKET_NAME not set in .env file"
        exit 1
    fi
    
    # Check if documents directory exists
    if [ ! -d "documents" ]; then
        print_warning "Documents directory not found. Creating empty directory..."
        mkdir -p documents
        print_warning "Please add your PDF documents to the 'documents' directory"
        return
    fi
    
    # Upload documents
    if [ "$(ls -A documents)" ]; then
        gsutil -m cp documents/* "gs://$STORAGE_BUCKET_NAME/"
        print_success "Documents uploaded to storage"
    else
        print_warning "No documents found in 'documents' directory"
    fi
}

# Run initial document processing
process_documents() {
    print_status "Processing documents for RAG system..."
    
    print_warning "Document processing will be triggered on first query"
    print_warning "This may take several minutes depending on the number of documents"
}

# Main deployment flow
main() {
    echo ""
    print_status "Starting deployment process..."
    
    check_dependencies
    setup_environment
    setup_storage
    setup_pinecone
    install_dependencies
    build_application
    deploy_firebase
    upload_documents
    process_documents
    
    echo ""
    print_success "🎉 Production deployment completed!"
    echo ""
    echo "Next steps:"
    echo "1. Test the application by making a query"
    echo "2. Monitor the Firebase Functions logs for any issues"
    echo "3. Check Pinecone dashboard for vector storage status"
    echo ""
    echo "Useful commands:"
    echo "  - View logs: firebase functions:log"
    echo "  - Test locally: firebase emulators:start"
    echo "  - Monitor: firebase functions:log --follow"
    echo ""
}

# Run main function
main "$@" 