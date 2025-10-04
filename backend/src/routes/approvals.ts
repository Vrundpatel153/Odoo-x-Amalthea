import { Router } from 'express';
import { auth } from '../middlewares/auth';
import * as ctrl from '../controllers/approvalsController';
const router = Router();
router.get('/pending', auth, ctrl.pending);
router.post('/action', auth, ctrl.action);
export default router;
