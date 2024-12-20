async function cleanupLocalData() {
    try {
        // Clear all IndexedDB databases
        if (globalThis.indexedDB) {
            const databases = await indexedDB.databases();
            for (const db of databases) {
                if (db.name) {
                    indexedDB.deleteDatabase(db.name);
                }
            }
        }

        // Clear local storage
        if (globalThis.localStorage) {
            localStorage.clear();
        }

        // Clear session storage
        if (globalThis.sessionStorage) {
            sessionStorage.clear();
        }

        console.log('Successfully cleaned up all local data');
    } catch (error) {
        console.error('Cleanup error:', error);
        process.exit(1);
    }
}

cleanupLocalData();