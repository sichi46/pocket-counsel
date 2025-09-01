#!/usr/bin/env python3
"""
Test script to verify the correct Vertex AI Vector Search API format
"""

import requests
import json

def test_vector_search_api():
    """Test the correct Vector Search API format"""
    
    # Your configuration from Google Cloud console
    project_id = "787651119619"
    location = "us-central1"
    endpoint_id = "4703748127021072384"
    index_id = "849546455294148608"
    
    print("🔍 Testing Vertex AI Vector Search API formats...")
    print(f"Project ID: {project_id}")
    print(f"Location: {location}")
    print(f"Endpoint ID: {endpoint_id}")
    print(f"Index ID: {index_id}")
    print()
    
    # Test different API formats
    test_urls = [
        # Format 1: Vector Search API (recommended)
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}:findNeighbors",
        
        # Format 2: Matching Engine API (legacy)
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexes/{index_id}:findNeighbors",
        
        # Format 3: Index Endpoints API
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}:findNeighbors",
        
        # Format 4: Direct Vector Search
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}:query"
    ]
    
    for i, url in enumerate(test_urls, 1):
        print(f"Test {i}: {url}")
        
        try:
            # Make a simple GET request to check if endpoint exists
            response = requests.get(url, timeout=10)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                print(f"   ✅ SUCCESS! Endpoint exists and is accessible")
                print(f"   Response: {response.text[:200]}...")
            elif response.status_code == 404:
                print(f"   ❌ 404 Not Found - Endpoint doesn't exist")
            elif response.status_code == 401:
                print(f"   🔐 401 Unauthorized - Authentication required (this is good!)")
            elif response.status_code == 403:
                print(f"   🚫 403 Forbidden - Permission denied")
            elif response.status_code == 405:
                print(f"   ⚠️  405 Method Not Allowed - Endpoint exists but GET not supported")
            else:
                print(f"   ⚠️  {response.status_code} - {response.reason}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Error: {e}")
        
        print()
    
    print("🎯 Analysis:")
    print("- If you get 401: Endpoint exists but needs authentication (GOOD)")
    print("- If you get 405: Endpoint exists but GET not supported (GOOD)")
    print("- If you get 404: Endpoint structure is incorrect")
    print()
    print("💡 Next Steps:")
    print("1. The endpoint that returns 401 or 405 is the correct one")
    print("2. We'll need to use POST with proper authentication")
    print("3. The request body format may be different for Vector Search")

if __name__ == "__main__":
    test_vector_search_api()
