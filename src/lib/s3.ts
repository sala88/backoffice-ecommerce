
export { client };
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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


export async function getPresignedUploadUrl({
  bucket,
  key,
  expiresIn = 900, // 15 minuti di default
  contentType = 'application/octet-stream',
}: {
  bucket: string;
  key: string;
  expiresIn?: number;
  contentType?: string;
}) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn });
}
