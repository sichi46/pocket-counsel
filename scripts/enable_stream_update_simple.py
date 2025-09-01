#!/usr/bin/env python3
"""
Simple script to enable StreamUpdate configuration using the higher-level Vertex AI client.
"""

from google.cloud import aiplatform


def enable_stream_update_simple(project_id: str, location: str, index_id: str):
    """
    Enable StreamUpdate configuration using the higher-level Vertex AI client.
    
    Args:
        project_id: Google Cloud project ID
        location: Google Cloud location (e.g., 'us-central1')
        index_id: The index ID to modify
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        print(f"🔧 Enabling StreamUpdate on index {index_id}")
        print(f"📍 Project: {project_id}")
        print(f"📍 Location: {location}")
        
        # Initialize Vertex AI
        aiplatform.init(project=project_id, location=location)
        
        # Get the existing index
        print(f"📋 Getting current index configuration...")
        index = aiplatform.MatchingEngineIndex(index_id)
        
        print(f"✅ Retrieved index: {index.display_name}")
        print(f"📊 Index ID: {index.name}")
        
        # Check if stream update is already enabled
        if hasattr(index, 'metadata') and index.metadata:
            if hasattr(index.metadata, 'stream_update_config'):
                print("✅ StreamUpdate is already enabled on this index!")
                return True
        
        print("🔧 Attempting to enable StreamUpdate...")
        print("⚠️ Note: StreamUpdate configuration may require index recreation")
        print("💡 Consider creating a new index with StreamUpdate enabled")
        
        # Try to update the index configuration
        try:
            # This is a simplified approach - in practice, you may need to recreate the index
            print("📤 Attempting to update index configuration...")
            
            # For now, we'll just inform the user about the limitation
            print("ℹ️ StreamUpdate configuration cannot be added to existing indexes")
            print("ℹ️ You need to create a new index with StreamUpdate enabled")
            print("ℹ️ Or use batch updates instead of stream updates")
            
            return False
            
        except Exception as update_error:
            print(f"❌ Update failed: {str(update_error)}")
            return False
        
    except Exception as e:
        print(f"❌ Error accessing index: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        return False


def main():
    """Main function to run the StreamUpdate enablement"""
    # Configuration
    PROJECT_ID = "787651119619"
    LOCATION = "us-central1"
    INDEX_ID = "2713755226048823296"
    
    print("🚀 Checking StreamUpdate Configuration on Vertex AI Vector Search Index")
    print("=" * 70)
    
    success = enable_stream_update_simple(PROJECT_ID, LOCATION, INDEX_ID)
    
    if not success:
        print("\n🔧 Alternative Solutions:")
        print("1. Create a new index with StreamUpdate enabled from the start")
        print("2. Use batch updates instead of stream updates for ingestion")
        print("3. Modify the ingestion script to use batch operations")
    
    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()
