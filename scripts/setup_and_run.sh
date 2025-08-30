#!/bin/bash

# Pocket Counsel RAG Ingestion Setup and Run Script
# This script sets up the Python environment and runs the RAG ingestion

set -e

echo "🚀 Setting up Pocket Counsel RAG Ingestion Service"
echo "=================================================="

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

echo "✅ pip3 found: $(pip3 --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🔧 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "🔧 Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "🔧 Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ Dependencies installed successfully"

# Check if configuration file exists
if [ ! -f "config.env" ]; then
    echo "⚠️  Configuration file config.env not found"
    echo "📝 Please create config.env with your Google Cloud settings"
    echo "📝 See config.env.example for reference"
    exit 1
fi

# Load environment variables
echo "🔧 Loading configuration..."
source config.env

# Validate required environment variables
required_vars=("GOOGLE_CLOUD_PROJECT" "VERTEX_AI_LOCATION" "VERTEX_AI_INDEX_ID" "GCS_BUCKET_NAME")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables: ${missing_vars[*]}"
    echo "📝 Please check your config.env file"
    exit 1
fi

echo "✅ Configuration loaded successfully"
echo "📋 Configuration:"
echo "   Project ID: $GOOGLE_CLOUD_PROJECT"
echo "   Location: $VERTEX_AI_LOCATION"
echo "   Index ID: $VERTEX_AI_INDEX_ID"
echo "   Bucket: $GCS_BUCKET_NAME"

# Check Google Cloud authentication
echo "🔧 Checking Google Cloud authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "⚠️  No active Google Cloud authentication found"
    echo "🔐 Please authenticate with: gcloud auth login"
    echo "🔐 Or set service account: export GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json"
    exit 1
fi

echo "✅ Google Cloud authentication verified"

# Check if the script exists
if [ ! -f "rag_ingestion.py" ]; then
    echo "❌ RAG ingestion script not found: rag_ingestion.py"
    exit 1
fi

echo "✅ RAG ingestion script found"

# Run the ingestion
echo "🚀 Starting RAG ingestion..."
echo "=================================================="

python3 rag_ingestion.py

echo "=================================================="
echo "🎉 RAG ingestion completed!"
echo "📊 Check the logs above for results"
echo "🔍 Verify in Google Cloud Console:"
echo "   - Vertex AI Vector Search > Indexes > pocket_counsel_staging"
echo "   - Check if Dense vector count > 0"
