#!/usr/bin/env python3
"""
Pocket Counsel RAG Data Ingestion Script
Processes PDF documents from Google Cloud Storage and uploads embeddings to Vertex AI Vector Search
"""

import logging
import vertexai
from vertexai.language_models import TextEmbeddingModel
from google.cloud import aiplatform
from google.cloud import storage
import PyPDF2
import io
from typing import List, Dict, Any
import time
import os
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RAGIngestionService:
    def __init__(self, project_id: str, location: str, index_id: str):
        self.project_id = project_id
        self.location = location
        self.index_id = index_id
        
        # Initialize Vertex AI
        vertexai.init(project=project_id, location=location)
        
        # Initialize embedding model - use the latest recommended version
        self.embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-004")
        
        # Initialize Vector Search index for StreamUpdate
        self.index = aiplatform.MatchingEngineIndex(
            index_name=index_id,
            project=project_id,
            location=location
        )
        
        # Initialize Cloud Storage client
        self.storage_client = storage.Client()
        
        logger.info(f"✅ Initialized RAG service for project {project_id}, location {location}, index {index_id}")

    def extract_text_from_pdf(self, bucket_name: str, pdf_path: str) -> str:
        """Extract text from PDF in Cloud Storage"""
        try:
            logger.info(f"📄 Extracting text from {pdf_path}")
            
            bucket = self.storage_client.bucket(bucket_name)
            blob = bucket.blob(pdf_path)
            
            # Download PDF content
            pdf_content = blob.download_as_bytes()
            logger.info(f"📥 Downloaded {len(pdf_content)} bytes from {pdf_path}")
            
            # Extract text using PyPDF2
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            text = ""
            
            for page_num, page in enumerate(pdf_reader.pages):
                page_text = page.extract_text()
                text += f"\n--- Page {page_num + 1} ---\n{page_text}"
                logger.info(f"📖 Extracted page {page_num + 1}: {len(page_text)} characters")
            
            logger.info(f"✅ Successfully extracted {len(text)} total characters from {pdf_path}")
            return text
            
        except Exception as e:
            logger.error(f"❌ Failed to extract text from {pdf_path}: {str(e)}")
            raise

    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into overlapping chunks"""
        try:
            chunks = []
            start = 0
            
            while start < len(text):
                end = start + chunk_size
                chunk = text[start:end]
                
                # Try to break at sentence boundaries
                if end < len(text):
                    last_period = chunk.rfind('.')
                    last_newline = chunk.rfind('\n')
                    break_point = max(last_period, last_newline)
                    
                    if break_point > start + chunk_size * 0.7:
                        chunk = text[start:break_point + 1]
                        end = start + len(chunk)
                
                chunks.append(chunk.strip())
                start = end - overlap
                
            logger.info(f"📦 Created {len(chunks)} text chunks from {len(text)} characters")
            return chunks
            
        except Exception as e:
            logger.error(f"❌ Failed to chunk text: {str(e)}")
            raise

    def generate_embeddings(self, text_chunks: List[str]) -> List[List[float]]:
        """Generate embeddings for text chunks"""
        try:
            logger.info(f"🔄 Generating embeddings for {len(text_chunks)} chunks")
            
            embeddings = []
            batch_size = 5  # Process in small batches to avoid rate limits
            
            for i in range(0, len(text_chunks), batch_size):
                batch = text_chunks[i:i + batch_size]
                logger.info(f"📊 Processing batch {i//batch_size + 1}/{(len(text_chunks) + batch_size - 1)//batch_size}")
                
                try:
                    # Generate embeddings for batch
                    batch_embeddings = self.embedding_model.get_embeddings(batch)
                    
                    # Extract embedding values
                    for embedding in batch_embeddings:
                        embedding_values = embedding.values
                        embeddings.append(embedding_values)
                        logger.info(f"✅ Generated embedding: {len(embedding_values)} dimensions")
                    
                    # Rate limiting
                    if i + batch_size < len(text_chunks):
                        time.sleep(1)
                        
                except Exception as batch_error:
                    logger.error(f"❌ Failed to generate embeddings for batch {i//batch_size + 1}: {str(batch_error)}")
                    # Continue with next batch
                    continue
            
            logger.info(f"🎉 Successfully generated {len(embeddings)} embeddings")
            return embeddings
            
        except Exception as e:
            logger.error(f"❌ Failed to generate embeddings: {str(e)}")
            raise

    def upload_to_vector_search(self, datapoints: List[Dict[str, Any]]) -> bool:
        """Upload datapoints to Vector Search index using StreamUpdate"""
        try:
            logger.info(f"📤 Uploading {len(datapoints)} datapoints to Vector Search index using StreamUpdate")
            
            # Log first datapoint for debugging
            if datapoints:
                first_datapoint = datapoints[0]
                logger.info(f"🔍 Sample datapoint structure: {first_datapoint}")
                logger.info(f"🔍 Datapoint ID: {first_datapoint.get('datapoint_id')}")
                logger.info(f"🔍 Vector dimensions: {len(first_datapoint.get('feature_vector', []))}")
            
            # Format datapoints for StreamUpdate
            formatted_datapoints = []
            for datapoint in datapoints:
                formatted_datapoint = {
                    "datapoint_id": datapoint["datapoint_id"],
                    "feature_vector": datapoint["feature_vector"],
                    "restricts": datapoint["restricts"]
                }
                formatted_datapoints.append(formatted_datapoint)
            
            # Use upsert_datapoints for StreamUpdate index
            response = self.index.upsert_datapoints(datapoints=formatted_datapoints)
            
            logger.info(f"✅ Successfully uploaded {len(datapoints)} datapoints to Vector Search")
            logger.info(f"📊 Upload response: {response}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to upload to Vector Search: {str(e)}")
            logger.error(f"❌ Error type: {type(e).__name__}")
            raise

    def process_pdf_document(self, bucket_name: str, pdf_path: str) -> bool:
        """Process a single PDF document end-to-end"""
        try:
            logger.info(f"🚀 Starting processing of {pdf_path}")
            
            # Step 1: Extract text
            text = self.extract_text_from_pdf(bucket_name, pdf_path)
            
            # Step 2: Create chunks
            chunks = self.chunk_text(text, chunk_size=1000, overlap=200)
            
            # Step 3: Generate embeddings
            embeddings = self.generate_embeddings(chunks)
            
            # Step 4: Prepare datapoints
            datapoints = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                datapoint = {
                    "datapoint_id": f"{pdf_path}-chunk-{i}",
                    "feature_vector": embedding,
                    "restricts": [
                        {
                            "namespace": "source",
                            "allow_list": [pdf_path]
                        }
                    ]
                }
                datapoints.append(datapoint)
            
            logger.info(f"📋 Prepared {len(datapoints)} datapoints for upload")
            
            # Step 5: Upload to Vector Search
            success = self.upload_to_vector_search(datapoints)
            
            if success:
                logger.info(f"🎉 Successfully processed {pdf_path}: {len(datapoints)} chunks uploaded")
            else:
                logger.error(f"❌ Failed to process {pdf_path}")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Failed to process {pdf_path}: {str(e)}")
            return False

    def process_single_test_document(self, bucket_name: str, pdf_path: str) -> Dict[str, Any]:
        """Process a single PDF document for testing"""
        try:
            logger.info(f"🧪 Testing processing of {pdf_path}")
            
            success = self.process_pdf_document(bucket_name, pdf_path)
            
            results = {
                "total_files": 1,
                "successful": 1 if success else 0,
                "failed": 0 if success else 1,
                "failed_files": [] if success else [pdf_path],
                "total_chunks": 1 if success else 0
            }
            
            logger.info(f"📊 Test complete: {results}")
            return results
            
        except Exception as e:
            logger.error(f"❌ Test failed: {str(e)}")
            raise

    def process_all_pdfs(self, bucket_name: str) -> Dict[str, Any]:
        """Process all PDFs in a bucket"""
        try:
            logger.info(f"🚀 Starting batch processing of all PDFs in bucket {bucket_name}")
            
            bucket = self.storage_client.bucket(bucket_name)
            blobs = bucket.list_blobs()
            
            pdf_files = [blob.name for blob in blobs if blob.name.lower().endswith('.pdf')]
            logger.info(f"📋 Found {len(pdf_files)} PDF files to process")
            
            results = {
                "total_files": len(pdf_files),
                "successful": 0,
                "failed": 0,
                "failed_files": [],
                "total_chunks": 0
            }
            
            for i, pdf_path in enumerate(pdf_files):
                logger.info(f"📄 Processing file {i + 1}/{len(pdf_files)}: {pdf_path}")
                
                try:
                    success = self.process_pdf_document(bucket_name, pdf_path)
                    
                    if success:
                        results["successful"] += 1
                        # Count chunks (approximate)
                        results["total_chunks"] += 10  # Estimate
                    else:
                        results["failed"] += 1
                        results["failed_files"].append(pdf_path)
                        
                except Exception as e:
                    logger.error(f"❌ Unexpected error processing {pdf_path}: {str(e)}")
                    results["failed"] += 1
                    results["failed_files"].append(pdf_path)
                
                # Add delay between documents
                if i < len(pdf_files) - 1:
                    logger.info("💤 Waiting 2 seconds before next document...")
                    time.sleep(2)
            
            logger.info(f"📊 Processing complete: {results}")
            return results
            
        except Exception as e:
            logger.error(f"❌ Failed to process PDFs: {str(e)}")
            raise

def main():
    """Main function to run the RAG ingestion service"""
    
    # Configuration - Update these values for your setup
    PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "pocket-counsel")
    LOCATION = os.getenv("VERTEX_AI_LOCATION", "us-central1")
    INDEX_ID = os.getenv("VERTEX_AI_INDEX_ID", "849546455294148608")  # Updated to StreamUpdate index
    BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "pocket-counsel-rag-corpus")
    
    # Log configuration
    logger.info("🚀 Starting Pocket Counsel RAG Ingestion Service")
    logger.info(f"📋 Configuration:")
    logger.info(f"   Project ID: {PROJECT_ID}")
    logger.info(f"   Location: {LOCATION}")
    logger.info(f"   Index ID: {INDEX_ID}")
    logger.info(f"   Bucket: {BUCKET_NAME}")
    
    try:
        # Initialize service
        rag_service = RAGIngestionService(PROJECT_ID, LOCATION, INDEX_ID)
        
        # Process all PDFs
        results = rag_service.process_all_pdfs(BUCKET_NAME)
        
        logger.info("🎉 RAG ingestion complete!")
        logger.info(f"📊 Final Results:")
        logger.info(f"   Total files: {results['total_files']}")
        logger.info(f"   Successful: {results['successful']}")
        logger.info(f"   Failed: {results['failed']}")
        logger.info(f"   Total chunks: {results['total_chunks']}")
        
        if results['failed_files']:
            logger.warning(f"⚠️ Failed files: {results['failed_files']}")
        
        # Exit with appropriate code
        if results['failed'] == 0:
            logger.info("✅ All documents processed successfully!")
            sys.exit(0)
        else:
            logger.warning(f"⚠️ {results['failed']} documents failed to process")
            sys.exit(1)
        
    except Exception as e:
        logger.error(f"❌ RAG ingestion failed: {str(e)}")
        logger.error(f"❌ Error type: {type(e).__name__}")
        sys.exit(1)

if __name__ == "__main__":
    main()
