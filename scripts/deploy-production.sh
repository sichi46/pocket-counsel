#!/bin/bash

# Production Deployment Script (Explicit Production)
echo "🚀 Deploying to PRODUCTION environment..."

# Load production environment variables
# Only export lines that don't start with # and contain =
while IFS= read -r line; do
    if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ "$line" =~ = ]]; then
        export "$line"
    fi
done < config/environments/production.env

# Set Firebase project
firebase use production

# Deploy to production
firebase deploy --only hosting,functions

echo "✅ Production deployment complete!"
echo "🌐 URL: https://pocket-counsel.web.app"
echo "🗄️  Database: staging-db - PRODUCTION DATA"
echo "⚠️  WARNING: This deploys to PRODUCTION with real data!" 