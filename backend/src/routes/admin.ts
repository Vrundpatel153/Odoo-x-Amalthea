import { Router } from 'express';
import { auth, permit } from '../middlewares/auth';
import * as ctrl from '../controllers/adminController';
const router = Router();
router.post('/override', auth, permit('admin'), ctrl.override);
export default router;
