// utils/imageStorage.ts
const DB_NAME = 'ProductImagesDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

class ImageStorage {
    private async getDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
        });
    }

    async saveImage(imageId: string, blob: Blob): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(blob, imageId);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async getImage(imageId: string): Promise<string | null> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(imageId);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const blob = request.result;
            if (blob) {
                resolve(URL.createObjectURL(blob));
            } else {
                resolve(null);
            }
        };
        });
    }

    async deleteImage(imageId: string): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(imageId);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async clearAllImages(): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
}

export const imageStorage = new ImageStorage();