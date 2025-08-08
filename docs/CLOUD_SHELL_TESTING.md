# Testing RAG System in Google Cloud Shell

## 🚀 Quick Test Commands

Copy and paste these commands in your Google Cloud Shell terminal:

### 1. Health Check

```bash
curl -X GET "https://health-6otymacelq-uc.a.run.app"
```

### 2. tRPC Health Query

```bash
curl -X GET "https://api-6otymacelq-uc.a.run.app/trpc/health"
```

### 3. Ask Question - Children's Rights

```bash
curl -X GET "https://api-6otymacelq-uc.a.run.app/trpc/askQuestion?input={\"question\":\"What are the rights of children under Zambian law?\",\"topK\":3}"
```

### 4. Ask Question - Employment Law

```bash
curl -X GET "https://api-6otymacelq-uc.a.run.app/trpc/askQuestion?input={\"question\":\"What does the Employment Code Act regulate?\",\"topK\":3}"
```

### 5. Get Stats

```bash
curl -X GET "https://api-6otymacelq-uc.a.run.app/trpc/getStats"
```

### 6. List Documents

```bash
curl -X GET "https://api-6otymacelq-uc.a.run.app/trpc/listDocuments"
```

## 🔧 Why Your Original Command Failed

Your original command:

```bash
curl -X POST "https://api-787651119619.us-centrall.run.app" \
-H "Authorization: bearer $(gcloud auth print-identity-token)" \
-H "Content-Type: application/json" \
-d '{ "query": "What are the rights of children under Zambian Law" }'
```

**Issues:**

1. **Wrong URL**: You used a different URL than the deployed one
2. **Wrong HTTP Method**: The `askQuestion` procedure is a **query** (GET), not a mutation (POST)
3. **Wrong Path**: You need to use `/trpc/askQuestion` path
4. **Wrong Parameter Format**: tRPC expects `input` parameter, not `query`

## ✅ Correct Format

**For tRPC queries (GET requests):**

```bash
curl -X GET "https://api-6otymacelq-uc.a.run.app/trpc/PROCEDURE_NAME?input={\"param1\":\"value1\"}"
```

**For tRPC mutations (POST requests):**

```bash
curl -X POST "https://api-6otymacelq-uc.a.run.app/trpc/PROCEDURE_NAME" \
-H "Content-Type: application/json" \
-d '{"param1": "value1"}'
```

## 🎯 Expected Responses

### Health Check Response:

```json
{
  "status": "ok",
  "message": "Pocket Counsel API is running",
  "timestamp": "2025-08-08T11:51:56.536Z",
  "database": "(default)",
  "environment": "development"
}
```

### Ask Question Response:

```json
{
  "result": {
    "data": {
      "answer": "Based on the provided Children's Code Act No. 12 of 2022...",
      "sources": [
        {
          "source": "The Children's Code Act No. 12 of 2022",
          "content": "..."
        }
      ],
      "confidence": 0.95
    }
  }
}
```

## 🚀 Run All Tests

If you want to run all tests at once, you can use the script:

```bash
# Download and run the test script
curl -O https://raw.githubusercontent.com/your-repo/pocket-counsel-new/main/test-rag-cloud-shell.sh
chmod +x test-rag-cloud-shell.sh
./test-rag-cloud-shell.sh
```

## 🔍 Troubleshooting

### If you get "Cannot POST /" error:

- You're using POST instead of GET
- You're missing the `/trpc` path
- You're using the wrong URL

### If you get authentication errors:

- The API is public and doesn't require authentication
- Remove the Authorization header

### If you get CORS errors:

- The API has CORS enabled
- Make sure you're using the correct URL

## 📞 Support

If you still have issues:

1. Check the Firebase Functions logs in Google Cloud Console
2. Verify the function URLs are correct
3. Test with the health endpoint first
