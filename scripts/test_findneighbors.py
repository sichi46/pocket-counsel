#!/usr/bin/env python3
"""
Test script to verify findNeighbors functionality with the new optimized index
"""

import vertexai
from vertexai.preview.language_models import TextEmbeddingModel
from google.cloud import aiplatform
import json

def test_findneighbors():
    """Test findNeighbors with the new optimized index"""
    try:
        # Initialize Vertex AI
        vertexai.init(project="787651119619", location="us-central1")
        
        # Initialize the index endpoint
        index_endpoint = aiplatform.MatchingEngineIndexEndpoint(
            "projects/787651119619/locations/us-central1/indexEndpoints/4703748127021072384"
        )
        
        # Initialize the embedding model
        model = TextEmbeddingModel.from_pretrained("text-embedding-004")
        
        # Test query
        test_query = "how many leave days in a year is an employee entitled to"
        print(f"🔍 Testing query: {test_query}")
        
        # Generate embedding
        print("📊 Generating embedding...")
        embedding = model.get_embeddings([test_query])[0].values
        print(f"✅ Generated embedding: {len(embedding)} dimensions")
        
        # Test findNeighbors
        print("🔍 Testing findNeighbors...")
        response = index_endpoint.find_neighbors(
            deployed_index_id="pocket_council_stream_optimized_v1",
            queries=[{
                "datapoint": {"featureVector": embedding}, 
                "neighborCount": 15
            }]
        )
        
        print("✅ findNeighbors successful!")
        print(f"📊 Response type: {type(response)}")
        
        # Print response details
        if hasattr(response, 'nearest_neighbors'):
            for i, query_result in enumerate(response.nearest_neighbors):
                print(f"\n🔍 Query {i + 1} results:")
                print(f"   Found {len(query_result.neighbors)} neighbors")
                
                for j, neighbor in enumerate(query_result.neighbors[:5]):  # Show first 5
                    print(f"   Neighbor {j + 1}:")
                    print(f"     ID: {neighbor.datapoint.datapoint_id}")
                    print(f"     Distance: {neighbor.distance}")
                    if hasattr(neighbor.datapoint, 'feature_vector'):
                        print(f"     Vector dimensions: {len(neighbor.datapoint.feature_vector)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing findNeighbors: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    print("🚀 Testing findNeighbors with new optimized index...")
    success = test_findneighbors()
    
    if success:
        print("\n🎉 findNeighbors test completed successfully!")
    else:
        print("\n❌ findNeighbors test failed!")
