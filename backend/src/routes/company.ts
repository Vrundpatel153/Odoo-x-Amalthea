import { Router } from 'express';
import { auth, permit } from '../middlewares/auth';
const router = Router();
router.get('/', auth, permit('admin'), (_req, res) => res.json({ company: {} }));
export default router;
