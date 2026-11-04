import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppError } from '../utils/appError.js';

/**
 * Backblaze B2 configuration (S3-compatible API).
 * All credentials are read from environment variables only — never from the
 * frontend, source control, or responses.
 */
const keyId = process.env.B2_KEY_ID || '';
const applicationKey = process.env.B2_APPLICATION_KEY || '';
const bucket = process.env.B2_BUCKET_NAME || '';
const region = process.env.B2_REGION || 'eu-central-003';

export const b2Config = { keyId, applicationKey, bucket, region };

/** Verify the required B2 environment variables are configured */
export function assertB2Configured() {
  if (!keyId || !applicationKey || !bucket) {
    throw new AppError('Backblaze B2 is not configured on the server. Set B2_KEY_ID, B2_APPLICATION_KEY and B2_BUCKET_NAME in the backend environment.', 500);
  }
}

/** Build an S3 client pointed at the Backblaze B2 endpoint */
export function getB2Client() {
  assertB2Configured();
  return new S3Client({
    region,
    endpoint: `https://s3.${region}.backblazeb2.com`,
    forcePathStyle: true,
    credentials: {
      accessKeyId: keyId,
      secretAccessKey: applicationKey,
    },
  });
}

/** Upload an object to the private bucket */
export async function uploadToB2({ key, body, contentType }) {
  assertB2Configured();
  const client = getB2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return { key, bucket };
}

/** Generate a short-lived, pre-signed download URL (bucket stays private) */
export async function createSignedDownloadUrl(key) {
  assertB2Configured();
  const client = getB2Client();
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 900 });
}

/** Delete an object from the bucket */
export async function deleteFromB2(key) {
  assertB2Configured();
  const client = getB2Client();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
