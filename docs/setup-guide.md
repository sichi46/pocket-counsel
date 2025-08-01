# Pocket Counsel Setup Guide

## 🎯 Quick Start

This guide will help you set up Pocket Counsel for local development and understand the deployment process.

## 📋 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PNPM 8+** - `npm install -g pnpm`
- **Firebase CLI** - `npm install -g firebase-tools`
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd pocket-counsel

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy the environment template
cp config/environments/.env.example config/environments/development.env

# Edit the development environment file
# See config/environments/.env.example for all required fields
```

**Required Environment Variables for Development:**

```bash
# Essential for development
NODE_ENV=development
FIREBASE_PROJECT_ID=pocket-counsel
FIRESTORE_DATABASE_ID=staging-db
USE_EMULATORS=true

# Firebase Configuration (get from Firebase Console)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=pocket-counsel.firebaseapp.com
FIREBASE_STORAGE_BUCKET=pocket-counsel.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 3. Firebase Setup

```bash
# Login to Firebase
firebase login

# Set the project
firebase use pocket-counsel

# Set up emulators (optional but recommended)
./scripts/setup-emulators.sh
```

### 4. Start Development

```bash
# Start all services
npm run dev

# Or start individual services
npm run dev --workspace=apps/web
npm run dev --workspace=functions
```

### 5. Access Your Application

- **Web App**: http://localhost:3001 (or next available port)
- **Emulator UI**: http://localhost:4000 (if emulators are running)
- **Functions**: http://localhost:5001 (if emulators are running)

## 🔧 Available Commands

### Development

```bash
npm run dev          # Start all development servers
npm run build        # Build all packages
npm run lint         # Lint all packages
npm run type-check   # Type check all packages
npm run clean        # Clean build artifacts
```

### Emulators

```bash
firebase emulators:start                    # Start all emulators
firebase emulators:start --only hosting,functions,firestore  # Start specific emulators
firebase emulators:export ./emulator-data  # Export emulator data
firebase emulators:start --import ./emulator-data  # Start with imported data
```

### Deployment (Local)

```bash
npm run deploy:dev    # Deploy to staging
npm run deploy:prod   # Deploy to production
npm run setup:databases  # Set up Firestore databases
```

## 🌍 Environment Strategy

### Environment Files Structure

```
config/environments/
├── .env.example          # Template (committed to repo)
├── development.env       # Local development (gitignored)
├── staging.env          # Staging deployment (gitignored)
└── production.env       # Production deployment (gitignored)
```

### Environment-Specific Configurations

| Environment     | Database     | Emulators   | Purpose                   |
| --------------- | ------------ | ----------- | ------------------------- |
| **Development** | `staging-db` | ✅ Enabled  | Local development         |
| **Staging**     | `staging-db` | ❌ Disabled | Testing before production |
| **Production**  | `(default)`  | ❌ Disabled | Live application          |

### Database Strategy

- **`staging-db`**: Used for development and staging (safe for testing)
- **`(default)`**: Used for production (real user data)

## 🔐 GitHub Secrets Setup

For CI/CD to work, you need to set up these secrets in your GitHub repository:

### Required Secrets

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=pocket-counsel
FIREBASE_API_KEY=your-api-key
FIREBASE_TOKEN=your-firebase-token

# Optional (for advanced features)
GOOGLE_CLOUD_CREDENTIALS=base64-encoded-service-account-key
```

### How to Get Firebase Token

```bash
# Generate a CI token
firebase login:ci --no-localhost

# This will give you a token to use in GitHub secrets
```

## 🚀 Deployment Process

### Manual Deployment

1. **Staging Deployment**

   ```bash
   npm run deploy:dev
   ```

2. **Production Deployment**
   ```bash
   npm run deploy:prod
   ```

### Automated Deployment (CI/CD)

- **Push to `develop` branch** → Deploys to staging
- **Push to `main` branch** → Deploys to production
- **Pull Request to `main`** → Runs tests only

## 🛠️ Troubleshooting

### Common Issues

1. **"Port 3000 is in use"**

   ```bash
   # The app will automatically try the next available port
   # Check the terminal output for the actual URL
   ```

2. **"Firebase project not found"**

   ```bash
   # Make sure you're logged in
   firebase login

   # Check your project
   firebase projects:list
   ```

3. **"Environment variables not found"**

   ```bash
   # Check if development.env exists
   ls config/environments/

   # Copy the template if missing
   cp config/environments/.env.example config/environments/development.env
   ```

4. **"Emulators not starting"**

   ```bash
   # Check if ports are available
   netstat -an | grep :4000
   netstat -an | grep :5000
   netstat -an | grep :5001
   netstat -an | grep :8080

   # Kill processes using those ports if needed
   ```

### Getting Help

1. Check the [Environment Strategy](docs/environment-strategy.md) for detailed configuration
2. Review the [Technical Design](docs/technical-design.md) for architecture details
3. Open an issue in the GitHub repository

## 📚 Additional Resources

- [Product Design Document](docs/product-design.md)
- [Technical Design Document](docs/technical-design.md)
- [Environment Strategy](docs/environment-strategy.md)
- [Project Roadmap](docs/to-do.md)

## 🎉 You're Ready!

Once you've completed this setup, you should be able to:

- ✅ Run the application locally
- ✅ Use Firebase emulators for testing
- ✅ Deploy to staging and production
- ✅ Contribute to the project

Happy coding! 🚀
