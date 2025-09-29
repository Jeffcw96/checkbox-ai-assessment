import { SNSClient } from "@aws-sdk/client-sns";

export const snsClient = new SNSClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
  // Use provided credentials if present; otherwise fall back to default provider chain (local dev profile, etc.)
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});
