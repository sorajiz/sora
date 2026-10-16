import crypto from "crypto";
import { S3Client, PutObjectCommand, HeadObjectCommand, DeleteObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "../env";

let s3Client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!s3Client) {
    const env = getEnv();
    const accountId = env.R2_ACCOUNT_ID || "anonymous";
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

    s3Client = new S3Client({
      endpoint,
      region: "auto",
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID || "dummy",
        secretAccessKey: env.R2_SECRET_ACCESS_KEY || "dummy",
      },
    });
  }
  return s3Client;
}

export const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
]);

/**
 * Sniffs real binary image format from initial buffer bytes (§11).
 * Strictly rejects SVG, XML, HTML, and polyglots.
 */
export function sniffImageFormat(buffer: Buffer): { mime: string; ext: string } | null {
  if (buffer.length < 12) return null;

  // Reject SVG / XML / HTML
  const headerStr = buffer.slice(0, 100).toString("utf8").toLowerCase();
  if (
    headerStr.includes("<svg") ||
    headerStr.includes("<?xml") ||
    headerStr.includes("<html") ||
    headerStr.includes("<!doctype")
  ) {
    return null;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mime: "image/png", ext: "png" };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }

  // GIF: 47 49 46 38 (GIF87a or GIF89a)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return { mime: "image/gif", ext: "gif" };
  }

  // WebP: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { mime: "image/webp", ext: "webp" };
  }

  // AVIF: ....ftypavif
  if (
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70 &&
    buffer[8] === 0x61 &&
    buffer[9] === 0x76 &&
    buffer[10] === 0x69 &&
    buffer[11] === 0x66
  ) {
    return { mime: "image/avif", ext: "avif" };
  }

  return null;
}

/**
 * Generates a presigned PUT URL for direct browser upload (§11).
 */
export async function getPresignedUploadUrl(params: {
  declaredType: string;
  declaredSize: number;
}): Promise<{ uploadUrl: string; pendingKey: string }> {
  if (!ALLOWED_MIME_TYPES.has(params.declaredType)) {
    throw new Error(`Disallowed media type: ${params.declaredType}. Allowed: PNG, JPEG, WebP, GIF, AVIF.`);
  }

  // Max upload size 15 MB
  if (params.declaredSize > 15 * 1024 * 1024) {
    throw new Error("File exceeds maximum upload size (15 MB).");
  }

  const env = getEnv();
  const uuid = crypto.randomUUID();
  const pendingKey = `menu/pending/${uuid}`;

  // If R2 credentials are dummy/unconfigured in local dev, provide safe mock URL
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || env.R2_ACCESS_KEY_ID === "dummy") {
    return {
      uploadUrl: `/api/admin/menu/media/mock-upload?key=${encodeURIComponent(pendingKey)}`,
      pendingKey,
    };
  }

  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: pendingKey,
    ContentType: params.declaredType,
    ContentLength: params.declaredSize,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });
  return { uploadUrl, pendingKey };
}
