import { Router } from 'express';
import { login, register, logout, forgotPassword, refreshToken, resetPassword, verifyResetTokenToResetPassword} from '../../controllers/admin/authController';
import { forgotPasswordSchema, resetPasswordSchema, userLoginSchema, userRegistrationSchema } from '../../utils/validation/userValidation';
import validateRequest from '../../middlewares/validateRequest';
import authMiddleware from '../../middlewares/authMiddleware';

export const adminAuthRoute = Router();

adminAuthRoute.post('/login' , validateRequest(userLoginSchema) , login); 
adminAuthRoute.post('/register', validateRequest(userRegistrationSchema) , register);
adminAuthRoute.post('/logout', authMiddleware("ADMIN", false), logout)
adminAuthRoute.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword)
adminAuthRoute.post('/refresh-token', authMiddleware("ADMIN", true), refreshToken)
adminAuthRoute.get('/reset-password/:token', verifyResetTokenToResetPassword).post('/reset-password/:token', validateRequest(resetPasswordSchema), resetPassword)
