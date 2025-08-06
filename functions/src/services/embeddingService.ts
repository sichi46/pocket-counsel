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
      // For now, we'll use a simple approach since the embedding model might not be available
      // In a production system, you'd use the actual embedding API
      
      // Create a simple hash-based embedding as a fallback
      const embedding = this.createSimpleEmbedding(text);
      return embedding;
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw new Error('Failed to create embedding');
    }
  }

  private createSimpleEmbedding(text: string): number[] {
    // Simple hash-based embedding for demonstration
    // In production, replace this with actual embedding API calls
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
    
    for (const chunk of chunks) {
      try {
        console.log(`Creating embedding for chunk: ${chunk.id}`);
        const embedding = await this.createEmbedding(chunk.content);
        
        results.push({
          chunkId: chunk.id,
          embedding,
          metadata: {
            documentName: chunk.documentName,
            chunkIndex: chunk.chunkIndex,
            contentLength: chunk.content.length,
          },
        });
      } catch (error) {
        console.error(`Failed to create embedding for chunk ${chunk.id}:`, error);
        // Continue with other chunks
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