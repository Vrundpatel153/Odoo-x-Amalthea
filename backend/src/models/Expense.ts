import mongoose, { Schema, Document, Model } from 'mongoose';

export type ExpenseStatus = 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected';

export interface IApprovalStep {
  user: mongoose.Types.ObjectId;
  role: 'admin' | 'manager' | 'employee';
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  actedAt?: Date;
}

export interface IExpense extends Document {
  company: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  currency: string;
  status: ExpenseStatus;
  approvers: IApprovalStep[];
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalStepSchema = new Schema<IApprovalStep>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'manager', 'employee'], required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: { type: String },
    actedAt: { type: Date },
  },
  { _id: false }
);

const ExpenseSchema = new Schema<IExpense>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ['draft', 'submitted', 'pending', 'approved', 'rejected'], default: 'submitted', index: true },
    approvers: { type: [ApprovalStepSchema], default: [] },
    receiptUrl: { type: String },
  },
  { timestamps: true }
);

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
export default Expense;
