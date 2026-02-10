import { S3Client } from '@aws-sdk/client-s3';

const isMinio = process.env.STORAGE_PROVIDER === 'minio';

const client = new S3Client({
  region: process.env.STORAGE_REGION || 'us-east-1',

  ...(isMinio && {
    endpoint: process.env.STORAGE_ENDPOINT,
    forcePathStyle: true,
  }),

  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.STORAGE_SECRET_KEY!,
  },
});

export default client;
