const DB_NAME = 'send-particles-texture-db';
const STORE_NAME = 'send-particles-textures';
const TEXTURE_KEY = 'send-particles-user-texture';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export function saveTextureFile(file) {
    return new Promise((resolve, reject) => {
        openDB().then(db => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put(file, TEXTURE_KEY);

            tx.oncomplete = resolve;
            tx.onerror = () => {
                console.error('Transaction error');
                resolve(null);
            };
        }).catch(() => {
            console.error('Failed to open database');
            resolve(null);
        });

    });
}

export function loadTextureFile() {
    return new Promise((resolve, reject) => {
        openDB().then(db => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const request = tx.objectStore(STORE_NAME).get(TEXTURE_KEY);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => resolve(null);
        }).catch(() => resolve(null));

    });
}

