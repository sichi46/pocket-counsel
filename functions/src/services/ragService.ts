import { GoogleGenerativeAI } from '@google/generative-ai';
import { DocumentService, DocumentChunk } from './documentService';
import { EmbeddingService, EmbeddingResult } from './embeddingService';
import { VertexVectorSearchService, VectorSearchResult } from './vertexVectorSearchService';

export interface RAGResponse {
  answer: string;
  sources: {
    documentName: string;
    title: string;
    content: string;
    similarity: number;
    chunkIndex: number;
  }[];
  metadata: {
    totalChunks: number;
    searchTime: number;
    model: string;
  };
}

export class RAGService {
  private documentService: DocumentService;
  private embeddingService: EmbeddingService;
  private vertexVectorSearchService: VertexVectorSearchService;
  private genAI: GoogleGenerativeAI;
  private model: string;
  private isInitialized = false;

  constructor() {
    this.documentService = new DocumentService();
    this.embeddingService = new EmbeddingService();
    this.vertexVectorSearchService = new VertexVectorSearchService();
    
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = 'gemini-1.5-flash';
    
    console.log('RAG Service initialized with Vertex AI Vector Search');
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing RAG service...');
      
      // Initialize vector database
      await this.vertexVectorSearchService.initialize();
      
      // For now, skip document processing on initialization to avoid memory issues
      // Documents will be processed on-demand when needed
      console.log('RAG service initialized successfully (documents will be processed on-demand)');
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing RAG service:', error);
      throw error;
    }
  }

  async processDocuments(): Promise<void> {
    try {
      console.log('Processing documents for RAG system...');
      
      // Process all documents instead of just the first 3
      const documents = await this.documentService.listDocuments();
      console.log(`Found ${documents.length} documents to process`);
      
      if (documents.length === 0) {
        console.log('No documents found to process');
        return;
      }
      
      const allChunks: DocumentChunk[] = [];
      const processedDocuments: string[] = [];
      const failedDocuments: string[] = [];
      
      // Process documents in batches to avoid memory issues
      const batchSize = 3; // Process 3 documents at a time
      
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}: ${batch.join(', ')}`);
        
        for (const document of batch) {
          try {
            console.log(`Processing document: ${document}`);
            const chunks = await this.documentService.processDocument(document);
            allChunks.push(...chunks);
            processedDocuments.push(document);
            console.log(`Completed processing ${document}: ${chunks.length} chunks`);
          } catch (error) {
            console.error(`Failed to process ${document}:`, error);
            failedDocuments.push(document);
            // Continue with other documents
          }
        }
        
        // Add a small delay between batches to prevent overwhelming the system
        if (i + batchSize < documents.length) {
          console.log('Waiting 2 seconds before processing next batch...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      console.log(`Processing complete. Processed: ${processedDocuments.length}, Failed: ${failedDocuments.length}`);
      console.log(`Created ${allChunks.length} total chunks`);
      
      if (failedDocuments.length > 0) {
        console.log('Failed documents:', failedDocuments);
      }
      
      if (allChunks.length === 0) {
        console.log('No chunks created, skipping embedding and vector database operations');
        return;
      }
      
      // Create embeddings for chunks in batches
      console.log('Creating embeddings for chunks...');
      const embeddings = await this.embeddingService.createEmbeddingsForChunks(allChunks);
      console.log(`Created ${embeddings.length} embeddings`);
      
      // Add to vector database
      console.log('Adding chunks to Vertex AI Vector Search...');
      await this.vertexVectorSearchService.addChunks(allChunks, embeddings);
      console.log('Documents processed and added to vector database');
    } catch (error) {
      console.error('Error processing documents:', error);
      throw error;
    }
  }

  async askQuestion(question: string, topK: number = 5): Promise<RAGResponse> {
    try {
      const startTime = Date.now();
      
      // Check if we have documents in the database
      const stats = await this.vertexVectorSearchService.getStats();
      
      if (stats.chunks === 0) {
        console.log('No documents in database, processing documents first...');
        await this.processDocuments();
      }
      
      // Search for relevant document chunks
      const searchResults = await this.vertexVectorSearchService.search(question, topK);
      console.log(`Found ${searchResults.length} relevant chunks`);
      
      // Prepare context from search results
      const context = this.prepareContext(searchResults);
      
      // Generate answer using AI
      const answer = await this.generateAnswer(question, context);
      
      const searchTime = Date.now() - startTime;
      
      // Prepare sources
      const sources = searchResults.map((result: any) => ({
        documentName: result.chunk.documentName,
        title: result.chunk.metadata.title,
        content: result.chunk.content.substring(0, 200) + '...',
        similarity: result.similarity,
        chunkIndex: result.chunk.chunkIndex,
      }));
      
      const finalStats = await this.vertexVectorSearchService.getStats();
      
      return {
        answer,
        sources,
        metadata: {
          totalChunks: finalStats.chunks,
          searchTime,
          model: this.model,
        },
      };
    } catch (error) {
      console.error('Error in RAG question answering:', error);
      throw error;
    }
  }

  private prepareContext(searchResults: VectorSearchResult[]): string {
    if (searchResults.length === 0) {
      return 'No relevant documents found.';
    }

    const contextParts = searchResults.map((result, index) => {
      const { chunk } = result;
      return `Document ${index + 1}: ${chunk.metadata.title}
Source: ${chunk.metadata.source}
Content: ${chunk.content}

---`;
    });

    return contextParts.join('\n');
  }

  private async generateAnswer(question: string, context: string): Promise<string> {
    try {
      const prompt = `You are a legal assistant for Zambian law. Answer the following question based on the provided legal documents. Only use information from the context provided. If the context doesn't contain relevant information, say so.

Context:
${context}

Question: ${question}

Please provide a clear, accurate answer based on the Zambian legal documents provided. Include relevant citations when possible.`;

      const model = this.genAI.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text() || 'Sorry, I was unable to generate an answer.';
    } catch (error) {
      console.error('Error generating answer:', error);
      return 'Sorry, I encountered an error while generating the answer.';
    }
  }

  async getStats(): Promise<{
    documents: number;
    chunks: number;
    embeddings: number;
  }> {
    try {
      const documents = await this.documentService.listDocuments();
      const vectorStats = await this.vertexVectorSearchService.getStats();
      
      return {
        documents: documents.length,
        chunks: vectorStats.chunks,
        embeddings: vectorStats.embeddings,
      };
    } catch (error) {
      console.error('Error getting RAG stats:', error);
      throw error;
    }
  }

  async refreshDocuments(): Promise<void> {
    try {
      console.log('Refreshing documents in RAG system...');
      
      // Clear existing data
      await this.vertexVectorSearchService.clear();
      
      // Reprocess all documents
      await this.processDocuments();
      
      console.log('Documents refreshed successfully');
    } catch (error) {
      console.error('Error refreshing documents:', error);
      throw error;
    }
  }
} 