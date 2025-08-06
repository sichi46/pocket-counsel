# Pocket Counsel - Project Structure

## 📁 Overview

Pocket Counsel is a monorepo built with **NPM + Turborepo** for optimal build orchestration and dependency management. The project follows SOLID principles and separation of concerns for scalable architecture.

## 🏗️ Monorepo Architecture

```
pocket-counsel/
├── 📁 apps/                    # Frontend applications
│   └── 📁 web/                # React web application
├── 📁 packages/               # Shared packages and libraries
│   ├── 📁 shared/            # Shared types, utilities, and models
│   └── 📁 corpus/            # Legal corpus and training data
├── 📁 functions/              # Firebase Cloud Functions (Backend)
├── 📁 config/                 # Configuration files
│   ├── 📁 environments/      # Environment-specific configs
│   ├── 📁 prompts/           # AI system prompts
│   └── 📁 services/          # Service configurations
├── 📁 scripts/               # Deployment and utility scripts
├── 📁 docs/                  # Project documentation
└── 📁 public/               # Static assets
```

## 📂 Detailed Structure

### 🎯 **apps/web/** - React Frontend
```
apps/web/
├── 📁 src/
│   ├── 📄 App.tsx           # Main application component
│   ├── 📄 main.tsx          # Application entry point
│   └── 📁 components/       # React components (future)
├── 📄 package.json          # Frontend dependencies
├── 📄 tsconfig.json         # TypeScript configuration
└── 📄 vite.config.ts        # Vite build configuration
```

**Purpose:** Modern React application with TypeScript, Vite, and Tailwind CSS for the user interface.

### 🔧 **functions/** - Firebase Cloud Functions
```
functions/
├── 📁 src/
│   ├── 📄 index.ts          # Main functions entry point
│   └── 📁 routers/          # tRPC routers (future)
├── 📄 package.json          # Functions dependencies
└── 📄 tsconfig.json         # TypeScript configuration
```

**Purpose:** Serverless backend functions for API endpoints, authentication, and AI processing.

### 📦 **packages/shared/** - Shared Code
```
packages/shared/
├── 📁 src/
│   ├── 📁 types/            # TypeScript type definitions
│   ├── 📁 models/           # Data models and schemas
│   ├── 📁 utils/            # Shared utilities
│   └── 📁 schemas/          # Validation schemas
├── 📄 package.json          # Shared package dependencies
└── 📄 tsconfig.json         # TypeScript configuration
```

**Purpose:** Common code shared between frontend and backend for type safety and consistency.

### 📚 **packages/corpus/** - Legal Data
```
packages/corpus/
├── 📄 sample-zambian-law.txt # Sample legal corpus
└── 📄 package.json          # Corpus package configuration
```

**Purpose:** Legal corpus and training data for AI models.

### ⚙️ **config/** - Configuration Management
```
config/
├── 📁 environments/
│   ├── 📄 .env.example      # Environment template
│   ├── 📄 development.env   # Local development (gitignored)
│   ├── 📄 staging.env       # Staging environment (gitignored)
│   └── 📄 production.env    # Production environment (gitignored)
├── 📁 prompts/
│   └── 📄 system-prompt.md  # AI system prompts
└── 📁 services/
    └── 📄 firebase.yaml     # Firebase service configuration
```

**Purpose:** Environment-specific configurations and service settings.

### 🚀 **scripts/** - Deployment & Utilities
```
scripts/
├── 📄 deploy-dev.sh         # Development deployment
├── 📄 deploy-production.sh  # Production deployment
├── 📄 deploy-staging.sh     # Staging deployment
├── 📄 setup-databases.sh    # Database setup
├── 📄 setup-emulators.sh    # Firebase emulators setup
└── 📄 seed-corpus.sh        # Data seeding utilities
```

**Purpose:** Automated deployment and setup scripts for different environments.

### 📖 **docs/** - Documentation
```
docs/
├── 📄 product-design.md     # Product requirements and design
├── 📄 technical-design.md   # Technical architecture
├── 📄 to-do.md             # Project roadmap and milestones
├── 📄 project-structure.md # This file
└── 📄 staging-production-setup.md # Environment setup guide
```

**Purpose:** Project documentation and guides.

## 🔄 Build & Development Workflow

### **Development Commands:**
```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Build all packages
npm run build

# Run linting
npm run lint

# Run tests
npm run test

# Type checking
npm run type-check
```

### **Deployment Commands:**
```bash
# Deploy to staging
npm run deploy:dev

# Deploy to production
npm run deploy:prod

# Setup databases
npm run setup:databases
```

## 🏛️ Architecture Principles

### **SOLID Principles:**
- **Single Responsibility:** Each package has a clear, focused purpose
- **Open/Closed:** Extensible through shared packages
- **Liskov Substitution:** Type-safe interfaces
- **Interface Segregation:** Modular package dependencies
- **Dependency Inversion:** Shared abstractions

### **Separation of Concerns:**
- **Frontend:** UI/UX and user interactions
- **Backend:** Business logic and API endpoints
- **Shared:** Common types and utilities
- **Config:** Environment and service management
- **Docs:** Knowledge and guides

### **Code Factoring:**
- **Monorepo:** Single source of truth
- **Shared Types:** Type safety across boundaries
- **Modular Scripts:** Reusable deployment logic
- **Environment Isolation:** Separate configs per environment

## 🔐 Security & Best Practices

### **Environment Management:**
- `.env` files are gitignored
- Only `example.env` is committed
- GitHub secrets for production credentials
- Environment-specific configurations

### **Firebase Security:**
- Firestore security rules
- Authentication integration
- Function-level security
- Database isolation (staging vs production)

## 🚀 Deployment Strategy

### **Environment Isolation:**
- **Development:** Uses staging database, local emulators
- **Staging:** Uses staging database, Firebase hosting
- **Production:** Uses production database, Firebase hosting

### **CI/CD Pipeline:**
- GitHub Actions for automated deployment
- Environment-specific secrets
- Automated testing and linting
- Branch-based deployment triggers

## 📊 Technology Stack

### **Frontend:**
- React 18+ with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Firebase SDK for client-side features

### **Backend:**
- Firebase Cloud Functions
- Node.js 20+ (latest LTS)
- TypeScript for type safety
- Firebase Admin SDK

### **Infrastructure:**
- Firebase Hosting
- Firestore Database
- Firebase Authentication
- Google Cloud Vertex AI (future)

### **Development Tools:**
- NPM for package management
- Turborepo for build orchestration
- ESLint + Prettier for code quality
- Husky for git hooks
- Vitest for testing

## 🎯 Key Benefits

1. **Scalability:** Monorepo structure supports growth
2. **Type Safety:** Shared types across frontend/backend
3. **Developer Experience:** Fast builds with Turborepo
4. **Security:** Environment isolation and proper secrets management
5. **Maintainability:** Clear separation of concerns
6. **Deployment:** Automated CI/CD with environment-specific configs

---

*This structure supports the AI-powered Zambian legal guide vision while maintaining enterprise-grade software engineering practices.*
