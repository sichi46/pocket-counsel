#!/usr/bin/env python3
"""
Test script to verify the public endpoint domain is working correctly
This tests the exact configuration that your Cloud Functions will use
"""

import os
import json
import requests
from google.auth import default
from google.auth.transport.requests import Request

def test_public_endpoint():
    """Test the public endpoint domain with findNeighbors"""
    
    # Your current configuration
    PROJECT_ID = "787651119619"
    LOCATION = "us-central1"
    ENDPOINT_ID = "4703748127021072384"
    DEPLOYED_INDEX_ID = "pocket_council_stream_depl_1756497505059"
    PUBLIC_DOMAIN = "1416637477.us-central1-787651119619.vdb.vertexai.goog"
    
    print("🚀 Testing Public Endpoint Domain")
    print(f"Project: {PROJECT_ID}")
    print(f"Location: {LOCATION}")
    print(f"Endpoint ID: {ENDPOINT_ID}")
    print(f"Deployed Index ID: {DEPLOYED_INDEX_ID}")
    print(f"Public Domain: {PUBLIC_DOMAIN}")
    print()
    
    try:
        # Get authentication credentials
        print("🔐 Getting authentication credentials...")
        credentials, project = default()
        credentials.refresh(Request())
        access_token = credentials.token
        
        print("✅ Authentication successful")
        
        # Create the API URL using the public domain
        api_url = f"https://{PUBLIC_DOMAIN}/v1/projects/{PROJECT_ID}/locations/{LOCATION}/indexEndpoints/{ENDPOINT_ID}:findNeighbors"
        
        print(f"🔍 API URL: {api_url}")
        
        # Create a test embedding (768 dimensions, all zeros for testing)
        test_embedding = [0.0] * 768
        
        # Prepare the request payload
        payload = {
            "deployedIndexId": DEPLOYED_INDEX_ID,
            "queries": [{
                "datapoint": {
                    "featureVector": test_embedding
                },
                "neighborCount": 5
            }]
        }
        
        print("📤 Sending request...")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        # Make the API call
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }
        
        response = requests.post(api_url, headers=headers, json=payload, timeout=30)
        
        print(f"📥 Response Status: {response.status_code}")
        print(f"📥 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: findNeighbors call successful!")
            result = response.json()
            print(f"Response: {json.dumps(result, indent=2)}")
            
            # Check if we got neighbors
            if 'nearestNeighbors' in result and result['nearestNeighbors']:
                neighbors = result['nearestNeighbors'][0].get('neighbors', [])
                print(f"🎯 Found {len(neighbors)} neighbors")
                for i, neighbor in enumerate(neighbors[:3]):
                    print(f"  Neighbor {i+1}: Distance={neighbor.get('distance', 'N/A')}")
            else:
                print("⚠️  No neighbors found in response")
                
            return True
        else:
            print(f"❌ FAILED: HTTP {response.status_code}")
            print(f"Error Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    success = test_public_endpoint()
    if success:
        print("\n🎉 SUCCESS: Public endpoint domain is working correctly!")
        print("Your Cloud Functions should now work without 501 errors.")
    else:
        print("\n💥 FAILED: Public endpoint domain test failed.")
        print("Check the error details above.")
