#!/usr/bin/env python3
"""
Simple test script to verify Vertex AI endpoint accessibility
"""

import requests
import json

def test_endpoint_access():
    """Test basic endpoint access without authentication."""
    
    project_id = "787651119619"
    location = "us-central1"
    endpoint_id = "8138815966239784960"
    
    print("🔍 Testing Vertex AI Endpoint Access")
    print("=" * 50)
    
    # Test 1: Check if the endpoint URL is accessible
    endpoint_url = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}"
    
    print(f"📍 Testing endpoint: {endpoint_url}")
    
    try:
        # This will fail with 401 (unauthorized) but confirms the endpoint exists
        response = requests.get(endpoint_url, timeout=10)
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 401:
            print("✅ Endpoint exists (401 Unauthorized is expected without auth)")
        elif response.status_code == 404:
            print("❌ Endpoint not found - check endpoint ID")
        elif response.status_code == 403:
            print("❌ Endpoint exists but access forbidden - check permissions")
        else:
            print(f"📄 Response: {response.text[:200]}...")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    
    print()
    
    # Test 2: Check API discovery
    print("🔍 Testing API Discovery")
    discovery_url = f"https://{location}-aiplatform.googleapis.com/$discovery/rest?version=v1"
    
    try:
        response = requests.get(discovery_url, timeout=10)
        if response.status_code == 200:
            print("✅ API discovery endpoint accessible")
            discovery_data = response.json()
            print(f"   - API Name: {discovery_data.get('name', 'N/A')}")
            print(f"   - API Version: {discovery_data.get('version', 'N/A')}")
        else:
            print(f"❌ API discovery failed: {response.status_code}")
    except Exception as e:
        print(f"❌ API discovery error: {e}")
    
    print()
    
    # Test 3: Generate curl commands for manual testing
    print("🔧 Manual Testing Commands")
    print("=" * 30)
    print()
    print("1. Get access token:")
    print("   gcloud auth print-access-token")
    print()
    print("2. Test endpoint (replace YOUR_TOKEN):")
    print(f"   curl -H 'Authorization: Bearer YOUR_TOKEN' \\")
    print(f"     '{endpoint_url}'")
    print()
    print("3. Test deployed indexes:")
    deployed_indexes_url = f"{endpoint_url}/deployedIndexes"
    print(f"   curl -H 'Authorization: Bearer YOUR_TOKEN' \\")
    print(f"     '{deployed_indexes_url}'")
    print()
    print("4. Test findNeighbors (replace YOUR_TOKEN and use proper embedding):")
    find_neighbors_url = f"{endpoint_url}/deployedIndexes/pocket_counsel_staging:findNeighbors"
    print(f"   curl -X POST \\")
    print(f"     -H 'Content-Type: application/json' \\")
    print(f"     -H 'Authorization: Bearer YOUR_TOKEN' \\")
    print(f"     -d '{{\"deployedIndexId\": \"pocket_counsel_staging\", \"queries\": [{{\"datapoint\": {{\"datapointId\": \"test\", \"featureVector\": [0.1, 0.1, 0.1, 0.1, 0.1]}}, \"neighborCount\": 5}}]}}' \\")
    print(f"     '{find_neighbors_url}'")

if __name__ == "__main__":
    test_endpoint_access()
