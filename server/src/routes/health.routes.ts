import { Router, Request, Response } from 'express';
import { pool } from '../db/index.js';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const dbRes = await pool.query('SELECT 1 as healthy');
    res.json({
      status: 'ok',
      service: 'croppilot-api',
      timestamp: new Date().toISOString(),
      database: dbRes.rows.length > 0 ? 'connected' : 'disconnected',
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'degraded',
      service: 'croppilot-api',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

export default router;
