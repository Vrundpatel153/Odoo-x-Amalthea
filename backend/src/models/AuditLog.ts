import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  company: mongoose.Types.ObjectId;
  actor?: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
