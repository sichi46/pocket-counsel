Technical Design Document: Pocket Counsel RAG Application

1. Introduction
   This document outlines the technical architecture and implementation plan for the Pocket Counsel RAG (Retrieval-Augmented Generation) application, which will integrate a Firebase frontend with a Google Cloud backend for document-based Q&A. The system will leverage a Gemini model on Vertex AI(Google Generative AI), configured with tools to access both static PDF documents and real-time data from external APIs.

2. High-Level Architecture

Frontend: A Firebase-hosted web application where users will submit queries.

Backend: A Cloud Function for Firebase, acting as a secure bridge between the frontend and the AI services.

Core RAG Service: The Google Generative AI Agent Builder - RAG Engine will handle document ingestion, indexing, and retrieval.

LLM: A Gemini model will act as the orchestrator, deciding when to use the retrieval tools and generating grounded responses.

Data Sources:

PDFs: Stored in a Google Cloud Storage (GCS) bucket.

Live Data: Accessed via a custom "Search API" backed by a Cloud Function and fronted by API Gateway.

3. RAG Approach: Model-centric (Recommended)
   This design adopts the "Model-centric" approach, which is the modern and flexible standard for developers on Google Cloud. Instead of using a high-level "Search App," we will directly configure a Gemini model with tools that point to our data sources. This provides more control and allows Gemini to intelligently use multiple data sources in a single query.

4. Data Ingestion Pipeline

PDFs: The Google.preview.generative_models.RagEngineClient Python SDK will be used to programmatically create a corpus and import files from the GCS bucket. This process handles chunking and embedding automatically.


5. Backend & Integration

Bridge Function: A Cloud Function for Firebase (queryRagEngine) will receive user queries via an https.onCall trigger.

Tool Configuration: The function will use the Vertex AI SDK to configure a Gemini model with two tools: one for the RAG Corpus (ragCorpus) and one for the live API (externalApi).

Genkit: The project will use the Genkit framework to simplify the backend flow, handling authentication, retries, and providing observability.