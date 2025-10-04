import { Router } from 'express';
import { auth } from '../middlewares/auth';
import * as ctrl from '../controllers/expensesController';
const router = Router();
router.get('/', auth, ctrl.list);
router.post('/', auth, ctrl.create);
export default router;
