import { onRequest } from 'firebase-functions/v2/https';
import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';
import { PredictionServiceClient } from '@google-cloud/aiplatform';

// Initialize Firebase Admin
import * as admin from 'firebase-admin';
admin.initializeApp();

// Get Firestore instance
const getDatabase = () => {
  return admin.firestore();
};

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: process.env.VERTEX_AI_PROJECT_ID || '787651119619',
  location: process.env.VERTEX_AI_LOCATION || 'us-central1',
});

// CORS middleware
const cors = (req: any, res: any, next: () => void) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  next();
};

// Enhanced Query Transformation Function with Legal-Specific Keywords
const transformQuery = async (query: string, geminiModel: any): Promise<string[]> => {
  try {
    // Legal document type keywords for better sub-query generation
    const legalKeywords = {
      employment: ['Employment Code Act', 'workers', 'employee', 'employer', 'leave', 'wages', 'working hours', 'termination', 'contract'],
      business: ['Companies Act', 'business registration', 'PACRA', 'company', 'business name', 'registration', 'corporate'],
      property: ['Lands and Deeds Registry Act', 'land registration', 'property ownership', 'title deed', 'real estate'],
      criminal: ['Criminal Procedure Code Act', 'Penal Code Act', 'arrest', 'bail', 'trial', 'criminal procedure'],
      family: ['Children\'s Code', 'Matrimonial Causes Act', 'marriage', 'divorce', 'custody', 'family law'],
      financial: ['Banking and Financial Services Act', 'banking', 'financial services', 'regulations'],
      constitutional: ['Constitution of Zambia', 'constitutional rights', 'fundamental rights', 'amendment']
    };

    const transformationPrompt = `You are a legal research expert specializing in Zambian law. Transform the user's query into 3-5 specific, searchable sub-queries that would help find relevant legal information.

USER QUERY: "${query}"

Generate specific sub-queries that:
1. Use legal terminology and specific legal concepts from Zambian law
2. Include different aspects of the main query
3. Are specific enough to find relevant legal documents
4. Cover related legal areas that might contain relevant information
5. Incorporate relevant legal act names and specific legal terms

IMPORTANT: Focus on Zambian legal acts and terminology.

Format your response as a simple list, one query per line, without numbering or additional text.

EXAMPLE SUB-QUERIES:`;

    const transformationResponse = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: transformationPrompt }] }],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.3,
        topP: 0.8,
      },
    });

    const transformedQueries = transformationResponse.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse the response into individual queries
    const queries = transformedQueries
      .split('\n')
      .map((q: string) => q.trim())
      .filter((q: string) => q.length > 0 && !q.match(/^\d+\./))
      .slice(0, 5); // Limit to 5 queries

    // Always include the original query
    if (!queries.includes(query)) {
      queries.unshift(query);
    }

    console.log(`🔄 Query transformation: "${query}" → ${queries.length} sub-queries`);
    return queries;
  } catch (error) {
    console.log('⚠️ Query transformation failed, using original query only');
    return [query];
  }
};

