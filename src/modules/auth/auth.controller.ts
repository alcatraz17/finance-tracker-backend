import type { Request, Response } from 'express';
import * as authService from './auth.service.js';

export async function register(req: Request, res: Response) {
  const user = await authService.register(req.body.email, req.body.password, req.body.name);

  res.status(201).json({
    success: true,
    data: { user }
  });
}

