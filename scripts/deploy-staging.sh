#!/bin/bash

# Staging Deployment Script
echo "🚀 Deploying to STAGING environment..."

# Load staging environment variables
export $(cat config/environments/staging.env | xargs)

# Set Firebase project
firebase use staging

# Deploy to staging
firebase deploy --only hosting,functions

echo "✅ Staging deployment complete!"
echo "🌐 Staging URL: https://pocket-counsel.web.app"
echo "🗄️  Database: staging-db" 