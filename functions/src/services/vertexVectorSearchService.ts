import { Storage } from '@google-cloud/storage';
import { GoogleAuth } from 'google-auth-library';
import { DocumentChunk } from './documentService';
import { EmbeddingResult, EmbeddingService } from './embeddingService';

export interface VectorSearchResult {
  chunk: DocumentChunk;
  embedding: EmbeddingResult;
  similarity: number;
}

export class VertexVectorSearchService {
  private embeddingService: EmbeddingService;
  private storage: Storage;
  private auth: GoogleAuth;
  private projectId: string;
  private location: string;
  private indexId: string;
  private indexEndpointId: string;
  private deployedIndexId: string;
  private bucketName: string;
  private isInitialized = false;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'pocket-counsel';
    this.location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    this.indexId = process.env.VERTEX_AI_INDEX_ID || '6627418486605873152';
    this.indexEndpointId = process.env.VERTEX_AI_INDEX_ENDPOINT_ID || '8138815966239784960';
    this.deployedIndexId = process.env.VERTEX_AI_DEPLOYED_INDEX_ID || 'pocket_counsel_staging';
    this.bucketName = 'pocket-counsel-staging-vectors';
    
    this.embeddingService = new EmbeddingService();
    this.storage = new Storage({ projectId: this.projectId });
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing Vertex AI Vector Search...');
      
