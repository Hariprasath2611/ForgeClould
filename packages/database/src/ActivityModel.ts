import mongoose, { Schema, Document } from 'mongoose';
import { BaseSchemaDefinition } from './index';
import { IBaseDocument } from '@forge/shared-types';

export interface IActivityDocument extends IBaseDocument, Document {
  workspaceId: string;
  projectId?: string;
  actorId: string;
  actorName: string;
  action: string;
  details: Record<string, any>;
  timestamp: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    workspaceId: { type: String, required: true, index: true },
    projectId: { type: String, index: true },
    actorId: { type: String, required: true, index: true },
    actorName: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, index: true },
    ...BaseSchemaDefinition,
  },
  { timestamps: true }
);

export const ActivityModel = mongoose.model<IActivityDocument>('Activity', ActivitySchema);
