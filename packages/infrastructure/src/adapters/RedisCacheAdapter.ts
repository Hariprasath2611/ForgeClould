import { ICachePort, ILockPort } from '../index';
import Redis from 'ioredis';

export class RedisCacheAdapter implements ICachePort, ILockPort {
  constructor(private readonly client: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, data);
    } else {
      await this.client.set(key, data);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async invalidateByTag(tag: string): Promise<void> {
    // A simplified tag invalidation, assumes keys are stored via a set for each tag
    const keys = await this.client.smembers(`tag:${tag}`);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async acquire(lockKey: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.client.set(lockKey, 'locked', 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async release(lockKey: string): Promise<void> {
    await this.client.del(lockKey);
  }
}
