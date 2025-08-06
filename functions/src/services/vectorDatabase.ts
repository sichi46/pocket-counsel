import { DocumentChunk } from './documentService';
import { EmbeddingResult } from './embeddingService';

export interface VectorSearchResult {
  chunk: DocumentChunk;
  embedding: EmbeddingResult;
  similarity: number;
}

export class VectorDatabase {
  private chunks: Map<string, DocumentChunk> = new Map();
  private embeddings: Map<string, EmbeddingResult> = new Map();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing vector database...');
      
      // For now, we'll use an in-memory approach
      // In production, you'd use a proper vector database like Pinecone, Weaviate, or Google's Vector Search
      this.isInitialized = true;
      console.log('Vector database initialized');
    } catch (error) {
      console.error('Error initializing vector database:', error);
      throw new Error('Failed to initialize vector database');
    }
  }

  async addChunks(chunks: DocumentChunk[], embeddings: EmbeddingResult[]): Promise<void> {
    try {
      console.log(`Adding ${chunks.length} chunks to vector database`);
      
      // Add chunks
      for (const chunk of chunks) {
        this.chunks.set(chunk.id, chunk);
      }
      
      // Add embeddings
      for (const embedding of embeddings) {
        this.embeddings.set(embedding.chunkId, embedding);
      }
      
      console.log(`Successfully added ${chunks.length} chunks and ${embeddings.length} embeddings`);
    } catch (error) {
      console.error('Error adding chunks to vector database:', error);
      throw new Error('Failed to add chunks to vector database');
    }
  }

  async search(query: string, topK: number = 5): Promise<VectorSearchResult[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Get all embeddings
      const allEmbeddings = Array.from(this.embeddings.values());
      
      if (allEmbeddings.length === 0) {
        console.log('No embeddings found in database');
        return [];
      }

      // Create a simple search based on text similarity
      const results: VectorSearchResult[] = [];
      
      for (const embedding of allEmbeddings) {
        const chunk = this.chunks.get(embedding.chunkId);
        if (!chunk) continue;

        // Calculate simple text similarity (word overlap)
        const similarity = this.calculateTextSimilarity(query, chunk.content);
        
        results.push({
          chunk,
          embedding,
          similarity,
        });
      }

      // Sort by similarity and return top K results
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
    } catch (error) {
      console.error('Error searching vector database:', error);
      throw new Error('Failed to search vector database');
    }
  }

  private calculateTextSimilarity(query: string, content: string): number {
    const queryWords = new Set(query.toLowerCase().split(/\s+/).filter(word => word.length > 2));
    const contentWords = new Set(content.toLowerCase().split(/\s+/).filter(word => word.length > 2));
    
    if (queryWords.size === 0 || contentWords.size === 0) {
      return 0;
    }

    const intersection = new Set([...queryWords].filter(word => contentWords.has(word)));
    const union = new Set([...queryWords, ...contentWords]);
    
    return intersection.size / union.size;
  }

  async getChunk(chunkId: string): Promise<DocumentChunk | null> {
    return this.chunks.get(chunkId) || null;
  }

  async getEmbedding(chunkId: string): Promise<EmbeddingResult | null> {
    return this.embeddings.get(chunkId) || null;
  }

  async getStats(): Promise<{ chunks: number; embeddings: number }> {
    return {
      chunks: this.chunks.size,
      embeddings: this.embeddings.size,
    };
  }

  async clear(): Promise<void> {
    this.chunks.clear();
    this.embeddings.clear();
    this.isInitialized = false;
    console.log('Vector database cleared');
  }
} 