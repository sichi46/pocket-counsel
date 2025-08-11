# 🚀 Pocket Counsel Test Mode - Quick Start

## ⚡ Get Testing in 3 Steps

### 1. Setup Environment (NEW - Based on Audit)
```bash
# Run the comprehensive environment setup script
.\setup-environment.ps1
```

### 2. Start Firebase Emulator
```bash
# The setup script will guide you, or manually:
firebase emulators:start --only functions
```

### 3. Run Quick Tests (Choose One)
```bash
# PowerShell (Windows) - RECOMMENDED
.\test-powershell.ps1

# Node.js (Cross-platform)
node test-pdf-processing.js

# Bash/Unix
./test-curl.sh
```

## 🔧 Environment Variables Setup

The `setup-environment.ps1` script automatically sets these environment variables based on the audit:

```bash
# Firebase Functions Configuration (from audit)
GOOGLE_API_KEY=AIzaSyDuAN_BpMae7xsuVGKtPtGlhWIo2SUKY8U
PINECONE_API_KEY=pcsk_VyJ6T_8EmnAkeRYTYRYpGoKhtrLU5tB8ZuKzriiad5uMWj1VbzuvGLscFdDbZcyQA7sqi

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=pocket-counsel
GOOGLE_CLOUD_LOCATION=us-central1

# Storage Configuration
STORAGE_BUCKET_NAME=pocket-counsel-rag-corpus

# Vertex AI Configuration (from audit)
VERTEX_AI_INDEX_ID=6627418486605873152
VERTEX_AI_ENDPOINT_ID=8138815966239784960

# Model Configuration
EMBEDDING_MODEL=textembedding-gecko-multilingual@001
LLM_MODEL=gemini-1.5-flash
```

**💡 Note**: All values are verified from the actual Firebase and Google Cloud configuration.

## 🧪 Test Modes Available

| Mode | Command | Purpose |
|------|---------|---------|
| **Single Page** | `--single-page` | Basic validation (`maxPages: 1`) |
| **Memory** | `--memory` | Monitor memory usage |
| **Sentiment** | `--sentiment` | Validate sentiment analysis |
| **Scaling** | `--scaling` | Test 1→2→3→5 pages |
| **All Tests** | (no args) | Complete test suite |

## 📊 What You'll See

### Memory Monitoring
```
💾 Initial memory: rss: 45.23 MB, heapUsed: 23.45 MB
💾 Final memory: rss: 48.67 MB, heapUsed: 25.12 MB
📊 Memory delta: rss: 3.44 MB, heapUsed: 1.67 MB
```

### Sentiment Analysis
```
😊 Sentiment distribution: {"neutral":2,"positive":1}
😊 Average score: 0.023, Average magnitude: 0.156
😊 Valid chunks: 3/3 (100.0%)
```

### Processing Results
```
✅ Single page test completed successfully
⏱️ Processing time: 25000ms
📦 Chunks created: 3
💾 Memory delta: rss: 3.44 MB, heapUsed: 1.67 MB
```

## 🔧 Quick Commands

### Health Check
```bash
curl "http://localhost:5001/pocket-counsel-new/us-central1/api/trpc/health"
```

### Memory Status
```bash
curl "http://localhost:5001/pocket-counsel-new/us-central1/api/trpc/getMemoryStatus"
```

### Single Page Test
```bash
curl -X POST "http://localhost:5001/pocket-counsel-new/us-central1/api/trpc/testSinglePage" \
  -H "Content-Type: application/json" \
  -d '{"filename":"sample-zambian-law.txt","bucketName":"pocket-counsel-rag-corpus"}'
```

## 🎯 Success Criteria

- ✅ **Processing**: Completes without errors
- ✅ **Memory**: Peak < 1.5GB, cleanup > 80%
- ✅ **Time**: Single page < 30 seconds
- ✅ **Sentiment**: Valid scores > 90%
- ✅ **Quality**: Consistent classifications > 80%

## 🆘 Need Help?

### Check Environment
```bash
node check-environment.js
```

### View Logs
```bash
firebase functions:log
```

### Common Issues
- **Port conflicts**: Check if port 5001 is free
- **Memory errors**: Reduce `maxPages` to 1
- **Timeout errors**: Check network connectivity
- **Build errors**: Run `npm run build`
- **Environment variables**: Use `.\setup-environment.ps1`

### Troubleshooting Environment Variables
If you get environment variable errors:

1. **Use the setup script** (recommended):
   ```bash
   .\setup-environment.ps1
   ```

2. **Manual setup**:
   ```bash
   $env:GOOGLE_API_KEY="AIzaSyDuAN_BpMae7xsuVGKtPtGlhWIo2SUKY8U"
   $env:NODE_ENV="development"
   firebase emulators:start --only functions
   ```

## 📚 Full Documentation

- **Complete Guide**: `TEST_MODE_README.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`
- **Environment Check**: `check-environment.js`
- **Audit Report**: `AUDIT_REPORT.md`

## 🔍 Audit Results Summary

Based on the comprehensive audit:
- ✅ **Firebase**: Fully configured and authenticated
- ✅ **Google Cloud**: Project active, region set to us-central1
- ✅ **Vertex AI**: Index and endpoint active (768 dimensions)
- ✅ **Storage**: 23 Zambian legal documents available
- ✅ **Authentication**: mutale@hytel.io has full access

---

**Ready to test? Start with: `.\setup-environment.ps1` 🚀**
