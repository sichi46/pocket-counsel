#!/bin/bash

# Simple Document Status Check
# This script checks document status using curl commands

echo "🔍 Checking RAG System Document Status..."
echo "========================================"

API_URL="https://api-6otymacelq-uc.a.run.app"
HEALTH_URL="https://health-6otymacelq-uc.a.run.app"

echo ""
echo "📊 System Health:"
curl -s "$HEALTH_URL" | jq '.'

echo ""
echo "📈 System Statistics:"
curl -s "$API_URL/trpc/getStats" | jq '.'

echo ""
echo "📚 Available Documents:"
curl -s "$API_URL/trpc/listDocuments" | jq '.'

echo ""
echo "🧪 Testing Sample Query:"
curl -s "$API_URL/trpc/askQuestion?input=$(echo -n '{\"question\":\"What are the rights of children under Zambian law?\",\"topK\":3}' | jq -sRr @uri)" | jq '.result.data.sources[] | {title, documentName, source, similarity, score}'

echo ""
echo "✅ Document Status Check Complete!"
