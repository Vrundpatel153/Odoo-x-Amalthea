import { Response } from 'express';
import Expense from '../models/Expense';
import { AuthedRequest } from '../middlewares/auth';

export async function list(req: AuthedRequest, res: Response) {
  const company = req.user?.company;
  const items = await Expense.find({ company }).sort({ createdAt: -1 }).limit(100).lean();
  res.json({ items });
}

export async function create(req: AuthedRequest, res: Response) {
  const userId = req.user?.sub;
  const company = req.user?.company;
  const { title, amount, currency = 'USD' } = req.body || {};
  if (!title || !amount) return res.status(400).json({ message: 'title and amount required' });
  const exp = await Expense.create({ company, user: userId, title, amount, currency, status: 'submitted', approvers: [] });
  res.status(201).json({ id: exp.id });
}
