# RAG on Google Cloud: Pocket Counsel Guide

This guide outlines the steps to build a Retrieval-Augmented Generation (RAG) application using Firebase for the frontend and Vertex AI for the backend. The core of this architecture is a Gemini model that can retrieve information from both static PDF documents and a live API.

## High-Level Architecture

- **Frontend:** Your Firebase-hosted web app.
- **Backend:** A Cloud Function for Firebase (or Genkit) that acts as a secure bridge.
- **AI Service:** A Gemini model on Vertex AI, configured with tools to access your data sources.
- **Data Sources:**
  - PDFs in a Cloud Storage bucket.
  - Live API data exposed via a custom Search API.

## Phase 1: Google Cloud Setup

1.  **Enable APIs:** In the Google Cloud Console, enable the following APIs:
    - `vertexai.googleapis.com`
    - `cloudfunctions.googleapis.com`
    - `apigateway.googleapis.com`
2.  **Service Account:** Create a dedicated service account for your RAG application (e.g., `rag-svc`). Grant it the following IAM roles:
    - `Vertex AI User`
    - `Storage Object Viewer` (on your PDF bucket)
    - `Secret Manager Secret Accessor` (if you are using secrets for API keys)
3.  **CLI Setup:** Authenticate the `gcloud` CLI on your machine and set your project ID.

## Phase 2: Building the RAG Corpus (PDFs)

1.  **Upload PDFs:** Upload all your PDF files to a Google Cloud Storage bucket.
2.  **Create Corpus (Programmatic):** Use the Python SDK to create a corpus for your documents. This is a one-time setup.
    ```python
    from vertexai.preview import generative_models
    client = generative_models.RagEngineClient(location="us-central1")
    corpus = client.create_corpus(display_name="my-docs")
    ```
3.  **Ingest Files:** Ingest the PDFs from your GCS bucket into the corpus.
    ```python
    client.import_files(
        corpus=corpus.name,
        gcs_source="gs://MY_BUCKET/**/*.pdf",
        import_result_sink="gs://MY_BUCKET/rag_import_logs/results.ndjson"
    )
    ```

## Phase 3: Exposing Live Data (Custom Search API)

This step is for real-time data access.

1.  **Create a Cloud Function:** Write a Cloud Function (e.g., in Python or Node.js) that can perform a search against your external API or database and return a list of JSON objects with `snippet` and `uri` fields.
2.  **Deploy with API Gateway:** Deploy the function and then use API Gateway to create a stable, public HTTPS endpoint. This provides a clean API contract and allows for secure authentication via an API key.

## Phase 4: Wiring Gemini to Both Sources

This is the central logic where you connect your data to the LLM.

1.  **Define RAG Tool:** In your backend code, define a tool that points to your PDF corpus.
    ```javascript
    const ragTool = {
      ragCorpus: {
        corpusId: 'projects/PROJECT/locations/us-central1/corpora/123456',
        topK: 5,
      },
    };
    ```
2.  **Define External Tool:** Define a second tool that points to your live Search API.
    ```javascript
    const externalTool = {
      externalApi: {
        apiSpec: 'SIMPLE_SEARCH',
        endpoint: 'https://CUSTOM_GATEWAY_ID.nw.gateway.dev/v0/search',
        apiAuth: { apiKeyConfig: { apiKeyString: process.env.SEARCH_API_KEY } },
      },
    };
    ```
3.  **Initialize Gemini:** Create your Gemini model instance and pass both tools to it.
    ```javascript
    const gemini = generativeModel({
      model: 'gemini-2.0-flash-001',
      tools: [ragTool, externalTool],
    });
    ```
4.  **Call Gemini:** Your backend will call `gemini.generateContent()` with the user's query. The model will automatically decide which tool to use.

## Phase 5: Integrating with Firebase

1.  **Write the Cloud Function:** Create a Firebase Cloud Function that receives the user's query and executes the Gemini call from Phase 4.
2.  **Set IAM Permissions:** Ensure the function's service account (`[PROJECT_ID]@appspot.gserviceaccount.com`) has the `Vertex AI Agent Builder Viewer` role.
3.  **Deploy:** Deploy your function using `firebase deploy --only functions`.
4.  **Frontend Call:** From your web app, use the Firebase SDK's `httpsCallable` to securely call your new Cloud Function.
