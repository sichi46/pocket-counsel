#!/usr/bin/env node

// Check Documents in RAG System
// This script checks which documents are available and ready for querying

const https = require('https');

const API_URL = 'https://api-6otymacelq-uc.a.run.app';
const HEALTH_URL = 'https://health-6otymacelq-uc.a.run.app';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function checkSystemStatus() {
  log('\n🔍 Checking RAG System Document Status...', 'cyan');
  log('==========================================', 'cyan');

  try {
    // Check health endpoint
    log('\n📊 Checking System Health...', 'blue');
    const healthResponse = await makeRequest(`${HEALTH_URL}`);
    
    if (healthResponse.status === 200) {
      const health = healthResponse.data;
      log('✅ Health endpoint is working', 'green');
      log(`   Status: ${health.status}`, 'green');
      log(`   Environment: ${health.environment || 'Unknown'}`, 'green');
      log(`   Database: ${health.database || 'Unknown'}`, 'green');
      
      if (health.rag) {
        log(`   RAG Status: ${health.rag.status}`, 'green');
        log(`   RAG Type: ${health.rag.type}`, 'green');
        log(`   Documents Available: ${health.rag.documents}`, 'green');
      }
      
      if (health.models) {
        log(`   AI Model: ${health.models.generative}`, 'green');
        log(`   Provider: ${health.models.provider}`, 'green');
      }
    } else {
      log(`❌ Health check failed: ${healthResponse.status}`, 'red');
    }

    // Check stats endpoint
    log('\n📈 Checking System Statistics...', 'blue');
    const statsResponse = await makeRequest(`${API_URL}/trpc/getStats`);
    
    if (statsResponse.status === 200) {
      const stats = statsResponse.data.result?.data || statsResponse.data;
      log('✅ Stats endpoint is working', 'green');
      log(`   Success: ${stats.success}`, 'green');
      log(`   Documents: ${stats.stats?.documents || 0}`, 'green');
      log(`   Chunks: ${stats.stats?.chunks || 0}`, 'green');
      log(`   Embeddings: ${stats.stats?.embeddings || 0}`, 'green');
      log(`   Type: ${stats.type || 'Unknown'}`, 'green');
    } else {
      log(`❌ Stats check failed: ${statsResponse.status}`, 'red');
    }

    // List all documents
    log('\n📚 Listing Available Documents...', 'blue');
    const documentsResponse = await makeRequest(`${API_URL}/trpc/listDocuments`);
    
    if (documentsResponse.status === 200) {
      const documents = documentsResponse.data.result?.data || documentsResponse.data;
      log('✅ Documents endpoint is working', 'green');
      log(`   Success: ${documents.success}`, 'green');
      log(`   Total Documents: ${documents.count || 0}`, 'green');
      log(`   Type: ${documents.type || 'Unknown'}`, 'green');
      
      if (documents.documents && documents.documents.length > 0) {
        log('\n📋 Available Documents:', 'yellow');
        documents.documents.forEach((doc, index) => {
          log(`   ${index + 1}. ${doc}`, 'yellow');
        });
      } else {
        log('⚠️  No documents found in the system', 'yellow');
      }
    } else {
      log(`❌ Documents check failed: ${documentsResponse.status}`, 'red');
    }

    // Test a sample query to see what documents are actually being used
    log('\n🧪 Testing Sample Query...', 'blue');
    const testQuestion = 'What are the rights of children under Zambian law?';
    const encodedQuestion = encodeURIComponent(JSON.stringify({
      question: testQuestion,
      topK: 3
    }));
    
    const queryResponse = await makeRequest(`${API_URL}/trpc/askQuestion?input=${encodedQuestion}`);
    
    if (queryResponse.status === 200) {
      const result = queryResponse.data.result?.data || queryResponse.data;
      log('✅ Query test successful', 'green');
      log(`   Answer Length: ${result.answer?.length || 0} characters`, 'green');
      log(`   Sources Found: ${result.sources?.length || 0}`, 'green');
      
      if (result.sources && result.sources.length > 0) {
        log('\n📖 Documents Used in Response:', 'yellow');
        result.sources.forEach((source, index) => {
          const docName = source.title || source.documentName || source.source || 'Unknown';
          const score = source.similarity || source.score || 0;
          log(`   ${index + 1}. ${docName} (${score.toFixed(1)}% match)`, 'yellow');
        });
      }
    } else {
      log(`❌ Query test failed: ${queryResponse.status}`, 'red');
    }

  } catch (error) {
    log(`❌ Error checking system: ${error.message}`, 'red');
  }

  log('\n✅ Document Status Check Complete!', 'green');
  log('==========================================', 'cyan');
}

// Run the check
checkSystemStatus().catch(console.error);
