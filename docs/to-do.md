Pocket Counsel: Project Roadmap & To-Do List
This document outlines the development milestones and associated tasks for building the Pocket Counsel MVP. The timeline is structured into focused sprints, prioritizing a logical build order from foundational setup to core feature implementation and finally, launch readiness.

✅ Milestone 1: Project Foundation & Setup (Sprint 0) - COMPLETED
Goal: Establish the complete development environment, CI/CD pipeline, and project structure. This ensures the team has a solid, automated foundation before writing feature code.
Completed: August 1, 2025
Deployed: https://pocket-counsel.web.app

Completed Tasks:

Infrastructure & DevOps:

[x] Initialize PNPM monorepo with Turborepo for build orchestration.

[x] Set up the Firebase project (pocketcounsel-prod) with Auth, Firestore, and Cloud Functions enabled.

[x] Set up a parallel Firebase project (pocketcounsel-dev) for testing.

[x] Set up the basic CI/CD pipeline in GitHub Actions (lint, test, build).

[x] Configure secret management for API keys (Firebase, Vertex AI) in GitHub Actions.

[x] COMPLETED: Create custom deployment script to handle workspace:\* protocol issues for deploying the monorepo to Firebase Functions.

Backend & AI Setup:

[x] Set up the Google Cloud project and enable Vertex AI APIs.

[x] Scaffold the tRPC server within the functions directory.

[x] Place initial legal documents into the packages/corpus directory.

Frontend Setup:

[x] Scaffold the React + Vite application within the apps/web directory.

[x] Integrate Tailwind CSS and initialize shadcn/ui.

[x] Connect the tRPC client to the React application.

Tooling & Quality:

[x] Configure ESLint, Prettier, and Husky pre-commit hooks.

[x] Create initial Zod schemas for core data models (User, ChatMessage) in packages/shared.

[x] Configure Vitest for unit and component testing.

🚀 RAG PIPELINE BREAKTHROUGH (August 2025)
Goal: Prove the core technical viability of the RAG (Retrieval-Augmented Generation) engine by successfully ingesting the legal corpus and getting the first accurate, source-cited answer. This is the riskiest and most critical part of the project.
Status: ⏳ PENDING

To-Do List:

[ ] Corpus Ingestion: Write and execute the seed-corpus.sh script to process the legal documents and ingest them into Vertex AI Vector Search.

[ ] RAG Engine Configuration: Configure the Vertex AI RAG Engine in the Google Cloud Console, connecting it to the new Vector Search index and a Gemini model.

[ ] Backend Integration: Implement the askQuestion tRPC procedure in the functions package to successfully call the RAG Engine endpoint.

[ ] End-to-End Test: Perform the first end-to-end test by sending a query from a test script, through the tRPC endpoint, to the RAG Engine, and verifying that the response is accurate and contains source citations.

Key Technical Solutions to Achieve:

Document Chunking: Implement an effective strategy for splitting large legal documents into meaningful, searchable chunks.

Prompt Engineering: Craft the initial system prompt in config/prompts/ that instructs the LLM to use the retrieved context and provide source-cited answers.

API Authentication: Successfully authenticate requests from the Firebase Cloud Function to the secured Vertex AI endpoint.

Milestone 2: Core Q&A Flow (MVP Part 1) - PENDING
Goal: Implement the complete conversational interface, allowing any user to ask a question and receive an AI-generated answer. This is the core "ask and answer" loop of the application.
Estimated Completion: August 22, 2025 (3 Weeks)

To-Do List:

UI/UX Foundation:

[ ] Install all necessary shadcn/ui components (button, input, card, toast, etc.).

[ ] Build the main chat interface components: ChatWindow, MessageBubble, ChatInput, DisclaimerBanner, and SourceCitation.

Core Feature Implementation:

[ ] Connect the ChatInput component to the askQuestion tRPC procedure using TanStack Query for mutation handling.

[ ] Implement the UI logic to display the stream of messages, including the AI's response and its sources.

[ ] Add loading states, error handling (using toasts), and a "Copy Answer" feature.

[ ] Ensure the legal disclaimer is prominently and persistently displayed.

Testing:

[ ] Write component tests for MessageBubble and ChatInput.

[ ] Write integration tests for the chat flow, mocking the tRPC client to simulate API responses.

Milestone 3: User Accounts & History (MVP Part 2) - PENDING
Goal: Allow users to sign up, log in, and view their past conversations. This adds personalization and utility to the platform.
Estimated Completion: September 12, 2025 (3 Weeks)

To-Do List:

Authentication:

[ ] Implement Firebase Authentication for email/password and Google sign-in.

[ ] Build the UI for the Login and Signup pages using shadcn/ui Form components.

[ ] Create protected routes and an authentication context to manage user state.

User Features:

[ ] Implement the getHistory tRPC procedure to fetch a user's past chat messages from Firestore.

[ ] Build the UI for a "Chat History" sidebar or page where users can view and resume past conversations.

[ ] Implement the rateAnswer tRPC procedure and connect it to a thumbs-up/down UI on each MessageBubble.

Data & Security:

[ ] Finalize Firestore security rules to ensure users can only access their own chat history.

[ ] Update the askQuestion logic to associate conversations with the logged-in userId.

Milestone 4: Admin, Evaluation & Internal Alpha - PENDING
Goal: Build the necessary tools for quality control and conduct a thorough internal test of the end-to-end flow.
Estimated Completion: October 3, 2025 (3 Weeks)

To-Do List:

Admin & Evaluation:

[ ] Create the "golden dataset" of test questions and expected outcomes for RAG evaluation.

[ ] Set up a scheduled GitHub Action to run the evaluation against the Vertex AI model and report on groundedness and accuracy.

[ ] Refine the corpus seeding scripts to make updating the legal knowledge base easier.

Testing & Polish:

[ ] Write end-to-end tests with Playwright for the full user journey: signup -> ask question -> view history -> rate answer.

[ ] Conduct a full internal Alpha test where the team uses the app extensively to find bugs and UX issues.

[ ] Collect all feedback and bugs into a prioritized backlog.

Milestone 5: Beta Testing & Launch Readiness - PENDING
Goal: Refine the product based on feedback, ensure stability, and prepare for a public launch.
Estimated Completion: October 24, 2025 (3 Weeks)

To-Do List:

Refinement & Monitoring:

[ ] Fix all critical bugs identified during the Alpha test.

[ ] Integrate Sentry for error monitoring and PostHog/GA for user analytics.

[ ] Set up budget alerts and logging dashboards in Google Cloud for Firebase and Vertex AI.

Launch Prep:

[ ] Conduct a closed Beta test with a small group of law students or legal professionals.

[ ] Prepare marketing materials and a simple landing page.

[ ] Final Go/No-Go meeting.

[ ] LAUNCH Pocket Counsel MVP!
