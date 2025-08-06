# Pinecone Setup Guide

This guide will help you create the Pinecone index required for the Pocket Counsel RAG system.

## Prerequisites

1. **Pinecone Account**: Sign up at [Pinecone Console](https://app.pinecone.io/)
2. **API Key**: Get your API key from the Pinecone console

## Step-by-Step Setup

### 1. Access Pinecone Console

1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Sign in to your account
3. Navigate to the "Indexes" section

### 2. Create New Index

1. Click **"Create Index"** button
2. Fill in the following details:

   **Index Name**: `pocket-counsel-rag`
   
   **Dimensions**: `768`
   
   **Metric**: `cosine`
   
   **Cloud Provider**: `AWS`
   
   **Region**: `us-east-1`

### 3. Index Configuration Details

- **Name**: `pocket-counsel-rag` (must match PINECONE_INDEX_NAME in .env)
- **Dimensions**: `768` (matches the embedding model output)
- **Metric**: `cosine` (best for semantic similarity)
- **Cloud**: `AWS` (recommended for performance)
- **Region**: `us-east-1` (matches our configuration)

### 4. Wait for Index Creation

- Index creation takes 1-2 minutes
- Status will show "Ready" when complete
- You can proceed once the index is ready

### 5. Get API Key

1. Go to **API Keys** section in Pinecone console
2. Copy your API key
3. Update the `.env` file:
   ```
   PINECONE_API_KEY=your_actual_pinecone_api_key_here
   ```

## Verification

To verify your setup:

1. **Check Index Status**: Should show "Ready" in Pinecone console
2. **Test API Key**: The deployment script will test the connection
3. **Monitor Usage**: Check the Pinecone dashboard for vector count

## Troubleshooting

### Common Issues

1. **Index Name Already Exists**
   - Choose a different name or delete existing index
   - Update PINECONE_INDEX_NAME in .env accordingly

2. **API Key Issues**
   - Ensure you're using the correct API key
   - Check if the key has proper permissions

3. **Region Issues**
   - Ensure you select `us-east-1` region
   - This matches our deployment configuration

### Support

- Pinecone Documentation: [https://docs.pinecone.io/](https://docs.pinecone.io/)
- Pinecone Community: [https://community.pinecone.io/](https://community.pinecone.io/)

## Next Steps

Once your Pinecone index is created and ready:

1. Update your `.env` file with the actual API key
2. Proceed to Step 3: Run the deployment script
3. The system will automatically connect to your Pinecone index

---

**Note**: The free tier of Pinecone includes:
- 1 index
- 100,000 vectors
- 10GB storage
- This should be sufficient for the initial deployment 