// Modern Vertex AI Hybrid Search Function using the built-in hybrid search
const performVectorSearch = async (
  query: string, 
  embedding: number[], 
  accessToken: string,
  projectId: string,
  location: string,
  deployedIndexId: string,
  endpointId: string
): Promise<any[]> => {
  try {
    console.log('🔍 Performing Vertex AI Hybrid Search...');
    
    // Get configuration from environment variables
    const publicDomain = process.env.VERTEX_AI_PUBLIC_DOMAIN || "1416637477.us-central1-787651119619.vdb.vertexai.goog";
    
    if (!publicDomain) {
      const error = 'VERTEX_AI_PUBLIC_DOMAIN environment variable is required for public endpoint access';
      console.log(`❌ Configuration Error: ${error}`);
      throw new Error(error);
    }
    
    console.log(`✅ Public domain configured: ${publicDomain}`);
    
    // IMPORTANT: Use the public domain, NOT the internal AI Platform API
    const apiUrl = `https://${publicDomain}/v1/projects/${projectId}/locations/${location}/indexEndpoints/${endpointId}:findNeighbors`;
    
    console.log(`🔍 Using PUBLIC endpoint domain: ${publicDomain}`);
    console.log(`🔍 Full API URL: ${apiUrl}`);

    // Enhanced search request with higher neighbor count for better filtering
    const searchRequest = {
      deployedIndexId: deployedIndexId,
      queries: [{
        datapoint: {
          featureVector: embedding, // Dense embedding (768 dimensions)
        },
        neighborCount: 15, // Increased from 8 to 15 for better candidate selection
      }],
    };

    console.log(`🔍 Making hybrid search API call to: ${apiUrl}`);
    console.log(`🔍 Request payload:`, JSON.stringify(searchRequest, null, 2));
    
    const searchResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(searchRequest),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.log(`❌ Hybrid search API call failed: ${searchResponse.status} ${searchResponse.statusText}`);
      console.log(`Error details: ${errorText}`);
      console.log(`🔍 API URL used: ${apiUrl}`);
      console.log(`🔍 Public domain: ${publicDomain}`);
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error && errorJson.error.code === 501) {
          console.log(`🚨 501 ERROR DETECTED: This usually means using wrong API URL`);
          console.log(`🚨 Expected: Public domain (${publicDomain})`);
          console.log(`🚨 Check if VERTEX_AI_PUBLIC_DOMAIN is set correctly`);
          throw new Error(`501 Error: Operation not implemented. This usually means the API URL is incorrect. Expected public domain: ${publicDomain}`);
        }
      } catch (parseError) {
        // If we can't parse the error, throw the original error
      }
      
      throw new Error(`Hybrid search failed: ${searchResponse.status} ${searchResponse.statusText}. Check logs for API URL details.`);
    }

    const searchResult = await searchResponse.json() as any;
    console.log(`✅ Hybrid search API call successful`);
    console.log(`🔍 Search result structure:`, JSON.stringify(searchResult, null, 2));
    
    const neighbors = searchResult.nearestNeighbors?.[0]?.neighbors || [];
    
    // Enhanced post-retrieval filtering: Sort by relevance and take top 8
    const sortedNeighbors = neighbors.sort((a: any, b: any) => {
      const scoreA = a.distance ? (1 - a.distance) : 0;
      const scoreB = b.distance ? (1 - b.distance) : 0;
      return scoreB - scoreA; // Higher scores first
    });
    
    // Take top 8 results after filtering
    const topNeighbors = sortedNeighbors.slice(0, 8);
    
    // Transform results to match expected format
    const transformedResults = topNeighbors.map((neighbor: any) => ({
      datapoint: {
        datapointId: neighbor.datapoint?.datapointId || `result_${Date.now()}`,
        featureVector: neighbor.datapoint?.featureVector || null,
      },
      distance: neighbor.distance || 0,
      content: neighbor.datapoint?.datapointId || 'Document from Vertex AI Hybrid Search',
      searchType: 'hybrid',
      score: neighbor.distance ? (1 - neighbor.distance) : 0
    }));
    
    console.log(`✅ Hybrid search found ${transformedResults.length} top-quality results from ${neighbors.length} candidates`);
    return transformedResults;

  } catch (error: any) {
    console.log(`❌ Hybrid search failed: ${error.message}`);
    throw error;
  }
};

// Helper function to generate sparse embedding for keywords
const generateSparseEmbedding = (query: string): number[] => {
  // Extract key legal terms and create sparse embedding
  const legalTerms = [
    'business', 'company', 'registration', 'license', 'permit', 'tax', 'employment',
    'contract', 'property', 'criminal', 'civil', 'family', 'inheritance', 'corporate',
    'zambia', 'zambian', 'law', 'legal', 'regulation', 'requirement', 'procedure'
  ];
  
  const sparseEmbedding: number[] = [];
  const queryLower = query.toLowerCase();
  
  legalTerms.forEach((term, index) => {
    if (queryLower.includes(term)) {
      sparseEmbedding.push(index);
    }
  });
  
  return sparseEmbedding;
};

