#!/bin/bash

# Database Setup Script
echo "🗄️  Setting up Firestore databases..."

# Check if Firestore API is enabled
echo "📋 Checking Firestore API status..."

# Create staging database
echo "🔧 Creating staging database..."
firebase firestore:databases:create staging-db --location us-central1 --project pocket-counsel

if [ $? -eq 0 ]; then
    echo "✅ Staging database 'staging-db' created successfully!"
    echo "📊 Database locations:"
    echo "   - (default): Production database"
    echo "   - staging-db: Staging database (for testing)"
else
    echo "❌ Failed to create staging database."
    echo "💡 Make sure to:"
    echo "   1. Enable Firestore API: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=pocket-counsel"
    echo "   2. Wait 2-3 minutes for API to be fully enabled"
    echo "   3. Run this script again"
fi

echo "🎯 Next steps:"
echo "   1. Run: ./scripts/deploy-dev.sh (for testing)"
echo "   2. Run: ./scripts/deploy-production.sh (for production)" 