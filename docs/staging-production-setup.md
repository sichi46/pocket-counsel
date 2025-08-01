# Staging/Production Setup Guide

## Overview: Two Database Approach

We're implementing **Option 1: Two Databases** for staging/production isolation within a single Firebase project.

### Architecture

```
Firebase Project: pocket-counsel
├── Database 1: (default) - Production data
├── Database 2: staging-db - Staging data
└── Hosting: pocket-counsel.web.app (same URL, different DB based on environment)
```

## How It Works

### 1. Environment Variables Control Database Selection

**Production Environment** (`config/environments/production.env`):

```bash
FIRESTORE_DATABASE_ID=(default)  # Uses the default database
NODE_ENV=production
```

**Staging Environment** (`config/environments/staging.env`):

```bash
FIRESTORE_DATABASE_ID=staging-db  # Uses the staging database
NODE_ENV=staging
```

### 2. Functions Dynamically Connect to Correct Database

The `functions/src/index.ts` contains logic to connect to the appropriate database:

```typescript
// Get Firestore instance based on environment
const getDatabase = () => {
  return admin.firestore();
};

// Functions use the database based on environment variables
export const health = functions.https.onRequest((_req, res) => {
  const db = getDatabase();
  res.json({
    status: 'ok',
    database: process.env.FIRESTORE_DATABASE_ID || '(default)',
    environment: process.env.NODE_ENV || 'development',
  });
});
```

### 3. Deployment Scripts Set Environment

**Staging Deployment** (`scripts/deploy-staging.sh`):

```bash
# Load staging environment variables
export $(cat config/environments/staging.env | xargs)
# This sets FIRESTORE_DATABASE_ID=staging-db
firebase deploy --only hosting,functions
```

**Production Deployment** (`scripts/deploy-production.sh`):

```bash
# Load production environment variables
export $(cat config/environments/production.env | xargs)
# This sets FIRESTORE_DATABASE_ID=(default)
firebase deploy --only hosting,functions
```

## Setup Steps

### Step 1: Enable Firestore API

1. Visit: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=pocket-counsel
2. Click "Enable API"
3. Wait 2-3 minutes for propagation

### Step 2: Create Staging Database

```bash
firebase firestore:databases:create staging-db --location us-central1 --project pocket-counsel
```

### Step 3: Deploy to Staging

```bash
./scripts/deploy-staging.sh
```

### Step 4: Deploy to Production

```bash
./scripts/deploy-production.sh
```

## Benefits of This Approach

✅ **Complete Data Isolation**: Staging data never mixes with production
✅ **Same Codebase**: One deployment, environment variables control behavior  
✅ **Cost Effective**: One project, one hosting site
✅ **Easier Testing**: Test with real data without affecting production
✅ **Simpler CI/CD**: One deployment pipeline

## Verification

After deployment, you can verify which database is being used by calling the health endpoint:

**Staging**: Will show `"database": "staging-db"`
**Production**: Will show `"database": "(default)"`

## Next Steps

1. Enable the Firestore API in Google Cloud Console
2. Create the staging database using the Firebase CLI command
3. Test deployments using the provided scripts
4. Verify database isolation by checking the health endpoint responses
