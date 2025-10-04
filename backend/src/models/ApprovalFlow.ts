import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApprovalRule {
  type: 'sequential' | 'parallel';
  approverIds: mongoose.Types.ObjectId[];
  minApprovalPercentage?: number;
  specificApproverId?: mongoose.Types.ObjectId;
  requiredFlags?: string[];
}

export interface IApprovalFlow extends Document {
  company: mongoose.Types.ObjectId;
  name: string;
  rules: IApprovalRule;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalFlowSchema = new Schema<IApprovalFlow>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true },
    rules: {
      type: {
        type: String,
        enum: ['sequential', 'parallel'],
        default: 'sequential',
      },
      approverIds: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
      minApprovalPercentage: Number,
      specificApproverId: { type: Schema.Types.ObjectId, ref: 'User' },
      requiredFlags: [String],
    },
  },
  { timestamps: true }
);

const ApprovalFlow: Model<IApprovalFlow> =
  mongoose.models.ApprovalFlow || mongoose.model<IApprovalFlow>('ApprovalFlow', ApprovalFlowSchema);
export default ApprovalFlow;
