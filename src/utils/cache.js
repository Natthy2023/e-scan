// Advanced Caching System with IndexedDB and Memory Cache

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.dbName = 'eScanCache';
    this.dbVersion = 1;
    this.storeName = 'scans';
    this.maxMemoryCacheSize = 50; // Max items in memory
    this.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    this.db = null;
    this.initDB();
  }

  // Initialize IndexedDB
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for scans
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
          objectStore.createIndex('userId', 'userId', { unique: false });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Get from cache (memory first, then IndexedDB)
  async get(key) {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      const cached = this.memoryCache.get(key);
      if (Date.now() - cached.timestamp < this.maxAge) {
        return cached.data;
      } else {
        this.memoryCache.delete(key);
      }
    }

    // Check IndexedDB
    try {
      await this.ensureDB();
      const data = await this.getFromDB(key);
      if (data && Date.now() - data.timestamp < this.maxAge) {
        // Promote to memory cache
        this.setMemoryCache(key, data.data);
        return data.data;
      }
    } catch (error) {
      console.error('Cache get error:', error);
    }

    return null;
  }

  // Set cache (both memory and IndexedDB)
  async set(key, data, userId = null) {
    const cacheEntry = {
      id: key,
      data,
      timestamp: Date.now(),
      userId,
    };

    // Set in memory cache
    this.setMemoryCache(key, data);

    // Set in IndexedDB
    try {
      await this.ensureDB();
      await this.setInDB(cacheEntry);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Memory cache management
  setMemoryCache(key, data) {
    // Implement LRU eviction
    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // IndexedDB operations
  async getFromDB(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async setInDB(entry) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get all cached scans for a user
  async getUserScans(userId) {
    try {
      await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const objectStore = transaction.objectStore(this.storeName);
        const index = objectStore.index('userId');
        const request = index.getAll(userId);

        request.onsuccess = () => {
          const scans = request.result.filter(
            scan => Date.now() - scan.timestamp < this.maxAge
          );
          resolve(scans.map(s => s.data));
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Get user scans error:', error);
      return [];
    }
  }

  // Clear old cache entries
  async clearOldEntries() {
    try {
      await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const objectStore = transaction.objectStore(this.storeName);
        const index = objectStore.index('timestamp');
        const request = index.openCursor();

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            if (Date.now() - cursor.value.timestamp > this.maxAge) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Clear old entries error:', error);
    }
  }

  // Clear all cache
  async clearAll() {
    this.memoryCache.clear();
    
    try {
      await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Clear all error:', error);
    }
  }

  // Ensure DB is initialized
  async ensureDB() {
    if (!this.db) {
      await this.initDB();
    }
  }

  // Get cache statistics
  async getStats() {
    try {
      await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const objectStore = transaction.objectStore(this.storeName);
        const countRequest = objectStore.count();

        countRequest.onsuccess = () => {
          resolve({
            memorySize: this.memoryCache.size,
            dbSize: countRequest.result,
            maxMemorySize: this.maxMemoryCacheSize,
            maxAge: this.maxAge,
          });
        };
        countRequest.onerror = () => reject(countRequest.error);
      });
    } catch (error) {
      console.error('Get stats error:', error);
      return {
        memorySize: this.memoryCache.size,
        dbSize: 0,
        maxMemorySize: this.maxMemoryCacheSize,
        maxAge: this.maxAge,
      };
    }
  }
}

// Singleton instance
const cacheManager = new CacheManager();

// Clean old entries on initialization
cacheManager.clearOldEntries().catch(console.error);

export default cacheManager;

// Helper functions
export const getCachedScan = (scanId) => cacheManager.get(scanId);
export const cacheScan = (scanId, data, userId) => cacheManager.set(scanId, data, userId);
export const getUserCachedScans = (userId) => cacheManager.getUserScans(userId);
export const clearCache = () => cacheManager.clearAll();
export const getCacheStats = () => cacheManager.getStats();
