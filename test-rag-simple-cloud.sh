#!/bin/bash

# Simple RAG Testing Script for Cloud Shell
# This script properly encodes JSON parameters

echo "🚀 Testing RAG System in Cloud Shell"
echo "===================================="

API_URL="https://api-6otymacelq-uc.a.run.app"
HEALTH_URL="https://health-6otymacelq-uc.a.run.app"

echo "API URL: $API_URL"
echo "Health URL: $HEALTH_URL"
echo ""

# Function to encode JSON for URL
encode_json() {
    echo -n "$1" | jq -sRr @uri
}

# Test 1: Health Check
echo "🔍 Test 1: Health Check"
curl -s "$HEALTH_URL" | jq
echo ""

# Test 2: Children's Rights
echo "🔍 Test 2: Children's Rights"
question='{"question":"What are the rights of children under Zambian law?","topK":3}'
encoded=$(encode_json "$question")
curl -s "$API_URL/trpc/askQuestion?input=$encoded" | jq
echo ""

# Test 3: Employment Law
echo "🔍 Test 3: Employment Law"
question='{"question":"What does the Employment Code Act regulate?","topK":3}'
encoded=$(encode_json "$question")
curl -s "$API_URL/trpc/askQuestion?input=$encoded" | jq
echo ""

# Test 4: Companies Act
echo "🔍 Test 4: Companies Act"
question='{"question":"What does the Companies Act govern?","topK":3}'
encoded=$(encode_json "$question")
curl -s "$API_URL/trpc/askQuestion?input=$encoded" | jq
echo ""

echo "✅ Testing Complete!"
