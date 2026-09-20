import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { authRouter } from './modules/auth/auth.routes.js';
import { NotFoundError } from './common/errors.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3132' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', authRouter);

app.use((_req, _res, next) => next(new NotFoundError('Route not found'))).use(errorHandler);

export default app;