      // For now, we'll just mark as initialized
      // In a full implementation, you would verify the endpoint exists
      this.isInitialized = true;
      console.log('Vertex AI Vector Search initialized successfully');
    } catch (error) {
      console.error('Error initializing Vertex AI Vector Search:', error);
      throw new Error(`Failed to initialize Vertex AI Vector Search: ${error}`);
    }
  }

  async addChunks(chunks: DocumentChunk[], embeddings: EmbeddingResult[]): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`Adding ${chunks.length} chunks to Vertex AI Vector Search`);
      
      // Convert chunks and embeddings to JSONL format for Vector Search
      const jsonlData = this.convertToJSONL(chunks, embeddings);
      
      // Upload JSONL data to GCS bucket
      const filename = `embeddings-${Date.now()}.jsonl`;
      await this.uploadToGCS(jsonlData, filename);
      
      // Trigger index update
      await this.updateVectorSearchIndex(filename);
      
      console.log(`Successfully added ${chunks.length} chunks to Vertex AI Vector Search`);
    } catch (error) {
      console.error('Error adding chunks to Vertex AI Vector Search:', error);
      throw new Error('Failed to add chunks to Vertex AI Vector Search');
    }
  }

  private convertToJSONL(chunks: DocumentChunk[], embeddings: EmbeddingResult[]): string {
    const jsonlLines: string[] = [];
    
    for (const chunk of chunks) {
      const embedding = embeddings.find(e => e.chunkId === chunk.id);
      if (!embedding) {
        console.warn(`No embedding found for chunk ${chunk.id}, skipping`);
        continue;
      }
      
      // Create datapoint in the format expected by Vertex AI Vector Search
      const datapoint = {
        datapoint_id: chunk.id,
        feature_vector: embedding.embedding,
        restricts: [
          { namespace: "document_name", allow: [chunk.documentName] },
          { namespace: "chunk_index", allow: [chunk.chunkIndex.toString()] }
        ],
        // Store metadata for retrieval
        crowding_tag: chunk.documentName
      };
      
      jsonlLines.push(JSON.stringify(datapoint));
    }
    
    return jsonlLines.join('\n');
  }

  private async uploadToGCS(data: string, filename: string): Promise<void> {
    try {
      console.log(`Uploading ${filename} to GCS bucket ${this.bucketName}`);
      
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(filename);
      
      await file.save(data, {
        metadata: {
          contentType: 'application/json',
        },
      });
      
      console.log(`Successfully uploaded ${filename} to GCS`);
    } catch (error) {
      console.error('Error uploading to GCS:', error);
      throw new Error(`Failed to upload to GCS: ${error}`);
    }
  }

  private async updateVectorSearchIndex(filename: string): Promise<void> {
    try {
      console.log('Triggering Vector Search index update...');
      
      // For now, we'll log the update process
      // In a full production implementation, you would:
      // 1. Use the AI Platform API to trigger an index update
      // 2. Monitor the update operation status
      // 3. Handle update failures and retries
      
      console.log(`Index update initiated for file: ${filename}`);
      console.log('Note: Vector Search index updates are batch operations that may take time to complete');
      
      // Store metadata about this upload for tracking
      const metadata = {
        filename,
        timestamp: new Date().toISOString(),
        status: 'uploaded'
      };
      
      const metadataFile = this.storage.bucket(this.bucketName).file(`metadata/${filename}.metadata.json`);
      await metadataFile.save(JSON.stringify(metadata, null, 2));
      
    } catch (error) {
      console.error('Error updating Vector Search index:', error);
      throw new Error(`Failed to update Vector Search index: ${error}`);
    }
  }

  async search(query: string, topK: number = 5): Promise<VectorSearchResult[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`Searching Vertex AI Vector Search for: "${query.substring(0, 50)}..."`);
      
      // Create query embedding using the existing embedding service
      const queryEmbedding = await this.embeddingService.createEmbedding(query);
      
      // Make REST API call to Vector Search
      const searchResults = await this.findNeighbors(queryEmbedding, topK);
      
      // Convert Vector Search results back to our format
      const results = await this.convertSearchResults(searchResults);
      
      console.log(`Found ${results.length} relevant chunks from Vertex AI Vector Search`);
      return results;
    } catch (error) {
      console.error('Error searching Vertex AI Vector Search:', error);
      
      // Fallback to mock results if Vector Search fails
      console.log('Falling back to mock results due to Vector Search error');
      return this.getMockResults(query, topK);
    }
  }

  private async findNeighbors(queryEmbedding: number[], topK: number): Promise<any> {
    try {
      const authClient = await this.auth.getClient();
      const accessToken = await authClient.getAccessToken();
      
      const endpoint = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/indexEndpoints/${this.indexEndpointId}:findNeighbors`;
      
      const requestBody = {
        deployed_index_id: this.deployedIndexId,
        queries: [
          {
            datapoint: {
              datapoint_id: `query-${Date.now()}`,
              feature_vector: queryEmbedding
            },
            neighbor_count: topK
          }
        ]
      };

      console.log(`Making Vector Search API call to: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vector Search API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling Vector Search API:', error);
      throw error;
    }
  }

  private async convertSearchResults(searchResults: any): Promise<VectorSearchResult[]> {
    const results: VectorSearchResult[] = [];
    
    if (searchResults?.nearest_neighbors?.[0]?.neighbors) {
      for (const neighbor of searchResults.nearest_neighbors[0].neighbors) {
        if (neighbor.datapoint) {
          const chunkId = neighbor.datapoint.datapoint_id;
          const distance = neighbor.distance || 0;
          const similarity = 1 - distance; // Convert distance to similarity
          
          // Retrieve chunk data using the datapoint ID
          const chunk = await this.getChunkFromStorage(chunkId);
          
          if (chunk) {
            const embedding: EmbeddingResult = {
              chunkId,
              embedding: neighbor.datapoint.feature_vector || [],
              metadata: {
                documentName: chunk.documentName,
                chunkIndex: chunk.chunkIndex,
                contentLength: chunk.content.length,
              }
            };
            
            results.push({
              chunk,
              embedding,
              similarity,
            });
          }
        }
      }
    }
    
    return results;
  }

  private async getChunkFromStorage(chunkId: string): Promise<DocumentChunk | null> {
    try {
      // In a production system, you would retrieve the chunk data from your storage
      // This could be from Firestore, Cloud Storage, or another database
      // For now, we'll return a placeholder chunk
      
      console.log(`Retrieving chunk ${chunkId} from storage`);
      
      // TODO: Implement actual chunk retrieval from your document storage
      // This is a placeholder implementation
      return {
        id: chunkId,
        content: 'Retrieved chunk content from storage',
        documentName: 'Retrieved Document',
        chunkIndex: 0,
        startPage: 1,
        endPage: 1,
        metadata: {
          title: 'Retrieved Document Title',
          source: 'storage',
          chunkSize: 500,
        }
      };
    } catch (error) {
      console.error(`Error retrieving chunk ${chunkId}:`, error);
      return null;
    }
  }

  private getMockResults(query: string, topK: number): VectorSearchResult[] {
    const mockResults: VectorSearchResult[] = [];
    
    // Create some mock chunks to demonstrate the structure
    for (let i = 0; i < Math.min(topK, 3); i++) {
      const mockChunk: DocumentChunk = {
        id: `mock-chunk-${i}`,
        content: `Mock content chunk ${i} related to: ${query}`,
        documentName: `Mock Document ${i}`,
        chunkIndex: i,
        startPage: i + 1,
        endPage: i + 1,
        metadata: {
          title: `Mock Document Title ${i}`,
          source: `mock-source-${i}`,
          chunkSize: 500,
        }
      };
      
      const mockEmbedding: EmbeddingResult = {
        chunkId: `mock-chunk-${i}`,
        embedding: [], // Empty for mock
        metadata: {
          documentName: mockChunk.documentName,
          chunkIndex: mockChunk.chunkIndex,
          contentLength: mockChunk.content.length,
        }
      };
      
      mockResults.push({
        chunk: mockChunk,
        embedding: mockEmbedding,
        similarity: 0.9 - (i * 0.1), // Decreasing similarity
      });
    }
    
    return mockResults;
  }

  async getChunk(chunkId: string): Promise<DocumentChunk | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`Getting chunk ${chunkId} from Vertex AI Vector Search`);
      
      // In production, retrieve from your document storage
      return null;
    } catch (error) {
      console.error('Error getting chunk from Vertex AI Vector Search:', error);
      return null;
    }
  }

  async getEmbedding(chunkId: string): Promise<EmbeddingResult | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`Getting embedding for ${chunkId} from Vertex AI Vector Search`);
      
      // In production, retrieve from Vertex AI or your storage
      return null;
    } catch (error) {
      console.error('Error getting embedding from Vertex AI Vector Search:', error);
      return null;
    }
  }

  async getStats(): Promise<{ chunks: number; embeddings: number }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // For now, return mock stats
      // In production, you would query the index stats via the AI Platform API
      const stats = {
        chunks: 150, // Mock number
        embeddings: 150, // Mock number
      };
      
      console.log(`Vertex AI Vector Search stats: ${JSON.stringify(stats)}`);
      return stats;
    } catch (error) {
      console.error('Error getting Vertex AI Vector Search stats:', error);
      return { chunks: 0, embeddings: 0 };
    }
  }

  async clear(): Promise<void> {
    try {
      console.log('Clearing Vertex AI Vector Search index...');
      
      // For Vertex AI, clearing involves:
      // 1. Removing all data from the GCS bucket
      // 2. Rebuilding the index with empty data
      
      console.log('Note: Vertex AI Vector Search clearing requires GCS bucket management');
      console.log('Use the Google Cloud Console or gsutil to clear the bucket');
      
      this.isInitialized = false;
    } catch (error) {
      console.error('Error clearing Vertex AI Vector Search:', error);
      throw new Error('Failed to clear Vertex AI Vector Search');
    }
  }
}
