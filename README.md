# Pocket Counsel

An AI-powered guide that makes Zambian law accessible and understandable for everyone, delivering clear, source-cited answers through a simple conversational interface.

## 🎯 Mission

Demystify Zambian law for citizens, students, and small business owners by translating complex legal text into plain English. Provide a reliable, first-step informational tool for legal queries, reducing uncertainty and improving legal literacy.

## 🏗️ Architecture

This project follows a monorepo structure with clear separation of concerns:

```
pocket-counsel/
├── apps/
│   └── web/                 # React frontend (chat interface)
├── functions/               # Firebase Cloud Functions + tRPC
├── packages/
│   ├── shared/             # Shared types, schemas, utilities
│   ├── corpus/             # Zambian legal documents
│   └── seeding/            # Scripts to ingest corpus into Vertex AI
├── config/
│   ├── environments/       # Environment-specific variables (.env files)
│   ├── services/           # Service-specific configurations (.yaml files)
│   └── prompts/            # System prompts for the LLM (.md files)
├── infrastructure/
│   └── terraform/          # Infrastructure as Code scripts
├── scripts/
│   ├── deploy.sh           # Deployment script for CI/CD
│   └── seed-corpus.sh      # Script to ingest documents into Vertex AI
└── docs/                   # Project documentation
```

## 🚀 Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Firebase Cloud Functions + tRPC
- **AI**: Google Cloud Vertex AI (RAG Engine, Vector Search)
- **Database**: Firestore (Multi-database setup: staging-db, production)
- **Authentication**: Firebase Auth
- **Build System**: NPM + Turborepo
- **CI/CD**: GitHub Actions
- **Environment**: Multi-environment setup (development, staging, production)

## 📋 Prerequisites

- Node.js 20+
- Firebase CLI
- Google Cloud CLI

## 🛠️ Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd pocket-counsel
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy the environment template
   cp config/environments/.env.example config/environments/development.env

   # Edit development.env with your Firebase and Google Cloud credentials
   # See docs/environment-strategy.md for detailed configuration
   ```

4. **Set up Firebase emulators (optional)**

   ```bash
   # Configure emulators for local development
   ./scripts/setup-emulators.sh

   # Start emulators
   firebase emulators:start
   ```

5. **Start development servers**

   ```bash
   # Start all services
   npm run dev

   # Or start individual services
   npm run --workspace=@pocket-counsel/web dev
   npm run --workspace=functions dev
   ```

## 🔧 Available Scripts

### Development

- `npm run dev` - Start all development servers
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `npm run test` - Run tests
- `npm run type-check` - Type check all packages
- `npm run clean` - Clean all build artifacts

### Deployment

- `npm run deploy:dev` - Deploy to staging environment
- `npm run deploy:prod` - Deploy to production environment
- `npm run setup:databases` - Set up Firestore databases

### Emulators

- `firebase emulators:start` - Start all Firebase emulators
- `firebase emulators:start --only hosting,functions,firestore` - Start specific emulators

## 📚 Documentation

- [Setup Guide](docs/setup-guide.md) - Complete setup instructions for new contributors
- [Product Design Document](docs/product-design.md)
- [Technical Design Document](docs/technical-design.md)
- [Project Roadmap](docs/to-do.md)
- [Environment Strategy](docs/environment-strategy.md) - Environment variables and GitHub secrets management

## 🏛️ Legal Disclaimer

Pocket Counsel provides informational guidance only and is not a substitute for professional legal advice. For specific legal matters, please consult a qualified lawyer.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.
