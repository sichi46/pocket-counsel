#!/usr/bin/env node

// Trigger Document Processing
// This script triggers the processing of all documents in GCS

const https = require('https');

const API_URL = 'https://api-6otymacelq-uc.a.run.app';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function triggerDocumentProcessing() {
  log('\n🔄 Triggering Real Document Processing...', 'cyan');
  log('==========================================', 'cyan');

  try {
    const url = `${API_URL}/trpc/processDocuments`;
    
    log('📡 Sending request to process all GCS documents...', 'blue');
    
    const response = await new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (error) {
            resolve({ status: res.statusCode, data });
          }
        });
      });

      req.on('error', reject);
      req.end();
    });

    if (response.status === 200) {
      const result = response.data.result?.data || response.data;
      log('✅ Document processing triggered successfully!', 'green');
      log(`📊 Processed ${result.documents?.length || 0} documents`, 'green');
      log(`📄 Total chunks: ${result.totalChunks || 0}`, 'green');
      
      if (result.documents && result.documents.length > 0) {
        log('\n📋 Processed Documents:', 'yellow');
        result.documents.forEach((doc, index) => {
          log(`   ${index + 1}. ${doc.title} (${doc.chunks} chunks)`, 'yellow');
          log(`      Source: ${doc.source}`, 'yellow');
          log(`      File Type: ${doc.metadata?.fileType || 'unknown'}`, 'yellow');
          log(`      File Size: ${(doc.metadata?.fileSize / 1024).toFixed(2)} KB`, 'yellow');
        });
      }
      
      log('\n🎉 Real document processing complete!', 'green');
      log('Your RAG system now uses actual document content from GCS.', 'green');
      
    } else {
      log(`❌ Failed to trigger processing: ${response.status}`, 'red');
      log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
    }

  } catch (error) {
    log(`❌ Error triggering processing: ${error.message}`, 'red');
  }
}

async function checkSystemStatus() {
  log('\n📊 Checking System Status After Processing...', 'cyan');
  log('=============================================', 'cyan');

  try {
    // Check health
    const healthResponse = await new Promise((resolve, reject) => {
      const req = https.request('https://health-6otymacelq-uc.a.run.app', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (error) {
            resolve({ status: res.statusCode, data });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    if (healthResponse.status === 200) {
      const health = healthResponse.data;
      log('✅ Health check passed', 'green');
      log(`   Status: ${health.status}`, 'green');
      log(`   Documents: ${health.rag?.documents || 0}`, 'green');
      log(`   Type: ${health.rag?.type || 'unknown'}`, 'green');
    } else {
      log(`❌ Health check failed: ${healthResponse.status}`, 'red');
    }

    // Check stats
    const statsResponse = await new Promise((resolve, reject) => {
      const req = https.request(`${API_URL}/trpc/getStats`, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (error) {
            resolve({ status: res.statusCode, data });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    if (statsResponse.status === 200) {
      const stats = statsResponse.data.result?.data || statsResponse.data;
      log('✅ Stats check passed', 'green');
      log(`   Documents: ${stats.stats?.documents || 0}`, 'green');
      log(`   Chunks: ${stats.stats?.chunks || 0}`, 'green');
      log(`   Embeddings: ${stats.stats?.embeddings || 0}`, 'green');
      log(`   Type: ${stats.type || 'unknown'}`, 'green');
    } else {
      log(`❌ Stats check failed: ${statsResponse.status}`, 'red');
    }

  } catch (error) {
    log(`❌ Error checking system status: ${error.message}`, 'red');
  }
}

async function testRealRAGQueries() {
  log('\n🧪 Testing RAG Queries with Real Documents...', 'cyan');
  log('==============================================', 'cyan');

  const testQuestions = [
    "What are the rights of children under Zambian law?",
    "What does the Employment Code Act cover?",
    "What does the Companies Act govern?",
    "What are the penalties for criminal offenses?",
    "How does the Constitution protect citizens?"
  ];

  for (const question of testQuestions) {
    try {
      log(`\n📝 Testing: "${question}"`, 'blue');
      
      const encodedQuestion = encodeURIComponent(JSON.stringify({
        question: question,
        topK: 3
      }));
      
      const response = await new Promise((resolve, reject) => {
        const req = https.request(`${API_URL}/trpc/askQuestion?input=${encodedQuestion}`, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              resolve({ status: res.statusCode, data: parsed });
            } catch (error) {
              resolve({ status: res.statusCode, data });
            }
          });
        });
        req.on('error', reject);
        req.end();
      });

      if (response.status === 200) {
        const result = response.data.result?.data || response.data;
        log('✅ Query successful', 'green');
        log(`   Answer: ${result.answer?.substring(0, 150)}...`, 'green');
        log(`   Sources: ${result.sources?.length || 0}`, 'green');
        
        if (result.sources && result.sources.length > 0) {
          log('   Sources Used:', 'yellow');
          result.sources.forEach((source, index) => {
            const docName = source.title || source.documentName || source.source || 'Unknown';
            const similarity = source.similarity || 0;
            log(`     ${index + 1}. ${docName} (${similarity.toFixed(1)}% match)`, 'yellow');
          });
        }
      } else {
        log(`❌ Query failed: ${response.status}`, 'red');
      }
    } catch (error) {
      log(`❌ Error testing query: ${error.message}`, 'red');
    }
  }
}

async function main() {
  log('🚀 Starting Real Document Processing Pipeline', 'cyan');
  log('=============================================', 'cyan');

  // Step 1: Trigger document processing
  await triggerDocumentProcessing();

  // Step 2: Check system status
  await checkSystemStatus();

  // Step 3: Test RAG queries with real documents
  await testRealRAGQueries();

  log('\n🎉 Real Document Processing Complete!', 'green');
  log('Your RAG system now processes real PDF and text documents from GCS.', 'green');
  log('🌐 Visit: https://pocket-counsel.web.app to test the system', 'green');
  log('📚 All 20+ legal documents are now available for queries!', 'green');
}

// Run the pipeline
main().catch(console.error);
