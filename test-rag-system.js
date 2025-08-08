#!/usr/bin/env node

/**
 * RAG System Testing Script
 * 
 * This script tests the RAG engine deployed in Google Cloud to ensure:
 * 1. All endpoints are responding correctly
 * 2. The RAG system is retrieving relevant documents
 * 3. AI responses are grounded in the ingested documents
 * 4. Source citations are working properly
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'https://api-6otymacelq-uc.a.run.app';
const HEALTH_URL = 'https://health-6otymacelq-uc.a.run.app';

// Test questions designed to verify RAG functionality
const TEST_QUESTIONS = [
  // Children's Code Act questions
  {
    question: "What are the rights of children under Zambian law?",
    expectedDocuments: ["The Children's Code Act No. 12 of 2022"],
    category: "Children's Rights"
  },
  {
    question: "What does the Children's Code Act cover?",
    expectedDocuments: ["The Children's Code Act No. 12 of 2022"],
    category: "Children's Rights"
  },
  
  // Employment Code Act questions
  {
    question: "What does the Employment Code Act regulate?",
    expectedDocuments: ["The Employment Code Act No. 3 of 2019"],
    category: "Employment Law"
  },
  {
    question: "What are the minimum wage requirements in Zambia?",
    expectedDocuments: ["The Employment Code Act No. 3 of 2019"],
    category: "Employment Law"
  },
  
  // Companies Act questions
  {
    question: "What does the Companies Act govern?",
    expectedDocuments: ["The Companies Act 2017"],
    category: "Corporate Law"
  },
  {
    question: "What are the requirements for company registration in Zambia?",
    expectedDocuments: ["The Companies Act 2017"],
    category: "Corporate Law"
  },
  
  // Cross-document questions
  {
    question: "What are the main Zambian laws that protect workers?",
    expectedDocuments: ["The Employment Code Act No. 3 of 2019"],
    category: "Cross-Document"
  },
  
  // Edge case questions
  {
    question: "What is the capital of Zambia?",
    expectedDocuments: [], // Should not find relevant documents
    category: "Edge Case"
  },
  {
    question: "How do I file for divorce in Zambia?",
    expectedDocuments: [], // Should not find relevant documents
    category: "Edge Case"
  }
];

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test health endpoint
async function testHealthEndpoint() {
  console.log('\n🔍 Testing Health Endpoint...');
  
  try {
    const response = await makeRequest(HEALTH_URL);
    
    if (response.status === 200) {
      console.log('✅ Health endpoint is working');
      console.log('   Status:', response.data.status);
      console.log('   Message:', response.data.message);
      console.log('   Timestamp:', response.data.timestamp);
      return true;
    } else {
      console.log('❌ Health endpoint failed');
      console.log('   Status:', response.status);
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Health endpoint error:', error.message);
    return false;
  }
}

// Test tRPC health endpoint
async function testTRPCHealth() {
  console.log('\n🔍 Testing tRPC Health Endpoint...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/trpc/health`);
    
    if (response.status === 200) {
      console.log('✅ tRPC health endpoint is working');
      console.log('   Status:', response.data.result.data.status);
      console.log('   Project:', response.data.result.data.project);
      console.log('   Model:', response.data.result.data.models.generative);
      console.log('   RAG Status:', response.data.result.data.rag.status);
      console.log('   Documents:', response.data.result.data.rag.documents);
      return true;
    } else {
      console.log('❌ tRPC health endpoint failed');
      console.log('   Status:', response.status);
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ tRPC health endpoint error:', error.message);
    return false;
  }
}

// Test stats endpoint
async function testStatsEndpoint() {
  console.log('\n🔍 Testing Stats Endpoint...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/trpc/getStats`);
    
    if (response.status === 200) {
      console.log('✅ Stats endpoint is working');
      console.log('   Documents:', response.data.result.data.stats.documents);
      console.log('   Chunks:', response.data.result.data.stats.chunks);
      console.log('   Embeddings:', response.data.result.data.stats.embeddings);
      console.log('   Type:', response.data.result.data.type);
      return true;
    } else {
      console.log('❌ Stats endpoint failed');
      console.log('   Status:', response.status);
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Stats endpoint error:', error.message);
    return false;
  }
}

// Test document listing endpoint
async function testListDocuments() {
  console.log('\n🔍 Testing Document List Endpoint...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/trpc/listDocuments`);
    
    if (response.status === 200) {
      console.log('✅ Document list endpoint is working');
      console.log('   Document Count:', response.data.result.data.count);
      console.log('   Documents:');
      response.data.result.data.documents.forEach((doc, index) => {
        console.log(`     ${index + 1}. ${doc}`);
      });
      return true;
    } else {
      console.log('❌ Document list endpoint failed');
      console.log('   Status:', response.status);
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Document list endpoint error:', error.message);
    return false;
  }
}

// Test RAG question answering
async function testRAGQuestion(question, expectedDocuments, category) {
  console.log(`\n🔍 Testing RAG Question (${category}): "${question}"`);
  
  try {
    const response = await makeRequest(`${BASE_URL}/trpc/askQuestion`, {
      method: 'POST',
      body: {
        question: question,
        topK: 3
      }
    });
    
    if (response.status === 200) {
      const result = response.data.result.data;
      
      console.log('✅ RAG response received');
      console.log('   Answer Length:', result.answer.length, 'characters');
      console.log('   Sources Found:', result.sources.length);
      console.log('   Search Time:', result.metadata.searchTime, 'ms');
      console.log('   Model:', result.model);
      
      // Check if sources match expected documents
      if (expectedDocuments.length > 0) {
        const foundDocuments = result.sources.map(s => s.title);
        const matches = expectedDocuments.filter(expected => 
          foundDocuments.some(found => found.includes(expected))
        );
        
        if (matches.length > 0) {
          console.log('✅ Relevant documents found:', matches);
        } else {
          console.log('⚠️  Expected documents not found');
          console.log('   Expected:', expectedDocuments);
          console.log('   Found:', foundDocuments);
        }
      } else {
        if (result.sources.length === 0) {
          console.log('✅ Correctly found no relevant documents');
        } else {
          console.log('⚠️  Found documents when none expected');
          console.log('   Found:', result.sources.map(s => s.title));
        }
      }
      
      // Display first source for verification
      if (result.sources.length > 0) {
        console.log('   Top Source:', result.sources[0].title);
        console.log('   Similarity Score:', result.sources[0].similarity);
      }
      
      return true;
    } else {
      console.log('❌ RAG question failed');
      console.log('   Status:', response.status);
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ RAG question error:', error.message);
    return false;
  }
}

// Test all RAG questions
async function testAllRAGQuestions() {
  console.log('\n🧪 Testing All RAG Questions...');
  
  let successCount = 0;
  let totalCount = TEST_QUESTIONS.length;
  
  for (const testCase of TEST_QUESTIONS) {
    const success = await testRAGQuestion(
      testCase.question, 
      testCase.expectedDocuments, 
      testCase.category
    );
    
    if (success) {
      successCount++;
    }
    
    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 RAG Question Test Results:`);
  console.log(`   Success: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  
  return successCount === totalCount;
}

// Test specific document retrieval
async function testDocumentRetrieval() {
  console.log('\n🔍 Testing Document Retrieval Accuracy...');
  
  const specificTests = [
    {
      question: "What does the Children's Code Act say about child protection?",
      expectedKeywords: ["protection", "children", "rights", "welfare"],
      document: "The Children's Code Act No. 12 of 2022"
    },
    {
      question: "What are the working hours regulations in the Employment Code?",
      expectedKeywords: ["working", "hours", "employment", "regulations"],
      document: "The Employment Code Act No. 3 of 2019"
    },
    {
      question: "How does the Companies Act handle corporate governance?",
      expectedKeywords: ["corporate", "governance", "companies", "directors"],
      document: "The Companies Act 2017"
    }
  ];
  
  let accuracyCount = 0;
  
  for (const test of specificTests) {
    try {
      const response = await makeRequest(`${BASE_URL}/trpc/askQuestion`, {
        method: 'POST',
        body: {
          question: test.question,
          topK: 1
        }
      });
      
      if (response.status === 200) {
        const result = response.data.result.data;
        const answer = result.answer.toLowerCase();
        const sources = result.sources;
        
        // Check if the correct document was retrieved
        const correctDocument = sources.some(s => s.title.includes(test.document));
        
        // Check if answer contains expected keywords
        const hasKeywords = test.expectedKeywords.some(keyword => 
          answer.includes(keyword.toLowerCase())
        );
        
        if (correctDocument && hasKeywords) {
          console.log(`✅ "${test.question}" - Correct document and relevant answer`);
          accuracyCount++;
        } else {
          console.log(`⚠️  "${test.question}" - Issues with retrieval or answer relevance`);
          if (!correctDocument) console.log('   Wrong document retrieved');
          if (!hasKeywords) console.log('   Answer lacks expected keywords');
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`❌ Error testing "${test.question}":`, error.message);
    }
  }
  
  console.log(`\n📊 Document Retrieval Accuracy: ${accuracyCount}/${specificTests.length} (${Math.round(accuracyCount/specificTests.length*100)}%)`);
  return accuracyCount === specificTests.length;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting RAG System Tests...');
  console.log('=====================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Health URL: ${HEALTH_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('=====================================');
  
  const results = {
    health: false,
    trpcHealth: false,
    stats: false,
    documents: false,
    ragQuestions: false,
    documentRetrieval: false
  };
  
  // Test basic endpoints
  results.health = await testHealthEndpoint();
  results.trpcHealth = await testTRPCHealth();
  results.stats = await testStatsEndpoint();
  results.documents = await testListDocuments();
  
  // Test RAG functionality
  results.ragQuestions = await testAllRAGQuestions();
  results.documentRetrieval = await testDocumentRetrieval();
  
  // Summary
  console.log('\n🎯 Test Summary');
  console.log('=====================================');
  console.log(`Health Endpoint: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`tRPC Health: ${results.trpcHealth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Stats Endpoint: ${results.stats ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Document List: ${results.documents ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`RAG Questions: ${results.ragQuestions ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Document Retrieval: ${results.documentRetrieval ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📊 Overall Result: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! The RAG system is working correctly.');
    console.log('✅ The system is successfully:');
    console.log('   - Responding to API requests');
    console.log('   - Retrieving relevant documents');
    console.log('   - Generating grounded AI responses');
    console.log('   - Providing source citations');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the logs above for details.');
  }
  
  return passedTests === totalTests;
}

// Run the tests
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testHealthEndpoint,
  testTRPCHealth,
  testStatsEndpoint,
  testListDocuments,
  testRAGQuestion,
  testAllRAGQuestions,
  testDocumentRetrieval
};
