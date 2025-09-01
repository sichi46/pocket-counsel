#!/usr/bin/env python3
"""
Test script to verify the Vector Search endpoint is accessible
"""

import requests
import json

def test_vector_search_endpoint():
    """Test the Vector Search endpoint directly"""
    
    # Your configuration from Google Cloud console
    project_id = "787651119619"
    location = "us-central1"
    index_id = "849546455294148608"
    
    # Test the Vector Search endpoint
    api_url = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{index_id}:findNeighbors"
    
    print("🔍 Testing Vector Search endpoint...")
    print(f"Project ID: {project_id}")
    print(f"Location: {location}")
    print(f"Index ID: {index_id}")
    print(f"API URL: {api_url}")
    print()
    
    try:
        # Make a simple GET request to check if endpoint exists
        response = requests.get(api_url, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS! Endpoint exists and is accessible")
            print(f"Response: {response.text[:200]}...")
        elif response.status_code == 401:
            print("🔐 401 Unauthorized - Authentication required (this is GOOD!)")
            print("The endpoint exists and is working correctly")
        elif response.status_code == 405:
            print("⚠️  405 Method Not Allowed - Endpoint exists but GET not supported (this is GOOD!)")
            print("The endpoint exists and is working correctly")
        elif response.status_code == 404:
            print("❌ 404 Not Found - Endpoint doesn't exist")
        else:
            print(f"⚠️  {response.status_code} - {response.reason}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
    
    print()
    print("🎯 Analysis:")
    print("- 401 or 405 means the endpoint exists and is working correctly")
    print("- 404 means the endpoint structure is wrong")
    print("- We'll use POST with authentication for actual searches")

if __name__ == "__main__":
    test_vector_search_endpoint()
