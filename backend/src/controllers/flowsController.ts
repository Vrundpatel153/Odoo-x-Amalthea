import { Request, Response } from 'express';
import ApprovalFlow from '../models/ApprovalFlow';
import { AuthedRequest } from '../middlewares/auth';

export async function list(req: AuthedRequest, res: Response) {
  const items = await ApprovalFlow.find({ company: req.user?.company }).lean();
  res.json({ items });
}

export async function create(req: AuthedRequest, res: Response) {
  const body = req.body || {};
  const flow = await ApprovalFlow.create({ company: req.user?.company, name: body.name || 'Default Flow', rules: body.rules });
  res.status(201).json({ id: flow.id });
}
