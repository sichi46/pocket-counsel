# Vector Search Test Scripts

This directory contains scripts to test and verify that vectors were successfully uploaded to your Vertex AI Vector Search index.

## Files

- **`test_vector_search.py`** - Main test script that performs comprehensive testing
- **`run_vector_search_test.sh`** - Shell script for Unix/Linux/macOS users
- **`run_vector_search_test.bat`** - Batch script for Windows users  
- **`run_test.py`** - Cross-platform Python test runner
- **`requirements.txt`** - Python dependencies needed for testing

## Prerequisites

1. **Python 3.8+** installed
2. **Google Cloud SDK** installed and authenticated
3. **Access to your Vertex AI Vector Search index**

## Quick Start

### Option 1: Cross-platform Python runner (Recommended)

```bash
# From project root directory
python scripts/run_test.py
```

### Option 2: Platform-specific scripts

**Windows:**
```cmd
# From project root directory
scripts\run_vector_search_test.bat
```

**Unix/Linux/macOS:**
```bash
# From project root directory
./scripts/run_vector_search_test.sh
```

### Option 3: Direct Python execution

```bash
# From project root directory
cd scripts
python test_vector_search.py
```

## What the Test Does

The test script performs the following checks:

1. **Index Connection** - Verifies connection to your Vertex AI Vector Search index
2. **Embedding Generation** - Tests that embeddings can be generated using the text-embedding-004 model
3. **Index Content Check** - Verifies that vectors actually exist in the index
4. **Vector Search Functionality** - Tests similarity search with various legal queries

## Configuration

The test uses these environment variables (with defaults):

- `GOOGLE_CLOUD_PROJECT` = "pocket-counsel"
- `VERTEX_AI_LOCATION` = "us-central1"  
- `VERTEX_AI_INDEX_ID` = "849546455294148608"

You can override these by setting them in your environment or modifying the scripts.

## Expected Results

### Success Case
```
🎉 ALL TESTS PASSED! Vector Search is working correctly.
✅ All tests passed! Vector Search is working correctly.
```

### Partial Success (No Vectors)
```
⚠️ Index connected and embeddings work, but no vectors found.
⚠️ Partial success. Check results for details.
```

### Failure Case
```
❌ CRITICAL TESTS FAILED. Vector Search is not working.
❌ Tests failed. Check results for details.
```

## Output Files

The test generates a JSON results file with timestamp:
- `vector_search_test_results_<timestamp>.json`

This file contains detailed information about each test and can be used for debugging.

## Troubleshooting

### Common Issues

1. **Authentication Error**
   ```bash
   gcloud auth login
   gcloud config set project pocket-counsel
   ```

2. **Missing Dependencies**
   ```bash
   pip install -r scripts/requirements.txt
   ```

3. **Wrong Directory**
   - Make sure you're running from the project root directory
   - The scripts expect to find `scripts/test_vector_search.py`

4. **Index Not Found**
   - Verify your `VERTEX_AI_INDEX_ID` is correct
   - Check that the index exists in the specified project and location

### Debug Mode

For more detailed logging, you can modify the logging level in `test_vector_search.py`:

```python
logging.basicConfig(
    level=logging.DEBUG,  # Change from INFO to DEBUG
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

## Test Queries

The test uses these sample legal queries to verify search functionality:

- "business registration Zambia"
- "divorce procedure" 
- "employment contract"
- "property law"
- "criminal procedure"
- "family law"
- "contract law"
- "constitutional rights"

## Support

If you encounter issues:

1. Check the generated JSON results file for detailed error information
2. Verify your Google Cloud credentials and permissions
3. Ensure your Vertex AI Vector Search index is properly deployed
4. Check that vectors were actually uploaded to the index

## Next Steps

After successful testing:

1. **Integration Testing** - Test the vector search from your main application
2. **Performance Testing** - Measure search latency and throughput
3. **Query Optimization** - Fine-tune search parameters for your use case
4. **Monitoring** - Set up alerts for index health and performance
