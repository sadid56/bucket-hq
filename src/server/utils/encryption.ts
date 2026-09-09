import crypto from "crypto";
import { env } from "../config/env";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  return Buffer.from(env.MASTER_ENCRYPTION_KEY, "hex");
}

export function encrypt(text: string): { iv: string; encryptedData: string; authTag: string } {
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted,
    authTag,
  };
}

export function decrypt(encryptedData: string, ivHex: string, authTagHex: string): string {
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
