#!/usr/bin/env node

// Process Local Documents
// This script processes local documents and triggers the processing pipeline

const fs = require('fs');
const path = require('path');
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
  log('\n🔄 Triggering Document Processing...', 'cyan');
  log('====================================', 'cyan');

  try {
    const url = `${API_URL}/trpc/processDocuments`;
    
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
      log('✅ Document processing triggered successfully', 'green');
      log(`📊 Processed ${result.documents?.length || 0} documents`, 'green');
      log(`📄 Total chunks: ${result.totalChunks || 0}`, 'green');
      
      if (result.documents) {
        log('\n📋 Processed Documents:', 'yellow');
        result.documents.forEach((doc, index) => {
          log(`   ${index + 1}. ${doc.title} (${doc.chunks} chunks)`, 'yellow');
        });
      }
    } else {
      log(`❌ Failed to trigger processing: ${response.status}`, 'red');
      log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
    }

  } catch (error) {
    log(`❌ Error triggering processing: ${error.message}`, 'red');
  }
}

async function checkSystemStatus() {
  log('\n📊 Checking System Status...', 'cyan');
  log('============================', 'cyan');

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
    } else {
      log(`❌ Stats check failed: ${statsResponse.status}`, 'red');
    }

  } catch (error) {
    log(`❌ Error checking system status: ${error.message}`, 'red');
  }
}

async function testRAGQueries() {
  log('\n🧪 Testing RAG Queries...', 'cyan');
  log('==========================', 'cyan');

  const testQuestions = [
    "What are the rights of children under Zambian law?",
    "What does the Employment Code Act cover?",
    "What does the Companies Act govern?"
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
        log(`   Answer: ${result.answer?.substring(0, 100)}...`, 'green');
        log(`   Sources: ${result.sources?.length || 0}`, 'green');
        
        if (result.sources && result.sources.length > 0) {
          result.sources.forEach((source, index) => {
            const docName = source.title || source.documentName || source.source || 'Unknown';
            log(`   Source ${index + 1}: ${docName}`, 'yellow');
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
  log('🚀 Starting Document Processing Pipeline', 'cyan');
  log('========================================', 'cyan');

  // Step 1: Check current system status
  await checkSystemStatus();

  // Step 2: Trigger document processing
  await triggerDocumentProcessing();

  // Step 3: Check system status after processing
  await checkSystemStatus();

  // Step 4: Test RAG queries
  await testRAGQueries();

  log('\n🎉 Pipeline Complete!', 'green');
  log('Your RAG system should now be using real document processing.', 'green');
  log('Visit: https://pocket-counsel.web.app to test the system.', 'green');
}

// Run the pipeline
main().catch(console.error);
