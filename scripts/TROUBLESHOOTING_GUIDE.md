# Pocket Counsel RAG Application Troubleshooting Guide

## 🚨 Current Issue
- Frontend sends queries successfully
- Backend Cloud Function API not returning responses
- Chat stays silent after user input

## 🔍 Diagnostic Plan

### Phase 1: API Endpoint Testing

#### 1.1 Quick curl Test
Test basic API connectivity with this command:

```bash
curl -X POST "https://pocket-counsel-api-787651119619.us-central1.run.app" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"query": "what is the minimum wage in Zambia?"}' \
  -v
```

**Expected Successful Response:**
```json
{
  "answer": "Based on Zambian law, the minimum wage is...",
  "sources": [
    {
      "title": "Employment Code Act",
      "content": "Relevant legal text...",
      "page": 45
    }
  ],
  "query": "what is the minimum wage in Zambia?",
  "timestamp": "2024-08-30T09:25:00Z"
}
```

**What to Look For:**
- ✅ Status code 200
- ✅ Valid JSON response
- ✅ Contains 'answer' and 'sources' fields
- ✅ Response time under 10 seconds

#### 1.2 Python Diagnostic Script
Run the comprehensive diagnostic script:
```bash
cd scripts
python diagnose_api.py
```

This will test multiple queries and provide detailed analysis.

### Phase 2: Cloud Logging Analysis

#### 2.1 Access Cloud Logs
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: `pocket-counsel`
3. Navigate to **Logging** → **Logs Explorer**

#### 2.2 Filter Logs for Your Cloud Function
Use this filter in Logs Explorer:
```
resource.type="cloud_run_revision"
resource.labels.service_name="pocket-counsel-api"
```

#### 2.3 Run curl Test and Monitor Logs
1. Open Cloud Logs in one browser tab
2. Run the curl command in another terminal
3. Watch for real-time log entries

#### 2.4 Expected Log Flow
Look for this sequence in your logs:

```
✅ Request received: POST / - Processing query: "what is the minimum wage in Zambia?"
✅ Embedding model called: text-embedding-004
✅ Vector search executed: Found 5 relevant documents
✅ Gemini model called: Generating response
✅ Response sent: 200 OK - Response length: 1,247 characters
```

#### 2.5 Common Error Logs and Meanings

**500 Internal Server Error:**
```
❌ ERROR: Function execution failed
❌ ERROR: Unhandled exception in function
```
**Action:** Check function code for runtime errors

**408 Request Timeout:**
```
❌ ERROR: Function execution took too long
❌ ERROR: Deadline exceeded
```
**Action:** Increase function timeout or optimize performance

**403 Forbidden:**
```
❌ ERROR: Permission denied
❌ ERROR: Authentication failed
```
**Action:** Check IAM permissions and API keys

**404 Not Found:**
```
❌ ERROR: Endpoint not found
❌ ERROR: Route not defined
```
**Action:** Check function deployment and routing

### Phase 3: Configuration Verification

#### 3.1 Critical Environment Variables
Check these in your Cloud Function settings:

```bash
# Required Environment Variables
PROJECT_ID=pocket-counsel
LOCATION=us-central1
INDEX_ID=pocket_counsel_stream
API_KEY=your_gemini_api_key
VERTEX_AI_LOCATION=us-central1
```

#### 3.2 Common Configuration Pitfalls

**CORS Issues:**
- Frontend domain not in allowed origins
- Missing CORS headers in response
- Preflight request failing

**Authentication Issues:**
- Invalid API keys
- Expired service account tokens
- Incorrect IAM permissions

**Payload Format Issues:**
- Missing required fields
- Incorrect data types
- Malformed JSON

#### 3.3 IAM Permissions Checklist
Ensure your Cloud Function has these permissions:
- `roles/aiplatform.user` - For Vertex AI access
- `roles/aiplatform.viewer` - For Vector Search access
- `roles/run.invoker` - For Cloud Run invocation

### Phase 4: Function Code Analysis

#### 4.1 Check Function Deployment
```bash
gcloud functions describe api-6otymacelq-uc \
  --region=us-central1 \
  --format="value(status,updateTime,versionId)"
```

#### 4.2 Verify Function Source
Check if the latest code is deployed:
1. Go to Cloud Functions console
2. Verify source code matches your repository
3. Check last deployment timestamp

#### 4.3 Test Function Locally (if possible)
```bash
# If you have function source code
cd functions
npm run serve
curl -X POST "http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"query": "test query"}'
```

## 🛠️ After Identifying the Error

### For 500 Internal Server Errors:
1. Check function logs for stack trace
2. Verify all dependencies are installed
3. Test with minimal payload
4. Check environment variable values

### For Timeout Issues:
1. Increase function timeout (max 540 seconds)
2. Optimize vector search queries
3. Implement response streaming
4. Add request queuing

### For Authentication Issues:
1. Regenerate API keys
2. Verify service account permissions
3. Check IAM role assignments
4. Test with service account credentials

### For CORS Issues:
1. Add CORS headers to function response
2. Configure allowed origins
3. Handle preflight requests
4. Test with different browsers

## 📋 Diagnostic Checklist

- [ ] Run curl test and get response
- [ ] Check Cloud Function logs during test
- [ ] Verify environment variables
- [ ] Check IAM permissions
- [ ] Test function deployment status
- [ ] Verify CORS configuration
- [ ] Check API key validity
- [ ] Test with minimal payload

## 🆘 Getting Help

If you're still stuck after following this guide:

1. **Collect Diagnostic Data:**
   - curl command output
   - Cloud Function logs
   - Environment variable values
   - Error messages

2. **Check Known Issues:**
   - Google Cloud status page
   - Vertex AI release notes
   - Cloud Functions documentation

3. **Contact Support:**
   - Google Cloud support (if you have a support plan)
   - Community forums
   - Stack Overflow with specific error details

## 🔄 Quick Recovery Steps

1. **Restart Function:** Redeploy the Cloud Function
2. **Check Billing:** Ensure project has billing enabled
3. **Verify Quotas:** Check if you've hit API limits
4. **Test Endpoint:** Use the diagnostic script to verify fixes

---

**Remember:** The diagnostic script will give you the most comprehensive view of what's happening. Start there, then use the logs to pinpoint the exact failure point.
