import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

interface CacheEntry {
  data: any;
  expiry: number;
}

export class Cache {
  private cache: Map<string, CacheEntry>;

  constructor() {
    this.cache = new Map();
  }

  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() < entry.expiry;
  }

  async get(url: string, headers?: Record<string, string>, body?: any): Promise<any> {
    const cacheKey = this.generateCacheKey(url, headers, body);
    const cachedResponse = this.cache.get(cacheKey);

    if (cachedResponse && this.isCacheValid(cachedResponse)) {
      return cachedResponse.data;
    }

    const config: AxiosRequestConfig = {
      headers: headers,
      data: body,
    };

    const response: AxiosResponse = await axios.get(url, config);
    const data = response.data;
    const cacheEntry: CacheEntry = {
      data: data,
      expiry: Date.now() + 300000, // 5 minutes cache duration
    };
    this.cache.set(cacheKey, cacheEntry);
    return data;
  }

  private generateCacheKey(url: string, headers?: Record<string, string>, body?: any): string {
    const keyParts = [url];
    if (headers) {
      keyParts.push(JSON.stringify(headers));
    }
    if (body) {
      keyParts.push(JSON.stringify(body));
    }
    return keyParts.join('|');
  }
}
