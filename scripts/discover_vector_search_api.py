#!/usr/bin/env python3
"""
Script to discover the correct Vector Search API structure
"""

import requests
import json

def discover_vector_search_api():
    """Discover the correct Vector Search API structure"""
    
    # Your configuration from Google Cloud console
    project_id = "787651119619"
    location = "us-central1"
    index_id = "849546455294148608"
    endpoint_id = "4703748127021072384"
    
    print("🔍 Discovering Vector Search API structure...")
    print(f"Project ID: {project_id}")
    print(f"Location: {location}")
    print(f"Index ID: {index_id}")
    print(f"Endpoint ID: {endpoint_id}")
    print()
    
    # Test different discovery approaches
    discovery_urls = [
        # Approach 1: Check if the index exists
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}",
        
        # Approach 2: Check if the endpoint exists
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}",
        
        # Approach 3: List all vector search indexes
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes",
        
        # Approach 4: List all index endpoints
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints",
        
        # Approach 5: Check if there's a different region
        f"https://us-east1-aiplatform.googleapis.com/v1/projects/{project_id}/locations/us-east1/vectorSearchIndexes/{index_id}",
        
        # Approach 6: Check if there's a different API version
        f"https://{location}-aiplatform.googleapis.com/v2/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}",
        
        # Approach 7: Check if there's a different API path
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexes/{index_id}",
        
        # Approach 8: Check if there's a different API path for vector search
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}/deployedIndexes"
    ]
    
    for i, url in enumerate(discovery_urls, 1):
        print(f"Discovery {i}: {url}")
        
        try:
            response = requests.get(url, timeout=10)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                print(f"   ✅ SUCCESS! Endpoint exists and is accessible")
                print(f"   Response: {response.text[:300]}...")
            elif response.status_code == 401:
                print(f"   🔐 401 Unauthorized - Authentication required (GOOD!)")
                print(f"   This endpoint exists and is working correctly")
            elif response.status_code == 403:
                print(f"   🚫 403 Forbidden - Permission denied (GOOD!)")
                print(f"   This endpoint exists and is working correctly")
            elif response.status_code == 404:
                print(f"   ❌ 404 Not Found - Endpoint doesn't exist")
            else:
                print(f"   ⚠️  {response.status_code} - {response.reason}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Error: {e}")
        
        print()
    
    print("🎯 Analysis:")
    print("- 200: Endpoint exists and is accessible")
    print("- 401/403: Endpoint exists but needs authentication/permission (GOOD!)")
    print("- 404: Endpoint doesn't exist")
    print()
    print("💡 Next Steps:")
    print("1. Find which endpoints return 401/403 (these exist)")
    print("2. Use those endpoints with proper authentication")
    print("3. Check the response structure for the correct API format")

if __name__ == "__main__":
    discover_vector_search_api()
