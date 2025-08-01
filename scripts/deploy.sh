#!/bin/bash

# Pocket Counsel Deployment Script
# This script handles deployment to Firebase with proper environment management

set -e

echo "🚀 Starting Pocket Counsel deployment..."

# Load environment variables
ENVIRONMENT=${1:-development}
ENV_FILE="config/environments/${ENVIRONMENT}.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file not found: $ENV_FILE"
    echo "Available environments:"
    ls config/environments/*.env 2>/dev/null || echo "No environment files found"
    exit 1
fi

echo "📦 Loading environment: $ENVIRONMENT"
source "$ENV_FILE"

# Build all packages
echo "🔨 Building packages..."
npm run build

# Deploy Firebase Functions
echo "🔧 Deploying Firebase Functions..."
cd functions
npm run build
cd ..

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
npx firebase deploy --project "$FIREBASE_PROJECT_ID"

echo "✅ Deployment completed successfully!"
echo "🌐 Your app should be available at: https://$FIREBASE_PROJECT_ID.web.app" 