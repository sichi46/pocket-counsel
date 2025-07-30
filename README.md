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
└── docs/                   # Project documentation
```

## 🚀 Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Firebase Cloud Functions + tRPC
- **AI**: Google Cloud Vertex AI (RAG Engine, Vector Search)
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **Build System**: PNPM + Turborepo
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js 18+
- PNPM 8+
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
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase and Google Cloud credentials
   ```

4. **Start development servers**
   ```bash
   # Start all services
   pnpm dev
   
   # Or start individual services
   pnpm --filter @pocket-counsel/web dev
   pnpm --filter functions dev
   ```

## 🔧 Available Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm test` - Run tests
- `pnpm type-check` - Type check all packages
- `pnpm clean` - Clean all build artifacts

## 📚 Documentation

- [Product Design Document](docs/product-design.md)
- [Technical Design Document](docs/technical-design.md)
- [Project Roadmap](docs/to-do.md)

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