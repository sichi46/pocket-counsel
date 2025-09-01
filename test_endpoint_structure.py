#!/usr/bin/env python3
"""
Test script to verify the correct Vertex AI Vector Search endpoint structure
"""

import requests
import json

def test_endpoint_structure():
    """Test different endpoint URL structures to find the correct one"""
    
    # Your configuration from Google Cloud console
    project_id = "787651119619"
    location = "us-central1"
    endpoint_id = "4703748127021072384"
    index_id = "849546455294148608"
    deployed_index_id = "pocket_council_stream_depl_1756497505059"
    
    # Test different URL structures
    test_urls = [
        # Structure 1: Using deployed index
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}/deployedIndexes/{deployed_index_id}:findNeighbors",
        
        # Structure 2: Using index directly
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}/indexes/{index_id}:findNeighbors",
        
        # Structure 3: Using matching engine format
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexes/{index_id}:findNeighbors",
        
        # Structure 4: Using vector search format
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}:findNeighbors"
    ]
    
    print("🔍 Testing different Vertex AI Vector Search endpoint structures...")
    print(f"Project ID: {project_id}")
    print(f"Location: {location}")
    print(f"Endpoint ID: {endpoint_id}")
    print(f"Index ID: {index_id}")
    print(f"Deployed Index ID: {deployed_index_id}")
    print()
    
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
                print(f"   🔐 401 Unauthorized - Authentication required")
            elif response.status_code == 403:
                print(f"   🚫 403 Forbidden - Permission denied")
            else:
                print(f"   ⚠️  {response.status_code} - {response.reason}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Error: {e}")
        
        print()
    
    print("🎯 Recommendation:")
    print("The endpoint that returns 200 or 401 is likely the correct one.")
    print("If you get 401, it means the endpoint exists but needs authentication.")
    print("If you get 404, the endpoint structure is incorrect.")

if __name__ == "__main__":
    test_endpoint_structure()
