import { Request, Response } from 'express';
import axios from 'axios';

export async function rates(req: Request, res: Response) {
  const from = String(req.query.from || 'USD');
  const to = String(req.query.to || 'INR');
  try {
    const resp = await axios.get(`https://api.exchangerate.host/convert?from=${from}&to=${to}`);
    const rate = resp.data?.info?.rate || null;
    res.json({ rate, from, to });
  } catch (e: any) {
    res.status(502).json({ message: 'Failed to fetch rates' });
  }
}
