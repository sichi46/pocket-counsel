#!/usr/bin/env python3
"""
Simple test script to verify findNeighbors is working
Uses your current configuration:
- Index ID: 849546455294148608
- Endpoint ID: 4703748127021072384  
- Deployed Index ID: pocket-council-stream-deploy
"""

import os
import json
from google.cloud import aiplatform
from google.auth import default

def test_findneighbors():
    """Test findNeighbors with your current configuration"""
    
    # Your current configuration
    PROJECT_ID = "pocket-counsel"
    LOCATION = "us-central1"
    INDEX_ENDPOINT_ID = "4703748127021072384"
    DEPLOYED_INDEX_ID = "pocket_council_stream_depl_1756497505059"
    
    print("🚀 Testing findNeighbors with your current configuration")
    print(f"Project: {PROJECT_ID}")
    print(f"Location: {LOCATION}")
    print(f"Endpoint ID: {INDEX_ENDPOINT_ID}")
    print(f"Deployed Index ID: {DEPLOYED_INDEX_ID}")
    print()
    
    try:
        # Initialize Vertex AI
        aiplatform.init(project=PROJECT_ID, location=LOCATION)
        
        # Get the index endpoint
        index_endpoint = aiplatform.MatchingEngineIndexEndpoint(
            f"projects/{PROJECT_ID}/locations/{LOCATION}/indexEndpoints/{INDEX_ENDPOINT_ID}"
        )
        
        print("✅ Index endpoint retrieved successfully")
        
        # Create a test embedding (768 dimensions, all zeros for testing)
        test_embedding = [0.0] * 768
        
        print("🔍 Testing findNeighbors...")
        
        # Call findNeighbors
        response = index_endpoint.find_neighbors(
            deployed_index_id=DEPLOYED_INDEX_ID,
            queries=[test_embedding],
            num_neighbors=5
        )
        
        print("✅ findNeighbors call successful!")
        print(f"Response type: {type(response)}")
        print(f"Response length: {len(response) if response else 0}")
        
        if response:
            print("📊 Sample results:")
            for i, neighbor in enumerate(response[0][:3]):  # Show first 3 neighbors
                print(f"  Neighbor {i+1}: Distance={neighbor.distance:.4f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing findNeighbors: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    success = test_findneighbors()
    if success:
        print("\n🎉 SUCCESS: findNeighbors is working correctly!")
        print("Your Vertex AI setup is properly configured.")
    else:
        print("\n💥 FAILED: findNeighbors is not working.")
        print("Check the error details above.")
