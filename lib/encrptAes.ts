import crypto from "crypto";

export async function encryptAES(data: string, encryptionKey: string, nonce: string): Promise<string> {
    if (!encryptionKey || encryptionKey.length === 0) {
        throw new Error("Encryption key is missing or invalid.");
    }
    
    // This check is the most critical part for debugging.
    try {
        // Test if the key is a valid Base64 string before proceeding.
        atob(encryptionKey);
    } catch (e) { 
        console.error("Error with atob(): The encryption key is not valid Base64.");
        console.error("The key causing the error is:", encryptionKey);
        throw e; // Re-throw the original error to halt execution.
    }
    
    if (nonce.length !== 12) {
        throw new Error("Nonce must be exactly 12 characters long");
    }

    const cryptoSubtle = globalThis.crypto?.subtle || (await import("crypto")).webcrypto?.subtle;
    if (!cryptoSubtle) {
        throw new Error("Crypto API is not available in this environment.");
    }
    
    // Note: The key should be a base64-encoded string.
    const decodedKeyBytes = Uint8Array.from(atob(encryptionKey), c => c.charCodeAt(0));

    const key = await cryptoSubtle.importKey(
        "raw",
        decodedKeyBytes,
        { name: "AES-GCM" },
        false,
        ["encrypt"]
    );
    const iv = new TextEncoder().encode(nonce);

    const encryptedData = await cryptoSubtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        new TextEncoder().encode(data)
    );

    return btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
}