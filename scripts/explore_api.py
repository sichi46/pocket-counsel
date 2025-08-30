#!/usr/bin/env python3
"""
Explore the MatchingEngineIndex API to find the correct methods
"""

import vertexai
from google.cloud import aiplatform

def explore_api():
    """Explore the MatchingEngineIndex API"""
    
    # Initialize Vertex AI
    vertexai.init(project="pocket-counsel", location="us-central1")
    
    # Create index object
    index = aiplatform.MatchingEngineIndex(
        index_name="849546455294148608",
        project="pocket-counsel",
        location="us-central1"
    )
    
    print("🔍 Exploring MatchingEngineIndex API...")
    print(f"Index object type: {type(index)}")
    print(f"Index object: {index}")
    print()
    
    # List all attributes and methods
    print("📋 All attributes and methods:")
    for attr in dir(index):
        if not attr.startswith('_'):
            try:
                value = getattr(index, attr)
                if callable(value):
                    print(f"  Method: {attr}() - {type(value)}")
                else:
                    print(f"  Attribute: {attr} = {value}")
            except Exception as e:
                print(f"  Attribute: {attr} - Error accessing: {e}")
    
    print()
    
    # Check specific methods we might need
    methods_to_check = [
        'find_neighbors', 'query', 'search', 'find', 'lookup',
        'get_nearest_neighbors', 'find_similar', 'match'
    ]
    
    print("🔍 Checking specific methods:")
    for method in methods_to_check:
        if hasattr(index, method):
            print(f"  ✅ {method}() exists")
            method_obj = getattr(index, method)
            if callable(method_obj):
                print(f"     Type: {type(method_obj)}")
                try:
                    import inspect
                    sig = inspect.signature(method_obj)
                    print(f"     Signature: {sig}")
                except:
                    print(f"     Could not get signature")
        else:
            print(f"  ❌ {method}() does not exist")
    
    print()
    
    # Try to understand the index better
    print("🔍 Index details:")
    print(f"  Index name: {getattr(index, 'index_name', 'N/A')}")
    print(f"  Project: {getattr(index, 'project', 'N/A')}")
    print(f"  Location: {getattr(index, 'location', 'N/A')}")
    
    # Check if there are any other useful attributes
    print()
    print("🔍 Other potentially useful attributes:")
    for attr in ['name', 'id', 'display_name', 'description', 'metadata']:
        if hasattr(index, attr):
            try:
                value = getattr(index, attr)
                print(f"  {attr}: {value}")
            except Exception as e:
                print(f"  {attr}: Error accessing - {e}")
        else:
            print(f"  {attr}: Not available")

if __name__ == "__main__":
    explore_api()
