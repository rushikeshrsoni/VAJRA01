import { Router, Request, Response, NextFunction } from 'express';
import { AdviceService } from '../services/advice.service.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { diagnosisLimiter } from '../middleware/rateLimiter.js';
import { AdviceRequestSchema } from '../schemas/index.js';

const router = Router();
router.use(requireAuth);

router.post(
  '/',
  diagnosisLimiter,
  validateBody(AdviceRequestSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const advice = await AdviceService.createAdvice(req.user!.id, req.body);
      res.status(201).json({ advice });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reports = await AdviceService.listAdviceReports(req.user!.id);
    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const report = await AdviceService.getAdviceReportById(req.user!.id, req.params.id);
    if (!report) {
      res.status(404).json({ error: 'Advice report not found' });
      return;
    }
    res.json({ report });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await AdviceService.deleteAdviceReport(req.user!.id, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Advice report not found' });
      return;
    }
    res.json({ message: 'Advice report deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
