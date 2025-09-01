#!/usr/bin/env python3
"""
Test script for Vertex AI Vector Search API
This script helps diagnose the 501 Not Implemented error by testing the API endpoint directly.
"""

import os
import json
import requests
from google.auth import default
from google.auth.transport.requests import Request

def get_access_token():
    """Get access token for Google Cloud API calls."""
    try:
        credentials, project = default()
        credentials.refresh(Request())
        return credentials.token
    except Exception as e:
        print(f"❌ Failed to get access token: {e}")
        return None

def test_vector_search_endpoint():
    """Test the Vertex AI Vector Search endpoint directly."""
    
    # Configuration from your environment
    project_id = "787651119619"
    location = "us-central1"
    endpoint_id = "8138815966239784960"
    deployed_index_id = "pocket_counsel_staging"
    
    # Get access token
    access_token = get_access_token()
    if not access_token:
        print("❌ Cannot proceed without access token")
        return
    
    # Test endpoint URL
    api_url = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}/deployedIndexes/{deployed_index_id}:findNeighbors"
    
    print(f"🔍 Testing Vertex AI Vector Search API endpoint...")
    print(f"📍 Project ID: {project_id}")
    print(f"📍 Location: {location}")
    print(f"📍 Endpoint ID: {endpoint_id}")
    print(f"📍 Deployed Index ID: {deployed_index_id}")
    print(f"🔗 API URL: {api_url}")
    print()
    
    # Test 1: Check if endpoint exists
    print("🧪 Test 1: Checking endpoint availability...")
    try:
        # First, let's check if the endpoint exists
        endpoint_url = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}"
        headers = {"Authorization": f"Bearer {access_token}"}
        
        response = requests.get(endpoint_url, headers=headers)
        if response.status_code == 200:
            endpoint_data = response.json()
            print(f"✅ Endpoint exists and is accessible")
            print(f"   - Display Name: {endpoint_data.get('displayName', 'N/A')}")
            print(f"   - State: {endpoint_data.get('state', 'N/A')}")
            print(f"   - Create Time: {endpoint_data.get('createTime', 'N/A')}")
        else:
            print(f"❌ Endpoint check failed: {response.status_code} {response.text}")
            return
    except Exception as e:
        print(f"❌ Endpoint check error: {e}")
        return
    
    print()
    
    # Test 2: Check deployed indexes
    print("🧪 Test 2: Checking deployed indexes...")
    try:
        deployed_indexes_url = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}/deployedIndexes"
        response = requests.get(deployed_indexes_url, headers=headers)
        
        if response.status_code == 200:
            deployed_indexes = response.json()
            print(f"✅ Found {len(deployed_indexes.get('deployedIndexes', []))} deployed indexes")
            for idx in deployed_indexes.get('deployedIndexes', []):
                print(f"   - ID: {idx.get('id', 'N/A')}")
                print(f"   - Display Name: {idx.get('displayName', 'N/A')}")
                print(f"   - State: {idx.get('state', 'N/A')}")
                print(f"   - Index: {idx.get('index', 'N/A')}")
                print()
        else:
            print(f"❌ Deployed indexes check failed: {response.status_code} {response.text}")
    except Exception as e:
        print(f"❌ Deployed indexes check error: {e}")
    
    print()
    
    # Test 3: Test findNeighbors operation
    print("🧪 Test 3: Testing findNeighbors operation...")
    
    # Create a dummy embedding (768 dimensions for text-embedding-004)
    dummy_embedding = [0.1] * 768
    
    search_request = {
        "deployedIndexId": deployed_index_id,
        "queries": [{
            "datapoint": {
                "datapointId": f"test_query_{int(__import__('time').time())}",
                "featureVector": dummy_embedding,
            },
            "neighborCount": 5,
        }],
    }
    
    print(f"📤 Request payload:")
    print(json.dumps(search_request, indent=2))
    print()
    
    try:
        response = requests.post(
            api_url,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}",
            },
            json=search_request,
            timeout=30
        )
        
        print(f"📥 Response Status: {response.status_code}")
        print(f"📥 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ findNeighbors operation successful!")
            result = response.json()
            print(f"📊 Results: {json.dumps(result, indent=2)}")
        else:
            print(f"❌ findNeighbors operation failed")
            print(f"📄 Error Response: {response.text}")
            
            # Try to parse error details
            try:
                error_data = response.json()
                if 'error' in error_data:
                    print(f"🚨 Error Code: {error_data['error'].get('code', 'N/A')}")
                    print(f"🚨 Error Message: {error_data['error'].get('message', 'N/A')}")
                    print(f"🚨 Error Status: {error_data['error'].get('status', 'N/A')}")
            except:
                pass
                
    except Exception as e:
        print(f"❌ findNeighbors test error: {e}")
    
    print()
    
    # Test 4: Check API discovery
    print("🧪 Test 4: Checking API discovery...")
    try:
        discovery_url = f"https://{location}-aiplatform.googleapis.com/$discovery/rest?version=v1"
        response = requests.get(discovery_url)
        
        if response.status_code == 200:
            discovery_data = response.json()
            print(f"✅ API discovery successful")
            print(f"   - API Name: {discovery_data.get('name', 'N/A')}")
            print(f"   - API Version: {discovery_data.get('version', 'N/A')}")
            
            # Check if findNeighbors is in the API
            if 'resources' in discovery_data:
                for resource_name, resource in discovery_data['resources'].items():
                    if 'methods' in resource:
                        for method_name, method in resource['methods'].items():
                            if 'findNeighbors' in method_name:
                                print(f"   - Found method: {resource_name}.{method_name}")
        else:
            print(f"❌ API discovery failed: {response.status_code}")
    except Exception as e:
        print(f"❌ API discovery error: {e}")

def generate_curl_command():
    """Generate a curl command for manual testing."""
    project_id = "787651119619"
    location = "us-central1"
    endpoint_id = "8138815966239784960"
    deployed_index_id = "pocket_counsel_staging"
    
    print("🔧 Manual Testing with curl")
    print("=" * 50)
    print()
    print("1. First, get an access token:")
    print("   gcloud auth print-access-token")
    print()
    print("2. Then test the API endpoint:")
    print(f"   curl -X POST \\")
    print(f"     -H 'Content-Type: application/json' \\")
    print(f"     -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \\")
    print(f"     -d '{{\"deployedIndexId\": \"{deployed_index_id}\", \"queries\": [{{\"datapoint\": {{\"datapointId\": \"test_query\", \"featureVector\": [0.1, 0.1, 0.1]}}, \"neighborCount\": 5}}]}}' \\")
    print(f"     'https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}/deployedIndexes/{deployed_index_id}:findNeighbors'")
    print()
    print("3. Test endpoint availability:")
    print(f"   curl -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \\")
    print(f"     'https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}'")
    print()
    print("4. Check deployed indexes:")
    print(f"   curl -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \\")
    print(f"     'https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}/deployedIndexes'")

if __name__ == "__main__":
    print("🚀 Vertex AI Vector Search API Diagnostic Tool")
    print("=" * 60)
    print()
    
    # Run tests
    test_vector_search_endpoint()
    
    print()
    print("=" * 60)
    
    # Generate curl commands
    generate_curl_command()
