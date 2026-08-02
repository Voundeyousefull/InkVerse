import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION
});

export async function getPresignedUploadUrl(key: string, contentType = "application/pdf") {
  const bucket = process.env.S3_BUCKET!;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ACL: "private"
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return url;
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 3600) {
  const bucket = process.env.S3_BUCKET!;
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const url = await getSignedUrl(s3, command, { expiresIn });
  return url;
}

export function getPublicFileUrl(key: string) {
  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
