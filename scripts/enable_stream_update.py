#!/usr/bin/env python3
"""
Script to enable StreamUpdate configuration on an existing Vertex AI Vector Search index.
This fixes the "StreamUpdate is not enabled on this index" error during ingestion.
"""

import time
from google.cloud import aiplatform
from google.cloud.aiplatform_v1 import IndexServiceClient, Index
from google.cloud.aiplatform_v1.types import index_service
from google.protobuf import field_mask_pb2


def enable_stream_update(project_id: str, location: str, index_id: str):
    """
    Enable StreamUpdate configuration on an existing Vertex AI Vector Search index.
    
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
        
        # Initialize the Index Service Client with explicit location
        client_options = {"api_endpoint": f"{location}-aiplatform.googleapis.com"}
        client = IndexServiceClient(client_options=client_options)
        
        # Get the existing index
        index_name = f"projects/{project_id}/locations/{location}/indexes/{index_id}"
        print(f"📋 Getting current index configuration...")
        
        get_request = index_service.GetIndexRequest(name=index_name)
        current_index = client.get_index(request=get_request)
        
        print(f"✅ Retrieved index: {current_index.display_name}")
        print(f"📊 Index ID: {current_index.name}")
        
        # Check if stream update is already enabled
        if hasattr(current_index, 'metadata') and current_index.metadata:
            if hasattr(current_index.metadata, 'stream_update_config'):
                print("✅ StreamUpdate is already enabled on this index!")
                return True
        
        # Create a new index configuration with stream updates enabled
        print("🔧 Updating index configuration to enable StreamUpdate...")
        
        # Create the updated index object
        updated_index = Index()
        updated_index.name = index_name
        
        # Copy existing configuration
        if hasattr(current_index, 'metadata') and current_index.metadata:
            updated_index.metadata = current_index.metadata
        
        # Enable stream updates
        if not hasattr(updated_index, 'metadata') or not updated_index.metadata:
            # Create new metadata if it doesn't exist
            from google.cloud.aiplatform_v1.types import index
            updated_index.metadata = index.IndexMetadata()
        
        # Set stream update configuration
        from google.cloud.aiplatform_v1.types import index
        stream_config = index.IndexMetadata.StreamUpdateConfig()
        stream_config.enabled = True
        updated_index.metadata.stream_update_config = stream_config
        
        # Create update mask to specify which fields to update
        update_mask = field_mask_pb2.FieldMask()
        update_mask.paths.append("metadata.stream_update_config")
        
        # Update the index
        print("📤 Updating index with StreamUpdate configuration...")
        
        update_request = index_service.UpdateIndexRequest(
            index=updated_index,
            update_mask=update_mask
        )
        
        operation = client.update_index(request=update_request)
        
        # Wait for the operation to complete
        print("⏳ Waiting for index update to complete...")
        result = operation.result()
        
        print(f"✅ Successfully updated index: {result.display_name}")
        print(f"📊 Index ID: {result.name}")
        
        # Verify stream update is enabled
        if hasattr(result, 'metadata') and result.metadata:
            if hasattr(result.metadata, 'stream_update_config'):
                stream_enabled = result.metadata.stream_update_config.enabled
                print(f"🔧 StreamUpdate enabled: {stream_enabled}")
                return stream_enabled
        
        print("⚠️ Warning: Could not verify StreamUpdate configuration")
        return True
        
    except Exception as e:
        print(f"❌ Error enabling StreamUpdate: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        return False


def main():
    """Main function to run the StreamUpdate enablement"""
    # Configuration - update these values
    PROJECT_ID = "787651119619"
    LOCATION = "us-central1"
    INDEX_ID = "2713755226048823296"
    
    print("🚀 Enabling StreamUpdate on Vertex AI Vector Search Index")
    print("=" * 60)
    
    success = enable_stream_update(PROJECT_ID, LOCATION, INDEX_ID)
    
    if success:
        print("\n🎉 StreamUpdate successfully enabled!")
        print("✅ You can now run the ingestion script without errors")
    else:
        print("\n❌ Failed to enable StreamUpdate")
        print("🔍 Check the error messages above for details")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
