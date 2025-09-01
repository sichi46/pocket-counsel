#!/usr/bin/env python3
"""
Test script to verify findNeighbors functionality using REST API
"""

import requests
import json
from google.auth import default
from google.auth.transport.requests import Request

def test_findneighbors_rest():
    """Test findNeighbors using REST API"""
    try:
        # Configuration
        PROJECT_ID = "787651119619"
        LOCATION = "us-central1"
        ENDPOINT_ID = "4703748127021072384"
        DEPLOYED_INDEX_ID = "pocket_council_stream_optimized_v1"
        PUBLIC_DOMAIN = "1416637477.us-central1-787651119619.vdb.vertexai.goog"
        
        print(f"🔍 Testing findNeighbors with REST API")
        print(f"📍 Project: {PROJECT_ID}")
        print(f"📍 Location: {LOCATION}")
        print(f"📍 Endpoint: {ENDPOINT_ID}")
        print(f"📍 Deployed Index: {DEPLOYED_INDEX_ID}")
        print(f"📍 Public Domain: {PUBLIC_DOMAIN}")
        
        # Get authentication token
        print("🔐 Getting authentication token...")
        credentials, project = default()
        credentials.refresh(Request())
        access_token = credentials.token
        print("✅ Authentication token obtained")
        
        # Test query
        test_query = "how many leave days in a year is an employee entitled to"
        print(f"🔍 Testing query: {test_query}")
        
        # Create a simple test embedding (768 dimensions of zeros for testing)
        test_embedding = [0.0] * 768
        print(f"📊 Using test embedding: {len(test_embedding)} dimensions")
        
        # Prepare the request
        api_url = f"https://{PUBLIC_DOMAIN}/v1/projects/{PROJECT_ID}/locations/{LOCATION}/indexEndpoints/{ENDPOINT_ID}:findNeighbors"
        
        payload = {
            "deployedIndexId": DEPLOYED_INDEX_ID,
            "queries": [{
                "datapoint": {
                    "featureVector": test_embedding
                },
                "neighborCount": 15
            }]
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }
        
        print(f"🔍 Making request to: {api_url}")
        print(f"📤 Request payload: {json.dumps(payload, indent=2)}")
        
        # Make the request
        response = requests.post(api_url, headers=headers, json=payload, timeout=30)
        
        print(f"📥 Response status: {response.status_code}")
        print(f"📥 Response headers: {dict(response.headers)}")
        
        if response.ok:
            print("✅ findNeighbors request successful!")
            response_data = response.json()
            print(f"📊 Response data: {json.dumps(response_data, indent=2)}")
            
            # Parse the response
            if 'nearestNeighbors' in response_data:
                for i, query_result in enumerate(response_data['nearestNeighbors']):
                    print(f"\n🔍 Query {i + 1} results:")
                    neighbors = query_result.get('neighbors', [])
                    print(f"   Found {len(neighbors)} neighbors")
                    
                    for j, neighbor in enumerate(neighbors[:5]):  # Show first 5
                        print(f"   Neighbor {j + 1}:")
                        print(f"     ID: {neighbor.get('datapoint', {}).get('datapointId', 'Unknown')}")
                        print(f"     Distance: {neighbor.get('distance', 'Unknown')}")
            
            return True
        else:
            print(f"❌ findNeighbors request failed: {response.status_code}")
            print(f"Error response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing findNeighbors: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    print("🚀 Testing findNeighbors with REST API...")
    success = test_findneighbors_rest()
    
    if success:
        print("\n🎉 findNeighbors test completed successfully!")
    else:
        print("\n❌ findNeighbors test failed!")
