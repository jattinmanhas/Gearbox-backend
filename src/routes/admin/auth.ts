import { Router } from 'express';
import { login, register, logout, forgotPassword, refreshToken, resetPassword, verifyResetTokenToResetPassword, getUserDetails} from '../../controllers/admin/authController';
import { forgotPasswordSchema, resetPasswordSchema, userLoginSchema, userRegistrationSchema } from '../../utils/validation/userValidation';
import validateRequest from '../../middlewares/validateRequest';
import authMiddleware from '../../middlewares/authMiddleware';

export const adminAuthRoute = Router();

adminAuthRoute.post('/login' , validateRequest(userLoginSchema) , login); 
adminAuthRoute.post('/register', validateRequest(userRegistrationSchema) , register);
adminAuthRoute.post('/logout', authMiddleware("ADMIN"), logout)
adminAuthRoute.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword)
adminAuthRoute.post('/refresh-token', authMiddleware("ADMIN"), refreshToken)
adminAuthRoute.get('/reset-password/:token', verifyResetTokenToResetPassword).post('/reset-password/:token', validateRequest(resetPasswordSchema), resetPassword)
adminAuthRoute.get('/user', authMiddleware("ADMIN"), getUserDetails)
