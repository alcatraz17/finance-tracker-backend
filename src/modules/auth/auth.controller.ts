import type { Request, Response } from 'express';
import * as authService from './auth.service.js';

export async function register(req: Request, res: Response) {
  const user = await authService.register(req.body.email, req.body.password, req.body.name);

  res.status(201).json({
    success: true,
    data: { user }
  });
}

export async function login(req: Request, res: Response) {
  const tokens = await authService.login(req.body.email, req.body.password);

  res.json({ success: true, data: tokens });
}

export async function refresh(req: Request, res: Response) {
  const tokens = await authService.refreshAccessToken(req.body.refreshToken);
  res.json({ success: true, data: tokens });
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.body.refreshToken);
  res.json({ success: true });
}
