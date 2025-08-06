import { GoogleGenerativeAI } from '@google/generative-ai';
import { DocumentChunk } from './documentService';

export interface EmbeddingResult {
  chunkId: string;
  embedding: number[];
  metadata: {
    documentName: string;
    chunkIndex: number;
    contentLength: number;
  };
}

export class EmbeddingService {
  private genAI: GoogleGenerativeAI;
  private embeddingModel: string;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.embeddingModel = 'textembedding-gecko-multilingual@001';
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      console.log(`Creating embedding for text (${text.length} characters)`);
      
      // Use the actual Google Generative AI embedding API
      const model = this.genAI.getGenerativeModel({ model: this.embeddingModel });
      
      // For text embedding, we need to use the embedding API directly
      // The current Google Generative AI SDK might not support embeddings directly
      // So we'll use a fallback approach with the REST API
      
      const embedding = await this.createEmbeddingViaAPI(text);
      return embedding;
    } catch (error) {
      console.error('Error creating embedding:', error);
      
      // Fallback to simple embedding if API fails
      console.log('Falling back to simple embedding...');
      return this.createSimpleEmbedding(text);
    }
  }

  private async createEmbeddingViaAPI(text: string): Promise<number[]> {
    try {
      // Use the Google AI REST API for embeddings
      const apiKey = process.env.GOOGLE_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.embeddingModel}:embedText?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.embedding && data.embedding.values) {
        return data.embedding.values;
      } else {
        throw new Error('Invalid response format from embedding API');
      }
    } catch (error) {
      console.error('Error calling embedding API:', error);
      throw error;
    }
  }

  private createSimpleEmbedding(text: string): number[] {
    // Simple hash-based embedding as fallback
    // This should only be used when the real API is unavailable
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(768).fill(0);
    
    words.forEach((word, index) => {
      const hash = this.hashString(word);
      const position = hash % 768;
      embedding[position] += 1;
    });
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return embedding.map(val => val / magnitude);
    }
    
    return embedding;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async createEmbeddingsForChunks(chunks: DocumentChunk[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];
    
    // Process chunks in batches to avoid rate limiting
    const batchSize = 10;
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      console.log(`Creating embeddings for batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`);
      
      const batchPromises = batch.map(async (chunk) => {
        try {
          console.log(`Creating embedding for chunk: ${chunk.id}`);
          const embedding = await this.createEmbedding(chunk.content);
          
          return {
            chunkId: chunk.id,
            embedding,
            metadata: {
              documentName: chunk.documentName,
              chunkIndex: chunk.chunkIndex,
              contentLength: chunk.content.length,
            },
          };
        } catch (error) {
          console.error(`Failed to create embedding for chunk ${chunk.id}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null) as EmbeddingResult[]);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < chunks.length) {
        console.log('Waiting 1 second before processing next batch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`Created embeddings for ${results.length} chunks`);
    return results;
  }

  async findSimilarChunks(query: string, embeddings: EmbeddingResult[], topK: number = 5): Promise<EmbeddingResult[]> {
    try {
      const queryEmbedding = await this.createEmbedding(query);
      
      // Calculate cosine similarity for all embeddings
      const similarities = embeddings.map(result => ({
        ...result,
        similarity: this.cosineSimilarity(queryEmbedding, result.embedding),
      }));
      
      // Sort by similarity and return top K results
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK)
        .map(({ similarity, ...result }) => result);
    } catch (error) {
      console.error('Error finding similar chunks:', error);
      throw new Error('Failed to find similar chunks');
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
} 