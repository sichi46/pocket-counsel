# Update Google API Key in Secret Manager
# This script helps you update the GOOGLE_API_KEY secret in Google Cloud Secret Manager

Write-Host "🔐 Updating Google API Key in Secret Manager..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Configuration
$PROJECT_ID = "pocket-counsel"  # Replace with your actual project ID
$SECRET_NAME = "GOOGLE_API_KEY"
$NEW_API_KEY = "AIzaSyDuAN_BpMae7xsuVGKtPtGlhWIo2SUKY8U"

Write-Host "Project ID: $PROJECT_ID" -ForegroundColor Yellow
Write-Host "Secret Name: $SECRET_NAME" -ForegroundColor Yellow
Write-Host "New API Key: $($NEW_API_KEY.Substring(0, 10))..." -ForegroundColor Yellow

# Check if gcloud is available
try {
    $gcloudVersion = gcloud --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Google Cloud CLI (gcloud) is not installed or not in PATH" -ForegroundColor Red
        Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Google Cloud CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Google Cloud CLI (gcloud) is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Check if user is authenticated
try {
    $authInfo = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrEmpty($authInfo)) {
        Write-Host "❌ Not authenticated with Google Cloud" -ForegroundColor Red
        Write-Host "Please run: gcloud auth login" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Authenticated as: $authInfo" -ForegroundColor Green
} catch {
    Write-Host "❌ Authentication check failed" -ForegroundColor Red
    exit 1
}

# Set the project
Write-Host "`n🔧 Setting project to: $PROJECT_ID" -ForegroundColor Blue
try {
    gcloud config set project $PROJECT_ID
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to set project" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Project set successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set project" -ForegroundColor Red
    exit 1
}

# Check if secret exists
Write-Host "`n🔍 Checking if secret exists..." -ForegroundColor Blue
try {
    $secretExists = gcloud secrets describe $SECRET_NAME --format="value(name)" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Secret '$SECRET_NAME' exists" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Secret '$SECRET_NAME' does not exist. Creating it..." -ForegroundColor Yellow
        gcloud secrets create $SECRET_NAME --replication-policy="automatic"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to create secret" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Secret created successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to check/create secret" -ForegroundColor Red
    exit 1
}

# Update the secret
Write-Host "`n🔄 Updating secret with new API key..." -ForegroundColor Blue
try {
    echo $NEW_API_KEY | gcloud secrets versions add $SECRET_NAME --data-file=-
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to update secret" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Secret updated successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update secret" -ForegroundColor Red
    exit 1
}

# Verify the secret was updated
Write-Host "`n🔍 Verifying secret update..." -ForegroundColor Blue
try {
    $latestVersion = gcloud secrets versions list $SECRET_NAME --format="value(name)" --limit=1
    Write-Host "✅ Latest version: $latestVersion" -ForegroundColor Green
    
    # Get the secret value (first few characters only for security)
    $secretValue = gcloud secrets versions access $latestVersion --secret=$SECRET_NAME
    Write-Host "✅ Secret value starts with: $($secretValue.Substring(0, 10))..." -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to verify secret" -ForegroundColor Red
    exit 1
}

# Grant access to Firebase Functions service account
Write-Host "`n🔐 Granting access to Firebase Functions..." -ForegroundColor Blue
try {
    # Get the Firebase Functions service account
    $serviceAccount = gcloud iam service-accounts list --filter="displayName:firebase-adminsdk" --format="value(email)" --limit=1
    
    if ([string]::IsNullOrEmpty($serviceAccount)) {
        Write-Host "⚠️  Firebase service account not found. You may need to grant access manually." -ForegroundColor Yellow
        Write-Host "Service account pattern: firebase-adminsdk-xxxxx@$PROJECT_ID.iam.gserviceaccount.com" -ForegroundColor Yellow
    } else {
        Write-Host "Found service account: $serviceAccount" -ForegroundColor Green
        
        # Grant access to the secret
        gcloud secrets add-iam-policy-binding $SECRET_NAME --member="serviceAccount:$serviceAccount" --role="roles/secretmanager.secretAccessor"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Access granted to Firebase Functions" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Failed to grant access automatically. You may need to do this manually." -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠️  Failed to configure access. You may need to do this manually." -ForegroundColor Yellow
}

Write-Host "`n🎉 Secret update completed!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan

Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Deploy your Firebase Functions to pick up the new secret:" -ForegroundColor White
Write-Host "   firebase deploy --only functions" -ForegroundColor Cyan
Write-Host "`n2. Test the RAG system to ensure it's working:" -ForegroundColor White
Write-Host "   node test-rag-simple.js" -ForegroundColor Cyan
Write-Host "`n3. If you need to grant access manually, run:" -ForegroundColor White
Write-Host "   gcloud secrets add-iam-policy-binding GOOGLE_API_KEY --member='serviceAccount:firebase-adminsdk-xxxxx@$PROJECT_ID.iam.gserviceaccount.com' --role='roles/secretmanager.secretAccessor'" -ForegroundColor Cyan

Write-Host "`n✅ Done!" -ForegroundColor Green
