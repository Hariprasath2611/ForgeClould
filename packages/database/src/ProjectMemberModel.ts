import mongoose, { Schema, Document } from 'mongoose';
import { BaseSchemaDefinition } from './index';
import { IBaseDocument } from '@forge/shared-types';

export interface IProjectMemberDocument extends IBaseDocument, Document {
  projectId: string;
  userId: string;
  roleId: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
}

const ProjectMemberSchema: Schema = new Schema(
  {
    projectId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    roleId: { type: String, enum: ['OWNER', 'ADMIN', 'DEVELOPER', 'VIEWER'], default: 'DEVELOPER' },
    status: { type: String, enum: ['PENDING', 'ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
    ...BaseSchemaDefinition,
  },
  { timestamps: true }
);

// Prevent duplicate membership in a project
ProjectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export const ProjectMemberModel = mongoose.model<IProjectMemberDocument>('ProjectMember', ProjectMemberSchema);
