import { Router, Request, Response, NextFunction } from 'express';
import { FarmService } from '../services/farm.service.js';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { FarmCreateSchema, FarmUpdateSchema } from '../schemas/index.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const farms = await FarmService.listFarms(req.user!.id);
    res.json({ farms });
  } catch (err) {
    next(err);
  }
});

router.post('/', validateBody(FarmCreateSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const farm = await FarmService.createFarm(req.user!.id, req.body);
    res.status(201).json({ farm });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const farm = await FarmService.getFarmById(req.user!.id, req.params.id);
    if (!farm) {
      res.status(404).json({ error: 'Farm not found' });
      return;
    }
    res.json({ farm });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validateBody(FarmUpdateSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const farm = await FarmService.updateFarm(req.user!.id, req.params.id, req.body);
    res.json({ farm });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await FarmService.deleteFarm(req.user!.id, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Farm not found' });
      return;
    }
    res.json({ message: 'Farm deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
