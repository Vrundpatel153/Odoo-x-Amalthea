import { Router } from 'express';
import * as ctrl from '../controllers/authController';
import { auth } from '../middlewares/auth';

const router = Router();

router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/profile', auth, ctrl.profile);

export default router;
