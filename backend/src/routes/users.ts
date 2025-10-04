import { Router, Request, Response } from 'express';
import { auth, permit, AuthedRequest } from '../middlewares/auth';

const router = Router();

router.get('/', auth, permit('admin'), (_req: Request, res: Response) => res.json({ items: [] }));
router.get('/me', auth, (req: AuthedRequest, res: Response) => res.json({ me: req.user }));

export default router;
