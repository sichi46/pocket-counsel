import { DocumentService, DocumentChunk } from './documentService';
import { EmbeddingService, EmbeddingResult } from './embeddingService';
import { VectorDatabase } from './vectorDatabase';

export interface ProcessingProgress {
  totalDocuments: number;
  processedDocuments: number;
  failedDocuments: string[];
  currentDocument: string;
  totalChunks: number;
  processedChunks: number;
  stage: 'extracting' | 'chunking' | 'embedding' | 'storing' | 'complete';
}

export interface ProcessingResult {
  success: boolean;
  totalDocuments: number;
  processedDocuments: number;
  failedDocuments: string[];
  totalChunks: number;
  totalEmbeddings: number;
  processingTime: number;
  errors: string[];
}

export class DocumentProcessor {
  private documentService: DocumentService;
  private embeddingService: EmbeddingService;
  private vectorDatabase: VectorDatabase;
  private progressCallback?: (progress: ProcessingProgress) => void;

  constructor() {
    this.documentService = new DocumentService();
    this.embeddingService = new EmbeddingService();
    this.vectorDatabase = new VectorDatabase();
  }

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(progress: Partial<ProcessingProgress>) {
    if (this.progressCallback) {
      this.progressCallback(progress as ProcessingProgress);
    }
  }

  async processAllDocuments(): Promise<ProcessingResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    
    try {
      console.log('Starting full document processing...');
      
      // Initialize services
      await this.vectorDatabase.initialize();
      
      // Get all documents
      const documents = await this.documentService.listDocuments();
      console.log(`Found ${documents.length} documents to process`);
      
      if (documents.length === 0) {
        return {
          success: true,
          totalDocuments: 0,
          processedDocuments: 0,
          failedDocuments: [],
          totalChunks: 0,
          totalEmbeddings: 0,
          processingTime: Date.now() - startTime,
          errors: [],
        };
      }
      
      const failedDocuments: string[] = [];
      let totalChunks = 0;
      let totalEmbeddings = 0;
      
      // Process documents in batches
      const batchSize = 3;
      
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}`);
        
        for (const document of batch) {
          try {
            this.updateProgress({
              totalDocuments: documents.length,
              processedDocuments: i + batch.indexOf(document),
              failedDocuments,
              currentDocument: document,
              totalChunks,
              processedChunks: totalChunks,
              stage: 'extracting',
            });
            
            console.log(`Processing document: ${document}`);
            
            // Extract and chunk document
            this.updateProgress({ stage: 'chunking' });
            const chunks = await this.documentService.processDocument(document);
            totalChunks += chunks.length;
            
            console.log(`Created ${chunks.length} chunks for ${document}`);
            
            // Create embeddings
            this.updateProgress({ stage: 'embedding' });
            const embeddings = await this.embeddingService.createEmbeddingsForChunks(chunks);
            totalEmbeddings += embeddings.length;
            
            console.log(`Created ${embeddings.length} embeddings for ${document}`);
            
            // Store in vector database
            this.updateProgress({ stage: 'storing' });
            await this.vectorDatabase.addChunks(chunks, embeddings);
            
            console.log(`Successfully processed ${document}`);
            
          } catch (error) {
            const errorMessage = `Failed to process ${document}: ${error}`;
            console.error(errorMessage);
            errors.push(errorMessage);
            failedDocuments.push(document);
          }
        }
        
        // Add delay between batches
        if (i + batchSize < documents.length) {
          console.log('Waiting 2 seconds before processing next batch...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      this.updateProgress({
        totalDocuments: documents.length,
        processedDocuments: documents.length - failedDocuments.length,
        failedDocuments,
        currentDocument: '',
        totalChunks,
        processedChunks: totalChunks,
        stage: 'complete',
      });
      
      const processingTime = Date.now() - startTime;
      
      console.log(`Document processing complete in ${processingTime}ms`);
      console.log(`Processed: ${documents.length - failedDocuments.length}/${documents.length} documents`);
      console.log(`Created: ${totalChunks} chunks, ${totalEmbeddings} embeddings`);
      
      if (failedDocuments.length > 0) {
        console.log('Failed documents:', failedDocuments);
      }
      
      return {
        success: failedDocuments.length === 0,
        totalDocuments: documents.length,
        processedDocuments: documents.length - failedDocuments.length,
        failedDocuments,
        totalChunks,
        totalEmbeddings,
        processingTime,
        errors,
      };
      
    } catch (error) {
      const errorMessage = `Fatal error during document processing: ${error}`;
      console.error(errorMessage);
      errors.push(errorMessage);
      
      return {
        success: false,
        totalDocuments: 0,
        processedDocuments: 0,
        failedDocuments: [],
        totalChunks: 0,
        totalEmbeddings: 0,
        processingTime: Date.now() - startTime,
        errors,
      };
    }
  }

  async processSingleDocument(documentName: string): Promise<ProcessingResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    
    try {
      console.log(`Processing single document: ${documentName}`);
      
      // Initialize services
      await this.vectorDatabase.initialize();
      
      this.updateProgress({
        totalDocuments: 1,
        processedDocuments: 0,
        failedDocuments: [],
        currentDocument: documentName,
        totalChunks: 0,
        processedChunks: 0,
        stage: 'extracting',
      });
      
      // Extract and chunk document
      this.updateProgress({ stage: 'chunking' });
      const chunks = await this.documentService.processDocument(documentName);
      
      this.updateProgress({ totalChunks: chunks.length });
      
      // Create embeddings
      this.updateProgress({ stage: 'embedding' });
      const embeddings = await this.embeddingService.createEmbeddingsForChunks(chunks);
      
      // Store in vector database
      this.updateProgress({ stage: 'storing' });
      await this.vectorDatabase.addChunks(chunks, embeddings);
      
      this.updateProgress({
        totalDocuments: 1,
        processedDocuments: 1,
        failedDocuments: [],
        currentDocument: '',
        totalChunks: chunks.length,
        processedChunks: chunks.length,
        stage: 'complete',
      });
      
      const processingTime = Date.now() - startTime;
      
      console.log(`Successfully processed ${documentName} in ${processingTime}ms`);
      console.log(`Created: ${chunks.length} chunks, ${embeddings.length} embeddings`);
      
      return {
        success: true,
        totalDocuments: 1,
        processedDocuments: 1,
        failedDocuments: [],
        totalChunks: chunks.length,
        totalEmbeddings: embeddings.length,
        processingTime,
        errors: [],
      };
      
    } catch (error) {
      const errorMessage = `Failed to process ${documentName}: ${error}`;
      console.error(errorMessage);
      errors.push(errorMessage);
      
      return {
        success: false,
        totalDocuments: 1,
        processedDocuments: 0,
        failedDocuments: [documentName],
        totalChunks: 0,
        totalEmbeddings: 0,
        processingTime: Date.now() - startTime,
        errors,
      };
    }
  }

  async getProcessingStats(): Promise<{
    documents: number;
    chunks: number;
    embeddings: number;
  }> {
    try {
      const documents = await this.documentService.listDocuments();
      const vectorStats = await this.vectorDatabase.getStats();
      
      return {
        documents: documents.length,
        chunks: vectorStats.chunks,
        embeddings: vectorStats.embeddings,
      };
    } catch (error) {
      console.error('Error getting processing stats:', error);
      return {
        documents: 0,
        chunks: 0,
        embeddings: 0,
      };
    }
  }
} 