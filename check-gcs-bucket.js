#!/usr/bin/env node

// Check Google Cloud Storage Bucket
// This script checks what documents are stored in your GCS bucket

const { Storage } = require('@google-cloud/storage');

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: 'pocket-counsel',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined,
});

const BUCKET_NAME = 'pocket-counsel-rag-corpus';

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

async function checkGCSBucket() {
  log('\n🔍 Checking Google Cloud Storage Bucket...', 'cyan');
  log('============================================', 'cyan');

  try {
    const bucket = storage.bucket(BUCKET_NAME);
    
    // Check if bucket exists
    log('\n📦 Checking Bucket Status...', 'blue');
    const [exists] = await bucket.exists();
    
    if (!exists) {
      log(`❌ Bucket '${BUCKET_NAME}' does not exist`, 'red');
      log('💡 You may need to create the bucket first:', 'yellow');
      log(`   gsutil mb -p pocket-counsel gs://${BUCKET_NAME}`, 'yellow');
      return;
    }
    
    log(`✅ Bucket '${BUCKET_NAME}' exists`, 'green');
    
    // List all files in the bucket
    log('\n📋 Listing Files in Bucket...', 'blue');
    const [files] = await bucket.getFiles();
    
    if (files.length === 0) {
      log('⚠️  No files found in the bucket', 'yellow');
      log('💡 You may need to upload documents:', 'yellow');
      log('   gsutil -m cp documents/* gs://pocket-counsel-rag-corpus/', 'yellow');
      return;
    }
    
    log(`✅ Found ${files.length} files in bucket`, 'green');
    
    // Group files by type
    const pdfFiles = files.filter(file => file.name.toLowerCase().endsWith('.pdf'));
    const txtFiles = files.filter(file => file.name.toLowerCase().endsWith('.txt'));
    const otherFiles = files.filter(file => 
      !file.name.toLowerCase().endsWith('.pdf') && 
      !file.name.toLowerCase().endsWith('.txt')
    );
    
    log('\n📄 PDF Documents:', 'yellow');
    if (pdfFiles.length > 0) {
      pdfFiles.forEach((file, index) => {
        const sizeMB = (file.metadata.size / (1024 * 1024)).toFixed(2);
        log(`   ${index + 1}. ${file.name} (${sizeMB} MB)`, 'yellow');
      });
    } else {
      log('   No PDF files found', 'yellow');
    }
    
    log('\n📝 Text Documents:', 'yellow');
    if (txtFiles.length > 0) {
      txtFiles.forEach((file, index) => {
        const sizeKB = (file.metadata.size / 1024).toFixed(2);
        log(`   ${index + 1}. ${file.name} (${sizeKB} KB)`, 'yellow');
      });
    } else {
      log('   No text files found', 'yellow');
    }
    
    if (otherFiles.length > 0) {
      log('\n📁 Other Files:', 'yellow');
      otherFiles.forEach((file, index) => {
        const sizeMB = (file.metadata.size / (1024 * 1024)).toFixed(2);
        log(`   ${index + 1}. ${file.name} (${sizeMB} MB)`, 'yellow');
      });
    }
    
    // Check bucket permissions
    log('\n🔐 Checking Bucket Permissions...', 'blue');
    try {
      const [iamPolicy] = await bucket.iam.getPolicy();
      log('✅ Bucket permissions accessible', 'green');
      
      const publicAccess = iamPolicy.bindings.some(binding => 
        binding.role === 'roles/storage.objectViewer' && 
        binding.members.includes('allUsers')
      );
      
      if (publicAccess) {
        log('⚠️  Bucket has public read access', 'yellow');
      } else {
        log('✅ Bucket has restricted access (good for security)', 'green');
      }
    } catch (error) {
      log(`⚠️  Could not check bucket permissions: ${error.message}`, 'yellow');
    }
    
    // Summary
    log('\n📊 Summary:', 'cyan');
    log(`   Total Files: ${files.length}`, 'green');
    log(`   PDF Files: ${pdfFiles.length}`, 'green');
    log(`   Text Files: ${txtFiles.length}`, 'green');
    log(`   Other Files: ${otherFiles.length}`, 'green');
    
    const totalSizeMB = files.reduce((sum, file) => sum + (file.metadata.size / (1024 * 1024)), 0);
    log(`   Total Size: ${totalSizeMB.toFixed(2)} MB`, 'green');
    
  } catch (error) {
    log(`❌ Error checking GCS bucket: ${error.message}`, 'red');
    
    if (error.code === 'ENOTFOUND') {
      log('\n💡 Possible solutions:', 'yellow');
      log('1. Make sure you have Google Cloud SDK installed', 'yellow');
      log('2. Run: gcloud auth application-default login', 'yellow');
      log('3. Set your project: gcloud config set project pocket-counsel', 'yellow');
    }
  }
  
  log('\n✅ GCS Bucket Check Complete!', 'green');
  log('============================================', 'cyan');
}

// Run the check
checkGCSBucket().catch(console.error);
