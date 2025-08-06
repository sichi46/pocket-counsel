# packages/seeding/src/ingest_and_embed.py
import os
from google.cloud import aiplatform
from google.cloud.aiplatform.preview import rag
from google.cloud import storage
import time

# Configuration
GCP_PROJECT_ID = 'pocket-counsel'
GCS_BUCKET_NAME = 'gcf-sources-787651119619-us-central1'
CORPUS_DISPLAY_NAME = 'pocket-counsel-corpus'
CORPUS_DIRECTORY = os.path.join(os.path.dirname(__file__), '../../corpus')
GCP_LOCATION = 'us-central1'

def upload_files_to_gcs(bucket_name, directory_path):
    """Uploads all PDF files from a local directory to a GCS bucket."""
    storage_client = storage.Client(project=GCP_PROJECT_ID)
    bucket = storage_client.bucket(bucket_name)
    blobs = {blob.name for blob in bucket.list_blobs()}

    print(f'Uploading files from {directory_path} to gs://{bucket_name}...')

    for filename in os.listdir(directory_path):
        if filename.endswith('.pdf'):
            if filename not in blobs:
                filepath = os.path.join(directory_path, filename)
                blob = bucket.blob(filename)
                blob.upload_from_filename(filepath)
                print(f'  Uploaded {filename}.')
            else:
                print(f'  Skipped {filename} (already exists).')

def create_and_ingest_corpus():
    """Creates a RAG corpus and ingests the PDF files from GCS."""
    aiplatform.init(project=GCP_PROJECT_ID, location=GCP_LOCATION)

    # Check if the corpus already exists
    corpora = rag.RagCorpus.list()
    corpus = next((c for c in corpora if c.display_name == CORPUS_DISPLAY_NAME), None)

    if not corpus:
        print(f'Creating new corpus: {CORPUS_DISPLAY_NAME}')
        corpus = rag.RagCorpus.create(display_name=CORPUS_DISPLAY_NAME)
    else:
        print(f'Corpus "{CORPUS_DISPLAY_NAME}" already exists.')

    print(f'Ingesting files into corpus: {corpus.name}')
    rag.RagFile.upload(
        corpus=corpus,
        source_uri=f'gs://{GCS_BUCKET_NAME}/*.pdf',
        file_chunking_strategy='CHUNKING_STRATEGY_UNSPECIFIED',
        import_results_gcs_uri=f'gs://{GCS_BUCKET_NAME}/rag_import_logs/results.ndjson'
    )
    print('Ingestion complete.')

if __name__ == '__main__':
    upload_files_to_gcs(GCS_BUCKET_NAME, CORPUS_DIRECTORY)
    create_and_ingest_corpus()
