import { Pinecone } from '@pinecone-database/pinecone';
import { DocumentChunk } from './documentService';
import { EmbeddingResult, EmbeddingService } from './embeddingService';

export interface VectorSearchResult {
  chunk: DocumentChunk;
  embedding: EmbeddingResult;
  similarity: number;
}

export class VectorDatabase {
  private pinecone: Pinecone;
  private indexName: string;
  private embeddingService: EmbeddingService;
  private isInitialized = false;

  constructor() {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY environment variable is required');
    }
    
    this.pinecone = new Pinecone({
      apiKey: apiKey,
    });
    
    this.indexName = process.env.PINECONE_INDEX_NAME || 'pocket-counsel-rag';
    this.embeddingService = new EmbeddingService();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing Pinecone vector database...');
      
      // Check if index exists, create if it doesn't
      const indexes = await this.pinecone.listIndexes();
      const indexExists = indexes.some(index => index.name === this.indexName);
      
      if (!indexExists) {
        console.log(`Creating Pinecone index: ${this.indexName}`);
        await this.pinecone.createIndex({
          name: this.indexName,
          dimension: 768, // Match the embedding dimension
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        
        // Wait for index to be ready
        console.log('Waiting for index to be ready...');
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
      }
      
      this.isInitialized = true;
      console.log('Pinecone vector database initialized successfully');
    } catch (error) {
      console.error('Error initializing Pinecone vector database:', error);
      throw new Error('Failed to initialize Pinecone vector database');
    }
  }

  async addChunks(chunks: DocumentChunk[], embeddings: EmbeddingResult[]): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`Adding ${chunks.length} chunks to Pinecone index`);
      
      const index = this.pinecone.index(this.indexName);
      
      // Prepare vectors for Pinecone
      const vectors = chunks.map((chunk, i) => {
        const embedding = embeddings.find(e => e.chunkId === chunk.id);
        if (!embedding) {
          throw new Error(`No embedding found for chunk ${chunk.id}`);
        }
        
        return {
          id: chunk.id,
          values: embedding.embedding,
          metadata: {
            documentName: chunk.documentName,
            chunkIndex: chunk.chunkIndex,
            startPage: chunk.startPage,
            endPage: chunk.endPage,
            title: chunk.metadata.title,
            source: chunk.metadata.source,
            chunkSize: chunk.metadata.chunkSize,
            content: chunk.content.substring(0, 1000), // Store truncated content for metadata
          }
        };
      });
      
      // Upsert vectors in batches (Pinecone has limits)
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        console.log(`Upserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
        await index.upsert(batch);
      }
      
      console.log(`Successfully added ${chunks.length} chunks to Pinecone index`);
    } catch (error) {
      console.error('Error adding chunks to Pinecone:', error);
      throw new Error('Failed to add chunks to Pinecone');
    }
  }

  async search(query: string, topK: number = 5): Promise<VectorSearchResult[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const index = this.pinecone.index(this.indexName);
      
      // Use the embedding service to create proper query embedding
      console.log('Creating query embedding...');
      const queryEmbedding = await this.embeddingService.createEmbedding(query);
      
      // Search in Pinecone
      const searchResponse = await index.query({
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
      });
      
      // Convert Pinecone results to our format
      const results: VectorSearchResult[] = [];
      
      for (const match of searchResponse.matches || []) {
        if (match.metadata) {
          const chunk: DocumentChunk = {
            id: match.id,
            content: match.metadata.content as string,
            documentName: match.metadata.documentName as string,
            chunkIndex: match.metadata.chunkIndex as number,
            startPage: match.metadata.startPage as number,
            endPage: match.metadata.endPage as number,
            metadata: {
              title: match.metadata.title as string,
              source: match.metadata.source as string,
              chunkSize: match.metadata.chunkSize as number,
            }
          };
          
          const embedding: EmbeddingResult = {
            chunkId: match.id,
            embedding: [], // We don't need to store the embedding in the result
            metadata: {
              documentName: match.metadata.documentName as string,
              chunkIndex: match.metadata.chunkIndex as number,
              contentLength: (match.metadata.content as string).length,
            }
          };
          
          results.push({
            chunk,
            embedding,
            similarity: match.score || 0,
          });
        }
      }
      
      console.log(`Found ${results.length} relevant chunks from Pinecone`);
      return results;
    } catch (error) {
      console.error('Error searching Pinecone:', error);
      throw new Error('Failed to search Pinecone');
    }
  }



  async getChunk(chunkId: string): Promise<DocumentChunk | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const index = this.pinecone.index(this.indexName);
      const response = await index.fetch([chunkId]);
      
      const vector = response.vectors[chunkId];
      if (!vector || !vector.metadata) {
        return null;
      }
      
      return {
        id: chunkId,
        content: vector.metadata.content as string,
        documentName: vector.metadata.documentName as string,
        chunkIndex: vector.metadata.chunkIndex as number,
        startPage: vector.metadata.startPage as number,
        endPage: vector.metadata.endPage as number,
        metadata: {
          title: vector.metadata.title as string,
          source: vector.metadata.source as string,
          chunkSize: vector.metadata.chunkSize as number,
        }
      };
    } catch (error) {
      console.error('Error getting chunk from Pinecone:', error);
      return null;
    }
  }

  async getEmbedding(chunkId: string): Promise<EmbeddingResult | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const index = this.pinecone.index(this.indexName);
      const response = await index.fetch([chunkId]);
      
      const vector = response.vectors[chunkId];
      if (!vector || !vector.metadata) {
        return null;
      }
      
      return {
        chunkId,
        embedding: vector.values,
        metadata: {
          documentName: vector.metadata.documentName as string,
          chunkIndex: vector.metadata.chunkIndex as number,
          contentLength: (vector.metadata.content as string).length,
        }
      };
    } catch (error) {
      console.error('Error getting embedding from Pinecone:', error);
      return null;
    }
  }

  async getStats(): Promise<{ chunks: number; embeddings: number }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const index = this.pinecone.index(this.indexName);
      const stats = await index.describeIndexStats();
      
      return {
        chunks: stats.totalVectorCount || 0,
        embeddings: stats.totalVectorCount || 0,
      };
    } catch (error) {
      console.error('Error getting Pinecone stats:', error);
      return { chunks: 0, embeddings: 0 };
    }
  }

  async clear(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const index = this.pinecone.index(this.indexName);
      
      // Delete all vectors by querying with a dummy vector and deleting the results
      // This is a simple approach - in production, you might want to keep track of vector IDs
      console.log('Clearing Pinecone index...');
      
      // For now, we'll just log that clearing is not implemented
      // In production, you'd implement proper clearing logic
      console.log('Note: Pinecone index clearing not implemented. Use Pinecone console to delete vectors.');
      
      this.isInitialized = false;
    } catch (error) {
      console.error('Error clearing Pinecone index:', error);
      throw new Error('Failed to clear Pinecone index');
    }
  }
} 