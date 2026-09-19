import { Router } from 'express';
import { validate } from '../../middlewares/validator.js';
import { registerSchema } from './auth.schema.js';
import * as authController from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.register);
