# GitHub Secrets Setup Guide

## 🎯 Overview

This guide will help you set up GitHub secrets for automated deployment of Pocket Counsel.

## 📋 Prerequisites

- GitHub repository access
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created (`pocket-counsel`)

## 🔐 Step-by-Step Setup

### Step 1: Generate Firebase CI Token

```bash
# Login to Firebase (if not already logged in)
firebase login

# Generate a CI token
firebase login:ci --no-localhost
```

**Expected Output:**

```
✔  Success! Use this token to login on a CI server:

1//0example-token-here

Example: firebase deploy --token "$FIREBASE_TOKEN"
```

**⚠️ Important:** Copy this token - you'll need it for GitHub secrets.

### Step 2: Access GitHub Repository Settings

1. Go to your GitHub repository: `https://github.com/your-username/pocket-counsel`
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 3: Add Required Secrets

Click **New repository secret** for each of the following:

#### 🔥 Firebase Configuration Secrets

**Secret Name:** `FIREBASE_PROJECT_ID`
**Secret Value:** `pocket-counsel`

**Secret Name:** `FIREBASE_API_KEY`
**Secret Value:** `AIzaSyCqILfoeqPnBV6FHQOz7ZvXxRhCd0rEy6M`

**Secret Name:** `FIREBASE_AUTH_DOMAIN`
**Secret Value:** `pocket-counsel.firebaseapp.com`

**Secret Name:** `FIREBASE_STORAGE_BUCKET`
**Secret Value:** `pocket-counsel.firebasestorage.app`

**Secret Name:** `FIREBASE_MESSAGING_SENDER_ID`
**Secret Value:** `787651119619`

**Secret Name:** `FIREBASE_APP_ID`
**Secret Value:** `1:787651119619:web:fd178d0f97ac8fa1751c36`

**Secret Name:** `FIREBASE_MEASUREMENT_ID`
**Secret Value:** `G-QWRSHYZQB0`

#### 🔑 Deployment Secrets

**Secret Name:** `FIREBASE_TOKEN`
**Secret Value:** `1//0example-token-here` (use the token from Step 1)

#### 🌐 Google Cloud Secrets (Optional)

**Secret Name:** `GCLOUD_PROJECT`
**Secret Value:** `pocket-counsel`

**Secret Name:** `GCLOUD_REGION`
**Secret Value:** `us-central1`

### Step 4: Verify Secrets

Your GitHub secrets should look like this:

| Secret Name                    | Description                  | Example Value                        |
| ------------------------------ | ---------------------------- | ------------------------------------ |
| `FIREBASE_PROJECT_ID`          | Firebase project ID          | `pocket-counsel`                     |
| `FIREBASE_API_KEY`             | Firebase API key             | `AIzaSyC...`                         |
| `FIREBASE_AUTH_DOMAIN`         | Firebase auth domain         | `pocket-counsel.firebaseapp.com`     |
| `FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket      | `pocket-counsel.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `787651119619`                       |
| `FIREBASE_APP_ID`              | Firebase app ID              | `1:787651119619:web:...`             |
| `FIREBASE_MEASUREMENT_ID`      | Firebase measurement ID      | `G-QWRSHYZQB0`                       |
| `FIREBASE_TOKEN`               | Firebase CI token            | `1//0example-token-here`             |
| `GCLOUD_PROJECT`               | Google Cloud project ID      | `pocket-counsel`                     |
| `GCLOUD_REGION`                | Google Cloud region          | `us-central1`                        |

## 🚀 Test the Setup

### Step 5: Trigger a Test Deployment

1. **Create a test branch:**

   ```bash
   git checkout -b test-ci
   git push origin test-ci
   ```

2. **Check GitHub Actions:**
   - Go to **Actions** tab in your repository
   - You should see the workflow running
   - Check for any errors in the logs

3. **Verify deployment:**
   - If successful, your app should be deployed to Firebase Hosting
   - Check: `https://pocket-counsel.web.app`

## 🔧 Troubleshooting

### Common Issues

1. **"Firebase token expired"**

   ```bash
   # Generate a new token
   firebase login:ci --no-localhost
   # Update the FIREBASE_TOKEN secret
   ```

2. **"Project not found"**
   - Verify `FIREBASE_PROJECT_ID` secret matches your project
   - Check if you're logged into the correct Firebase account

3. **"Permission denied"**
   - Ensure your Firebase account has access to the project
   - Check if billing is enabled (required for Cloud Functions)

### Debug Workflow

1. **Check workflow logs:**
   - Go to Actions → Click on the workflow run
   - Expand each step to see detailed logs

2. **Test locally first:**
   ```bash
   # Test deployment locally
   npm run deploy:dev
   ```

## 🛡️ Security Best Practices

1. **Never commit secrets to code**
   - All secrets are stored in GitHub, not in code
   - Environment files are gitignored

2. **Rotate tokens regularly**
   - Firebase tokens expire every 1 hour
   - Generate new tokens when needed

3. **Use environment-specific secrets**
   - Staging and production use different databases
   - Secrets are environment-aware

## ✅ Verification Checklist

- [ ] Firebase CI token generated
- [ ] All required secrets added to GitHub
- [ ] Test branch created and pushed
- [ ] GitHub Actions workflow runs successfully
- [ ] Deployment to Firebase Hosting works
- [ ] No errors in workflow logs

## 🎉 Success!

Once all steps are completed:

- **Push to `develop`** → Deploys to staging
- **Push to `main`** → Deploys to production
- **Pull Request to `main`** → Runs tests only

Your CI/CD pipeline is now ready! 🚀
