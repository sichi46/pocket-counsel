const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuration
const API_KEY = process.env.GOOGLE_AI_API_KEY || 'your-api-key-here';
const genAI = new GoogleGenerativeAI(API_KEY);

async function testGoogleAI() {
  console.log('Testing Google AI API...');
  
  try {
    // Test Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = 'Hello! Can you tell me a short joke?';
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Google AI response:', text.substring(0, 100) + '...');
    return true;
  } catch (error) {
    console.error('❌ Google AI test failed:', error.message);
    return false;
  }
}

async function runTest() {
  console.log('🚀 Starting Google AI Test...\n');
  
  if (!API_KEY || API_KEY === 'your-api-key-here') {
    console.log('⚠️  Please set GOOGLE_AI_API_KEY environment variable');
    console.log('   You can get an API key from: https://makersuite.google.com/app/apikey');
    return;
  }
  
  await testGoogleAI();
  console.log('\n✨ Test completed!');
}

runTest().catch(console.error); 