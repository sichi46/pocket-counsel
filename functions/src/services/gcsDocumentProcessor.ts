import { Storage } from '@google-cloud/storage';
import { DocumentService } from './documentService';
import { EmbeddingService } from './embeddingService';
import { VertexVectorSearchService } from './vertexVectorSearchService';
import * as admin from 'firebase-admin';

export class GCSDocumentProcessor {
  private storage: Storage;
  private documentService: DocumentService;
  private embeddingService: EmbeddingService;
  private vectorSearchService: VertexVectorSearchService;
  private projectId: string;
  private bucketName: string;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'pocket-counsel';
    this.bucketName = process.env.GCS_DOCUMENTS_BUCKET || 'pocket-counsel-rag-corpus';
    
    this.storage = new Storage({ projectId: this.projectId });
    this.documentService = new DocumentService();
    this.embeddingService = new EmbeddingService();
    this.vectorSearchService = new VertexVectorSearchService();
  }

  async processAllDocumentsFromGCS(): Promise<void> {
    try {
      console.log(`Processing documents from GCS bucket: ${this.bucketName}`);
      
      // List all PDF files in the bucket
      const [files] = await this.storage.bucket(this.bucketName).getFiles({
        prefix: '', // Get all files
      });
      
      const pdfFiles = files.filter(file => file.name.toLowerCase().endsWith('.pdf'));
      console.log(`Found ${pdfFiles.length} PDF files in GCS bucket`);
      
      if (pdfFiles.length === 0) {
        console.log('No PDF files found in GCS bucket');
        return;
      }
      
      // Process documents one at a time to conserve memory
      const batchSize = 1; // Reduced batch size for memory efficiency
      let totalChunksProcessed = 0;
      const processedFiles = [];
      const failedFiles = [];
      
      for (let i = 0; i < pdfFiles.length; i += batchSize) {
        const batch = pdfFiles.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(pdfFiles.length / batchSize)}`);
        
        for (const file of batch) {
          try {
            console.log(`Processing file: ${file.name}`);
            
            // Download file to temporary location
            const tempFilePath = `/tmp/${file.name}`;
            await file.download({ destination: tempFilePath });
            
            // Process the document using the existing document service
            console.log(`🔄 Processing document: ${file.name}`);
            const chunks = await this.documentService.processDocument(file.name);
            
            if (chunks.length > 0) {
              // Process chunks in smaller batches for embedding
              const embeddingBatchSize = 5; // Process 5 chunks at a time
              let documentsEmbeddings: any[] = [];
              
              for (let i = 0; i < chunks.length; i += embeddingBatchSize) {
                const chunkBatch = chunks.slice(i, i + embeddingBatchSize);
                console.log(`Creating embeddings for batch ${Math.floor(i/embeddingBatchSize) + 1}/${Math.ceil(chunks.length/embeddingBatchSize)} (${chunkBatch.length} chunks)...`);
                
                try {
                  const batchEmbeddings = await this.embeddingService.createEmbeddingsForChunks(chunkBatch);
                  documentsEmbeddings.push(...batchEmbeddings);
                  
                  // Clear batch variables to free memory
                  chunkBatch.length = 0;
                  
                  // Add small delay to prevent rate limiting
                  await new Promise(resolve => setTimeout(resolve, 500));
                  
                } catch (embeddingError) {
                  console.error(`Error creating embeddings for batch:`, embeddingError);
                  // Continue with next batch
                }
                
                // Force garbage collection after each batch
                if (global.gc) {
                  global.gc();
                }
              }
              
              console.log(`Created ${documentsEmbeddings.length} embeddings total`);
              
              // Add to Vector Search
              console.log(`Adding ${chunks.length} chunks to Vector Search...`);
              await this.vectorSearchService.addChunks(chunks, documentsEmbeddings);
              
              totalChunksProcessed += chunks.length;
              processedFiles.push(file.name);
              
              console.log(`✅ Successfully processed ${file.name}: ${chunks.length} chunks (Total: ${totalChunksProcessed})`);
              
              // Clear all document data from memory
              chunks.length = 0;
              documentsEmbeddings.length = 0;
              
            } else {
              console.log(`❌ No chunks created for ${file.name}`);
            }
            
            // Clean up temporary file immediately
            const fs = require('fs');
            if (fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath);
            }
            
            // Force garbage collection after each document
            if (global.gc) {
              global.gc();
            }
            
            // Add delay between documents to prevent memory buildup
            console.log(`💤 Waiting 3 seconds before next document...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            
          } catch (error) {
            console.error(`❌ Failed to process ${file.name}:`, error);
            failedFiles.push(file.name);
            
            // Still clean up on error
            const fs = require('fs');
            const tempFilePath = `/tmp/${file.name}`;
            if (fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath);
            }
          }
        }
        
        // Add delay between batches
        if (i + batchSize < pdfFiles.length) {
          console.log('Waiting 2 seconds before processing next batch...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      console.log(`\nProcessing Summary:`);
      console.log(`- Successfully processed: ${processedFiles.length} files`);
      console.log(`- Failed: ${failedFiles.length} files`);
      console.log(`- Total chunks processed: ${totalChunksProcessed}`);
      
      if (failedFiles.length > 0) {
        console.log('Failed files:', failedFiles);
      }
      
      // Store processing metadata in Firestore for tracking
      await this.storeProcessingMetadata(processedFiles, failedFiles, totalChunksProcessed, totalChunksProcessed);
      
      console.log('GCS document processing completed successfully!');
      
    } catch (error) {
      console.error('Error processing documents from GCS:', error);
      throw error;
    }
  }

  async processSpecificDocument(filename: string): Promise<void> {
    try {
      console.log(`🔄 Processing specific document: ${filename}`);
      
      const file = this.storage.bucket(this.bucketName).file(filename);
      const [exists] = await file.exists();
      
      if (!exists) {
        throw new Error(`File ${filename} not found in bucket ${this.bucketName}`);
      }
      
      // Download file to temporary location
      const tempFilePath = `/tmp/${filename}`;
      await file.download({ destination: tempFilePath });
      
      // Process the document with memory management
      const chunks = await this.documentService.processDocument(filename);
      console.log(`Created ${chunks.length} chunks from ${filename}`);
      
      if (chunks.length > 0) {
        // Process chunks in smaller batches for embedding
        const embeddingBatchSize = 3; // Smaller batches for single document processing
        let documentsEmbeddings: any[] = [];
        
        for (let i = 0; i < chunks.length; i += embeddingBatchSize) {
          const chunkBatch = chunks.slice(i, i + embeddingBatchSize);
          console.log(`Creating embeddings for batch ${Math.floor(i/embeddingBatchSize) + 1}/${Math.ceil(chunks.length/embeddingBatchSize)} (${chunkBatch.length} chunks)...`);
          
          try {
            const batchEmbeddings = await this.embeddingService.createEmbeddingsForChunks(chunkBatch);
            documentsEmbeddings.push(...batchEmbeddings);
            
            // Clear batch variables to free memory
            chunkBatch.length = 0;
            
            // Add small delay to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
            
          } catch (embeddingError) {
            console.error(`Error creating embeddings for batch:`, embeddingError);
            // Continue with next batch
          }
          
          // Force garbage collection after each batch
          if (global.gc) {
            global.gc();
          }
        }
        
        console.log(`Created ${documentsEmbeddings.length} embeddings total`);
        
        // Add to Vector Search
        console.log(`Adding ${chunks.length} chunks to Vector Search...`);
        await this.vectorSearchService.addChunks(chunks, documentsEmbeddings);
        
        // Clear all document data from memory
        chunks.length = 0;
        documentsEmbeddings.length = 0;
        
        console.log(`✅ Successfully processed ${filename}`);
      }
      
      // Clean up temporary file immediately
      const fs = require('fs');
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      // Force final garbage collection
      if (global.gc) {
        global.gc();
      }
      
      console.log(`Successfully processed ${filename}`);
      
    } catch (error) {
      console.error(`Error processing document ${filename}:`, error);
      throw error;
    }
  }

  async listDocumentsInGCS(): Promise<string[]> {
    try {
      const [files] = await this.storage.bucket(this.bucketName).getFiles();
      const pdfFiles = files
        .filter(file => file.name.toLowerCase().endsWith('.pdf'))
        .map(file => file.name);
      
      console.log(`Found ${pdfFiles.length} PDF files in GCS bucket ${this.bucketName}:`);
      pdfFiles.forEach(filename => console.log(`- ${filename}`));
      
      return pdfFiles;
    } catch (error) {
      console.error('Error listing documents in GCS:', error);
      throw error;
    }
  }

  private async storeProcessingMetadata(
    processedFiles: string[],
    failedFiles: string[],
    totalChunks: number,
    totalEmbeddings: number
  ): Promise<void> {
    try {
      const metadata = {
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        processedFiles,
        failedFiles,
        totalChunks,
        totalEmbeddings,
        source: 'gcs-batch-processing',
        bucketName: this.bucketName,
      };
      
      const db = admin.firestore();
      await db.collection('processing_history').add(metadata);
      
      console.log('Processing metadata stored in Firestore');
    } catch (error) {
      console.error('Error storing processing metadata:', error);
      // Don't throw error here as this is not critical
    }
  }

  async getProcessingHistory(): Promise<any[]> {
    try {
      const db = admin.firestore();
      const snapshot = await db.collection('processing_history')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
      
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return history;
    } catch (error) {
      console.error('Error getting processing history:', error);
      return [];
    }
  }
}
