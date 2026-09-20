import { Router } from 'express';
import { validate } from '../../middlewares/validator.js';
import { loginSchema, refreshTokenSchema, registerSchema } from './auth.schema.js';
import * as authController from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.post('/refresh', validate(refreshTokenSchema), authController.refresh);
authRouter.post('/logout', validate(refreshTokenSchema), authController.logout);
