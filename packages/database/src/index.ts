import mongoose, { Document, Model, FilterQuery, UpdateQuery } from 'mongoose';
import { IBaseDocument, PaginationMeta } from '@forge/shared-types';
import { NotFoundException } from '@forge/exceptions';

// Base schema definition that all models should append to
export const BaseSchemaDefinition = {
  createdBy: { type: String, required: false },
  updatedBy: { type: String, required: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: String, required: false },
  version: { type: Number, default: 1 },
  organizationId: { type: String, required: true, index: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  audit: { type: Array, default: [] },
};

// Generic Repository Interface
export interface IRepository<T extends IBaseDocument> {
  findById(id: string, organizationId: string): Promise<T>;
  findOne(query: FilterQuery<T>, organizationId: string): Promise<T | null>;
  findMany(query: FilterQuery<T>, organizationId: string, pagination?: any): Promise<{ data: T[]; pagination: PaginationMeta }>;
  create(data: Partial<T>, actorId?: string): Promise<T>;
  update(id: string, organizationId: string, data: UpdateQuery<T>, actorId?: string): Promise<T>;
  softDelete(id: string, organizationId: string, actorId?: string): Promise<void>;
  restore(id: string, organizationId: string, actorId?: string): Promise<void>;
}

// Base Repository Implementation
export abstract class BaseRepository<T extends IBaseDocument & Document> implements IRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  private getBaseFilter(organizationId: string): FilterQuery<T> {
    return { organizationId, deletedAt: null } as FilterQuery<T>;
  }

  async findById(id: string, organizationId: string): Promise<T> {
    const doc = await this.model.findOne({ _id: id, ...this.getBaseFilter(organizationId) }).exec();
    if (!doc) {
      throw new NotFoundException(`Document with id ${id} not found in organization ${organizationId}`);
    }
    return doc;
  }

  async findOne(query: FilterQuery<T>, organizationId: string): Promise<T | null> {
    return this.model.findOne({ ...query, ...this.getBaseFilter(organizationId) }).exec();
  }

  async findMany(
    query: FilterQuery<T>,
    organizationId: string,
    pagination: { page?: number; limit?: number; sort?: any } = {}
  ): Promise<{ data: T[]; pagination: PaginationMeta }> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const finalQuery = { ...query, ...this.getBaseFilter(organizationId) };
    const [data, totalCount] = await Promise.all([
      this.model.find(finalQuery).sort(pagination.sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(finalQuery).exec(),
    ]);

    const pageCount = Math.ceil(totalCount / limit);
    const hasMore = page < pageCount;

    return {
      data,
      pagination: {
        page,
        limit,
        totalCount,
        pageCount,
        hasMore,
      },
    };
  }

  async create(data: Partial<T>, actorId?: string): Promise<T> {
    const doc = new this.model({
      ...data,
      createdBy: actorId,
      updatedBy: actorId,
      version: 1,
    });
    return doc.save();
  }

  async update(id: string, organizationId: string, data: UpdateQuery<T>, actorId?: string): Promise<T> {
    const doc = await this.findById(id, organizationId);
    
    // Auto-increment version
    const currentVersion = doc.version || 1;
    
    const updated = await this.model.findOneAndUpdate(
      { _id: id, organizationId, deletedAt: null },
      { 
        ...data, 
        updatedBy: actorId,
        $inc: { version: 1 } 
      },
      { new: true }
    ).exec();

    if (!updated) {
      throw new NotFoundException(`Failed to update. Document ${id} not found.`);
    }

    return updated;
  }

  async softDelete(id: string, organizationId: string, actorId?: string): Promise<void> {
    const updated = await this.model.findOneAndUpdate(
      { _id: id, organizationId, deletedAt: null },
      { deletedAt: new Date(), deletedBy: actorId } as any
    ).exec();

    if (!updated) {
      throw new NotFoundException(`Document ${id} not found or already deleted.`);
    }
  }

  async restore(id: string, organizationId: string, actorId?: string): Promise<void> {
    const updated = await this.model.findOneAndUpdate(
      { _id: id, organizationId, deletedAt: { $ne: null } },
      { deletedAt: null, deletedBy: null, updatedBy: actorId } as any
    ).exec();

    if (!updated) {
      throw new NotFoundException(`Document ${id} not found in deleted state.`);
    }
  }
}

export * from './WorkspaceModel';
export * from './ProjectModel';
export * from './EnvironmentModel';
export * from './ProjectMemberModel';
export * from './ActivityModel';

