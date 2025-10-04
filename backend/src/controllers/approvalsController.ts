import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Expense from '../models/Expense';
import User from '../models/User';
import { AuthedRequest } from '../middlewares/auth';

export async function pending(req: AuthedRequest, res: Response) {
  const company = req.user?.company as string;
  const userId = req.user?.sub as string;
  const role = req.user?.role;
  const match: any = { company: new mongoose.Types.ObjectId(company), status: { $in: ['submitted', 'pending'] } };
  if (role !== 'admin') {
    match.approvers = { $elemMatch: { user: new mongoose.Types.ObjectId(userId), status: 'pending' } };
  }
  const items = await Expense.find(match).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ items });
}

export async function action(req: AuthedRequest, res: Response) {
  const { expenseId, decision, comment } = req.body || {};
  if (!expenseId || !['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ message: 'expenseId and decision required' });
  }
  const exp = await Expense.findById(expenseId);
  if (!exp) return res.status(404).json({ message: 'Expense not found' });
  if (String(exp.company) !== String(req.user?.company)) return res.status(403).json({ message: 'Forbidden' });
  const user = await User.findById(req.user?.sub).lean();
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const approverEntry = {
    user: user._id,
    role: user.role,
    status: decision === 'approve' ? 'approved' : 'rejected',
    comment,
    actedAt: new Date(),
  } as any;
  exp.approvers.push(approverEntry);

  if (user.role === 'admin') {
    exp.status = decision === 'approve' ? 'approved' : 'rejected';
  } else {
    // Non-admin actions won't finalize; keep pending for admin override
    if (decision === 'approve') {
      exp.status = 'pending';
    } else {
      exp.status = 'pending';
    }
  }
  await exp.save();
  res.json({ status: exp.status });
}
