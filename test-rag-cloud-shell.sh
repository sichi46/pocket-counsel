#!/bin/bash

# Test RAG System in Google Cloud Shell
# This script provides the correct curl commands to test your RAG system

echo "🚀 Testing RAG System in Google Cloud Shell"
echo "=========================================="

# Configuration
API_URL="https://api-6otymacelq-uc.a.run.app"
HEALTH_URL="https://health-6otymacelq-uc.a.run.app"

echo "API URL: $API_URL"
echo "Health URL: $HEALTH_URL"
echo ""

# Test 1: Health Check
echo "🔍 Test 1: Health Check"
echo "curl -X GET \"$HEALTH_URL\""
echo ""
curl -X GET "$HEALTH_URL"
echo ""
echo ""

# Test 2: tRPC Health Query
echo "🔍 Test 2: tRPC Health Query"
echo "curl -X GET \"$API_URL/trpc/health\""
echo ""
curl -X GET "$API_URL/trpc/health"
echo ""
echo ""

# Test 3: tRPC Ask Question (Children's Rights)
echo "🔍 Test 3: tRPC Ask Question - Children's Rights"
echo "curl -X GET \"$API_URL/trpc/askQuestion?input={\\\"question\\\":\\\"What are the rights of children under Zambian law?\\\",\\\"topK\\\":3}\""
echo ""
curl -X GET "$API_URL/trpc/askQuestion?input={\"question\":\"What are the rights of children under Zambian law?\",\"topK\":3}"
echo ""
echo ""

# Test 4: tRPC Ask Question (Employment Law)
echo "🔍 Test 4: tRPC Ask Question - Employment Law"
echo "curl -X GET \"$API_URL/trpc/askQuestion?input={\\\"question\\\":\\\"What does the Employment Code Act regulate?\\\",\\\"topK\\\":3}\""
echo ""
curl -X GET "$API_URL/trpc/askQuestion?input={\"question\":\"What does the Employment Code Act regulate?\",\"topK\":3}"
echo ""
echo ""

# Test 5: tRPC Get Stats
echo "🔍 Test 5: tRPC Get Stats"
echo "curl -X GET \"$API_URL/trpc/getStats\""
echo ""
curl -X GET "$API_URL/trpc/getStats"
echo ""
echo ""

# Test 6: tRPC List Documents
echo "🔍 Test 6: tRPC List Documents"
echo "curl -X GET \"$API_URL/trpc/listDocuments\""
echo ""
curl -X GET "$API_URL/trpc/listDocuments"
echo ""
echo ""

echo "✅ Testing Complete!"
echo "=========================================="
