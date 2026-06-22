import mongoose, { Schema, Document } from 'mongoose';
import { BaseSchemaDefinition } from './index';
import { IBaseDocument } from '@forge/shared-types';

export interface IProjectEnvVar {
  key: string;
  value: string;
  isSecret: boolean;
  environment: 'all' | 'development' | 'staging' | 'production';
}

export interface IProjectDocument extends IBaseDocument, Document {
  workspaceId: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  framework: string;
  sourceControl: {
    provider: string;
    repository: string;
    branch: string;
  };
  settings: {
    buildSettings: {
      buildCommand: string;
      outputDirectory: string;
      installCommand: string;
    };
    environmentVariables: IProjectEnvVar[];
  };
}

const ProjectSchema: Schema = new Schema(
  {
    workspaceId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String },
    ownerId: { type: String, required: true, index: true },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED', 'DELETED'], default: 'ACTIVE' },
    framework: { type: String, required: true, default: 'nextjs' },
    sourceControl: {
      provider: { type: String, required: true, default: 'github' },
      repository: { type: String, required: true },
      branch: { type: String, required: true, default: 'main' },
    },
    settings: {
      buildSettings: {
        buildCommand: { type: String, default: 'npm run build' },
        outputDirectory: { type: String, default: 'dist' },
        installCommand: { type: String, default: 'npm install' },
      },
      environmentVariables: [
        {
          key: { type: String, required: true },
          value: { type: String, required: true },
          isSecret: { type: Boolean, default: false },
          environment: { type: String, enum: ['all', 'development', 'staging', 'production'], default: 'all' },
        },
      ],
    },
    ...BaseSchemaDefinition,
  },
  { timestamps: true }
);

// Slug must be unique within a workspace
ProjectSchema.index({ workspaceId: 1, slug: 1 }, { unique: true });

export const ProjectModel = mongoose.model<IProjectDocument>('Project', ProjectSchema);
