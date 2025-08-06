#!/bin/bash

# Environment Setup Script for Pocket Counsel RAG
# This script helps you create the .env file with required variables

echo "🔧 Setting up environment variables for Pocket Counsel RAG"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
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

# Check if .env already exists
if [ -f ".env" ]; then
    print_warning ".env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Keeping existing .env file"
        exit 0
    fi
fi

print_info "Creating .env file..."

# Create .env file
cat > .env << 'EOF'
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

print_success ".env file created successfully!"

echo ""
print_info "Next steps:"
echo "1. Edit the .env file and replace the placeholder values with your actual API keys"
echo "2. Get your API keys from:"
echo "   - Google AI API Key: https://makersuite.google.com/app/apikey"
echo "   - Pinecone API Key: https://app.pinecone.io/"
echo "3. Set your Firebase project ID and Google Cloud project ID"
echo ""
print_warning "Never commit the .env file to version control!"
echo "" 