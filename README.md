# Pocket Counsel

An AI-powered guide that makes Zambian law accessible and understandable for everyone, delivering clear, source-cited answers through a simple conversational interface.

## 🚀 Tech Stack

- **Runtime**: Node.js (Firebase Cloud Functions)
- **Language**: TypeScript (strict)
- **Frontend**: React + Vite
- **UI Kit**: shadcn/ui (Radix + Tailwind)
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query
- **Forms & Validation**: React Hook Form + Zod
- **API Layer**: tRPC (typed RPC)
- **Backend Services**: Firebase Auth, Firestore, Storage, Functions
- **AI Engine**: Vertex AI (RAG Engine, Vector Search, Gemini Models)
- **Package Manager**: PNPM workspaces
- **Build Orchestration**: Turborepo
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
pocket-counsel/
├── apps/
│   └── web/                      # React frontend (chat interface)
├── functions/                    # Firebase Cloud Functions / tRPC routers
├── packages/
│   ├── shared/                   # Zod schemas, common types
│   ├── corpus/                   # Raw legal documents (PDFs, .txt files)
│   └── seeding/                  # Scripts to ingest corpus into Vertex AI
├── docs/                         # Project documentation
└── .github/                      # CI workflows
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- PNPM 8.15.0+
- Firebase CLI
- Google Cloud SDK

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd pocket-counsel
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Configure the following variables:
   - `GOOGLE_CLOUD_PROJECT`: Your Google Cloud project ID
   - `VERTEX_AI_LOCATION`: Vertex AI location (e.g., us-central1)
   - `VERTEX_AI_MODEL`: Model name (e.g., gemini-pro)
   - `VERTEX_AI_ENDPOINT_ID`: Optional custom endpoint ID

4. **Build shared packages**
   ```bash
   pnpm build
   ```

### Running the Application

#### Development Mode

1. **Start the web application**

   ```bash
   cd apps/web
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

2. **Start Firebase Functions (in another terminal)**
   ```bash
   cd functions
   pnpm serve
   ```

#### Production Build

```bash
# Build all packages
pnpm build

# Deploy to Firebase
firebase deploy
```

## 📚 Corpus Management

### Ingesting Legal Documents

1. **Place PDF documents in the corpus directory**

   ```bash
   packages/corpus/
   ```

2. **Run the ingestion script**
   ```bash
   cd packages/seeding
   pnpm ingest ../corpus/
   ```

### Querying the RAG System

```bash
cd packages/seeding
pnpm query "What are the requirements for starting a business in Zambia?"
```

## 🔧 Available Scripts

### Root Level

- `pnpm build` - Build all packages
- `pnpm dev` - Start development servers
- `pnpm lint` - Run linting across all packages
- `pnpm test` - Run tests across all packages
- `pnpm clean` - Clean build artifacts

### Web App (`apps/web`)

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests

### Functions (`functions`)

- `pnpm build` - Build TypeScript
- `pnpm serve` - Start Firebase emulator
- `pnpm deploy` - Deploy to Firebase

### Seeding (`packages/seeding`)

- `pnpm ingest <path>` - Ingest corpus from directory
- `pnpm query <question>` - Query the RAG system

## 🏗️ Architecture

### Frontend (React + Vite)

- **Chat Interface**: Main conversational UI
- **Message Components**: Display user queries and AI responses
- **Source Citations**: Expandable legal source references
- **Rating System**: Thumbs up/down for answer quality

### Backend (Firebase Functions + tRPC)

- **API Layer**: Type-safe tRPC procedures
- **Authentication**: Firebase Auth integration
- **Database**: Firestore for chat history and user data
- **AI Integration**: Vertex AI RAG engine calls

### AI Pipeline (Vertex AI)

- **Document Processing**: PDF extraction and chunking
- **Vector Search**: Semantic document retrieval
- **RAG Engine**: Context-aware answer generation
- **Source Grounding**: Citation extraction and validation

## 🔒 Security & Compliance

- **Legal Disclaimer**: Prominent disclaimers throughout the UI
- **Source Citations**: Every answer includes legal references
- **User Authentication**: Firebase Auth for user management
- **Rate Limiting**: API rate limiting to prevent abuse
- **Data Privacy**: Minimal data collection, user consent

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific package tests
cd apps/web && pnpm test
cd functions && pnpm test
```

## 📊 Monitoring & Analytics

- **Error Tracking**: Sentry integration
- **Performance**: Google Cloud Logging
- **AI Metrics**: Vertex AI monitoring
- **User Analytics**: PostHog/Google Analytics

## 🚀 Deployment

### Firebase Deployment

1. **Configure Firebase project**

   ```bash
   firebase use <project-id>
   ```

2. **Deploy functions and hosting**
   ```bash
   firebase deploy
   ```

### Vertex AI Setup

1. **Enable Vertex AI API**

   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```

2. **Create vector search index**
   ```bash
   gcloud ai index-endpoints create --region=us-central1
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Legal Disclaimer

This application provides general legal information for educational purposes only. It is not a substitute for professional legal advice. Always consult with a qualified lawyer for specific legal matters. The information provided may not be complete, accurate, or up-to-date.
