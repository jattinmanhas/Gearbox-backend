import { Router } from 'express';
import { login, register, logout } from '../../controllers/admin/authController';
import { userLoginSchema, userRegistrationSchema } from '../../utils/validation/userValidation';
import validateRequest from '../../middlewares/validateRequest';
import authMiddleware from '../../middlewares/authMiddleware';

export const adminAuthRoute = Router();

adminAuthRoute.post('/login' , validateRequest(userLoginSchema) , login); 
adminAuthRoute.post('/register', validateRequest(userRegistrationSchema) , register);
adminAuthRoute.post('/logout', authMiddleware("ADMIN"), logout)
