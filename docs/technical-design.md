Pocket Counsel
One‑sentence pitch: An AI-powered guide that makes Zambian law accessible and understandable for everyone, delivering clear, source-cited answers through a simple conversational interface.

1. OVERVIEW
   Goal:

Demystify Zambian law for citizens, students, and small business owners.

Provide a reliable, first-step informational tool for legal queries.

Empower users to understand their rights and obligations under Zambian law.

Function as an educational guide, not a substitute for professional legal advice.

Key features:

Conversational Q&A Interface

AI-Powered, Source-Grounded Answers

Source Citations with every answer

User Session & History

Prominent Legal Disclaimer

Target users & success criteria:

Users: The general Zambian public, law students, journalists, small business owners, HR professionals.

Success Criteria:

10,000+ successfully answered queries within 6 months post-launch.

Average answer "helpfulness" rating > 85%.

Automated groundedness score > 95% on the RAG evaluation dataset.

Top 10 most critical pieces of Zambian legislation onboarded by launch.

2. TECH STACK (GOLDEN PATH)
   Runtime: Node.js (Firebase Cloud Functions)

Language: TypeScript (strict)

Front‑end: React + Vite

UI kit & Styling: shadcn/ui & Tailwind CSS

State / data fetching: TanStack Query

API layer: tRPC

Backend services: Firebase (Auth, Firestore), Vertex AI (RAG Engine, Vector Search, Gemini Models)

Infrastructure as Code: Terraform

Monorepo: PNPM workspaces + Turborepo

CI / CD: GitHub Actions

3. MONOREPO LAYOUT (PNPM)
   The monorepo is structured to separate concerns, with distinct directories for the frontend, backend functions, shared packages, configuration, infrastructure, and automation scripts.

.
├── apps/
│ └── web/ ← React front‑end (The chat interface)
├── functions/ ← Firebase Cloud Functions / tRPC API layer
├── packages/
│ ├── shared/ ← Zod schemas, common types
│ └── corpus/ ← Raw legal documents (PDFs, .txt of Zambian Acts)
├── config/
│ ├── environments/ ← Environment-specific variables (.env files)
│ ├── services/ ← Service-specific configurations (.yaml files)
│ └── prompts/ ← System prompts for the LLM (.md files)
├── infrastructure/
│ └── terraform/ ← Terraform scripts for Google Cloud resources
├── scripts/
│ ├── deploy.sh ← Deployment script for CI/CD
│ └── seed-corpus.sh ← Script to ingest documents into Vertex AI
└── .github/
└── workflows/ ← GitHub Actions CI/CD workflows

4. ARCHITECTURE
   The system uses a decoupled architecture where the frontend client interacts with a tRPC API hosted on Firebase Functions. The API layer orchestrates calls to Firebase services for user data and to the Vertex AI RAG Engine for legal queries.

Client (React) ⇄ tRPC API (Firebase Functions)

tRPC API ⇄ Firebase Auth & Firestore (for user management & chat history)

tRPC API ⇄ Vertex AI RAG Engine (for answering legal questions)

5. CONFIGURATION MANAGEMENT
   Configuration is managed centrally in the config/ directory to eliminate hardcoded values and provide a clear overview of the system's settings.

config/environments/\*.env: These files contain environment-specific secrets and variables (e.g., PROJECT_ID, API keys). The appropriate file is loaded at runtime by our scripts.

config/services/\*.yaml: These files define the static configuration for external services. They can reference variables from the .env files (e.g., ${GCLOUD_PROJECT}).

config/prompts/\*.md: Contains the master system prompts for the AI, allowing them to be version-controlled and easily edited without changing application code.

6. INFRASTRUCTURE AS CODE (IaC)
   All Google Cloud resources (Firebase projects, Vertex AI indexes, Cloud Storage buckets) will be defined and managed using Terraform.

The Terraform scripts will reside in the infrastructure/terraform directory.

This ensures that our infrastructure is version-controlled, easily reproducible across different environments (dev/prod), and can be audited.

Secrets like service account keys will be managed by the CI/CD provider (GitHub Secrets) and passed to Terraform during deployment.

7. RAG ARCHITECTURE IMPLEMENTATION
   The core of Pocket Counsel is its RAG system, which has two main processes:

A. Data Ingestion Pipeline (Handled by scripts/seed-corpus.sh)

Source: Legal documents are placed in the packages/corpus directory.

Chunking: The script reads each document and splits it into smaller, logical chunks (e.g., by section or paragraph).

Embedding: Each chunk is sent to the Vertex AI Embeddings API to be converted into a vector.

Storage: The generated vectors, along with their metadata (e.g., source Act, section number), are stored and indexed in Vertex AI Vector Search.

B. RAG Query Flow (Handled by the askQuestion tRPC procedure)

User Query: A user asks a question in the frontend app.

Query Embedding: The user's question is sent to the Vertex AI Embeddings API to be converted into a vector.

Vector Search: The system queries Vertex AI Vector Search with the user's vector to find the most relevant document chunks (the "context").

LLM Generation: The original question and the retrieved context chunks are combined into a detailed prompt (from config/prompts/) and sent to a Gemini model. The prompt instructs the model to answer the question only using the provided context and to cite its sources.

Response: The grounded, source-cited answer is returned to the user.

8. DATA MODEL (FIRESTORE)
   Entity

Key fields

Notes

User

uid, email, createdAt, subscriptionStatus

Maps 1:1 with Firebase Auth. uid is the doc ID.

ChatSession

userId, title, createdAt, updatedAt

Groups a conversation.

ChatMessage

sessionId, query, response, sources (array), rating

Individual message within a session.

9. API DESIGN (tRPC)
   Router

Procedure

Input (Zod schema)

Output

chat

askQuestion

z.object({ question: z.string(), ... })

{ answer: string, sources: array, ... }

getHistory

z.object({ sessionId: z.string() })

ChatMessage[]

rateAnswer

z.object({ messageId: z.string(), ... })

{ success: boolean }

10. TESTING & RAG EVALUATION
    The strategy includes standard web testing and a dedicated track for the RAG component.

Unit/Component/Integration: Vitest + Testing Library

End‑to‑end: Playwright

RAG Evaluation: A "golden dataset" of questions will be run against the RAG Engine using the Vertex AI Evaluation Service to systematically measure groundedness, relevance, and factuality.

11. CI / CD PIPELINE & SECRETS
    The CI/CD pipeline automates testing and deployment.

Trigger: On push to the main branch.

Lint & Test: Runs ESLint and Vitest.

Deploy Infrastructure: Applies any changes from the infrastructure/terraform directory.

Deploy Application: Uses the scripts/deploy.sh script to build and deploy the app to Firebase.

Secrets Management: The deploy.sh script is responsible for loading the correct production environment variables. These secrets are securely injected into the CI/CD run via GitHub Secrets and are never stored in the repository.

12. RISKS & MITIGATION
    Risk

Mitigation

Legal Inaccuracy

Rigorous RAG evaluation, clear disclaimers, user feedback mechanism (rateAnswer).

User Misinterpretation

Prominent, unavoidable disclaimers stating the tool is not a lawyer.

Cost Overruns

Set up billing alerts in Google Cloud; monitor API usage in Vertex AI dashboards.

Corpus Freshness

Establish a clear procedure for running scripts/seed-corpus.sh when laws are amended.
