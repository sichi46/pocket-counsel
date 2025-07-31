import { VertexAIService } from './vertex-ai';
import { CorpusDocument } from '@pocket-counsel/shared';

export class CorpusIngestionService {
  private vertexAIService: VertexAIService;

  constructor(vertexAIService: VertexAIService) {
    this.vertexAIService = vertexAIService;
  }

  async ingestDocuments(documents: CorpusDocument[]): Promise<void> {
    console.log(`Starting ingestion of ${documents.length} documents`);
    
    // Process documents in batches
    const batchSize = 10;
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      await this.processBatch(batch);
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}`);
    }
  }

  private async processBatch(documents: CorpusDocument[]): Promise<void> {
    // Chunk documents into smaller pieces for better retrieval
    const chunks = this.chunkDocuments(documents);
    
    // Create or update vector index
    const indexId = await this.vertexAIService.createVectorIndex(chunks);
    
    console.log(`Created/updated vector index: ${indexId}`);
  }

  private chunkDocuments(documents: CorpusDocument[]): CorpusDocument[] {
    const chunks: CorpusDocument[] = [];
    const maxChunkSize = 1000; // characters

    for (const document of documents) {
      const documentChunks = this.chunkDocument(document, maxChunkSize);
      chunks.push(...documentChunks);
    }

    return chunks;
  }

  private chunkDocument(document: CorpusDocument, maxChunkSize: number): CorpusDocument[] {
    const chunks: CorpusDocument[] = [];
    const content = document.content;
    
    // Simple chunking by sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let currentChunk = '';
    let chunkIndex = 0;

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
        // Save current chunk
        chunks.push({
          id: `${document.id}-chunk-${chunkIndex}`,
          title: `${document.title} - Part ${chunkIndex + 1}`,
          content: currentChunk.trim(),
          metadata: {
            ...document.metadata,
            chunkIndex,
            totalChunks: Math.ceil(content.length / maxChunkSize)
          }
        });
        
        currentChunk = sentence;
        chunkIndex++;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence;
      }
    }

    // Add the last chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        id: `${document.id}-chunk-${chunkIndex}`,
        title: `${document.title} - Part ${chunkIndex + 1}`,
        content: currentChunk.trim(),
        metadata: {
          ...document.metadata,
          chunkIndex,
          totalChunks: chunkIndex + 1
        }
      });
    }

    return chunks;
  }
} 