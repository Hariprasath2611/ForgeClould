import { DomainEvent } from '@forge/shared-types';

export interface ICachePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  invalidateByTag(tag: string): Promise<void>;
}

export interface IQueuePort {
  publish(queueName: string, jobName: string, data: any, options?: any): Promise<void>;
}

export interface IEventBusPort {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventName: string, handler: (event: DomainEvent) => Promise<void>): void;
}

export interface ILockPort {
  acquire(lockKey: string, ttlSeconds: number): Promise<boolean>;
  release(lockKey: string): Promise<void>;
}

export * from './adapters/RedisCacheAdapter';
export * from './adapters/BullMQAdapter';
