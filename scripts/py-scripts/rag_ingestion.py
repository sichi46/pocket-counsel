# -*- coding: utf-8 -*-
#
# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
"""
This script ingests PDF documents from a Google Cloud Storage (GCS) bucket 
into a RAG (Retrieval-Augmented Generation) corpus.

This script will perform the following steps:
1.  **Connect to Google Cloud Storage:** Authenticate and establish a connection 
    to the specified GCS bucket.
2.  **List and Filter Documents:** Identify all PDF files within the bucket that 
    need to be processed.
3.  **Extract Text from PDFs:** For each PDF, extract the text content.
4.  **Chunk the Text:** Break down the extracted text into smaller, manageable 
    chunks suitable for embedding.
5.  **Generate Embeddings:** Convert each text chunk into a vector embedding 
    using a pre-trained language model.
6.  **Store in RAG Corpus:** Ingest the embeddings and their corresponding text 
    into the RAG corpus, making them searchable.
"""

import os
import argparse
import io
from google.cloud import storage
# from google.cloud import aiplatform
import PyPDF2

def ingest_pdfs_from_gcs(bucket_name: str, project_id: str, location: str):
    """
    Ingests PDF documents from a GCS bucket into a RAG corpus.

    Args:
        bucket_name (str): The name of the GCS bucket containing the PDFs.
        project_id (str): The Google Cloud project ID.
        location (str): The Google Cloud location/region.
    """
    print(f"Starting ingestion from bucket: {bucket_name}")

    # 1. Connect to Google Cloud Storage
    storage_client = storage.Client(project=project_id)
    bucket = storage_client.bucket(bucket_name)

    # 2. List and Filter for PDF documents
    blobs = bucket.list_blobs()
    pdf_files = [blob for blob in blobs if blob.name.lower().endswith(".pdf")]

    if not pdf_files:
        print("No PDF files found in the bucket.")
        return

    print(f"Found {len(pdf_files)} PDF file(s) to process.")

    # 3. Process each PDF
    for blob in pdf_files:
        print(f"Processing {blob.name}...")
        try:
            # Download the PDF content
            pdf_content = blob.download_as_bytes()
            
            # Extract text from the PDF
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()

            print(f"  Extracted text (first 500 chars): {text[:500]}")

            # TODO: Chunk the extracted text
        except Exception as e:
            print(f"  Error processing {blob.name}: {e}")


    # 4. TODO: Generate embeddings for each chunk
    # - Initialize the Vertex AI client
    # - For each text chunk, generate a vector embedding

    # 5. TODO: Ingest into the RAG corpus
    # - Store the embeddings and their corresponding text chunks in the corpus
    #   (e.g., in a vector database like Vertex AI Vector Search)

    print("Ingestion process completed.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Ingest PDF documents from GCS into a RAG corpus."
    )
    parser.add_argument(
        "--bucket_name",
        type=str,
        required=True,
        help="The name of the GCS bucket containing the PDFs.",
    )
    parser.add_argument(
        "--project_id",
        type=str,
        required=True,
        help="The Google Cloud project ID.",
    )
    parser.add_argument(
        "--location",
        type=str,
        default="us-central1",
        help="The Google Cloud location/region.",
    )

    args = parser.parse_args()

    ingest_pdfs_from_gcs(
        bucket_name=args.bucket_name,
        project_id=args.project_id,
        location=args.location,
    )
