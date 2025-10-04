export type UserRole = 'admin' | 'manager' | 'employee';

export type ExpenseStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Company {
  id: string;
  name: string;
  country: string;
  defaultCurrency: string;
  createdAt: string;
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  managerId: string | null;
  paidBy?: string;
  remarks?: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  companyId: string;
  originalUserId?: string; // For impersonation
  createdAt: string;
}

export interface ApprovalRule {
  id: string;
  companyId: string;
  name: string;
  scope: 'all' | string; // category name or 'all'
  sequence: Array<string | 'manager'>; // userId or 'manager'
  parallel: boolean;
  requiredFlags: Record<string, boolean>; // approverId: required
  minApprovalPercentage: number;
  specificApproverId: string | null;
  escalationDays: number;
  createdAt: string;
}

export interface ExpenseItem {
  description: string;
  amount: number;
}

export interface Expense {
  id: string;
  companyId: string;
  requesterId: string;
  description: string;
  date: string;
  category: string;
  paidBy: string;
  remarks?: string;
  items?: ExpenseItem[];
  expenseCurrency: string;
  totalAmount: number;
  totalInCompanyCurrency?: number;
  exchangeRate?: number;
  exchangeRateTimestamp?: string;
  status: ExpenseStatus;
  approvalRuleId?: string;
  approverState?: {
    approvers: Array<{
      userId: string;
      status: ApprovalStatus;
      comment?: string;
      actedAt?: string;
      escalated?: boolean;
    }>;
    sequenceIndex: number;
  };
  receiptId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  expenseId: string;
  fileName: string;
  fileData: string; // base64
  ocrData?: {
    amount?: number;
    date?: string;
    merchant?: string;
    confidence?: number;
  };
  createdAt: string;
}

export interface ApprovalAction {
  id: string;
  expenseId: string;
  approverId: string;
  action: 'approved' | 'rejected';
  comment?: string;
  timestamp: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
  ttl: number; // milliseconds
}

export interface SeedData {
  companies: Company[];
  users: User[];
  expenses: Expense[];
  approvalRules: ApprovalRule[];
  receipts: Receipt[];
  approvalActions: ApprovalAction[];
  exchangeRates: ExchangeRate[];
}
