// src/utils/indexedDB.js
const DB_NAME = 'BibleCacheDB';
const DB_VERSION = 1;
const STORE_NAME = 'bibleData';

let db;

const openDB = () => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            reject('IndexedDB error: ' + event.target.errorCode);
        };
    });
};

export const getFromDB = async (key) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => {
            resolve(request.result ? request.result.value : null);
        };
        request.onerror = (event) => {
            reject('Error getting data from DB: ' + event.target.errorCode);
        };
    });
};

export const setInDB = async (key, value) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ key, value });
        request.onsuccess = () => {
            resolve();
        };
        request.onerror = (event) => {
            reject('Error setting data in DB: ' + event.target.errorCode);
        };
    });
};

export const clearDB = async () => {
    // Close the database connection before attempting to delete
    if (db) {
        db.close();
        db = null;
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);

        request.onsuccess = () => {
            console.log('IndexedDB deleted successfully');
            localStorage.clear();
            console.log('LocalStorage cleared successfully');

            // Attempt to unregister service workers
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (const registration of registrations) {
                        registration.unregister();
                        console.log('Service worker unregistered', registration);
                    }
                    resolve();
                }).catch((error) => {
                    console.error('Service worker unregistration failed:', error);
                    resolve(); // Resolve even if unregistration fails
                });
            } else {
                resolve();
            }
        };

        request.onerror = (event) => {
            reject('Error deleting IndexedDB: ' + event.target.errorCode);
        };

        request.onblocked = () => {
            console.warn('IndexedDB deletion blocked. Close other tabs.');
            reject('IndexedDB deletion blocked.');
        };
    });
};
