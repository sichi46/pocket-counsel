export interface EnvironmentConfig {
  googleApiKey: string;
  pineconeApiKey: string;
  pineconeIndexName: string;
  storageBucketName: string;
  embeddingModel: string;
  llmModel: string;
}

export function validateEnvironment(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    googleApiKey: process.env.GOOGLE_API_KEY || '',
    pineconeApiKey: process.env.PINECONE_API_KEY || '',
    pineconeIndexName: process.env.PINECONE_INDEX_NAME || 'pocket-counsel-rag',
    storageBucketName: process.env.STORAGE_BUCKET_NAME || 'pocket-counsel-rag-corpus',
    embeddingModel: process.env.EMBEDDING_MODEL || 'textembedding-gecko-multilingual@001',
    llmModel: process.env.LLM_MODEL || 'gemini-1.5-flash',
  };

  const missingVars: string[] = [];
  
  if (!config.googleApiKey) missingVars.push('GOOGLE_API_KEY');
  if (!config.pineconeApiKey) missingVars.push('PINECONE_API_KEY');
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return config;
}

export const env = validateEnvironment(); 