import requests
import json
import subprocess
import sys

def get_gcloud_token():
    """Get access token from gcloud CLI"""
    try:
        result = subprocess.run(['gcloud', 'auth', 'print-access-token'], 
                              capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ gcloud CLI not found or not authenticated")
        print("Please run: gcloud auth login")
        return None

def test_vertex_ai_endpoints():
    """Test different Vertex AI endpoints to find working ones"""
    
    project_id = "787651119619"
    location = "us-central1"
    endpoint_id = "4703748127021072384"
    deployed_index_id = "pocket_council_stream_depl_1756497505059"
    
    token = get_gcloud_token()
    if not token:
        return
    
    print(f"🔍 Testing Vertex AI endpoints for project: {project_id}")
    print(f"📍 Location: {location}")
    print(f"🔗 Endpoint ID: {endpoint_id}")
    print(f"📊 Deployed Index ID: {deployed_index_id}")
    print("=" * 80)
    
    # Test different endpoint combinations
    test_cases = [
        {
            "name": "findNeighbors (current)",
            "url": f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}:findNeighbors",
            "method": "POST",
            "body": {
                "deployedIndexId": deployed_index_id,
                "queries": [{
                    "datapoint": {
                        "featureVector": [0.1] * 768
                    },
                    "neighborCount": 1
                }]
            }
        },
        {
            "name": "query (alternative)",
            "url": f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}:query",
            "method": "POST",
            "body": {
                "deployedIndexId": deployed_index_id,
                "queries": [{
                    "datapoint": {
                        "featureVector": [0.1] * 768
                    },
                    "neighborCount": 1
                }]
            }
        },
        {
            "name": "search (alternative)",
            "url": f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}:search",
            "method": "POST",
            "body": {
                "deployedIndexId": deployed_index_id,
                "queries": [{
                    "datapoint": {
                        "featureVector": [0.1] * 768
                    },
                    "neighborCount": 1
                }]
            }
        },
        {
            "name": "findNeighbors with index ID",
            "url": f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexes/{deployed_index_id}:findNeighbors",
            "method": "POST",
            "body": {
                "queries": [{
                    "datapoint": {
                        "featureVector": [0.1] * 768
                    },
                    "neighborCount": 1
                }]
            }
        },
        {
            "name": "vectorSearch (new API)",
            "url": f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/vectorSearchIndexes/{deployed_index_id}:findNeighbors",
            "method": "POST",
            "body": {
                "queries": [{
                    "datapoint": {
                        "featureVector": [0.1] * 768
                    },
                    "neighborCount": 1
                }]
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"\n🧪 Testing: {test_case['name']}")
        print(f"🔗 URL: {test_case['url']}")
        
        try:
            response = requests.post(
                test_case['url'],
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {token}'
                },
                json=test_case['body'],
                timeout=30
            )
            
            print(f"📊 Status: {response.status_code} {response.reason}")
            
            if response.status_code == 200:
                print("✅ SUCCESS! This endpoint works!")
                try:
                    result = response.json()
                    print(f"📋 Response keys: {list(result.keys())}")
                    if 'nearestNeighbors' in result:
                        print(f"🔍 Found {len(result['nearestNeighbors'])} neighbor groups")
                except:
                    print("📋 Response is not JSON")
                    
            elif response.status_code == 401:
                print("🔒 Unauthorized - Check authentication")
            elif response.status_code == 403:
                print("🚫 Forbidden - Check permissions")
            elif response.status_code == 404:
                print("❌ Not Found - Endpoint doesn't exist")
            elif response.status_code == 501:
                print("🚫 Not Implemented - Operation not supported")
            else:
                print(f"⚠️ Unexpected status: {response.status_code}")
                try:
                    error_data = response.json()
                    if 'error' in error_data:
                        print(f"📋 Error: {error_data['error'].get('message', 'Unknown error')}")
                except:
                    print(f"📋 Response: {response.text[:200]}...")
                    
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
        
        print("-" * 60)

if __name__ == "__main__":
    test_vertex_ai_endpoints()
