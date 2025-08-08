#!/bin/bash

# RAG System Quick Test Script
# This script uses curl to quickly test the RAG system endpoints

echo "🚀 Testing RAG System in Google Cloud..."
echo "======================================"

# Configuration
BASE_URL="https://api-6otymacelq-uc.a.run.app"
HEALTH_URL="https://health-6otymacelq-uc.a.run.app"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test health endpoint
echo -e "\n${YELLOW}🔍 Testing Health Endpoint...${NC}"
if curl -s "$HEALTH_URL" | jq '.' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health endpoint is working${NC}"
    curl -s "$HEALTH_URL" | jq '.'
else
    echo -e "${RED}❌ Health endpoint failed${NC}"
fi

# Test tRPC health endpoint
echo -e "\n${YELLOW}🔍 Testing tRPC Health Endpoint...${NC}"
if curl -s "$BASE_URL/trpc/health" | jq '.' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ tRPC health endpoint is working${NC}"
    curl -s "$BASE_URL/trpc/health" | jq '.result.data'
else
    echo -e "${RED}❌ tRPC health endpoint failed${NC}"
fi

# Test stats endpoint
echo -e "\n${YELLOW}🔍 Testing Stats Endpoint...${NC}"
if curl -s "$BASE_URL/trpc/getStats" | jq '.' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Stats endpoint is working${NC}"
    curl -s "$BASE_URL/trpc/getStats" | jq '.result.data'
else
    echo -e "${RED}❌ Stats endpoint failed${NC}"
fi

# Test document list endpoint
echo -e "\n${YELLOW}🔍 Testing Document List Endpoint...${NC}"
if curl -s "$BASE_URL/trpc/listDocuments" | jq '.' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Document list endpoint is working${NC}"
    curl -s "$BASE_URL/trpc/listDocuments" | jq '.result.data'
else
    echo -e "${RED}❌ Document list endpoint failed${NC}"
fi

# Test RAG question - Children's Code
echo -e "\n${YELLOW}🔍 Testing RAG Question - Children's Rights...${NC}"
QUESTION='{"question": "What are the rights of children under Zambian law?", "topK": 3}'
if curl -s -X POST "$BASE_URL/trpc/askQuestion" \
    -H "Content-Type: application/json" \
    -d "$QUESTION" | jq '.' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ RAG question answered successfully${NC}"
    echo "Answer preview:"
    curl -s -X POST "$BASE_URL/trpc/askQuestion" \
        -H "Content-Type: application/json" \
        -d "$QUESTION" | jq '.result.data.answer' | head -c 200
    echo "..."
    echo "Sources found:"
    curl -s -X POST "$BASE_URL/trpc/askQuestion" \
        -H "Content-Type: application/json" \
        -d "$QUESTION" | jq '.result.data.sources[].title'
else
    echo -e "${RED}❌ RAG question failed${NC}"
fi

# Test RAG question - Employment Code
echo -e "\n${YELLOW}🔍 Testing RAG Question - Employment Law...${NC}"
QUESTION='{"question": "What does the Employment Code Act regulate?", "topK": 3}'
if curl -s -X POST "$BASE_URL/trpc/askQuestion" \
    -H "Content-Type: application/json" \
    -d "$QUESTION" | jq '.' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ RAG question answered successfully${NC}"
    echo "Answer preview:"
    curl -s -X POST "$BASE_URL/trpc/askQuestion" \
        -H "Content-Type: application/json" \
        -d "$QUESTION" | jq '.result.data.answer' | head -c 200
    echo "..."
    echo "Sources found:"
    curl -s -X POST "$BASE_URL/trpc/askQuestion" \
        -H "Content-Type: application/json" \
        -d "$QUESTION" | jq '.result.data.sources[].title'
else
    echo -e "${RED}❌ RAG question failed${NC}"
fi

# Test RAG question - Companies Act
echo -e "\n${YELLOW}🔍 Testing RAG Question - Corporate Law...${NC}"
QUESTION='{"question": "What does the Companies Act govern?", "topK": 3}'
if curl -s -X POST "$BASE_URL/trpc/askQuestion" \
    -H "Content-Type: application/json" \
    -d "$QUESTION" | jq '.' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ RAG question answered successfully${NC}"
    echo "Answer preview:"
    curl -s -X POST "$BASE_URL/trpc/askQuestion" \
        -H "Content-Type: application/json" \
        -d "$QUESTION" | jq '.result.data.answer' | head -c 200
    echo "..."
    echo "Sources found:"
    curl -s -X POST "$BASE_URL/trpc/askQuestion" \
        -H "Content-Type: application/json" \
        -d "$QUESTION" | jq '.result.data.sources[].title'
else
    echo -e "${RED}❌ RAG question failed${NC}"
fi

# Test edge case - question with no relevant documents
echo -e "\n${YELLOW}🔍 Testing Edge Case - No Relevant Documents...${NC}"
QUESTION='{"question": "What is the capital of Zambia?", "topK": 3}'
if curl -s -X POST "$BASE_URL/trpc/askQuestion" \
    -H "Content-Type: application/json" \
    -d "$QUESTION" | jq '.' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Edge case handled successfully${NC}"
    SOURCES_COUNT=$(curl -s -X POST "$BASE_URL/trpc/askQuestion" \
        -H "Content-Type: application/json" \
        -d "$QUESTION" | jq '.result.data.sources | length')
    echo "Sources found: $SOURCES_COUNT"
else
    echo -e "${RED}❌ Edge case test failed${NC}"
fi

echo -e "\n${GREEN}🎉 RAG System Testing Complete!${NC}"
echo "======================================"
