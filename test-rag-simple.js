#!/usr/bin/env node

/**
 * Simple RAG System Test Script
 * Tests the core RAG functionality using the working endpoints
 */

const { createTRPCProxyClient, httpBatchLink } = require('@trpc/client');

// Create tRPC client
const trpc = createTRPCProxyClient({
  links: [
    httpBatchLink({
      url: 'https://api-6otymacelq-uc.a.run.app/trpc',
    }),
  ],
});

async function testRAGSystem() {
  console.log('🚀 Testing RAG System in Google Cloud...');
  console.log('=====================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('=====================================');

  try {
    // Test health endpoint
    console.log('\n🔍 Testing Health Endpoint...');
    const health = await trpc.health.query();
    console.log('✅ Health endpoint is working');
    console.log('   Status:', health.status);
    console.log('   Message:', health.message);
    console.log('   Documents:', health.documents);
    console.log('   Environment:', health.environment);

    // Test RAG questions
    const testQuestions = [
      {
        question: "What are the rights of children under Zambian law?",
        category: "Children's Rights",
        expectedDocument: "Children's Code Act"
      },
      {
        question: "What does the Employment Code Act regulate?",
        category: "Employment Law",
        expectedDocument: "Employment Code Act"
      },
      {
        question: "What does the Companies Act govern?",
        category: "Corporate Law",
        expectedDocument: "Companies Act"
      },
      {
        question: "What is the capital of Zambia?",
        category: "Edge Case (No Relevant Documents)",
        expectedDocument: null
      }
    ];

    console.log('\n🧪 Testing RAG Questions...');
    let successCount = 0;
    let totalCount = testQuestions.length;
    
    for (const testCase of testQuestions) {
      console.log(`\n🔍 Testing: "${testCase.question}" (${testCase.category})`);
      
      try {
        const result = await trpc.askQuestion.query({
          question: testCase.question,
          topK: 3
        });

        console.log('✅ RAG response received');
        console.log('   Answer Length:', result.answer.length, 'characters');
        console.log('   Sources Found:', result.sources.length);
        console.log('   Confidence:', result.confidence);
        
        // Check if relevant documents were found
        if (testCase.expectedDocument) {
          const foundRelevantDoc = result.sources.some(source => 
            source.title.includes(testCase.expectedDocument)
          );
          
          if (foundRelevantDoc) {
            console.log('✅ Relevant document found:', testCase.expectedDocument);
            successCount++;
          } else {
            console.log('⚠️  Expected document not found:', testCase.expectedDocument);
            console.log('   Found sources:', result.sources.map(s => s.title));
          }
        } else {
          if (result.sources.length === 0) {
            console.log('✅ Correctly found no relevant documents');
            successCount++;
          } else {
            console.log('⚠️  Found documents when none expected');
            console.log('   Found sources:', result.sources.map(s => s.title));
          }
        }
        
        if (result.sources.length > 0) {
          console.log('   Top Source:', result.sources[0].title);
          console.log('   Source Document:', result.sources[0].source);
        }
        
        // Show answer preview
        const preview = result.answer.substring(0, 200);
        console.log('   Answer Preview:', preview + (result.answer.length > 200 ? '...' : ''));
        
      } catch (error) {
        console.log('❌ RAG question failed:', error.message);
      }
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n📊 RAG Test Results: ${successCount}/${totalCount} tests passed (${Math.round(successCount/totalCount*100)}%)`);

    console.log('\n🎉 RAG System Testing Complete!');
    console.log('=====================================');
    
    if (successCount === totalCount) {
      console.log('✅ The RAG system is working correctly:');
      console.log('   - Health endpoint is responding');
      console.log('   - Document retrieval is functional');
      console.log('   - AI responses are being generated');
      console.log('   - Source citations are provided');
      console.log('   - The system is grounded in Zambian legal documents');
    } else {
      console.log('⚠️  Some tests failed. Please check the logs above for details.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testRAGSystem()
    .then(() => {
      console.log('\n✅ Test completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { testRAGSystem };
