#!/usr/bin/env python3
"""
Pocket Counsel RAG API Diagnostic Script
Tests the live Cloud Function API to identify where the failure is occurring.
"""

import requests
import json
import time
from datetime import datetime

# Configuration - Update these with your actual values
BASE_URL = "https://pocket-counsel-api-787651119619.us-central1.run.app"
ENDPOINTS = [
    "/",
    "/health",
    "/trpc",
    "/api",
    "/query",
    "/rag",
    "/chat"
]
SAMPLE_QUERIES = [
    "what is the minimum wage in Zambia?",
    "what are the rights of children under Zambian law?",
    "how do I register a business in Zambia?"
]

def test_api_endpoints():
    """Test all possible API endpoints"""
    print("🔍 Pocket Counsel RAG API Endpoint Discovery")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'PocketCounsel-Diagnostic/1.0'
    }
    
    # Test 1: Health endpoint (should work)
    print("🏥 Testing Health Endpoint")
    print("-" * 40)
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        print(f"✅ Health check: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
    print()
    
    # Test 2: Test all endpoints with GET
    print("🔍 Testing All Endpoints (GET)")
    print("-" * 40)
    for endpoint in ENDPOINTS:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            print(f"✅ {endpoint}: {response.status_code} - {response.text[:100]}...")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")
    print()
    
    # Test 3: Test POST to all endpoints
    print("📝 Testing All Endpoints (POST)")
    print("-" * 40)
    payload = {
        "query": "what is the minimum wage in Zambia?",
        "timestamp": datetime.now().isoformat()
    }
    
    for endpoint in ENDPOINTS:
        try:
            response = requests.post(f"{BASE_URL}{endpoint}", headers=headers, json=payload, timeout=30)
            print(f"✅ {endpoint}: {response.status_code}")
            if response.status_code == 200:
                print(f"   📄 Response: {response.text[:200]}...")
            elif response.status_code == 404:
                print(f"   ❌ Not Found")
            else:
                print(f"   📊 Status: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")
    print()
    
    print("=" * 60)
    print("🔍 Next Steps:")
    print("1. Check which endpoints are working")
    print("2. Update frontend to use the correct endpoint")
    print("3. Check Cloud Function logs for routing information")
    print("4. Verify the API route configuration")

def generate_curl_commands():
    """Generate curl commands for manual testing"""
    print("\n🔄 Manual Testing with curl")
    print("=" * 50)
    
    for query in SAMPLE_QUERIES:
        # Escape quotes for shell
        escaped_query = query.replace('"', '\\"')
        curl_cmd = f'''curl -X POST "{BASE_URL}/trpc" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{{"query": "{escaped_query}"}}' \\
  -v'''
        
        print(f"📝 Test Query: {query}")
        print("💻 curl command:")
        print(curl_cmd)
        print()

if __name__ == "__main__":
    test_api_endpoints()
    generate_curl_commands()
