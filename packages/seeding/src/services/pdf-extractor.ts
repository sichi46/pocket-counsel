import * as fs from 'fs';
import * as path from 'path';
import * as pdf from 'pdf-parse';
import { CorpusDocument } from '@pocket-counsel/shared';

export class PDFExtractor {
  async extractFromDirectory(directoryPath: string): Promise<CorpusDocument[]> {
    const documents: CorpusDocument[] = [];
    
    try {
      const files = await this.getPDFFiles(directoryPath);
      
      for (const file of files) {
        try {
          const document = await this.extractFromFile(file);
          documents.push(document);
          console.log(`Extracted: ${path.basename(file)}`);
        } catch (error) {
          console.error(`Failed to extract ${file}:`, error);
        }
      }
    } catch (error) {
      console.error('Error reading directory:', error);
      throw error;
    }
    
    return documents;
  }

  private async getPDFFiles(directoryPath: string): Promise<string[]> {
    const files: string[] = [];
    
    const items = await fs.promises.readdir(directoryPath);
    
    for (const item of items) {
      const fullPath = path.join(directoryPath, item);
      const stat = await fs.promises.stat(fullPath);
      
      if (stat.isDirectory()) {
        const subFiles = await this.getPDFFiles(fullPath);
        files.push(...subFiles);
      } else if (path.extname(item).toLowerCase() === '.pdf') {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private async extractFromFile(filePath: string): Promise<CorpusDocument> {
    const buffer = await fs.promises.readFile(filePath);
    const data = await pdf(buffer);
    
    const fileName = path.basename(filePath, '.pdf');
    const fileId = this.generateDocumentId(fileName);
    
    return {
      id: fileId,
      title: fileName,
      content: data.text,
      metadata: {
        source: filePath,
        page: data.numpages,
        date: new Date().toISOString(),
      },
    };
  }

  private generateDocumentId(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async extractFromTextFile(filePath: string): Promise<CorpusDocument> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileId = this.generateDocumentId(fileName);
    
    return {
      id: fileId,
      title: fileName,
      content,
      metadata: {
        source: filePath,
        date: new Date().toISOString(),
      },
    };
  }
} 