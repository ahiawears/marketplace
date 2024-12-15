import crypto from "crypto";

/**
 * Encrypt data using 3DES-24 encryption
 * @param text - The text to encrypt
 * @param key - The encryption key (must be 24 characters long)
 * @returns The encrypted data in base64 format
 */
export function encrypt3DES(text: string, key: string): string {
    if (key.length !== 24) {
        throw new Error("Encryption key must be 24 characters long.");
    }

    // Triple DES (3DES) in ECB mode does not require an IV
    const cipher = crypto.createCipheriv("des-ede3", Buffer.from(key), null);
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
}
