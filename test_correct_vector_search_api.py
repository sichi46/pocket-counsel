#!/usr/bin/env python3
"""
Test script to find the correct Vector Search API format
"""

import requests
import json

def test_vector_search_api_formats():
    """Test different Vector Search API formats"""
    
    # Your configuration from Google Cloud console
    project_id = "787651119619"
    location = "us-central1"
    index_id = "849546455294148608"
    endpoint_id = "4703748127021072384"
    
    print("🔍 Testing different Vector Search API formats...")
    print(f"Project ID: {project_id}")
    print(f"Location: {location}")
    print(f"Index ID: {index_id}")
    print(f"Endpoint ID: {endpoint_id}")
    print()
    
    # Test different API formats based on Google Cloud documentation
    test_urls = [
        # Format 1: Direct Vector Search (most likely)
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}:query",
        
        # Format 2: Vector Search with findNeighbors
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}:findNeighbors",
        
        # Format 3: Using the endpoint
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}:query",
        
        # Format 4: Using the endpoint with findNeighbors
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}:findNeighbors",
        
        # Format 5: Direct index access
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexes/{index_id}:findNeighbors",
        
        # Format 6: Vector Search discovery
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}"
    ]
    
    for i, url in enumerate(test_urls, 1):
        print(f"Test {i}: {url}")
        
        try:
            response = requests.get(url, timeout=10)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                print(f"   ✅ SUCCESS! Endpoint exists and is accessible")
                print(f"   Response: {response.text[:200]}...")
            elif response.status_code == 401:
                print(f"   🔐 401 Unauthorized - Authentication required (GOOD!)")
            elif response.status_code == 405:
                print(f"   ⚠️  405 Method Not Allowed - Endpoint exists but GET not supported (GOOD!)")
            elif response.status_code == 404:
                print(f"   ❌ 404 Not Found - Endpoint doesn't exist")
            else:
                print(f"   ⚠️  {response.status_code} - {response.reason}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Error: {e}")
        
        print()
    
    print("🎯 Analysis:")
    print("- 401 or 405 means the endpoint exists and is working correctly")
    print("- 404 means the endpoint structure is wrong")
    print("- We need to find the correct endpoint before deploying")

if __name__ == "__main__":
    test_vector_search_api_formats()
