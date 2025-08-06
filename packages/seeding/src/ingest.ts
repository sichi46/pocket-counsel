import { IndexServiceClient, PredictionServiceClient } from '@google-cloud/aiplatform';
import { Storage } from '@google-cloud/storage';

const GCS_BUCKET_NAME = 'gcf-sources-787651119619-us-central1';
const GCP_PROJECT_ID = 'pocket-counsel';
const GCP_LOCATION = 'us-central1';
const TEXT_EMBEDDING_MODEL = 'textembedding-gecko@003';
const VECTOR_SEARCH_INDEX_NAME = 'pocket-counsel-index';
const VECTOR_SEARCH_DIMENSIONS = 768; // Based on the textembedding-gecko@001 model

const storage = new Storage({
  projectId: GCP_PROJECT_ID,
});

const indexServiceClient = new IndexServiceClient({
  apiEndpoint: `${GCP_LOCATION}-aiplatform.googleapis.com`,
});
const predictionServiceClient = new PredictionServiceClient({
  apiEndpoint: `${GCP_LOCATION}-aiplatform.googleapis.com`,
});

async function listFilesFromGCS(bucketName: string): Promise<string[]> {
  console.log(`Listing files from bucket: ${bucketName}`);
  try {
    const [files] = await storage.bucket(bucketName).getFiles();
    const fileNames = files.map((file) => file.name);
    console.log('Found files:', fileNames);
    return fileNames;
  } catch (error) {
    console.error('Error listing files from GCS:', error);
    return [];
  }
}

async function getFileContentFromGCS(bucketName: string, fileName: string): Promise<string> {
  console.log(`Reading file: ${fileName} from bucket: ${bucketName}`);
  try {
    const file = storage.bucket(bucketName).file(fileName);
    const contents = await file.download();
    return contents.toString();
  } catch (error) {
    console.error(`Error reading file ${fileName} from GCS:`, error);
    return '';
  }
}

function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  // TODO: Implement a more sophisticated chunking strategy, e.g., by section or paragraph.
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}

async function getEmbeddings(textChunks: string[]): Promise<number[][]> {
  console.log('Generating embeddings for', textChunks.length, 'chunks');
  const embeddings: number[][] = [];
  const endpoint = `projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/publishers/google/models/${TEXT_EMBEDDING_MODEL}`;
  const instances = textChunks.map((c) => ({ content: c }));

  const request = {
    endpoint,
    instances,
  };

  try {
    const [response] = await predictionServiceClient.predict(request as any);
    if (response.predictions) {
      for (const prediction of response.predictions) {
        // @ts-ignore
        embeddings.push(prediction.embeddings.values);
      }
    }
  } catch (error) {
    console.error('Error generating embeddings:', error);
  }
  return embeddings;
}

async function createIndexIfNotExists() {
  const parent = `projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}`;
  const request = {
    parent,
  };
  const [indexes] = await indexServiceClient.listIndexes(request);
  const indexExists = indexes.some((index) => index.displayName === VECTOR_SEARCH_INDEX_NAME);

  if (!indexExists) {
    console.log(`Creating new index: ${VECTOR_SEARCH_INDEX_NAME}`);
    const index = {
      displayName: VECTOR_SEARCH_INDEX_NAME,
      description: 'Vector search index for Pocket Counsel',
      metadata: {
        contentsDeltaUri: `gs://${GCS_BUCKET_NAME}/vs-index`,
        config: {
          dimensions: VECTOR_SEARCH_DIMENSIONS,
          approximateNeighborsCount: 150,
          distanceMeasureType: 'DOT_PRODUCT_DISTANCE',
          algorithmConfig: {
            treeAhConfig: {
              leafNodeEmbeddingCount: 500,
              leafNodesToSearchPercent: 7,
            },
          },
        },
      },
      // Add the dimensions field at the top level as well
      dimensions: VECTOR_SEARCH_DIMENSIONS,
    };
    // @ts-ignore
    const [operation] = await indexServiceClient.createIndex({ parent, index });
    await operation.promise();
    console.log('Index created.');
  } else {
    console.log(`Index ${VECTOR_SEARCH_INDEX_NAME} already exists.`);
  }
}

async function storeEmbeddings(embeddings: { id: string; embedding: number[] }[]): Promise<void> {
  console.log('Storing', embeddings.length, 'embeddings');
  const indexName = `projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/indexes/${VECTOR_SEARCH_INDEX_NAME}`;
  const datapoints = embeddings.map((e) => ({
    datapointId: e.id,
    featureVector: e.embedding,
  }));

  const request = {
    index: indexName,
    datapoints,
  };

  try {
    await indexServiceClient.upsertDatapoints(request);
    console.log('Embeddings stored successfully.');
  } catch (error) {
    console.error('Error storing embeddings:', error);
  }
}

async function main() {
  console.log('Starting data ingestion...');
  await createIndexIfNotExists();
  const fileNames = await listFilesFromGCS(GCS_BUCKET_NAME);
  let idCounter = 0;

  for (const fileName of fileNames) {
    const content = await getFileContentFromGCS(GCS_BUCKET_NAME, fileName);
    if (content) {
      const chunks = chunkText(content);
      const embeddings = await getEmbeddings(chunks);
      if (embeddings.length > 0) {
        const datapoints = embeddings.map((embedding, i) => ({
          id: `${fileName}-${idCounter + i}`,
          embedding,
        }));
        await storeEmbeddings(datapoints);
        idCounter += embeddings.length;
      }
    }
  }

  console.log('Data ingestion complete.');
}

main().catch(console.error);
