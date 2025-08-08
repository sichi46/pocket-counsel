#!/usr/bin/env node

// Upload Documents to GCS
// This script uploads local documents to Google Cloud Storage

const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

// Initialize Google Cloud Storage with application default credentials
const storage = new Storage({
  projectId: 'pocket-counsel',
});

const BUCKET_NAME = 'pocket-counsel-rag-corpus';

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

async function createBucketIfNotExists() {
  try {
    const bucket = storage.bucket(BUCKET_NAME);
    const [exists] = await bucket.exists();
    
    if (!exists) {
      log('📦 Creating GCS bucket...', 'blue');
      await bucket.create();
      log('✅ Bucket created successfully', 'green');
    } else {
      log('✅ Bucket already exists', 'green');
    }
    
    return bucket;
  } catch (error) {
    log(`❌ Error creating bucket: ${error.message}`, 'red');
    throw error;
  }
}

async function uploadDocuments() {
  log('\n📤 Uploading Documents to GCS...', 'cyan');
  log('================================', 'cyan');

  try {
    const bucket = await createBucketIfNotExists();
    
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

async function listBucketContents() {
  log('\n📋 Listing Bucket Contents...', 'cyan');
  log('=============================', 'cyan');

  try {
    const bucket = storage.bucket(BUCKET_NAME);
    const [files] = await bucket.getFiles();
    
    if (files.length === 0) {
      log('⚠️  No files found in the bucket', 'yellow');
      return;
    }
    
    log(`✅ Found ${files.length} files in bucket`, 'green');
    
    // Group files by type
    const txtFiles = files.filter(file => file.name.toLowerCase().endsWith('.txt'));
    const pdfFiles = files.filter(file => file.name.toLowerCase().endsWith('.pdf'));
    const otherFiles = files.filter(file => 
      !file.name.toLowerCase().endsWith('.txt') && 
      !file.name.toLowerCase().endsWith('.pdf')
    );
    
    if (txtFiles.length > 0) {
      log('\n📝 Text Documents:', 'yellow');
      txtFiles.forEach((file, index) => {
        const sizeKB = (file.metadata.size / 1024).toFixed(2);
        log(`   ${index + 1}. ${file.name} (${sizeKB} KB)`, 'yellow');
      });
    }
    
    if (pdfFiles.length > 0) {
      log('\n📄 PDF Documents:', 'yellow');
      pdfFiles.forEach((file, index) => {
        const sizeMB = (file.metadata.size / (1024 * 1024)).toFixed(2);
        log(`   ${index + 1}. ${file.name} (${sizeMB} MB)`, 'yellow');
      });
    }
    
    if (otherFiles.length > 0) {
      log('\n📁 Other Files:', 'yellow');
      otherFiles.forEach((file, index) => {
        const sizeMB = (file.metadata.size / (1024 * 1024)).toFixed(2);
        log(`   ${index + 1}. ${file.name} (${sizeMB} MB)`, 'yellow');
      });
    }
    
  } catch (error) {
    log(`❌ Error listing bucket contents: ${error.message}`, 'red');
  }
}

async function main() {
  log('🚀 Starting GCS Document Upload', 'cyan');
  log('==============================', 'cyan');

  // Step 1: Upload documents
  const uploadSuccess = await uploadDocuments();
  
  if (!uploadSuccess) {
    log('❌ Document upload failed. Stopping.', 'red');
    return;
  }

  // Step 2: List bucket contents
  await listBucketContents();

  log('\n🎉 GCS Upload Complete!', 'green');
  log('Your documents are now in Google Cloud Storage.', 'green');
  log('Bucket: gs://pocket-counsel-rag-corpus', 'green');
}

// Run the upload
main().catch(console.error);
