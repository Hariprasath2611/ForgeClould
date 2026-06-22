import mongoose, { Schema, Document } from 'mongoose';

export interface ISessionDocument extends Document {
  userId: string; // References User._id
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  lastActivityAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

const SessionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    deviceName: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    status: { type: String, enum: ['ACTIVE', 'REVOKED', 'EXPIRED'], default: 'ACTIVE' },
    lastActivityAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL index to automatically remove expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel = mongoose.model<ISessionDocument>('Session', SessionSchema);
