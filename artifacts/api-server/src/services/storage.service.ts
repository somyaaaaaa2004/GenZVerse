import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { ValidationError } from "../utils/errors.js";

export type UploadPurpose =
  | "avatar"
  | "banner"
  | "community"
  | "challenge"
  | "attachment";

const ALLOWED_MIME: Record<UploadPurpose, string[]> = {
  avatar: ["image/jpeg", "image/png", "image/webp"],
  banner: ["image/jpeg", "image/png", "image/webp"],
  community: ["image/jpeg", "image/png", "image/webp"],
  challenge: ["image/jpeg", "image/png", "image/webp"],
  attachment: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
  ],
};

const MAX_SIZE: Record<UploadPurpose, number> = {
  avatar: 5 * 1024 * 1024,
  banner: 10 * 1024 * 1024,
  community: 10 * 1024 * 1024,
  challenge: 10 * 1024 * 1024,
  attachment: 25 * 1024 * 1024,
};

export function validateUploadRequest(
  purpose: UploadPurpose,
  contentType: string,
  contentLength: number,
) {
  if (!ALLOWED_MIME[purpose].includes(contentType)) {
    throw new ValidationError("Unsupported file type");
  }
  if (contentLength > MAX_SIZE[purpose]) {
    throw new ValidationError("File too large");
  }
}

export async function createPresignedUploadUrl(options: {
  purpose: UploadPurpose;
  userId: string;
  contentType: string;
  contentLength: number;
}) {
  validateUploadRequest(
    options.purpose,
    options.contentType,
    options.contentLength,
  );

  const ext = options.contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "bin";
  const key = `uploads/${options.purpose}/${options.userId}/${randomUUID()}.${ext}`;

  if (!env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
    return {
      uploadUrl: null as string | null,
      publicUrl: null as string | null,
      key,
      message:
        "Cloud storage not configured. Set S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY.",
    };
  }

  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

  const client = new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: Boolean(env.S3_ENDPOINT),
  });

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: options.contentType,
    ContentLength: options.contentLength,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });
  const publicUrl = env.S3_PUBLIC_URL
    ? `${env.S3_PUBLIC_URL.replace(/\/$/, "")}/${key}`
    : `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${key}`;

  return { uploadUrl, publicUrl, key };
}

export function getPublicUrl(key: string): string {
  if (env.S3_PUBLIC_URL) {
    return `${env.S3_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }
  return `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/${key}`;
}
