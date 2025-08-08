# RAG System Quick Test Script for PowerShell
# This script tests the RAG system endpoints using PowerShell

Write-Host "🚀 Testing RAG System in Google Cloud..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Configuration
$BASE_URL = "https://api-6otymacelq-uc.a.run.app"
$HEALTH_URL = "https://health-6otymacelq-uc.a.run.app"

# Test health endpoint
Write-Host "`n🔍 Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $HEALTH_URL -Method Get
    Write-Host "✅ Health endpoint is working" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Health endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test tRPC health endpoint
Write-Host "`n🔍 Testing tRPC Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/trpc/health" -Method Get
    Write-Host "✅ tRPC health endpoint is working" -ForegroundColor Green
    $response.result.data | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ tRPC health endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test stats endpoint
Write-Host "`n🔍 Testing Stats Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/trpc/getStats" -Method Get
    Write-Host "✅ Stats endpoint is working" -ForegroundColor Green
    $response.result.data | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Stats endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test document list endpoint
Write-Host "`n🔍 Testing Document List Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/trpc/listDocuments" -Method Get
    Write-Host "✅ Document list endpoint is working" -ForegroundColor Green
    $response.result.data | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Document list endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test RAG question - Children's Code
Write-Host "`n🔍 Testing RAG Question - Childrens Rights..." -ForegroundColor Yellow
$question = @{
    question = "What are the rights of children under Zambian law?"
    topK = 3
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/trpc/askQuestion" -Method Post -Body $question -ContentType "application/json"
    Write-Host "✅ RAG question answered successfully" -ForegroundColor Green
    Write-Host "Answer preview: $($response.result.data.answer.Substring(0, [Math]::Min(200, $response.result.data.answer.Length)))..." -ForegroundColor White
    Write-Host "Sources found:" -ForegroundColor White
    $response.result.data.sources | ForEach-Object { Write-Host "  - $($_.title)" -ForegroundColor White }
} catch {
    Write-Host "❌ RAG question failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test RAG question - Employment Code
Write-Host "`n🔍 Testing RAG Question - Employment Law..." -ForegroundColor Yellow
$question = @{
    question = "What does the Employment Code Act regulate?"
    topK = 3
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/trpc/askQuestion" -Method Post -Body $question -ContentType "application/json"
    Write-Host "✅ RAG question answered successfully" -ForegroundColor Green
    Write-Host "Answer preview: $($response.result.data.answer.Substring(0, [Math]::Min(200, $response.result.data.answer.Length)))..." -ForegroundColor White
    Write-Host "Sources found:" -ForegroundColor White
    $response.result.data.sources | ForEach-Object { Write-Host "  - $($_.title)" -ForegroundColor White }
} catch {
    Write-Host "❌ RAG question failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test RAG question - Companies Act
Write-Host "`n🔍 Testing RAG Question - Corporate Law..." -ForegroundColor Yellow
$question = @{
    question = "What does the Companies Act govern?"
    topK = 3
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/trpc/askQuestion" -Method Post -Body $question -ContentType "application/json"
    Write-Host "✅ RAG question answered successfully" -ForegroundColor Green
    Write-Host "Answer preview: $($response.result.data.answer.Substring(0, [Math]::Min(200, $response.result.data.answer.Length)))..." -ForegroundColor White
    Write-Host "Sources found:" -ForegroundColor White
    $response.result.data.sources | ForEach-Object { Write-Host "  - $($_.title)" -ForegroundColor White }
} catch {
    Write-Host "❌ RAG question failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test edge case - question with no relevant documents
Write-Host "`n🔍 Testing Edge Case - No Relevant Documents..." -ForegroundColor Yellow
$question = @{
    question = "What is the capital of Zambia?"
    topK = 3
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/trpc/askQuestion" -Method Post -Body $question -ContentType "application/json"
    Write-Host "✅ Edge case handled successfully" -ForegroundColor Green
    Write-Host "Sources found: $($response.result.data.sources.Count)" -ForegroundColor White
} catch {
    Write-Host "❌ Edge case test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 RAG System Testing Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
