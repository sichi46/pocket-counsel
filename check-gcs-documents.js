#!/usr/bin/env node

// Check GCS Documents
// This script checks what documents are available in your GCS bucket

const { Storage } = require('@google-cloud/storage');

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: 'pocket-counsel',
});

const BUCKET_NAME = 'pocket-counsel-rag-corpus';

async function checkGCSDocuments() {
  console.log('🔍 Checking GCS Documents...');
  console.log('============================');

  try {
    const bucket = storage.bucket(BUCKET_NAME);
    
    // Check if bucket exists
    const [exists] = await bucket.exists();
    
    if (!exists) {
      console.log(`❌ Bucket '${BUCKET_NAME}' does not exist`);
      console.log('💡 Creating bucket...');
      await bucket.create();
      console.log('✅ Bucket created successfully');
    } else {
      console.log(`✅ Bucket '${BUCKET_NAME}' exists`);
    }
    
    // List all files in the bucket
    console.log('\n📋 Listing Files in Bucket...');
    const [files] = await bucket.getFiles();
    
    if (files.length === 0) {
      console.log('⚠️  No files found in the bucket');
      console.log('💡 You may need to upload documents first');
      return [];
    }
    
    console.log(`✅ Found ${files.length} files in bucket`);
    
    // Group files by type
    const pdfFiles = files.filter(file => file.name.toLowerCase().endsWith('.pdf'));
    const txtFiles = files.filter(file => file.name.toLowerCase().endsWith('.txt'));
    const otherFiles = files.filter(file => 
      !file.name.toLowerCase().endsWith('.pdf') && 
      !file.name.toLowerCase().endsWith('.txt')
    );
    
    console.log('\n📄 PDF Documents:');
    pdfFiles.forEach((file, index) => {
      const sizeMB = (file.metadata.size / (1024 * 1024)).toFixed(2);
      console.log(`   ${index + 1}. ${file.name} (${sizeMB} MB)`);
    });
    
    console.log('\n📝 Text Documents:');
    txtFiles.forEach((file, index) => {
      const sizeKB = (file.metadata.size / 1024).toFixed(2);
      console.log(`   ${index + 1}. ${file.name} (${sizeKB} KB)`);
    });
    
    if (otherFiles.length > 0) {
      console.log('\n📁 Other Files:');
      otherFiles.forEach((file, index) => {
        const sizeMB = (file.metadata.size / (1024 * 1024)).toFixed(2);
        console.log(`   ${index + 1}. ${file.name} (${sizeMB} MB)`);
      });
    }
    
    return files;
    
  } catch (error) {
    console.error(`❌ Error checking GCS: ${error.message}`);
    return [];
  }
}

// Run the check
checkGCSDocuments().catch(console.error);
