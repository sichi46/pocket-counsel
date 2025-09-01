You are an advanced AI assistant tasked with optimizing a Retrieval-Augmented Generation (RAG) system for legal document processing. Follow these detailed instructions to improve the system's performance. For legal documents stored in a Google Cloud Storage bucket (gs://pocket-counsel-rag-corpus.

The current setup uses Vertex AI Vector Search with Index ID 849546455294148608, Endpoint ID 4703748127021072384, Deployed Index ID pocket_council_stream_depl_1756497505059, and the gemini-2.0-flash-exp embedding model. The goal is to ensure accurate, simple-language responses based on ingested data.

Tasks to Perform

Verify and Optimize Ingestion:

Check the Google Cloud Storage bucket gs://pocket-counsel-rag-corpus to confirm all legal documents are uploaded and accessible.

Use the gsutil command to list files:
textgsutil ls gs://pocket-counsel-rag-corpus

Ensure the full text of each document is ingested without truncation.

Review Chunking Logic and Use the Most Ideal One:

Analyze the current chunking process to determine if chunks are too small (e.g., <500 tokens), causing sections to be split across multiple chunks.
Recommend and implement an optimal chunk size of 1000-1500 tokens with a 200-token overlap to preserve context across legal sections.
Update the ingestion pipeline to reflect this change (e.g., adjust the chunking library or script used).

Re-ingest All Documents in the Bucket:

Undeploy the existing index to prepare for re-ingestion:
textgcloud ai index-endpoints undeploy-index 4703748127021072384 --deployed-index-id=pocket_council_stream_depl_1756497505059 --region=us-central1 --project=787651119619

Delete the current index:
textgcloud ai indexes delete 849546455294148608 --region=us-central1 --project=787651119619

Re-ingest all documents from gs://pocket-counsel-rag-corpus using the optimized chunking settings.

Update index_config.yaml with Optimized Chunking Settings:

Create or modify index_config.yaml to include optimized settings for the new index:
textdisplayName: pocket_council_stream
metadata:
contentsDeltaUri: gs://pocket-counsel-rag-corpus
config:
dimensions: 768
approximateNeighborsCount: 150
distanceMeasureType: DOT_PRODUCT_DISTANCE
algorithmConfig:
treeAhConfig:
leafNodeEmbeddingCount: 1000
leafNodesToSearchPercent: 5
indexUpdateMethod: STREAM_UPDATE # Add custom metadata for chunking if supported by Vertex AI # Example (if applicable): chunkSize: 1000, overlap: 200

Create the new index with the updated configuration:
textgcloud ai indexes create --region=us-central1 --project=787651119619 --config=index_config.yaml

Note the new Index ID and deploy it:
textgcloud ai index-endpoints deploy-index 4703748127021072384 --deployed-index-id=pocket_council_stream_depl_1756497505059 --index=NEW_INDEX_ID --region=us-central1 --project=787651119619

Enhance Query Transformation:

Modify the transformation logic to generate 3-5 sub-queries, incorporating specific keywords relevant to all legal documents (e.g., Employment Code Act, Lands and Deeds Registry Act, Criminal Procedure Code Act).

for example:
For the query "how many leave days in a year is an employee entitled to," generate sub-queries like:

"annual leave days per year"
"employee vacation entitlement"
"leave under Employment Code Act"
"annual leave entitlement Zambia"
"vacation days per year employment law"

Update the query transformation function to include keywords dynamically based on document types.

Improve Embedding and Retrieval:

Test the text-embedding-004 model from Vertex AI as an alternative to gemini-2.0-flash-exp if the current model underperforms on legal text.
Implement the switch in the pipeline:
pythonfrom vertexai.preview.language_models import TextEmbeddingModel

model = TextEmbeddingModel.from_pretrained("text-embedding-004")
embedding = model.get_embeddings([query])[0].values

Increase neighborCount to 10-15 in the findNeighbors call to retrieve more candidates:
pythonresponse = index_endpoint.find_neighbors(
deployed_index_id="pocket_council_stream_depl_1756497505059",
queries=[{"datapoint": {"featureVector": embedding}, "neighborCount": 15}],
approximate_neighbors_count=150
)

Post-retrieval, filter the top 8 results by relevance score (e.g., using cosine similarity) to maintain quality.

Refine Response Generation:

Train or fine-tune the conversational AI (e.g., Gemini or a custom LLM) on legal text to synthesize answers from partial data. Use a dataset of legal documents or sections if available.
Provide a sample prompt for the AI to follow:
textYou are a legal assistant. Given the following document chunks, explain the number of leave days an employee is entitled to in simple language. If the exact answer isn’t found, infer from related sections and suggest where to look. Chunks: [chunk data]...

Execution Guidelines

Execute each step sequentially, validating the output (e.g., check ingested files, test new embeddings, verify query responses).
Use the Google Cloud SDK (gcloud) for index management and Python for pipeline updates.
After re-ingestion and deployment, test with the query "how many leave days in a year is an employee entitled to" and expect a response like: "In Zambia, under the Employment Code Act No. 3 of 2019, an employee is entitled to at least 24 working days of annual leave per year after working continuously for 12 months. If you’ve worked less than a year, you get leave based on the time you’ve worked. For exact details or special cases, check with your employer or a Zambian employment lawyer!"
Log all changes and test results for debugging.

Deliverables

Updated index_config.yaml file.
Modified Python code for query transformation, embedding, and retrieval.
Sample fine-tuned prompt for response generation.
Test results from the updated RAG system.

Proceed with these tasks and provide the updated configurations and test outcomes
