#!/usr/bin/env node

// Test Direct Document Processing
// This script directly tests the document processing functionality

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

async function testProcessDocuments() {
  log('\n🔍 Testing Process Documents Endpoint...', 'cyan');
  log('=======================================', 'cyan');

  try {
    const url = `${API_URL}/trpc/processDocuments`;
    
    log(`📡 Testing URL: ${url}`, 'blue');
    
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

    log(`📊 Response Status: ${response.status}`, 'blue');
    log(`📄 Response Data:`, 'blue');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      const result = response.data.result?.data || response.data;
      if (result.success) {
        log('✅ Document processing successful!', 'green');
        log(`📊 Processed ${result.documents?.length || 0} documents`, 'green');
        log(`📄 Total chunks: ${result.totalChunks || 0}`, 'green');
      } else {
        log('❌ Document processing failed', 'red');
        log(`Error: ${result.message}`, 'red');
      }
    } else {
      log(`❌ Request failed with status: ${response.status}`, 'red');
    }

  } catch (error) {
    log(`❌ Error testing process documents: ${error.message}`, 'red');
  }
}

async function testAllEndpoints() {
  log('\n🔍 Testing All Available Endpoints...', 'cyan');
  log('=====================================', 'cyan');

  const endpoints = [
    { name: 'Health', url: 'https://health-6otymacelq-uc.a.run.app' },
    { name: 'Stats', url: `${API_URL}/trpc/getStats` },
    { name: 'List Documents', url: `${API_URL}/trpc/listDocuments` },
    { name: 'Process Documents', url: `${API_URL}/trpc/processDocuments` },
  ];

  for (const endpoint of endpoints) {
    try {
      log(`\n📡 Testing: ${endpoint.name}`, 'blue');
      
      const response = await new Promise((resolve, reject) => {
        const req = https.request(endpoint.url, {
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
        log(`✅ ${endpoint.name}: Working (${response.status})`, 'green');
        
        if (endpoint.name === 'Stats') {
          const stats = response.data.result?.data || response.data;
          log(`   Documents: ${stats.stats?.documents || 0}`, 'green');
          log(`   Chunks: ${stats.stats?.chunks || 0}`, 'green');
          log(`   Type: ${stats.type || 'unknown'}`, 'green');
        }
        
        if (endpoint.name === 'Process Documents') {
          const result = response.data.result?.data || response.data;
          if (result.success) {
            log(`   Success: ${result.message}`, 'green');
            log(`   Documents: ${result.documents?.length || 0}`, 'green');
            log(`   Chunks: ${result.totalChunks || 0}`, 'green');
          } else {
            log(`   Error: ${result.message}`, 'red');
          }
        }
      } else {
        log(`❌ ${endpoint.name}: Failed (${response.status})`, 'red');
        if (response.data.error) {
          log(`   Error: ${response.data.error.message}`, 'red');
        }
      }
    } catch (error) {
      log(`❌ ${endpoint.name}: Error - ${error.message}`, 'red');
    }
  }
}

async function main() {
  log('🚀 Testing Direct Document Processing', 'cyan');
  log('=====================================', 'cyan');

  // Test all endpoints
  await testAllEndpoints();

  // Test process documents specifically
  await testProcessDocuments();

  log('\n🎉 Direct Testing Complete!', 'green');
}

// Run the tests
main().catch(console.error);
