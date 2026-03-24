/**
 * encryption.js
 * Provides AES-256-CBC symmetric encryption/decryption helpers.
 * 
 * - DETERMINISTIC mode: uses a fixed IV derived from the key for fields that 
 *   need to be queried (e.g. email). Same plaintext → same ciphertext.
 * - RANDOM mode (not used currently): uses a random IV per encryption — more 
 *   secure but cannot be queried directly.
 */
const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";

// Require a 32-byte (256-bit) hex key from environment
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

// Deterministic IV derived from the key (first 16 bytes of the key sha256 hash)
// This makes the same plaintext always produce the same ciphertext — required for DB queries.
const DETERMINISTIC_IV = crypto.createHash("sha256").update(KEY).digest().subarray(0, 16);

/**
 * Deterministically encrypt a value (same input → same output).
 * Use this for fields you need to search/query by (e.g. email).
 */
function encryptDeterministic(text) {
  if (!text) return text;
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, DETERMINISTIC_IV);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

/**
 * Decrypt a deterministically-encrypted value.
 */
function decryptDeterministic(encryptedHex) {
  if (!encryptedHex) return encryptedHex;
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, DETERMINISTIC_IV);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    // If decryption fails (e.g., plain text during migration), return as-is
    return encryptedHex;
  }
}

module.exports = { encryptDeterministic, decryptDeterministic };
