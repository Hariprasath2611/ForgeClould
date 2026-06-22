import mongoose, { Schema, Document } from 'mongoose';
import { BaseSchemaDefinition } from './index';
import { IBaseDocument } from '@forge/shared-types';

export interface IEnvironmentDocument extends IBaseDocument, Document {
  projectId: string;
  name: 'development' | 'staging' | 'production';
  slug: string;
  status: 'PROVISIONING' | 'ACTIVE' | 'DEPLOYING' | 'ERROR';
  resources: {
    cpu: number;
    memory: number;
    storage: number;
  };
  configuration: {
    customDomains: string[];
  };
}

const EnvironmentSchema: Schema = new Schema(
  {
    projectId: { type: String, required: true, index: true },
    name: { type: String, enum: ['development', 'staging', 'production'], required: true },
    slug: { type: String, required: true },
    status: { type: String, enum: ['PROVISIONING', 'ACTIVE', 'DEPLOYING', 'ERROR'], default: 'PROVISIONING' },
    resources: {
      cpu: { type: Number, default: 0.5 },
      memory: { type: Number, default: 512 },
      storage: { type: Number, default: 1024 },
    },
    configuration: {
      customDomains: { type: [String], default: [] },
    },
    ...BaseSchemaDefinition,
  },
  { timestamps: true }
);

// Slug/name must be unique within a project
EnvironmentSchema.index({ projectId: 1, slug: 1 }, { unique: true });
EnvironmentSchema.index({ projectId: 1, name: 1 }, { unique: true });

export const EnvironmentModel = mongoose.model<IEnvironmentDocument>('Environment', EnvironmentSchema);
