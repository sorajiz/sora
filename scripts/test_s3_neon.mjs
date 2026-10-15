import "dotenv/config";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

async function testS3() {
  const endpoint = process.env.NEON_REST_URL || "https://ep-broad-resonance-b5zw62id.apirest.c-7.us-east-2.aws.neon.tech/neondb/rest/v1";
  console.log("Testing Object Storage connection to:", endpoint);
  
  const s3 = new S3Client({
    endpoint: endpoint,
    region: "us-east-2",
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "anonymous",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "anonymous",
    }
  });

  const bucket = "assets";
  const key = "uploads/test.txt";
  console.log("Generating presigned URL for", key);
  try {
    const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 3600 });
    console.log("[view presigned URL]:", url);
    return true;
  } catch (err) {
    console.warn("Presigned URL notice:", err.message);
    return false;
  }
}

testS3().then(() => console.log("S3 Test completed"));
