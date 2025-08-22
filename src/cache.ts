import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { CacheEntry, DocumentMetadata } from './types.js';

export class DocumentCache {
  private cacheDir: string;
  private cacheFile: string;

  constructor(cacheDir: string = '.cache') {
    this.cacheDir = cacheDir;
    this.cacheFile = path.join(cacheDir, 'document-cache.json');
    this.ensureCacheDir();
  }

  private async ensureCacheDir(): Promise<void> {
    await fs.ensureDir(this.cacheDir);
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  private async loadCache(): Promise<Record<string, CacheEntry>> {
    try {
      if (await fs.pathExists(this.cacheFile)) {
        const data = await fs.readJson(this.cacheFile);
        return data || {};
      }
    } catch (error) {
      console.warn('Failed to load cache:', error);
    }
    return {};
  }

  private async saveCache(cache: Record<string, CacheEntry>): Promise<void> {
    try {
      await fs.writeJson(this.cacheFile, cache, { spaces: 2 });
    } catch (error) {
      console.warn('Failed to save cache:', error);
    }
  }

  async get(filePath: string): Promise<DocumentMetadata | null> {
    const cache = await this.loadCache();
    const entry = cache[filePath];
    
    if (!entry) {
      return null;
    }

    // Check if file still exists and hash matches
    try {
      if (!(await fs.pathExists(filePath))) {
        return null;
      }

      const currentHash = await this.calculateFileHash(filePath);
      if (entry.fileHash !== currentHash) {
        // File has changed, remove from cache
        delete cache[filePath];
        await this.saveCache(cache);
        return null;
      }

      return entry.metadata;
    } catch (error) {
      console.warn('Error checking file hash:', error);
      return null;
    }
  }

  async set(filePath: string, metadata: DocumentMetadata): Promise<void> {
    try {
      const fileHash = await this.calculateFileHash(filePath);
      const cache = await this.loadCache();
      
      cache[filePath] = {
        filePath,
        metadata,
        timestamp: Date.now(),
        fileHash
      };

      await this.saveCache(cache);
    } catch (error) {
      console.warn('Failed to save to cache:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await fs.remove(this.cacheFile);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  async list(): Promise<string[]> {
    const cache = await this.loadCache();
    return Object.keys(cache);
  }
} 