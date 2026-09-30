import { Router, Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { chatLimiter } from '../middleware/rateLimiter.js';
import { CreateChatSessionSchema, SendChatMessageSchema } from '../schemas/index.js';

const router = Router();
router.use(requireAuth);

router.get('/sessions', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sessions = await ChatService.listSessions(req.user!.id);
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/sessions',
  validateBody(CreateChatSessionSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const session = await ChatService.createSession(
        req.user!.id,
        req.body.title,
        req.body.language || req.user!.preferredLanguage || 'en'
      );
      res.status(201).json({ session });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/sessions/:id/messages', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const messages = await ChatService.getMessages(req.user!.id, req.params.id);
    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/sessions/:id/messages',
  chatLimiter,
  validateBody(SendChatMessageSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userMessage, assistantMessage } = await ChatService.sendMessage(
        req.user!.id,
        req.params.id,
        req.body.content,
        req.body.language,
        req.body.useFarmContext ?? true
      );
      res.status(201).json({ userMessage, assistantMessage });
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/sessions/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await ChatService.deleteSession(req.user!.id, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Chat session not found' });
      return;
    }
    res.json({ message: 'Chat session deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
