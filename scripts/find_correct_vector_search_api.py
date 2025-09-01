#!/usr/bin/env python3
"""
Comprehensive script to find the correct Vertex AI Vector Search API
"""

import requests
import json

def find_correct_vector_search_api():
    """Find the correct Vertex AI Vector Search API structure"""
    
    # Your configuration from Google Cloud console
    project_id = "787651119619"
    location = "us-central1"
    index_id = "849546455294148608"
    endpoint_id = "4703748127021072384"
    
    print("🔍 Finding the correct Vertex AI Vector Search API...")
    print(f"Project ID: {project_id}")
    print(f"Location: {location}")
    print(f"Index ID: {index_id}")
    print(f"Endpoint ID: {endpoint_id}")
    print()
    
    # Test comprehensive API structures for Vertex AI Vector Search
    test_urls = [
        # Standard Vector Search API v1
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}:query",
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}:findNeighbors",
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}:search",
        
        # Alternative Vector Search API paths
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}/queries",
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}/search",
        
        # Using the endpoint with Vector Search operations
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}:query",
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}:search",
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}:findNeighbors",
        
        # Different API versions
        f"https://{location}-aiplatform.googleapis.com/v2/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}:query",
        f"https://{location}-aiplatform.googleapis.com/v2/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}:findNeighbors",
        
        # Different regions
        f"https://us-east1-aiplatform.googleapis.com/v1/projects/{project_id}/locations/us-east1/vectorSearchIndexes/{index_id}:query",
        f"https://us-west1-aiplatform.googleapis.com/v1/projects/{project_id}/locations/us-west1/vectorSearchIndexes/{index_id}:query",
        
        # Alternative API paths
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}/deployedIndexes/{endpoint_id}:query",
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}/deployedIndexes/{endpoint_id}:findNeighbors",
        
        # Direct Vector Search without index
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearch:query",
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearch:findNeighbors",
        
        # Check if there's a different API service
        f"https://{location}-vectorsearch.googleapis.com/v1/projects/{project_id}/locations/{location}/indexes/{index_id}:query",
        f"https://{location}-vectorsearch.googleapis.com/v1/projects/{project_id}/locations/{location}/indexes/{index_id}:findNeighbors"
    ]
    
    print("Testing Vector Search API endpoints...")
    print("=" * 80)
    
    working_endpoints = []
    
    for i, url in enumerate(test_urls, 1):
        print(f"Test {i:2d}: {url}")
        
        try:
            response = requests.get(url, timeout=10)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                print(f"   ✅ SUCCESS! Endpoint exists and is accessible")
                print(f"   Response: {response.text[:200]}...")
                working_endpoints.append((url, "200", "Accessible"))
            elif response.status_code == 401:
                print(f"   🔐 401 Unauthorized - Authentication required (GOOD!)")
                working_endpoints.append((url, "401", "Exists, needs auth"))
            elif response.status_code == 403:
                print(f"   🚫 403 Forbidden - Permission denied (GOOD!)")
                working_endpoints.append((url, "403", "Exists, needs permission"))
            elif response.status_code == 405:
                print(f"   ⚠️  405 Method Not Allowed - Endpoint exists but GET not supported (GOOD!)")
                working_endpoints.append((url, "405", "Exists, POST required"))
            elif response.status_code == 404:
                print(f"   ❌ 404 Not Found - Endpoint doesn't exist")
            else:
                print(f"   ⚠️  {response.status_code} - {response.reason}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Error: {e}")
        
        print()
    
    print("=" * 80)
    print("🎯 ANALYSIS RESULTS:")
    print("=" * 80)
    
    if working_endpoints:
        print("✅ WORKING ENDPOINTS FOUND:")
        for url, status, description in working_endpoints:
            print(f"   {status}: {url}")
            print(f"   Description: {description}")
            print()
        
        print("💡 RECOMMENDATIONS:")
        print("1. Use endpoints that return 401/403/405 (these exist)")
        print("2. 401/403 means the endpoint exists and needs authentication")
        print("3. 405 means the endpoint exists but requires POST method")
        print("4. These are the correct Vector Search API endpoints for your setup")
        
    else:
        print("❌ NO WORKING ENDPOINTS FOUND")
        print("This suggests:")
        print("1. The API structure is completely different")
        print("2. There might be a regional/configuration issue")
        print("3. The Vector Search service might not be properly enabled")
        print("4. You might need to use a different approach")
    
    print("=" * 80)

if __name__ == "__main__":
    find_correct_vector_search_api()
