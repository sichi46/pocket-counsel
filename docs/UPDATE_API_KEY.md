# Update Google API Key in Secret Manager

## 🔐 New API Key
Your new Google API key: `AIzaSyDuAN_BpMae7xsuVGKtPtGlhWIo2SUKY8U`

## 📋 Manual Steps

### Step 1: Update Secret in Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project**: `pocket-counsel`
3. **Navigate to Secret Manager**: Security → Secret Manager
4. **Find the secret**: `GOOGLE_API_KEY`
5. **Add new version**: Click "Add new version"
6. **Enter the new value**: `AIzaSyDuAN_BpMae7xsuVGKtPtGlhWIo2SUKY8U`
7. **Save the version**

### Step 2: Grant Access to Firebase Functions

1. **Find your Firebase service account**:
   - Go to IAM & Admin → Service Accounts
   - Look for: `firebase-adminsdk-xxxxx@pocket-counsel.iam.gserviceaccount.com`

2. **Grant Secret Manager access**:
   - Go to Secret Manager → `GOOGLE_API_KEY`
   - Click "Permissions"
   - Add member: `firebase-adminsdk-xxxxx@pocket-counsel.iam.gserviceaccount.com`
   - Role: `Secret Manager Secret Accessor`

## 🚀 Automated Script

Run the PowerShell script to automate the process:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/update-secret.ps1
```

## 🔧 Manual Commands (Alternative)

If you prefer command line:

```bash
# Set project
gcloud config set project pocket-counsel

# Update secret
echo "AIzaSyDuAN_BpMae7xsuVGKtPtGlhWIo2SUKY8U" | gcloud secrets versions add GOOGLE_API_KEY --data-file=-

# Grant access (replace with your actual service account)
gcloud secrets add-iam-policy-binding GOOGLE_API_KEY \
  --member="serviceAccount:firebase-adminsdk-xxxxx@pocket-counsel.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## ✅ After Updating

1. **Deploy Firebase Functions**:
   ```bash
   firebase deploy --only functions
   ```

2. **Test the RAG System**:
   ```bash
   node test-rag-simple.js
   ```

3. **Verify it's working** by checking the test results

## 🔍 Troubleshooting

### If Firebase Functions can't access the secret:

1. **Check service account permissions**:
   ```bash
   gcloud projects get-iam-policy pocket-counsel \
     --flatten="bindings[].members" \
     --filter="bindings.members:firebase-adminsdk" \
     --format="table(bindings.role)"
   ```

2. **Manually grant access**:
   ```bash
   gcloud secrets add-iam-policy-binding GOOGLE_API_KEY \
     --member="serviceAccount:firebase-adminsdk-xxxxx@pocket-counsel.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

### If the secret doesn't exist:

1. **Create the secret**:
   ```bash
   gcloud secrets create GOOGLE_API_KEY --replication-policy="automatic"
   ```

2. **Add the value**:
   ```bash
   echo "AIzaSyDuAN_BpMae7xsuVGKtPtGlhWIo2SUKY8U" | gcloud secrets versions add GOOGLE_API_KEY --data-file=-
   ```

## 📞 Support

If you encounter issues:
1. Check the Firebase Functions logs in Google Cloud Console
2. Verify the secret exists and has the correct value
3. Ensure the Firebase service account has proper permissions
