import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Company from '../models/Company';
import { AuthedRequest } from '../middlewares/auth';

function signToken(payload: Record<string, any>) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '1h' });
}

export async function signup(req: Request, res: Response) {
  const { companyName, name, email, password, role = 'admin' } = req.body || {};
  if (!companyName || !name || !email || !password) {
    return res.status(400).json({ message: 'companyName, name, email, password are required' });
  }
  const company = await Company.create({ name: companyName, adminEmail: email });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ company: company._id, name, email, password: hash, role });
  const token = signToken({ sub: user.id, role: user.role, company: company.id });
  return res.status(201).json({ token });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });
  const user = await User.findOne({ email }).exec();
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken({ sub: user.id, role: user.role, company: String(user.company) });
  return res.json({ token });
}

export async function refresh(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const token = signToken(req.user);
  return res.json({ token });
}

export async function logout(_req: AuthedRequest, res: Response) {
  return res.json({ message: 'logged out' });
}

export async function profile(req: AuthedRequest, res: Response) {
  return res.json({ user: req.user || null });
}
