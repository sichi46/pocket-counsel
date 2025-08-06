todo.md

Phase 1: Google Cloud Setup

[x] Enable all required APIs in the Google Cloud Console (Vertex AI, Cloud Functions, Cloud Build, Cloud Storage, API Gateway).

[x] Create a dedicated service account (rag-svc) with the necessary IAM roles (Vertex AI User, Storage Object Viewer, Secret Manager Secret Accessor).

[x] Authenticate the gcloud CLI and set the project ID.

Phase 2: Data Ingestion

[x] Upload all PDF documents to a dedicated Google Cloud Storage bucket.

[x] Write and execute a Python script to create the RAG corpus and ingest the PDFs from GCS.

Phase 4: Backend Integration

[x] Initialize the Firebase Functions directory and install the necessary npm packages (@google-cloud/vertexai).

[x] Implement the backend Cloud Function that configures and calls the Gemini model with the RAG tools.

[x] Build the Cloud Functions successfully using npm run build.

[x] Create and configure service accounts with necessary IAM permissions for Cloud Functions deployment.

[x] Deploy the Cloud Function to Firebase successfully.

[x] Fix build issues and successfully build all packages (functions, web, seeding, shared).

[x] Configure Cloud Functions to allow unauthenticated access for testing.

[x] Resolve Vertex AI model configuration issue (switched to Google AI API for better reliability).

Function URLs:

- Health: https://health-6otymacelq-uc.a.run.app ✅ (Working)
- API: https://api-6otymacelq-uc.a.run.app ✅ (Ready for deployment with Google AI API)

Phase 5: Frontend Integration

[ ] Install the Firebase SDK in the frontend application.

[ ] Write JavaScript/TypeScript code to call the backend Cloud Function with a user query.

[ ] Handle the response, displaying the answer and citations to the user.

Phase 6: Testing & Optimization

[ ] Use curl to test the RAG capabilities directly via the Vertex AI endpoint.

[ ] Implement continuous ingestion and evaluation pipelines.

[ ] Monitor logs and performance in the Google Cloud Console.
