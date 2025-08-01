# Environment Variables & GitHub Secrets Strategy

## 🎯 Overview

This document outlines how environment variables are managed across different environments and how GitHub secrets are used for CI/CD.

## 📁 Environment File Structure

```
config/environments/
├── .env.example          # Template (committed to repo)
├── development.env       # Local development (gitignored)
├── staging.env          # Staging deployment (gitignored)
└── production.env       # Production deployment (gitignored)
```

## 🔐 GitHub Secrets Strategy

### Required Secrets for CI/CD

#### Firebase Configuration Secrets

```bash
# Firebase Project Configuration
FIREBASE_PROJECT_ID=pocket-counsel
FIREBASE_API_KEY=AIzaSyCqILfoeqPnBV6FHQOz7ZvXxRhCd0rEy6M
FIREBASE_AUTH_DOMAIN=pocket-counsel.firebaseapp.com
FIREBASE_STORAGE_BUCKET=pocket-counsel.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=787651119619
FIREBASE_APP_ID=1:787651119619:web:fd178d0f97ac8fa1751c36
FIREBASE_MEASUREMENT_ID=G-QWRSHYZQB0
```

#### Google Cloud Secrets

```bash
# Google Cloud Configuration
GCLOUD_PROJECT=pocket-counsel
GCLOUD_REGION=us-central1
VERTEX_AI_LOCATION=us-central1
```

#### Database Configuration

```bash
# Firestore Database Selection
FIRESTORE_DATABASE_ID=staging-db  # for staging
FIRESTORE_DATABASE_ID=(default)   # for production
```

#### Deployment Secrets

```bash
# Firebase CLI Token (for automated deployments)
FIREBASE_TOKEN=your-firebase-token-here

# Google Cloud Service Account Key (for database operations)
GOOGLE_CLOUD_CREDENTIALS=base64-encoded-service-account-key
```

## 🚀 CI/CD Workflow Integration

### GitHub Actions Workflow Example

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main, develop]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build application
        run: npm run build
        env:
          NODE_ENV: staging
          FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          FIRESTORE_DATABASE_ID: staging-db

      - name: Deploy to Staging
        run: |
          echo ${{ secrets.FIREBASE_TOKEN }} | firebase login --token
          firebase deploy --only hosting,functions --project pocket-counsel
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}

  deploy-production:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
          FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          FIRESTORE_DATABASE_ID: '(default)'

      - name: Deploy to Production
        run: |
          echo ${{ secrets.FIREBASE_TOKEN }} | firebase login --token
          firebase deploy --only hosting,functions --project pocket-counsel
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## 🔧 Local Development Setup

### 1. Copy Environment Template

```bash
cp config/environments/.env.example config/environments/development.env
```

### 2. Update Development Environment

Edit `config/environments/development.env` with your local values:

```bash
# Development Environment Configuration
NODE_ENV=development
FIREBASE_PROJECT_ID=pocket-counsel
FIRESTORE_DATABASE_ID=staging-db
USE_EMULATORS=true
```

### 3. Start Emulators

```bash
firebase emulators:start
```

## 🛡️ Security Best Practices

### 1. Never Commit Sensitive Files

```bash
# .gitignore entries
config/environments/development.env
config/environments/staging.env
config/environments/production.env
```

### 2. Use Environment-Specific Secrets

- **Staging**: Use `staging-db` database
- **Production**: Use `(default)` database
- **Development**: Use emulators + `staging-db`

### 3. Rotate Secrets Regularly

- Firebase tokens expire every 1 hour
- Service account keys should be rotated quarterly
- API keys should be regenerated if compromised

## 📋 Environment Variable Reference

| Variable                | Development      | Staging          | Production       | Purpose                |
| ----------------------- | ---------------- | ---------------- | ---------------- | ---------------------- |
| `NODE_ENV`              | `development`    | `staging`        | `production`     | Environment identifier |
| `FIRESTORE_DATABASE_ID` | `staging-db`     | `staging-db`     | `(default)`      | Database selection     |
| `USE_EMULATORS`         | `true`           | `false`          | `false`          | Enable local emulators |
| `FIREBASE_PROJECT_ID`   | `pocket-counsel` | `pocket-counsel` | `pocket-counsel` | Firebase project       |
| `LOG_LEVEL`             | `debug`          | `info`           | `warn`           | Logging verbosity      |

## 🔄 Deployment Workflow

### Staging Deployment

```bash
# Load staging environment
source config/environments/staging.env

# Deploy to staging
firebase deploy --only hosting,functions
```

### Production Deployment

```bash
# Load production environment
source config/environments/production.env

# Deploy to production
firebase deploy --only hosting,functions
```

## 🚨 Troubleshooting

### Common Issues

1. **Missing Environment Variables**

   ```bash
   # Check if environment file exists
   ls -la config/environments/

   # Verify variables are loaded
   echo $FIREBASE_PROJECT_ID
   ```

2. **Firebase Token Expired**

   ```bash
   # Generate new token
   firebase login --no-localhost
   firebase login:ci --no-localhost
   ```

3. **Database Connection Issues**

   ```bash
   # Check database exists
   firebase firestore:databases:list

   # Create missing database
   firebase firestore:databases:create staging-db --location us-central1
   ```
