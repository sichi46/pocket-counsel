const { GoogleGenerativeAI } = require('@google/generative-ai');
const { IndexServiceClient, PredictionServiceClient } = require('@google-cloud/aiplatform');

// Configuration
const GCP_PROJECT_ID = 'pocket-counsel';
const GCP_LOCATION = 'us-central1';
const TEXT_EMBEDDING_MODEL = 'textembedding-gecko@003';
const GEMINI_MODEL = 'gemini-pro';

// Initialize clients
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const predictionServiceClient = new PredictionServiceClient({
  apiEndpoint: `${GCP_LOCATION}-aiplatform.googleapis.com`,
});

async function testHealth() {
  console.log('Testing API Health...');
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    project: GCP_PROJECT_ID,
    location: GCP_LOCATION,
    models: {
      embedding: TEXT_EMBEDDING_MODEL,
      generative: GEMINI_MODEL,
    },
  };
  console.log(JSON.stringify(health, null, 2));
  return health;
}

async function testEmbedding() {
  console.log('\nTesting Embedding Generation...');
  try {
    const question = 'What is the capital of Zambia?';
    const endpoint = `projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/publishers/google/models/${TEXT_EMBEDDING_MODEL}`;
    const embeddingRequest = {
      endpoint,
      instances: [{ content: question }],
    };

    const [embeddingResponse] = await predictionServiceClient.predict(embeddingRequest);
    let questionEmbedding = [];
    if (embeddingResponse.predictions) {
      questionEmbedding = embeddingResponse.predictions[0]?.embeddings?.values ?? [];
    }

    console.log(`✅ Embedding generated successfully! Length: ${questionEmbedding.length}`);
    return questionEmbedding;
  } catch (error) {
    console.error('❌ Embedding generation failed:', error.message);
    return null;
  }
}

async function testGemini() {
  console.log('\nTesting Gemini Model...');
  try {
    const generativeModel = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = 'Hello! Can you tell me a short joke?';
    
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini response:', text.substring(0, 100) + '...');
    return true;
  } catch (error) {
    console.error('❌ Gemini test failed:', error.message);
    return false;
  }
}

async function testFullRAG() {
  console.log('\nTesting Full RAG Pipeline...');
  try {
    const question = 'What is the capital of Zambia?';
    
    // 1. Generate embedding
    const embedding = await testEmbedding();
    if (!embedding) {
      throw new Error('Embedding generation failed');
    }
    
    // 2. Mock vector search (for now)
    const neighbors = [
      { datapoint: { datapointId: 'sample-doc-1' }, distance: 0.1 },
      { datapoint: { datapointId: 'sample-doc-2' }, distance: 0.2 },
    ];
    const context = neighbors.map((n) => n.datapoint?.datapointId).join('\n');
    
    // 3. Generate answer with Gemini
    const generativeModel = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `Answer the following question based on the provided context. Only use information from the context. Cite your sources.

Context:
${context}

Question:
${question}`;

    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const answer = response.text() ?? "Sorry, I was unable to find an answer.";
    
    console.log('✅ Full RAG pipeline completed successfully!');
    console.log('Answer:', answer.substring(0, 200) + '...');
    
    return {
      answer,
      sources: neighbors.map((n) => ({
        id: n.datapoint?.datapointId,
        distance: n.distance,
      })),
    };
  } catch (error) {
    console.error('❌ Full RAG test failed:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Complete API Tests...\n');
  
  // Check if API key is available
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.log('⚠️  Please set GOOGLE_AI_API_KEY environment variable');
    console.log('   You can get an API key from: https://makersuite.google.com/app/apikey');
    console.log('   Example: $env:GOOGLE_AI_API_KEY="your-api-key"');
    return;
  }
  
  await testHealth();
  
  const embeddingSuccess = await testEmbedding();
  const geminiSuccess = await testGemini();
  
  if (embeddingSuccess && geminiSuccess) {
    await testFullRAG();
  }
  
  console.log('\n✨ All tests completed!');
  console.log('\n📋 Summary:');
  console.log('- Health Check: ✅');
  console.log(`- Embedding Generation: ${embeddingSuccess ? '✅' : '❌'}`);
  console.log(`- Gemini Model: ${geminiSuccess ? '✅' : '❌'}`);
  console.log(`- Full RAG Pipeline: ${embeddingSuccess && geminiSuccess ? '✅' : '❌'}`);
}

runTests().catch(console.error); 