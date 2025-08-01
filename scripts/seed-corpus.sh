#!/bin/bash

# Pocket Counsel Corpus Seeding Script
# This script processes legal documents and ingests them into Vertex AI Vector Search

set -e

echo "📚 Starting legal corpus ingestion..."

# Load environment variables
ENVIRONMENT=${1:-development}
ENV_FILE="config/environments/${ENVIRONMENT}.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file not found: $ENV_FILE"
    exit 1
fi

echo "📦 Loading environment: $ENVIRONMENT"
source "$ENV_FILE"

# Check required environment variables
if [ -z "$GCLOUD_PROJECT" ] || [ -z "$VERTEX_AI_LOCATION" ]; then
    echo "❌ Missing required environment variables"
    echo "Required: GCLOUD_PROJECT, VERTEX_AI_LOCATION"
    exit 1
fi

# Check if corpus directory exists
CORPUS_DIR="packages/corpus"
if [ ! -d "$CORPUS_DIR" ]; then
    echo "❌ Corpus directory not found: $CORPUS_DIR"
    exit 1
fi

# Check for legal documents
DOCUMENT_COUNT=$(find "$CORPUS_DIR" -name "*.txt" -o -name "*.pdf" | wc -l)
if [ "$DOCUMENT_COUNT" -eq 0 ]; then
    echo "❌ No legal documents found in $CORPUS_DIR"
    echo "Please add .txt or .pdf files containing Zambian legal documents"
    exit 1
fi

echo "📄 Found $DOCUMENT_COUNT legal document(s) to process"

# Build seeding package
echo "🔨 Building seeding package..."
cd packages/seeding
npm run build
cd ../..

# Run corpus ingestion
echo "🚀 Running corpus ingestion..."
echo "⚠️  Note: This is a placeholder script for Milestone 1"
echo "📝 Full implementation will be completed in Milestone 2: RAG Pipeline Breakthrough"

# TODO: Implement actual corpus processing in Milestone 2
# This will include:
# - Document chunking strategy
# - Vector embedding generation
# - Vertex AI Vector Search index creation
# - Batch upload to vector database

echo "✅ Corpus seeding preparation completed!"
echo "🎯 Ready for Milestone 2 implementation" 