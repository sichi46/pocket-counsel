#!/usr/bin/env python3
"""
Test script for Pocket Counsel RAG API
Tests the deployed API to verify real Vertex AI Vector Search integration
"""

import requests
import json
import time

def test_rag_api():
    """Test the deployed RAG API with a legal query"""
    
    # API endpoint
    api_url = "https://us-central1-pocket-counsel.cloudfunctions.net/api"
    
    # Test query
    test_query = "What are the minimum wage requirements for employees in Zambia?"
    
    print("🧪 Testing Pocket Counsel RAG API")
    print("=" * 50)
    print(f"API URL: {api_url}")
    print(f"Test Query: {test_query}")
    print()
    
    try:
        # Make the API call
        print("📡 Sending request to RAG API...")
        start_time = time.time()
        
        response = requests.post(
            api_url,
            json={"query": test_query},
            headers={"Content-Type": "application/json"},
            timeout=120  # 2 minutes timeout for RAG processing
        )
        
        end_time = time.time()
        response_time = end_time - start_time
        
        print(f"⏱️  Response time: {response_time:.2f} seconds")
        print(f"📊 HTTP Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print("\n✅ API Response Received Successfully!")
            print("=" * 50)
            
            # Display the answer
            print(f"🤖 AI Answer:")
            print(f"{data.get('answer', 'No answer provided')}")
            print()
            
            # Display sources
            sources = data.get('sources', [])
            print(f"📄 Sources Retrieved: {len(sources)}")
            for i, source in enumerate(sources, 1):
                print(f"  {i}. {source.get('title', 'Unknown')}")
                print(f"     Content: {source.get('content', 'No content')[:100]}...")
                print(f"     Relevance: {source.get('relevance', 'Unknown')}")
                print(f"     Distance: {source.get('distance', 'Unknown')}")
                print()
            
            # Display metadata
            metadata = data.get('metadata', {})
            print(f"🔍 Metadata:")
            print(f"  Documents Retrieved: {metadata.get('documentsRetrieved', 'Unknown')}")
            print(f"  Embedding Dimensions: {metadata.get('embeddingDimensions', 'Unknown')}")
            print(f"  Model Used: {metadata.get('modelUsed', 'Unknown')}")
            print(f"  Vector Search Index: {metadata.get('vectorSearchIndex', 'Unknown')}")
            print(f"  Endpoint ID: {metadata.get('endpointId', 'Unknown')}")
            print(f"  Note: {metadata.get('note', 'No note')}")
            print()
            
            # Check if using real Vertex AI
            note = metadata.get('note', '')
            if 'real Vertex AI Vector Search' in note:
                print("🎉 SUCCESS: API is using REAL Vertex AI Vector Search!")
                print("   No mock data detected - full RAG pipeline is operational!")
            else:
                print("⚠️  WARNING: API may still be using mock data")
                print(f"   Note: {note}")
            
            print(f"\n📈 Processing Time: {data.get('processingTime', 'Unknown')}ms")
            print(f"🕐 Timestamp: {data.get('timestamp', 'Unknown')}")
            
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏰ Timeout: Request took too long (>2 minutes)")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request Error: {e}")
    except json.JSONDecodeError as e:
        print(f"❌ JSON Parse Error: {e}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")

def test_health_endpoint():
    """Test the health endpoint"""
    
    health_url = "https://us-central1-pocket-counsel.cloudfunctions.net/health"
    
    print("\n🏥 Testing Health Endpoint")
    print("=" * 30)
    
    try:
        response = requests.get(health_url, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Health endpoint is working")
            print(f"Status: {data.get('status')}")
            print(f"Message: {data.get('message')}")
            print(f"RAG Status: {data.get('ragStatus')}")
            
            vertex_ai = data.get('vertexAI', {})
            print(f"Vertex AI Project: {vertex_ai.get('project')}")
            print(f"Vertex AI Location: {vertex_ai.get('location')}")
            print(f"Gemini Model: {data.get('geminiModel')}")
        else:
            print(f"❌ Health endpoint error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")

if __name__ == "__main__":
    print("🚀 Pocket Counsel RAG API Test Suite")
    print("Testing real Vertex AI Vector Search integration")
    print()
    
    # Test health endpoint first
    test_health_endpoint()
    
    # Test main RAG API
    test_rag_api()
    
    print("\n�� Test completed!")
