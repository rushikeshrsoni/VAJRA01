import { Router, Request, Response, NextFunction } from 'express';
import { DiagnosisService } from '../services/diagnosis.service.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { diagnosisLimiter } from '../middleware/rateLimiter.js';
import { DiagnosisRequestSchema } from '../schemas/index.js';

const router = Router();
router.use(requireAuth);

router.post(
  '/',
  diagnosisLimiter,
  upload.single('image'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate text body
      const validatedData = DiagnosisRequestSchema.parse(req.body);

      // Require at least an image OR symptomsText
      if (!req.file && (!validatedData.symptomsText || validatedData.symptomsText.trim().length === 0)) {
        res.status(400).json({
          error: 'Please provide either a photo of the affected crop or a description of the symptoms.',
        });
        return;
      }

      const diagnosis = await DiagnosisService.createDiagnosis(req.user!.id, validatedData, req.file);
      res.status(201).json({ diagnosis });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const diagnoses = await DiagnosisService.listDiagnoses(req.user!.id);
    res.json({ diagnoses });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const diagnosis = await DiagnosisService.getDiagnosisById(req.user!.id, req.params.id);
    if (!diagnosis) {
      res.status(404).json({ error: 'Diagnosis record not found' });
      return;
    }
    res.json({ diagnosis });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await DiagnosisService.deleteDiagnosis(req.user!.id, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Diagnosis record not found' });
      return;
    }
    res.json({ message: 'Diagnosis record deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