// Hybrid Search Function - Combine semantic and keyword search
const performHybridSearch = async (
  query: string, 
  embedding: number[], 
  accessToken: string,
  projectId: string,
  location: string,
  deployedIndexId: string,
  endpointId: string,
  geminiModel: any
): Promise<any[]> => {
  const allResults: any[] = [];
  
  try {
    // 1. Modern Vertex AI Vector Search
    console.log('🔍 Step 1: Performing modern Vertex AI Vector Search...');
    const vectorResults = await performVectorSearch(
      query,
      embedding,
      accessToken,
      projectId,
      location,
      deployedIndexId,
      endpointId
    );
    
    // Add vector search results
    allResults.push(...vectorResults);
    console.log(`✅ Vector search completed with ${vectorResults.length} results`);

    // 2. Keyword-based search using Gemini for query expansion
    console.log('🔍 Step 2: Performing keyword-based search...');
    const keywordPrompt = `Extract 5-8 key legal terms, concepts, and phrases from this query that would be useful for searching legal documents. Focus on:
- Legal terminology
- Specific legal concepts
- Related legal areas
- Common legal phrases

Query: "${query}"

Return only the key terms, one per line, without numbering or additional text.`;

    const keywordResponse = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: keywordPrompt }] }],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.2,
      },
    });

    const keywords = keywordResponse.response.candidates?.[0]?.content?.parts?.[0]?.text
      ?.split('\n')
      .map((k: string) => k.trim())
      .filter((k: string) => k.length > 0) || [];

    console.log(`🔑 Extracted keywords: ${keywords.join(', ')}`);

    // 3. Enhance results with keyword relevance
    if (keywords.length > 0) {
      allResults.forEach(result => {
        const content = result.content || result.datapoint?.datapointId || '';
        const keywordMatches = keywords.filter((keyword: string) => 
          content.toLowerCase().includes(keyword.toLowerCase())
        ).length;
        
        // Boost score for keyword matches
        if (keywordMatches > 0) {
          result.score = (result.score || 0) + (keywordMatches * 0.1);
          result.keywordMatches = keywordMatches;
        }
      });
    }

    // 4. Remove duplicates and sort by relevance
    const uniqueResults = allResults.filter((result, index, self) => 
      index === self.findIndex(r => r.datapoint?.datapointId === result.datapoint?.datapointId)
    );

    // Sort by combined score
    uniqueResults.sort((a, b) => (b.score || 0) - (a.score || 0));

    console.log(`✅ Hybrid search completed, found ${uniqueResults.length} unique results`);
    return uniqueResults.slice(0, 10); // Return top 10 results

  } catch (error: any) {
    console.log('❌ Hybrid search failed - no fallback results will be provided');
    console.log(`Error details: ${error.message || 'Unknown error'}`);
    
    // Re-throw the error to be handled by the calling function
    // This ensures only real results from Vertex AI Vector Search are returned
    throw new Error(`Vector search failed: ${error.message}. The system requires real document retrieval from Vertex AI Vector Search to function properly.`);
  }
};

// Health check function
export const health = onRequest({
  cpu: 1,
  memory: '512MiB',
  timeoutSeconds: 60,
  maxInstances: 5,
  concurrency: 40
}, (req, res) => {
  cors(req, res, () => {
    const db = getDatabase();
    res.json({
      status: 'ok',
      message: 'Pocket Counsel API is running',
      timestamp: new Date().toISOString(),
      database: process.env.FIRESTORE_DATABASE_ID || '(default)',
      environment: process.env.NODE_ENV || 'production',
      vertexAI: {
        project: process.env.VERTEX_AI_PROJECT_ID,
        location: process.env.VERTEX_AI_LOCATION,
        indexId: process.env.VERTEX_AI_INDEX_ID,
        endpointId: process.env.VERTEX_AI_INDEX_ENDPOINT_ID,
        deployedIndexId: process.env.VERTEX_AI_DEPLOYED_INDEX_ID,
      },
      geminiModel: process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash-exp',
      ragStatus: 'Enhanced RAG pipeline operational with Vertex AI Vector Search'
    });
  });
});

