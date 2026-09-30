import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { RegisterRequestSchema, LoginRequestSchema, UpdateProfileSchema } from '../schemas/index.js';

const router = Router();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

router.post(
  '/register',
  authLimiter,
  validateBody(RegisterRequestSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, token } = await AuthService.register(req.body);
      res.cookie('token', token, cookieOptions);
      res.status(201).json({ user, token });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  authLimiter,
  validateBody(LoginRequestSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, token } = await AuthService.login(req.body);
      res.cookie('token', token, cookieOptions);
      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('token', cookieOptions);
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await AuthService.getProfile(req.user!.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.put(
  '/profile',
  requireAuth,
  validateBody(UpdateProfileSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await AuthService.updateProfile(req.user!.id, req.body);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
