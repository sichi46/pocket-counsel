/**
 * Script to populate Vertex AI Vector Search with documents from GCS
 * This script processes all PDF documents in the GCS bucket and adds them to Vector Search
 */

const https = require('https');

// Configuration
const CLOUD_FUNCTION_URL = 'https://api-6otymacelq-uc.a.run.app';

async function makeAPICall(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, CLOUD_FUNCTION_URL);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
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
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function listGCSDocuments() {
  console.log('📋 Listing documents in GCS bucket...');
  
  try {
    const response = await makeAPICall('/trpc/listGCSDocuments');
    
    if (response.status === 200 && response.data.result?.data?.success) {
      const documents = response.data.result.data.documents;
      console.log(`Found ${documents.length} PDF documents in GCS:`);
      documents.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc}`);
      });
      return documents;
    } else {
      console.error('Failed to list GCS documents:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error listing GCS documents:', error);
    return [];
  }
}

async function processAllDocuments() {
  console.log('🚀 Starting processing of all documents from GCS...');
  
  try {
    const response = await makeAPICall('/trpc/processGCSDocuments');
    
    if (response.status === 200 && response.data.result?.data?.success) {
      console.log('✅ Successfully processed all documents!');
      console.log('📊 Result:', response.data.result.data.message);
      return true;
    } else {
      console.error('❌ Failed to process documents:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error processing documents:', error);
    return false;
  }
}

async function processSpecificDocument(filename) {
  console.log(`🔄 Processing specific document: ${filename}...`);
  
  try {
    const response = await makeAPICall('/trpc/processSpecificGCSDocument', 'POST', { filename });
    
    if (response.status === 200 && response.data.result?.data?.success) {
      console.log(`✅ Successfully processed ${filename}!`);
      return true;
    } else {
      console.error(`❌ Failed to process ${filename}:`, response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error);
    return false;
  }
}

async function testRAGQuery(question) {
  console.log(`🤖 Testing RAG query: "${question}"`);
  
  try {
    const response = await makeAPICall('/trpc/askRAG', 'POST', { 
      question,
      topK: 3 
    });
    
    if (response.status === 200 && response.data.result?.data?.success) {
      const result = response.data.result.data;
      console.log('✅ RAG Query successful!');
      console.log('\n📝 Answer:');
      console.log(result.answer);
      console.log('\n📚 Sources:');
      result.sources.forEach((source, index) => {
        console.log(`  ${index + 1}. ${source.title} (similarity: ${source.similarity.toFixed(3)})`);
        console.log(`     "${source.content}"`);
      });
      console.log('\n📊 Metadata:');
      console.log(`  - Total chunks searched: ${result.metadata.totalChunks}`);
      console.log(`  - Search time: ${result.metadata.searchTime}ms`);
      console.log(`  - Model used: ${result.metadata.model}`);
      return true;
    } else {
      console.error('❌ RAG query failed:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing RAG query:', error);
    return false;
  }
}

async function main() {
  console.log('🎯 Vertex AI Vector Search Population Script');
  console.log('============================================\n');
  
  // Get command line arguments
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'list') {
    await listGCSDocuments();
  } else if (command === 'process-all') {
    const documents = await listGCSDocuments();
    if (documents.length > 0) {
      console.log('\n🔄 Processing all documents...');
      const success = await processAllDocuments();
      
      if (success) {
        console.log('\n🧪 Testing RAG functionality...');
        await testRAGQuery('What are the rights of children under Zambian law?');
      }
    }
  } else if (command === 'process' && args[1]) {
    const filename = args[1];
    await processSpecificDocument(filename);
  } else if (command === 'test' && args[1]) {
    const question = args.slice(1).join(' ');
    await testRAGQuery(question);
  } else {
    console.log('Usage:');
    console.log('  node scripts/populate-vector-search.js list                    # List documents in GCS');
    console.log('  node scripts/populate-vector-search.js process-all             # Process all documents');
    console.log('  node scripts/populate-vector-search.js process <filename>      # Process specific document');
    console.log('  node scripts/populate-vector-search.js test <question>         # Test RAG query');
    console.log('\nExamples:');
    console.log('  node scripts/populate-vector-search.js list');
    console.log('  node scripts/populate-vector-search.js process-all');
    console.log('  node scripts/populate-vector-search.js process "Act No. 12 OF 2022,The Children\'s Code FINAL.pdf"');
    console.log('  node scripts/populate-vector-search.js test "What does the Employment Code Act cover?"');
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