// Main RAG API function
export const api = onRequest({
  cpu: 2,
  memory: '4GiB',
  timeoutSeconds: 540,
  maxInstances: 10,
  concurrency: 80
}, async (req, res) => {
  cors(req, res, async () => {
    const startTime = Date.now();

    try {
      // Handle different HTTP methods
      if (req.method === 'GET') {
        res.json({
          message: 'Pocket Counsel Enhanced RAG API',
          endpoints: {
            'POST /': 'Submit a legal query for enhanced RAG processing',
            'GET /health': 'Health check endpoint'
          },
          status: 'active',
          features: 'Enhanced RAG pipeline with query transformation, hybrid search, and conversational AI'
        });
        return;
      }

      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed. Use POST for queries.' });
        return;
      }

      // Validate request body
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query parameter is required and must be a string' });
        return;
      }

      console.log(`🚀 Processing enhanced RAG query: "${query}"`);

      // Step 1: Query Transformation
      console.log('🔄 Step 1: Transforming query for better retrieval...');
      const geminiModel = vertexAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash-exp',
      });
      
      const transformedQueries = await transformQuery(query, geminiModel);
      console.log(`✅ Query transformed into ${transformedQueries.length} sub-queries`);

      // Step 2: Generate embeddings for the main query
      console.log('📊 Step 2: Generating embeddings...');
      
      // Get authentication token for API calls
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();
      
      // Define project and location variables
      const projectId = process.env.VERTEX_AI_PROJECT_ID || '787651119619';
      const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
      
      // Use the text-embedding-004 model via REST API
      const embeddingUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/text-embedding-004:predict`;
      
      const embeddingRequest = {
        instances: [{
          content: query
        }]
      };
      
      const embeddingResponse = await fetch(embeddingUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.token}`,
        },
        body: JSON.stringify(embeddingRequest),
      });
      
      if (!embeddingResponse.ok) {
        throw new Error(`Embedding generation failed: ${embeddingResponse.status} ${embeddingResponse.statusText}`);
      }
      
      const embeddingResult = await embeddingResponse.json() as any;
      
      // Handle different embedding response structures
      let embedding: number[];
      if (embeddingResult.predictions && embeddingResult.predictions[0] && embeddingResult.predictions[0].embeddings) {
        if (embeddingResult.predictions[0].embeddings.values) {
          embedding = embeddingResult.predictions[0].embeddings.values;
        } else if (embeddingResult.predictions[0].embeddings.embeddings) {
          embedding = embeddingResult.predictions[0].embeddings.embeddings;
        } else {
          throw new Error('Unexpected embedding response structure');
        }
      } else {
        throw new Error('Invalid embedding response format');
      }
      
      console.log(`✅ Embedding generated successfully (${embedding.length} dimensions)`);

       // Step 3: Enhanced Hybrid Search
       console.log('🔍 Step 3: Performing enhanced hybrid search...');
       
       // Get configuration from environment variables
       const deployedIndexId = process.env.VERTEX_AI_DEPLOYED_INDEX_ID || 'pocket_council_stream_depl_1756497505059';
       const endpointId = process.env.VERTEX_AI_INDEX_ENDPOINT_ID || '4703748127021072384';
       
       console.log(`🔧 Using deployedIndexId: ${deployedIndexId}`);
       console.log(`🔧 Using endpointId: ${endpointId}`);
       
       if (!deployedIndexId) {
         throw new Error('VERTEX_AI_DEPLOYED_INDEX_ID environment variable is required');
       }
       if (!endpointId) {
         throw new Error('VERTEX_AI_INDEX_ENDPOINT_ID environment variable is required');
       }
       
       if (!accessToken.token) {
         throw new Error('Failed to obtain access token for API calls');
       }
       
       const neighbors = await performVectorSearch(
         query,
         embedding,
         accessToken.token,
         projectId,
         location,
         deployedIndexId,
         endpointId
       );

       // Step 4: Generate enhanced conversational response
       console.log('🤖 Step 4: Generating enhanced AI response...');

      // Prepare enhanced context from retrieved documents
      let context = '';
      if (neighbors.length > 0) {
        context = neighbors.map((neighbor: any, i: number) => {
          const datapoint = neighbor.datapoint;
          const documentContent = neighbor.content || `Document retrieved from Vertex AI Vector Search (ID: ${datapoint.datapointId})`;
          const searchType = neighbor.searchType || 'unknown';
          const score = neighbor.score || (neighbor.distance ? (1 - neighbor.distance) : 0);
          
          return `Document ${i + 1}: ${datapoint.datapointId || `Result ${i + 1}`}
Content: ${documentContent}
Relevance Score: ${score.toFixed(3)}
Search Method: ${searchType}`;
        }).join('\n\n');
      } else {
        context = 'No relevant legal documents found for this query.';
      }

      // Enhanced conversational prompt for legal assistance
      const enhancedPrompt = `You are a friendly, knowledgeable legal assistant specializing in Zambian law. Your goal is to help users understand legal concepts in simple, conversational terms.

IMPORTANT INSTRUCTIONS:
1. **Be Conversational**: Write as if you're explaining to a friend, not writing a legal brief
2. **Explain Simply**: Break down complex legal concepts into easy-to-understand language
3. **Be Helpful**: Even if you can't answer the exact question, explain what you DO know and why it might be relevant
4. **Context Awareness**: If the documents don't directly answer the query, explain what the documents ARE about and how they relate
5. **Avoid Generic Responses**: Never say "I am unable to provide specific information" - instead, explain what you found and suggest next steps
6. **Legal Accuracy**: Base your answer on the provided documents, but explain concepts in accessible terms
7. **Zambian Focus**: Emphasize that this is about Zambian law specifically
8. **Legal Act References**: When possible, reference specific Zambian legal acts (e.g., "Employment Code Act No. 3 of 2019")
9. **Practical Guidance**: Provide practical next steps and who to consult for specific legal advice

USER QUESTION: ${query}

RELEVANT LEGAL DOCUMENTS:
${context}

Please provide a helpful, conversational answer that:
- Explains legal concepts in simple terms
- Uses the documents provided as your knowledge base
- If the documents don't directly answer the question, explain what they DO cover and why that might be helpful
- Suggests what type of legal professional they might consult for more specific advice
- Maintains a friendly, helpful tone throughout
- References specific Zambian legal acts when relevant

ANSWER:`;

      const geminiResponse = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.3, // Slightly higher for more conversational responses
          topP: 0.9,
          topK: 40,
        },
      });

      const answer = geminiResponse.response.candidates?.[0]?.content?.parts?.[0]?.text || 'Response generation failed';
      console.log('✅ Enhanced Gemini response generated successfully');

      // Step 5: Return comprehensive enhanced response
      const response = {
        answer,
        sources: neighbors.map((neighbor: any, i: number) => ({
          title: neighbor.datapoint.datapointId || `Document ${i + 1}`,
          content: neighbor.content || 'Document retrieved from Vertex AI Vector Search',
          relevance: neighbor.score ? neighbor.score.toFixed(3) : (neighbor.distance ? (1 - neighbor.distance).toFixed(3) : 'Unknown'),
          distance: neighbor.distance || 'Unknown',
          searchType: neighbor.searchType || 'unknown',
          keywordMatches: neighbor.keywordMatches || 0
        })),
        query,
        transformedQueries, // Include the sub-queries for transparency
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        status: 'success',
        metadata: {
          documentsRetrieved: neighbors.length,
          averageRelevance: neighbors.length > 0 ? 
            neighbors.reduce((acc: number, n: any) => acc + (n.score || 0), 0) / neighbors.length : 0,
          embeddingDimensions: embedding.length,
          modelUsed: process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash-exp',
          vectorSearchIndex: deployedIndexId,
          endpointId: endpointId,
          searchStrategy: 'Enhanced hybrid search with query transformation',
          note: 'Enhanced RAG pipeline with conversational AI and improved retrieval'
        }
      };

      res.json(response);
      console.log(`🎉 Enhanced RAG pipeline completed successfully in ${Date.now() - startTime}ms`);

    } catch (error: any) {
      console.error('❌ Error in enhanced RAG pipeline:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const processingTime = Date.now() - startTime;

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process your legal query. Please try again.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : 'Contact support for details',
        processingTime,
        status: 'error',
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Enhanced RAG Pipeline with Python ML Components
export const enhancedRAGPipeline = onRequest({
  cors: true,
  maxInstances: 10,
}, async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Parse request
    const { query, documents = [], top_k = 5, threshold = 0.3 } = req.body;
    
    if (!query) {
      res.status(400).json({
        error: 'Bad request',
        message: 'Query is required'
      });
      return;
    }
    
    console.log(`🔄 Enhanced RAG Pipeline Request: "${query.substring(0, 100)}..."`);
    
    // Call the Python Enhanced RAG Server
    const enhancedRAGResponse = await fetch('http://localhost:5000/enhanced-rag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        documents,
        top_k,
        threshold
      })
    });
    
    if (!enhancedRAGResponse.ok) {
      throw new Error(`Enhanced RAG server error: ${enhancedRAGResponse.statusText}`);
    }
    
    const enhancedRAGData = await enhancedRAGResponse.json() as any;
    
    // Generate final response using Gemini with enhanced prompt
    const geminiModel = vertexAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash-exp',
    });
    
    const finalPrompt = `You are a friendly, knowledgeable legal assistant specializing in Zambian law. 
    
USER QUESTION: ${query}

ENHANCED CONTEXT FROM DOCUMENTS:
${enhancedRAGData.enhanced_prompt}

Please provide a helpful, conversational answer that:
- Explains legal concepts in simple terms
- Uses the enhanced context provided as your knowledge base
- If the context doesn't directly answer the question, explain what it DOES cover and why that might be helpful
- Suggests what type of legal professional they might consult for more specific advice
- Maintains a friendly, helpful tone throughout
- References specific Zambian legal acts when relevant

ANSWER:`;

    const geminiResponse = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.3,
        topP: 0.9,
        topK: 40,
      },
    });

    const answer = geminiResponse.response.candidates?.[0]?.content?.parts?.[0]?.text || 'Response generation failed';
    
    // Prepare comprehensive response
    const response = {
      answer,
      query,
      enhanced_rag_data: enhancedRAGData,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
      status: 'success',
      metadata: {
        note: 'Enhanced RAG pipeline with Python ML components (re-ranking, filtering, context enhancement)',
        documentsProcessed: enhancedRAGData.documents_processed,
        metrics: enhancedRAGData.metrics,
        enhancedPromptLength: enhancedRAGData.enhanced_prompt?.length || 0
      }
    };
    
    res.json(response);
    console.log(`🎉 Enhanced RAG Pipeline with ML components completed in ${Date.now() - startTime}ms`);
    
  } catch (error: any) {
    console.error('❌ Enhanced RAG Pipeline error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const processingTime = Date.now() - startTime;
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Enhanced RAG pipeline failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? errorMessage : 'Contact support for details',
      processingTime,
      status: 'error',
      timestamp: new Date().toISOString(),
      note: 'This endpoint requires the Python Enhanced RAG Server to be running on port 5000'
    });
  }
});
