#!/usr/bin/env node

// Upload and Process Documents
// This script uploads sample documents to GCS and triggers processing

const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: 'pocket-counsel',
});

const BUCKET_NAME = 'pocket-counsel-rag-corpus';
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

async function uploadDocuments() {
  log('\n📤 Uploading Documents to GCS...', 'cyan');
  log('================================', 'cyan');

  try {
    const bucket = storage.bucket(BUCKET_NAME);
    
    // Check if bucket exists, create if not
    const [exists] = await bucket.exists();
    if (!exists) {
      log('📦 Creating GCS bucket...', 'blue');
      await bucket.create();
      log('✅ Bucket created successfully', 'green');
    } else {
      log('✅ Bucket already exists', 'green');
    }

    // Get documents from the documents directory
    const documentsDir = path.join(__dirname, 'documents');
    const files = fs.readdirSync(documentsDir).filter(file => file.endsWith('.txt'));

    log(`📋 Found ${files.length} documents to upload`, 'blue');

    for (const file of files) {
      const filePath = path.join(documentsDir, file);
      const fileName = file;
      
      log(`📄 Uploading: ${fileName}`, 'blue');
      
      try {
        await bucket.upload(filePath, {
          destination: fileName,
          metadata: {
            contentType: 'text/plain',
          },
        });
        
        log(`✅ Uploaded: ${fileName}`, 'green');
      } catch (error) {
        log(`❌ Failed to upload ${fileName}: ${error.message}`, 'red');
      }
    }

    log('\n🎉 Document upload complete!', 'green');
    return true;

  } catch (error) {
    log(`❌ Error uploading documents: ${error.message}`, 'red');
    return false;
  }
}

async function triggerDocumentProcessing() {
  log('\n🔄 Triggering Document Processing...', 'cyan');
  log('====================================', 'cyan');

  try {
    const url = `${API_URL}/trpc/processDocuments`;
    
    const response = await new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: 'POST',
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

async function main() {
  log('🚀 Starting Document Upload and Processing Pipeline', 'cyan');
  log('==================================================', 'cyan');

  // Step 1: Upload documents
  const uploadSuccess = await uploadDocuments();
  
  if (!uploadSuccess) {
    log('❌ Document upload failed. Stopping.', 'red');
    return;
  }

  // Step 2: Trigger processing
  await triggerDocumentProcessing();

  // Step 3: Check system status
  await checkSystemStatus();

  log('\n🎉 Pipeline Complete!', 'green');
  log('Your RAG system should now be using real documents from GCS.', 'green');
  log('Visit: https://pocket-counsel.web.app to test the system.', 'green');
}

// Run the pipeline
main().catch(console.error);
