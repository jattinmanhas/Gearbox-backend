import { Router } from 'express'
export const router = Router();
import { adminAuthRoute } from './admin/auth';

router.use('/admin', adminAuthRoute);