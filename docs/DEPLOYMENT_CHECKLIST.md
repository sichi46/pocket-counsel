# Production Deployment Checklist

Use this checklist to ensure all deployment steps are completed correctly.

## ✅ Pre-Deployment Checklist

### Environment Setup
- [ ] `.env` file created with all required variables
- [ ] Google AI API key obtained and added to `.env`
- [ ] Pinecone API key obtained and added to `.env`
- [ ] Firebase project ID added to `.env`
- [ ] Google Cloud project ID added to `.env`

### Prerequisites
- [ ] Node.js 20+ installed
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Google Cloud CLI installed (optional but recommended)
- [ ] Git repository cloned and up to date

### API Keys and Services
- [ ] Google AI API key with embedding access
- [ ] Pinecone account created
- [ ] Firebase project created
- [ ] Google Cloud project with billing enabled

## ✅ Step 1: Environment Variables

- [ ] `.env` file exists in project root
- [ ] All placeholder values replaced with actual values:
  - [ ] `GOOGLE_API_KEY=your_actual_google_api_key`
  - [ ] `PINECONE_API_KEY=your_actual_pinecone_api_key`
  - [ ] `FIREBASE_PROJECT_ID=your_actual_firebase_project_id`
  - [ ] `GOOGLE_CLOUD_PROJECT=your_actual_google_cloud_project_id`

## ✅ Step 2: Pinecone Setup

- [ ] Pinecone account created at [https://app.pinecone.io/](https://app.pinecone.io/)
- [ ] New index created with specifications:
  - [ ] **Name**: `pocket-counsel-rag`
  - [ ] **Dimensions**: `768`
  - [ ] **Metric**: `cosine`
  - [ ] **Cloud**: `AWS`
  - [ ] **Region**: `us-east-1`
- [ ] Index status shows "Ready"
- [ ] API key copied from Pinecone console
- [ ] API key added to `.env` file

## ✅ Step 3: Document Preparation

- [ ] `documents/` directory created
- [ ] Zambian legal PDF documents copied to `documents/` directory
- [ ] Documents are in PDF format (or TXT)
- [ ] Document names are descriptive
- [ ] Individual files are under 100MB
- [ ] Total documents count: _____ (up to 17 recommended)

## ✅ Step 4: Deployment Execution

- [ ] PowerShell execution policy allows script execution
- [ ] Deployment script run: `powershell -ExecutionPolicy Bypass -File scripts/deploy-production.ps1`
- [ ] All deployment steps completed successfully:
  - [ ] Dependencies checked
  - [ ] Environment variables loaded
  - [ ] Storage bucket created (or confirmed existing)
  - [ ] Pinecone setup verified
  - [ ] Dependencies installed
  - [ ] Application built
  - [ ] Firebase deployment completed
  - [ ] Documents uploaded to storage

## ✅ Step 5: Verification

### Firebase Functions
- [ ] Functions deployed successfully
- [ ] No deployment errors in Firebase console
- [ ] Function logs accessible

### Storage
- [ ] Documents uploaded to Google Cloud Storage
- [ ] Bucket accessible and contains uploaded files
- [ ] File permissions set correctly

### Pinecone
- [ ] Index accessible via API
- [ ] No connection errors
- [ ] Index ready for vector storage

## ✅ Step 6: Testing

### First Query Test
- [ ] Made first query to trigger document processing
- [ ] Processing started (check Firebase logs)
- [ ] No errors during processing
- [ ] Processing completed successfully

### System Verification
- [ ] RAG system responds to queries
- [ ] Answers include source citations
- [ ] Vector search working correctly
- [ ] Embeddings created successfully

## ✅ Post-Deployment Monitoring

### Logs and Monitoring
- [ ] Firebase Functions logs monitored
- [ ] Pinecone dashboard checked for vector count
- [ ] Google AI API usage monitored
- [ ] No errors in system logs

### Performance
- [ ] Query response times acceptable
- [ ] Document processing completed
- [ ] System handles expected load
- [ ] Memory usage within limits

## 🚨 Troubleshooting Checklist

If deployment fails, check:

### Common Issues
- [ ] API keys are correct and have proper permissions
- [ ] Firebase project exists and is accessible
- [ ] Google Cloud project has billing enabled
- [ ] Pinecone index is in "Ready" state
- [ ] Documents are in correct format and size
- [ ] Network connectivity is stable

### Error Resolution
- [ ] Check Firebase Functions logs for specific errors
- [ ] Verify environment variables are loaded correctly
- [ ] Confirm all dependencies are installed
- [ ] Test API connections individually
- [ ] Review deployment script output for clues

## 📞 Support Resources

If issues persist:

1. **Firebase Documentation**: [https://firebase.google.com/docs](https://firebase.google.com/docs)
2. **Pinecone Documentation**: [https://docs.pinecone.io/](https://docs.pinecone.io/)
3. **Google AI Documentation**: [https://ai.google.dev/](https://ai.google.dev/)
4. **Project Documentation**: Check `docs/` directory for specific guides

## 🎉 Success Criteria

Deployment is successful when:

- [ ] All functions deploy without errors
- [ ] Documents upload successfully
- [ ] First query triggers document processing
- [ ] Processing completes without errors
- [ ] System responds to legal queries with citations
- [ ] Vector database contains processed embeddings

---

**Note**: Keep this checklist for future reference and troubleshooting. Update it as needed for your specific deployment environment. 