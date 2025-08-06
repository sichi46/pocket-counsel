# Production Setup Guide - Pocket Counsel RAG

This guide walks you through setting up the Pocket Counsel RAG application for production use with all the latest improvements.

## 🚀 Production Improvements Implemented

### 1. Full PDF Processing

- ✅ **Batch Processing**: All 17 documents are now processed in configurable batches
- ✅ **Progress Tracking**: Real-time progress monitoring with detailed logging
- ✅ **Error Handling**: Robust error handling with failed document tracking
- ✅ **Memory Management**: Optimized for large document sets with batch delays

### 2. Vector Database Migration

- ✅ **Pinecone Integration**: Migrated from in-memory to Pinecone vector database
- ✅ **Production-Ready**: Scalable, persistent vector storage
- ✅ **Automatic Index Creation**: Index creation and management
- ✅ **Batch Operations**: Efficient batch upserting for large datasets

### 3. Real Embeddings

- ✅ **Google AI Embeddings**: Using actual `textembedding-gecko-multilingual@001` model
- ✅ **REST API Integration**: Direct integration with Google AI embedding API
- ✅ **Fallback Support**: Graceful fallback to simple embeddings if API fails
- ✅ **Rate Limiting**: Proper rate limiting and batch processing

## 📋 Prerequisites

Before starting, ensure you have:

1. **Google Cloud Project** with billing enabled
2. **Firebase Project** set up
3. **Pinecone Account** (free tier available)
4. **Google AI API Key** with embedding access
5. **Node.js 20+** installed
6. **Firebase CLI** installed: `npm install -g firebase-tools`
7. **Google Cloud CLI** installed (optional but recommended)

## 🔧 Setup Steps

### Step 1: Environment Configuration

1. **Create `.env` file** in the root directory:

```bash
# Google Cloud Configuration
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CLOUD_PROJECT=your_project_id_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=pocket-counsel-rag

# Storage Configuration
STORAGE_BUCKET_NAME=pocket-counsel-rag-corpus

# Model Configuration
EMBEDDING_MODEL=textembedding-gecko-multilingual@001
LLM_MODEL=gemini-1.5-flash

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id_here
```

2. **Get API Keys**:
   - **Google AI API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Pinecone API Key**: Visit [Pinecone Console](https://app.pinecone.io/)

### Step 2: Pinecone Setup

1. **Create Pinecone Index**:
   - Visit [Pinecone Console](https://app.pinecone.io/)
   - Create new index with these specifications:
     - **Name**: `pocket-counsel-rag`
     - **Dimension**: `768`
     - **Metric**: `cosine`
     - **Cloud**: `AWS`
     - **Region**: `us-east-1`

### Step 3: Google Cloud Storage

1. **Create Storage Bucket**:

```bash
gsutil mb -p your_project_id gs://pocket-counsel-rag-corpus
gsutil iam ch allUsers:objectViewer gs://pocket-counsel-rag-corpus
```

2. **Upload Documents**:

```bash
# Create documents directory
mkdir documents

# Add your PDF files to the documents directory
# Then upload:
gsutil -m cp documents/* gs://pocket-counsel-rag-corpus/
```

### Step 4: Automated Deployment

Use the provided deployment script:

```bash
# Make script executable
chmod +x scripts/deploy-production.sh

# Run deployment
./scripts/deploy-production.sh
```

The script will:

- ✅ Check dependencies
- ✅ Validate environment variables
- ✅ Set up storage bucket
- ✅ Guide you through Pinecone setup
- ✅ Install dependencies
- ✅ Build the application
- ✅ Deploy to Firebase
- ✅ Upload documents

### Step 5: Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Install dependencies
npm install
cd functions && npm install && cd ..

# Build functions
cd functions && npm run build && cd ..

# Deploy to Firebase
firebase deploy --only functions
```

## 🔍 Testing the Setup

### 1. Check Deployment Status

```bash
# View function logs
firebase functions:log

# Check function status
firebase functions:list
```

### 2. Test Document Processing

The system will automatically process documents on the first query. Monitor the logs:

```bash
firebase functions:log --follow
```

### 3. Test RAG Query

Make a test query through your application or directly via Firebase Functions.

## 📊 Monitoring and Maintenance

### Key Metrics to Monitor

1. **Document Processing**:
   - Total documents processed
   - Failed documents
   - Processing time per document

2. **Vector Database**:
   - Total vectors in Pinecone
   - Query performance
   - Storage usage

3. **Embedding Service**:
   - API response times
   - Rate limit usage
   - Fallback usage

### Useful Commands

```bash
# View real-time logs
firebase functions:log --follow

# Check function status
firebase functions:list

# Monitor specific function
firebase functions:log --only queryRagEngine

# View Pinecone stats (via application)
# Check your application's stats endpoint
```

## 🛠️ Troubleshooting

### Common Issues

1. **Missing API Keys**:
   - Ensure all environment variables are set
   - Check API key permissions

2. **Pinecone Index Issues**:
   - Verify index exists and is ready
   - Check API key and region settings

3. **Document Processing Failures**:
   - Check document format (PDF/TXT)
   - Verify storage bucket permissions
   - Monitor function memory usage

4. **Embedding API Errors**:
   - Check Google AI API quota
   - Verify API key permissions
   - Monitor rate limiting

### Debug Mode

Enable debug logging by setting:

```bash
export DEBUG=true
```

## 🔄 Updating Documents

To update the document corpus:

1. **Upload new documents**:

```bash
gsutil cp new_document.pdf gs://pocket-counsel-rag-corpus/
```

2. **Trigger reprocessing**:
   - The system will automatically detect new documents
   - Or call the refresh endpoint in your application

## 📈 Performance Optimization

### For Large Document Sets

1. **Increase batch sizes** in `ragService.ts`:

```typescript
const batchSize = 5; // Increase from 3
```

2. **Adjust embedding batch size** in `embeddingService.ts`:

```typescript
const batchSize = 20; // Increase from 10
```

3. **Optimize chunk sizes** in `documentService.ts`:

```typescript
chunkText(text, 1500, 300); // Larger chunks, more overlap
```

### Memory Management

- Monitor function memory usage
- Adjust batch sizes based on available memory
- Consider using Cloud Run for longer processing times

## 🔒 Security Considerations

1. **API Key Security**:
   - Never commit API keys to version control
   - Use Firebase environment variables
   - Rotate keys regularly

2. **Access Control**:
   - Implement proper authentication
   - Use Firebase Auth for user management
   - Restrict function access as needed

3. **Data Privacy**:
   - Ensure documents don't contain sensitive information
   - Implement data retention policies
   - Monitor access logs

## 📞 Support

For issues or questions:

1. Check the Firebase Functions logs
2. Review the troubleshooting section
3. Check Pinecone dashboard for vector database issues
4. Monitor Google AI API usage and quotas

---

**🎉 Congratulations!** Your Pocket Counsel RAG system is now production-ready with full document processing, proper vector storage, and real embeddings.
