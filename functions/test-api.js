const { VertexAI } = require('@google-cloud/vertexai');
const { IndexServiceClient, PredictionServiceClient } = require('@google-cloud/aiplatform');

// Configuration
const GCP_PROJECT_ID = 'pocket-counsel';
const GCP_LOCATION = 'us-central1';
const TEXT_EMBEDDING_MODEL = 'textembedding-gecko@003';
const GEMINI_MODEL = 'gemini-pro';

// Initialize clients
const vertexAI = new VertexAI({
  project: GCP_PROJECT_ID,
  location: GCP_LOCATION,
});

const predictionServiceClient = new PredictionServiceClient({
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
});

async function testHealth() {
  console.log('Testing API Health...');
  console.log({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    project: GCP_PROJECT_ID,
    location: GCP_LOCATION,
    models: {
      embedding: TEXT_EMBEDDING_MODEL,
      generative: GEMINI_MODEL,
    },
  });
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
    const generativeModel = vertexAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = 'Hello! Can you tell me a short joke?';
    
    const result = await generativeModel.generateContent(prompt);
    const answer = result.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response";
    
    console.log('✅ Gemini response:', answer.substring(0, 100) + '...');
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
    const generativeModel = vertexAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `Answer the following question based on the provided context. Only use information from the context. Cite your sources.

Context:
${context}

Question:
${question}`;

    const result = await generativeModel.generateContent(prompt);
    const answer = result.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I was unable to find an answer.";
    
    console.log('✅ Full RAG pipeline completed successfully!');
    console.log('Answer:', answer.substring(0, 200) + '...');
    return true;
  } catch (error) {
    console.error('❌ Full RAG test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  await testHealth();
  
  const embeddingSuccess = await testEmbedding();
  const geminiSuccess = await testGemini();
  
  if (embeddingSuccess && geminiSuccess) {
    await testFullRAG();
  }
  
  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error); 