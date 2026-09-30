import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../db/index.js';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  preferredLanguage: 'en' | 'hi';
  regionState?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const userRes = await query(
      'SELECT id, email, full_name, preferred_language, region_state FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userRes.rows.length === 0) {
      res.status(401).json({ error: 'User account not found or has been removed.' });
      return;
    }

    const row = userRes.rows[0];
    req.user = {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      preferredLanguage: row.preferred_language || 'en',
      regionState: row.region_state,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
};
