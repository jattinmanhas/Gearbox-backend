import { Router } from 'express'
export const router = Router();
import { adminAuthRoute } from './admin/auth';
import { shopRoute } from './shop/shop';

router.use('/admin', adminAuthRoute);
router.use('/shop', shopRoute)