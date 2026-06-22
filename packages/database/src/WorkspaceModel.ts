import mongoose, { Schema, Document } from 'mongoose';
import { BaseSchemaDefinition } from './index';
import { IBaseDocument } from '@forge/shared-types';

export interface IWorkspaceQuotas {
  maxProjects: number;
  maxMembers: number;
  maxDeployments: number;
  maxStorageGB: number;
  maxBandwidthGB: number;
  maxCpuCores: number;
  maxMemoryMB: number;
}

export interface IWorkspaceDocument extends IBaseDocument, Document {
  name: string;
  slug: string;
  ownerId: string;
  status: 'ACTIVE' | 'SUSPENDED';
  allowedDomains: string[];
  defaultRole: string;
  quotas: IWorkspaceQuotas;
}

const WorkspaceSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    ownerId: { type: String, required: true, index: true },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
    allowedDomains: { type: [String], default: [] },
    defaultRole: { type: String, default: 'MEMBER' },
    quotas: {
      maxProjects: { type: Number, default: 5 },
      maxMembers: { type: Number, default: 10 },
      maxDeployments: { type: Number, default: 100 },
      maxStorageGB: { type: Number, default: 10 },
      maxBandwidthGB: { type: Number, default: 50 },
      maxCpuCores: { type: Number, default: 2 },
      maxMemoryMB: { type: Number, default: 2048 },
    },
    ...BaseSchemaDefinition,
  },
  { timestamps: true }
);

export const WorkspaceModel = mongoose.model<IWorkspaceDocument>('Workspace', WorkspaceSchema);
