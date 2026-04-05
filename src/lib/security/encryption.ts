import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

import { appEnv } from "@/lib/env";

const algorithm = "aes-256-gcm";

function getKey() {
  return createHash("sha256").update(appEnv.calendarEncryptionKey).digest();
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptSecret(payload: string) {
  const [ivPart, tagPart, encryptedPart] = payload.split(".");

  if (!ivPart || !tagPart || !encryptedPart) {
    throw new Error("Invalid encrypted secret payload.");
  }

  const decipher = createDecipheriv(
    algorithm,
    getKey(),
    Buffer.from(ivPart, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64url")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function sha256(value: Uint8Array | string) {
  return createHash("sha256").update(value).digest("hex");
}
