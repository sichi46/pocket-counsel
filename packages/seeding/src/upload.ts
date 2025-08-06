// packages/seeding/src/upload.ts
import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';
import * as path from 'path';

// TODO: Replace with your actual project and bucket details
const GCS_BUCKET_NAME = 'gcf-sources-787651119619-us-central1';
const GCP_PROJECT_ID = 'pocket-counsel';
const CORPUS_DIRECTORY = path.join(__dirname, '../../corpus');

const storage = new Storage({
  projectId: GCP_PROJECT_ID,
});

async function uploadFile(bucketName: string, filePath: string) {
  const bucket = storage.bucket(bucketName);
  const fileName = path.basename(filePath);
  const destination = fileName;

  console.log(`Uploading ${fileName} to gs://${bucketName}/${destination}`);

  try {
    await bucket.upload(filePath, {
      destination,
    });
    console.log(`${fileName} uploaded successfully.`);
  } catch (error) {
    console.error(`Error uploading ${fileName}:`, error);
  }
}

async function main() {
  console.log('Starting file upload...');
  const files = fs.readdirSync(CORPUS_DIRECTORY);
  const pdfFiles = files.filter((file) => file.endsWith('.pdf'));

  for (const pdfFile of pdfFiles) {
    const filePath = path.join(CORPUS_DIRECTORY, pdfFile);
    await uploadFile(GCS_BUCKET_NAME, filePath);
  }

  console.log('File upload complete.');
}

main().catch(console.error);
