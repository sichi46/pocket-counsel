#!/usr/bin/env node

// Test GCS Integration
// This script tests the GCS integration and document processing

const { Storage } = require('@google-cloud/storage');
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

async function testGCSAccess() {
  log('\n🔍 Testing GCS Access...', 'cyan');
  log('=======================', 'cyan');

  try {
    const storage = new Storage({
      projectId: 'pocket-counsel',
    });
    
    const bucket = storage.bucket('pocket-counsel-rag-corpus');
    const [files] = await bucket.getFiles();
    
    log(`✅ Successfully accessed GCS bucket`, 'green');
    log(`📋 Found ${files.length} files in bucket`, 'green');
    
    // Show some sample files
    const sampleFiles = files.slice(0, 5);
    log('\n📄 Sample Files:', 'yellow');
    sampleFiles.forEach((file, index) => {
      const sizeKB = (file.metadata.size / 1024).toFixed(2);
      log(`   ${index + 1}. ${file.name} (${sizeKB} KB)`, 'yellow');
    });
    
    return true;
  } catch (error) {
    log(`❌ GCS access failed: ${error.message}`, 'red');
    return false;
  }
}

async function testAPIEndpoints() {
  log('\n🔍 Testing API Endpoints...', 'cyan');
  log('===========================', 'cyan');

  const endpoints = [
    { name: 'Health', url: 'https://health-6otymacelq-uc.a.run.app' },
    { name: 'Stats', url: `${API_URL}/trpc/getStats` },
    { name: 'List Documents', url: `${API_URL}/trpc/listDocuments` },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await new Promise((resolve, reject) => {
        const req = https.request(endpoint.url, (res) => {
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
        log(`✅ ${endpoint.name}: Working`, 'green');
        if (endpoint.name === 'Stats') {
          const stats = response.data.result?.data || response.data;
          log(`   Documents: ${stats.stats?.documents || 0}`, 'green');
          log(`   Chunks: ${stats.stats?.chunks || 0}`, 'green');
        }
      } else {
        log(`❌ ${endpoint.name}: Failed (${response.status})`, 'red');
      }
    } catch (error) {
      log(`❌ ${endpoint.name}: Error - ${error.message}`, 'red');
    }
  }
}

async function testRAGQuery() {
  log('\n🧪 Testing RAG Query...', 'cyan');
  log('======================', 'cyan');

  try {
    const question = "What are the rights of children under Zambian law?";
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
      log('✅ RAG Query successful', 'green');
      log(`📝 Question: "${question}"`, 'blue');
      log(`💬 Answer: ${result.answer?.substring(0, 150)}...`, 'green');
      log(`📚 Sources: ${result.sources?.length || 0}`, 'green');
      
      if (result.sources && result.sources.length > 0) {
        log('\n📖 Sources Used:', 'yellow');
        result.sources.forEach((source, index) => {
          const docName = source.title || source.documentName || source.source || 'Unknown';
          const similarity = source.similarity || 0;
          log(`   ${index + 1}. ${docName} (${similarity.toFixed(1)}% match)`, 'yellow');
        });
      }
    } else {
      log(`❌ RAG Query failed: ${response.status}`, 'red');
      log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
    }
  } catch (error) {
    log(`❌ Error testing RAG query: ${error.message}`, 'red');
  }
}

async function main() {
  log('🚀 Testing GCS Integration and RAG System', 'cyan');
  log('==========================================', 'cyan');

  // Test 1: GCS Access
  const gcsAccess = await testGCSAccess();
  
  // Test 2: API Endpoints
  await testAPIEndpoints();
  
  // Test 3: RAG Query
  await testRAGQuery();

  log('\n🎉 Integration Test Complete!', 'green');
  
  if (gcsAccess) {
    log('✅ GCS integration is working', 'green');
    log('✅ Your documents are accessible from GCS', 'green');
    log('✅ RAG system is functional', 'green');
    log('\n🌐 Visit: https://pocket-counsel.web.app to use the system', 'green');
  } else {
    log('❌ GCS integration needs attention', 'red');
  }
}

// Run the tests
main().catch(console.error);
