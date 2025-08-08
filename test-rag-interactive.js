#!/usr/bin/env node

// Interactive RAG Testing Script
// Run with: node test-rag-interactive.js

const readline = require('readline');
const https = require('https');

const API_URL = 'https://api-6otymacelq-uc.a.run.app';
const HEALTH_URL = 'https://health-6otymacelq-uc.a.run.app';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = https.request(url, options, (res) => {
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
      req.write(data);
    }
    
    req.end();
  });
}

async function testHealth() {
  log('\n🔍 Testing Health Endpoint...', 'cyan');
  try {
    const response = await makeRequest(HEALTH_URL);
    if (response.status === 200) {
      log('✅ Health endpoint is working!', 'green');
      log(`   Status: ${response.data.status}`, 'green');
      log(`   Message: ${response.data.message}`, 'green');
      log(`   Environment: ${response.data.environment}`, 'green');
    } else {
      log(`❌ Health check failed with status: ${response.status}`, 'red');
    }
  } catch (error) {
    log(`❌ Health check error: ${error.message}`, 'red');
  }
}

async function askQuestion(question, topK = 3) {
  log(`\n🤔 Asking: "${question}"`, 'yellow');
  
  const encodedQuestion = encodeURIComponent(JSON.stringify({
    question: question,
    topK: topK
  }));
  
  const url = `${API_URL}/trpc/askQuestion?input=${encodedQuestion}`;
  
  try {
    const response = await makeRequest(url);
    
    if (response.status === 200) {
      log('✅ RAG response received!', 'green');
      
      const result = response.data.result?.data;
      if (result) {
        log(`\n📝 Answer:`, 'cyan');
        log(result.answer, 'bright');
        
        if (result.sources && result.sources.length > 0) {
          log(`\n📚 Sources (${result.sources.length}):`, 'cyan');
          result.sources.forEach((source, index) => {
            log(`   ${index + 1}. ${source.source}`, 'green');
            if (source.content) {
              log(`      Content: ${source.content.substring(0, 100)}...`, 'yellow');
            }
          });
        }
        
        if (result.confidence) {
          log(`\n🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`, 'magenta');
        }
      } else {
        log('⚠️  Response received but no data found', 'yellow');
        log(JSON.stringify(response.data, null, 2), 'yellow');
      }
    } else {
      log(`❌ Request failed with status: ${response.status}`, 'red');
      log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  }
}

function showMenu() {
  log('\n' + '='.repeat(60), 'blue');
  log('🤖 POCKET COUNSEL RAG SYSTEM - INTERACTIVE TESTER', 'bright');
  log('='.repeat(60), 'blue');
  log('\nChoose an option:', 'cyan');
  log('1. Test Health Check', 'yellow');
  log('2. Ask about Children\'s Rights', 'yellow');
  log('3. Ask about Employment Law', 'yellow');
  log('4. Ask about Companies Act', 'yellow');
  log('5. Ask about Criminal Law', 'yellow');
  log('6. Ask about Property Law', 'yellow');
  log('7. Ask your own question', 'yellow');
  log('8. Exit', 'yellow');
  log('\nEnter your choice (1-8):', 'cyan');
}

async function handleChoice(choice) {
  switch (choice.trim()) {
    case '1':
      await testHealth();
      break;
    case '2':
      await askQuestion("What are the rights of children under Zambian law?");
      break;
    case '3':
      await askQuestion("What does the Employment Code Act regulate?");
      break;
    case '4':
      await askQuestion("What does the Companies Act govern?");
      break;
    case '5':
      await askQuestion("What are the main provisions of the Penal Code?");
      break;
    case '6':
      await askQuestion("What does the Lands Act regulate?");
      break;
    case '7':
      rl.question('\nEnter your question: ', async (question) => {
        await askQuestion(question);
        showMenu();
      });
      return; // Don't show menu again, it will be shown after the question
    case '8':
      log('\n👋 Goodbye!', 'green');
      rl.close();
      return;
    default:
      log('❌ Invalid choice. Please enter a number between 1-8.', 'red');
  }
  
  // Show menu again after processing choice
  setTimeout(() => {
    showMenu();
  }, 1000);
}

async function main() {
  log('🚀 Starting Interactive RAG Tester...', 'green');
  
  // Test health first
  await testHealth();
  
  // Show menu and handle choices
  showMenu();
  
  rl.on('line', async (input) => {
    await handleChoice(input);
  });
  
  rl.on('close', () => {
    process.exit(0);
  });
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  log('\n\n👋 Goodbye!', 'green');
  rl.close();
});

main().catch(console.error);
