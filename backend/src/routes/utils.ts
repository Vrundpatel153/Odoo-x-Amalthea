import { Router } from 'express';
import * as ctrl from '../controllers/utilsController';
const router = Router();
router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.get('/rates', ctrl.rates);
export default router;
