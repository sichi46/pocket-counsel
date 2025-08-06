import { Storage } from '@google-cloud/storage';
import pdf from 'pdf-parse';

export interface DocumentChunk {
  id: string;
  content: string;
  documentName: string;
  chunkIndex: number;
  startPage: number;
  endPage: number;
  metadata: {
    title: string;
    source: string;
    chunkSize: number;
  };
}

export class DocumentService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    this.storage = new Storage();
    this.bucketName = 'pocket-counsel-rag-corpus';
  }

  async listDocuments(): Promise<string[]> {
    try {
      const [files] = await this.storage.bucket(this.bucketName).getFiles();
      return files.map(file => file.name);
    } catch (error) {
      console.error('Error listing documents:', error);
      throw new Error('Failed to list documents from storage');
    }
  }

  async extractTextFromPDF(fileName: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileName);
      
      const [buffer] = await file.download();
      const data = await pdf(buffer);
      
      return data.text;
    } catch (error) {
      console.error(`Error extracting text from ${fileName}:`, error);
      throw new Error(`Failed to extract text from ${fileName}`);
    }
  }

  async extractTextFromTXT(fileName: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(fileName);
      
      const [content] = await file.download();
      return content.toString('utf-8');
    } catch (error) {
      console.error(`Error extracting text from ${fileName}:`, error);
      throw new Error(`Failed to extract text from ${fileName}`);
    }
  }

  async extractTextFromDocument(fileName: string): Promise<string> {
    if (fileName.endsWith('.pdf')) {
      return this.extractTextFromPDF(fileName);
    } else if (fileName.endsWith('.txt')) {
      return this.extractTextFromTXT(fileName);
    } else {
      throw new Error(`Unsupported file type: ${fileName}`);
    }
  }

  chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      let chunk = text.slice(start, end);

      // Try to break at sentence boundaries
      if (end < text.length) {
        const lastPeriod = chunk.lastIndexOf('.');
        const lastNewline = chunk.lastIndexOf('\n');
        const breakPoint = Math.max(lastPeriod, lastNewline);
        
        if (breakPoint > start + chunkSize * 0.7) {
          chunk = text.slice(start, breakPoint + 1);
        }
      }

      chunks.push(chunk.trim());
      start = end - overlap;
    }

    return chunks.filter(chunk => chunk.length > 50); // Filter out very short chunks
  }

  async processDocument(fileName: string): Promise<DocumentChunk[]> {
    try {
      console.log(`Processing document: ${fileName}`);
      
      const text = await this.extractTextFromDocument(fileName);
      const chunks = this.chunkText(text);
      
      const documentChunks: DocumentChunk[] = chunks.map((chunk, index) => ({
        id: `${fileName}-chunk-${index}`,
        content: chunk,
        documentName: fileName,
        chunkIndex: index,
        startPage: Math.floor(index * 1000 / 500) + 1, // Approximate page calculation
        endPage: Math.floor((index + 1) * 1000 / 500),
        metadata: {
          title: fileName.replace(/\.(pdf|txt)$/i, ''),
          source: `gs://${this.bucketName}/${fileName}`,
          chunkSize: chunk.length,
        },
      }));

      console.log(`Created ${documentChunks.length} chunks for ${fileName}`);
      return documentChunks;
    } catch (error) {
      console.error(`Error processing document ${fileName}:`, error);
      throw error;
    }
  }

  async processAllDocuments(): Promise<DocumentChunk[]> {
    try {
      const documents = await this.listDocuments();
      const allChunks: DocumentChunk[] = [];

      for (const document of documents) {
        try {
          const chunks = await this.processDocument(document);
          allChunks.push(...chunks);
        } catch (error) {
          console.error(`Failed to process ${document}:`, error);
          // Continue with other documents
        }
      }

      console.log(`Total chunks created: ${allChunks.length}`);
      return allChunks;
    } catch (error) {
      console.error('Error processing all documents:', error);
      throw error;
    }
  }
} 