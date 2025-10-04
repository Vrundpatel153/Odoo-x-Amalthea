import { Router } from 'express';
import { auth, permit } from '../middlewares/auth';
import * as ctrl from '../controllers/flowsController';
const router = Router();
router.get('/', auth, permit('admin', 'manager'), ctrl.list);
router.post('/', auth, permit('admin', 'manager'), ctrl.create);
export default router;
