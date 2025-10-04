import { Response } from 'express';
import Expense from '../models/Expense';
import { AuthedRequest } from '../middlewares/auth';

export async function override(req: AuthedRequest, res: Response) {
  const { expenseId, decision, comment } = req.body || {};
  if (!expenseId || !['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ message: 'expenseId and decision required' });
  }
  const exp = await Expense.findById(expenseId);
  if (!exp) return res.status(404).json({ message: 'Expense not found' });
  if (String(exp.company) !== String(req.user?.company)) return res.status(403).json({ message: 'Forbidden' });
  exp.status = decision === 'approve' ? 'approved' : 'rejected';
  exp.approvers.push({
    user: req.user?.sub as any,
    role: 'admin',
    status: decision === 'approve' ? 'approved' : 'rejected',
    comment,
    actedAt: new Date(),
  } as any);
  await exp.save();
  res.json({ status: exp.status });
}
