import { createClient } from '@supabase/supabase-js';

class CacheManager {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly TTL: number = 5 * 60 * 1000; // 5 minutos em milissegundos

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  invalidateAll() {
    this.cache.clear();
  }

  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached) return cached;

    const data = await fetchFn();
    this.set(key, data);
    return data;
  }
}

export const cacheManager = new CacheManager();