#!/bin/bash

# Development Deployment Script (Default = Staging)
echo "🚀 Deploying to DEVELOPMENT/STAGING environment..."

# Load development environment variables (uses staging database)
# Only export lines that don't start with # and contain =
while IFS= read -r line; do
    if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ "$line" =~ = ]]; then
        export "$line"
    fi
done < config/environments/development.env

# Set Firebase project
firebase use default

# Deploy to development/staging
firebase deploy --only hosting,functions

echo "✅ Development/Staging deployment complete!"
echo "🌐 URL: https://pocket-counsel.web.app"
echo "🗄️  Database: staging-db (for testing)" 