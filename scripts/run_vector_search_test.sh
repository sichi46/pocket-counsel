#!/bin/bash

# Pocket Counsel Vector Search Test Runner
# This script runs the vector search test to verify vectors were uploaded

set -e  # Exit on any error

echo "🚀 Starting Pocket Counsel Vector Search Test"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "scripts/test_vector_search.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: scripts/test_vector_search.py"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed or not in PATH"
    exit 1
fi

# Check if virtual environment exists and activate it
if [ -d ".venv" ]; then
    echo "🔧 Activating virtual environment..."
    source .venv/bin/activate
    echo "✅ Virtual environment activated"
else
    echo "⚠️  No virtual environment found. Using system Python."
fi

# Check if required packages are installed
echo "🔍 Checking required packages..."
python3 -c "
import vertexai
import google.cloud.aiplatform
import google.cloud.storage
print('✅ All required packages are available')
" 2>/dev/null || {
    echo "❌ Missing required packages. Installing..."
    pip install google-cloud-aiplatform google-cloud-storage vertexai
}

# Set environment variables (you can override these)
export GOOGLE_CLOUD_PROJECT=${GOOGLE_CLOUD_PROJECT:-"pocket-counsel"}
export VERTEX_AI_LOCATION=${VERTEX_AI_LOCATION:-"us-central1"}
export VERTEX_AI_INDEX_ID=${VERTEX_AI_INDEX_ID:-"849546455294148608"}

echo "📋 Configuration:"
echo "   Project ID: $GOOGLE_CLOUD_PROJECT"
echo "   Location: $VERTEX_AI_LOCATION"
echo "   Index ID: $VERTEX_AI_INDEX_ID"
echo ""

# Check if user is authenticated with Google Cloud
echo "🔐 Checking Google Cloud authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with Google Cloud. Please run:"
    echo "   gcloud auth login"
    echo "   gcloud config set project $GOOGLE_CLOUD_PROJECT"
    exit 1
fi

echo "✅ Authenticated with Google Cloud"
echo ""

# Run the test
echo "🧪 Running Vector Search Test..."
echo "=================================="

cd scripts
python3 test_vector_search.py

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Test completed successfully!"
    echo "📄 Check the generated results file for detailed information"
else
    echo ""
    echo "❌ Test failed. Check the output above for details."
    exit 1
fi
