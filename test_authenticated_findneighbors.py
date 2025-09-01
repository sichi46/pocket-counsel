#!/usr/bin/env python3
"""
Test findNeighbors operation with proper authentication to see exact error
"""

import requests
import json
import subprocess
import sys

def get_gcloud_token():
    """Get access token from gcloud"""
    try:
        result = subprocess.run(['gcloud', 'auth', 'print-access-token'], 
                              capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        print("❌ Failed to get gcloud token. Please run: gcloud auth login")
        return None
    except FileNotFoundError:
        print("❌ gcloud not found. Please install Google Cloud SDK")
        return None

def test_authenticated_findneighbors():
    """Test findNeighbors with proper authentication"""
    
    # Your configuration
    project_id = "787651119619"
    location = "us-central1"
    endpoint_id = "4703748127021072384"
    deployed_index_id = "pocket_council_stream_depl_1756497505059"
    
    print("🔍 Testing Authenticated FindNeighbors Operation...")
    print(f"Project ID: {project_id}")
    print(f"Location: {location}")
    print(f"Endpoint ID: {endpoint_id}")
    print(f"Deployed Index ID: {deployed_index_id}")
    print()
    
    # Get authentication token
    print("🔐 Getting authentication token...")
    token = get_gcloud_token()
    if not token:
        return
    
    print("✅ Token obtained successfully")
    print()
    
    # Test URL
    api_url = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}:findNeighbors"
    
    # Create a minimal test request (similar to what your code sends)
    test_request = {
        "deployedIndexId": deployed_index_id,
        "queries": [{
            "datapoint": {
                "featureVector": [0.1] * 768  # 768-dimensional test vector
            },
            "neighborCount": 1
        }]
    }
    
    print("🔍 Making authenticated API call...")
    print(f"URL: {api_url}")
    print(f"Request: {json.dumps(test_request, indent=2)}")
    print()
    
    try:
        response = requests.post(
            api_url,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            },
            json=test_request,
            timeout=30
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print()
        
        if response.status_code == 200:
            print("✅ SUCCESS! Operation worked with authentication")
            print(f"Response: {response.text[:500]}...")
        else:
            print(f"❌ Operation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
            # Try to parse error details
            try:
                error_data = response.json()
                if 'error' in error_data:
                    print(f"\n🔍 Error Details:")
                    print(f"Code: {error_data['error'].get('code')}")
                    print(f"Message: {error_data['error'].get('message')}")
                    print(f"Status: {error_data['error'].get('status')}")
            except:
                pass
                
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    
    print()
    print("🎯 Analysis:")
    print("- 200: Operation works with authentication")
    print("- 401: Still authentication issues")
    print("- 403: Permission denied")
    print("- 501: Operation not implemented/enabled")
    print("- Other: Different issue")

if __name__ == "__main__":
    test_authenticated_findneighbors()
