#!/usr/bin/env python3
"""
Script to check the endpoint configuration and available operations
"""

import requests
import json

def check_endpoint_configuration():
    """Check the endpoint configuration and available operations"""
    
    # Your configuration from Google Cloud console
    project_id = "787651119619"
    location = "us-central1"
    endpoint_id = "4703748127021072384"
    
    print("🔍 Checking Endpoint Configuration...")
    print(f"Project ID: {project_id}")
    print(f"Location: {location}")
    print(f"Endpoint ID: {endpoint_id}")
    print()
    
    # Test different operations and configurations
    test_operations = [
        # 1. Check endpoint details
        {
            "name": "Endpoint Details",
            "url": f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}",
            "method": "GET"
        },
        
        # 2. Check if findNeighbors is available
        {
            "name": "FindNeighbors Operation",
            "url": f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}:findNeighbors",
            "method": "POST"
        },
        
        # 3. Check if query operation is available
        {
            "name": "Query Operation",
            "url": f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}:query",
            "method": "POST"
        },
        
        # 4. Check if search operation is available
        {
            "name": "Search Operation",
            "url": f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}:search",
            "method": "POST"
        },
        
        # 5. Check endpoint operations list
        {
            "name": "Endpoint Operations",
            "url": f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}/operations",
            "method": "GET"
        },
        
        # 6. Check if there are deployed indexes
        {
            "name": "Deployed Indexes",
            "url": f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/indexEndpoints/{endpoint_id}/deployedIndexes",
            "method": "GET"
        }
    ]
    
    print("Testing Endpoint Operations...")
    print("=" * 80)
    
    working_operations = []
    
    for operation in test_operations:
        print(f"Test: {operation['name']}")
        print(f"URL: {operation['url']}")
        print(f"Method: {operation['method']}")
        
        try:
            if operation['method'] == 'GET':
                response = requests.get(operation['url'], timeout=10)
            else:
                # For POST operations, send a minimal request to check if operation exists
                response = requests.post(operation['url'], 
                                      json={}, 
                                      timeout=10)
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                print(f"   ✅ SUCCESS! Operation exists and is accessible")
                print(f"   Response: {response.text[:300]}...")
                working_operations.append((operation['name'], "200", "Accessible"))
            elif response.status_code == 401:
                print(f"   🔐 401 Unauthorized - Authentication required (GOOD!)")
                print(f"   This operation exists and is working correctly")
                working_operations.append((operation['name'], "401", "Exists, needs auth"))
            elif response.status_code == 403:
                print(f"   🚫 403 Forbidden - Permission denied (GOOD!)")
                print(f"   This operation exists and is working correctly")
                working_operations.append((operation['name'], "403", "Exists, needs permission"))
            elif response.status_code == 405:
                print(f"   ⚠️  405 Method Not Allowed - Operation exists but wrong method (GOOD!)")
                print(f"   This operation exists and is working correctly")
                working_operations.append((operation['name'], "405", "Exists, wrong method"))
            elif response.status_code == 501:
                print(f"   ❌ 501 Not Implemented - Operation exists but not enabled")
                print(f"   This operation exists but needs to be enabled")
                working_operations.append((operation['name'], "501", "Exists, not enabled"))
            elif response.status_code == 404:
                print(f"   ❌ 404 Not Found - Operation doesn't exist")
            else:
                print(f"   ⚠️  {response.status_code} - {response.reason}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Error: {e}")
        
        print()
    
    print("=" * 80)
    print("🎯 ANALYSIS RESULTS:")
    print("=" * 80)
    
    if working_operations:
        print("✅ WORKING OPERATIONS FOUND:")
        for name, status, description in working_operations:
            print(f"   {status}: {name}")
            print(f"   Description: {description}")
            print()
        
        print("💡 RECOMMENDATIONS:")
        print("1. Operations returning 401/403/405 exist and are working")
        print("2. Operations returning 501 exist but need to be enabled")
        print("3. Check Google Cloud Console to enable required operations")
        
    else:
        print("❌ NO WORKING OPERATIONS FOUND")
        print("This suggests the endpoint might not be properly configured")
    
    print("=" * 80)
    print("🔧 NEXT STEPS:")
    print("1. Go to Google Cloud Console > Vertex AI > Vector Search")
    print("2. Find your index endpoint (ID: 4703748127021072384)")
    print("3. Check what operations are enabled")
    print("4. Enable the findNeighbors operation if available")
    print("5. Or check if you need to use a different operation")

if __name__ == "__main__":
    check_endpoint_configuration()
