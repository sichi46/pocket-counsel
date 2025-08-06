# Document Upload Guide

This guide explains how to upload your Zambian legal documents to Google Cloud Storage for the RAG system.

## Prerequisites

1. **Google Cloud CLI** installed and authenticated
2. **Storage bucket** created (see deployment script)
3. **PDF documents** ready for upload

## Step 1: Prepare Documents

### Document Requirements

- **Format**: PDF files (recommended) or TXT files
- **Content**: Zambian legal documents, statutes, regulations
- **Naming**: Use descriptive names (e.g., `Companies_Act_2017.pdf`)
- **Size**: Individual files should be under 100MB

### Document Types Supported

- ✅ PDF documents (primary format)
- ✅ Text files (.txt)
- ❌ Word documents (.docx) - convert to PDF first
- ❌ Images - extract text first

## Step 2: Place Documents in Local Directory

1. **Navigate to the documents directory**:

   ```bash
   cd documents
   ```

2. **Copy your PDF files** to this directory:

   ```bash
   # Example: Copy files from another location
   copy "C:\path\to\your\legal\documents\*.pdf" .
   ```

3. **Verify files are present**:
   ```bash
   dir
   ```

## Step 3: Upload to Google Cloud Storage

### Option A: Using the Deployment Script

The deployment script will automatically upload documents:

```bash
# Run the deployment script
powershell -ExecutionPolicy Bypass -File scripts/deploy-production.ps1
```

### Option B: Manual Upload

If you prefer to upload manually:

```bash
# Upload all documents in the directory
gsutil -m cp documents/* gs://pocket-counsel-rag-corpus/

# Or upload specific files
gsutil cp documents/Companies_Act_2017.pdf gs://pocket-counsel-rag-corpus/
```

### Option C: Using Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Storage** > **Browser**
3. Select your bucket (`pocket-counsel-rag-corpus`)
4. Click **Upload Files**
5. Select your PDF documents
6. Click **Upload**

## Step 4: Verify Upload

### Check Upload Status

```bash
# List files in the bucket
gsutil ls gs://pocket-counsel-rag-corpus/

# Get detailed information
gsutil ls -l gs://pocket-counsel-rag-corpus/
```

### Expected Output

You should see your uploaded files listed, for example:

```
gs://pocket-counsel-rag-corpus/Companies_Act_2017.pdf
gs://pocket-counsel-rag-corpus/Criminal_Procedure_Code.pdf
gs://pocket-counsel-rag-corpus/Labour_Act_2019.pdf
```

## Step 5: Document Processing

Once uploaded, the system will automatically process documents:

1. **First Query**: Documents will be processed when you make your first query
2. **Processing Time**: Depends on document size and quantity (typically 5-15 minutes)
3. **Monitoring**: Check Firebase Functions logs for processing status

## Troubleshooting

### Common Issues

1. **Permission Denied**

   ```bash
   # Ensure you're authenticated
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Bucket Not Found**

   ```bash
   # Create bucket if it doesn't exist
   gsutil mb -p YOUR_PROJECT_ID gs://pocket-counsel-rag-corpus
   ```

3. **Upload Fails**
   - Check file size (should be under 100MB)
   - Verify file format (PDF or TXT)
   - Ensure stable internet connection

### File Size Optimization

For large documents:

1. **Split large PDFs** into smaller sections
2. **Compress PDFs** if possible
3. **Extract text** for very large documents

## Recommended Document Structure

For best results, organize your documents:

```
documents/
├── Acts/
│   ├── Companies_Act_2017.pdf
│   ├── Criminal_Procedure_Code.pdf
│   └── Labour_Act_2019.pdf
├── Regulations/
│   ├── Company_Regulations_2018.pdf
│   └── Labour_Regulations_2020.pdf
└── Guidelines/
    ├── Legal_Practice_Guidelines.pdf
    └── Court_Procedures.pdf
```

## Next Steps

After uploading documents:

1. **Run the deployment script** to deploy the system
2. **Make your first query** to trigger document processing
3. **Monitor logs** to ensure successful processing
4. **Test the system** with various legal questions

## Support

If you encounter issues:

1. Check the Firebase Functions logs
2. Verify document format and size
3. Ensure proper authentication
4. Review the troubleshooting section above

---

**Note**: The system supports up to 17 Zambian legal documents. For larger document sets, consider upgrading your Pinecone plan.
