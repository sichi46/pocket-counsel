import { CorpusIngestionService } from './services/corpus-ingestion';
import { PDFExtractor } from './services/pdf-extractor';
import { VertexAIService } from './services/vertex-ai';
import { CorpusDocument } from '@pocket-counsel/shared';

export class SeedingService {
  private pdfExtractor: PDFExtractor;
  private vertexAIService: VertexAIService;
  private corpusIngestion: CorpusIngestionService;

  constructor() {
    this.pdfExtractor = new PDFExtractor();
    this.vertexAIService = new VertexAIService();
    this.corpusIngestion = new CorpusIngestionService(this.vertexAIService);
  }

  async ingestCorpus(corpusPath: string): Promise<void> {
    console.log('Starting corpus ingestion...');
    
    // Extract documents from PDFs
    const documents = await this.pdfExtractor.extractFromDirectory(corpusPath);
    
    // Ingest into Vertex AI
    await this.corpusIngestion.ingestDocuments(documents);
    
    console.log(`Successfully ingested ${documents.length} documents`);
  }

  async queryRAG(question: string): Promise<any> {
    return await this.vertexAIService.queryRAG(question);
  }
}

// CLI interface
if (require.main === module) {
  const seedingService = new SeedingService();
  
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'ingest':
      if (args.length === 0) {
        console.error('Usage: npm run ingest <corpus-path>');
        process.exit(1);
      }
      seedingService.ingestCorpus(args[0]).catch(console.error);
      break;
      
    case 'query':
      if (args.length === 0) {
        console.error('Usage: npm run query <question>');
        process.exit(1);
      }
      seedingService.queryRAG(args[0]).then(console.log).catch(console.error);
      break;
      
    default:
      console.log('Available commands:');
      console.log('  ingest <corpus-path> - Ingest corpus from directory');
      console.log('  query <question> - Query the RAG system');
      break;
  }
} 