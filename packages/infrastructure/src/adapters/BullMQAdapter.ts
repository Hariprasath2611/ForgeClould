import { Queue, Worker, Job } from 'bullmq';
import { IQueuePort } from '../index';

export class BullMQAdapter implements IQueuePort {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  constructor(private readonly connection: any) {} // ioredis connection options

  private getQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, new Queue(queueName, { connection: this.connection }));
    }
    return this.queues.get(queueName)!;
  }

  async publish(queueName: string, jobName: string, data: any, options?: any): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.add(jobName, data, options);
  }

  registerWorker(queueName: string, handler: (job: Job) => Promise<void>, options?: any): void {
    if (this.workers.has(queueName)) {
      throw new Error(`Worker for queue ${queueName} is already registered.`);
    }
    const worker = new Worker(queueName, handler, { connection: this.connection, ...options });
    this.workers.set(queueName, worker);
  }

  async gracefulShutdown(): Promise<void> {
    const shutdownPromises: Promise<void>[] = [];
    for (const worker of this.workers.values()) {
      shutdownPromises.push(worker.close());
    }
    for (const queue of this.queues.values()) {
      shutdownPromises.push(queue.close());
    }
    await Promise.all(shutdownPromises);
  }
}
