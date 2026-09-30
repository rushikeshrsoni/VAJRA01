import { Router, Request, Response, NextFunction } from 'express';
import { userQuery } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/dashboard', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Counts
    const countsRes = await userQuery(
      userId,
      `SELECT
        (SELECT COUNT(*) FROM farms WHERE user_id = $1) as farm_count,
        (SELECT COUNT(*) FROM diagnoses WHERE user_id = $1) as diagnosis_count,
        (SELECT COUNT(*) FROM advice_reports WHERE user_id = $1) as advice_count,
        (SELECT COUNT(*) FROM chat_sessions WHERE user_id = $1) as chat_count`,
      [userId]
    );

    // Recent Diagnoses
    const recentDiagnosesRes = await userQuery(
      userId,
      `SELECT d.id, d.crop_name, d.image_url, d.confidence_score, d.language, d.created_at,
              d.ai_response->>'disease_name' as disease_name,
              d.ai_response->>'severity' as severity,
              f.name as farm_name
       FROM diagnoses d
       LEFT JOIN farms f ON d.farm_id = f.id
       WHERE d.user_id = $1
       ORDER BY d.created_at DESC
       LIMIT 5`,
      [userId]
    );

    // Recent Advice
    const recentAdviceRes = await userQuery(
      userId,
      `SELECT a.id, a.language, a.created_at,
              a.request_payload->>'goal' as goal,
              a.request_payload->>'season' as season,
              f.name as farm_name
       FROM advice_reports a
       LEFT JOIN farms f ON a.farm_id = f.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC
       LIMIT 5`,
      [userId]
    );

    // Recent Chat Sessions
    const recentChatsRes = await userQuery(
      userId,
      `SELECT s.id, s.title, s.language, s.updated_at,
              (SELECT content FROM chat_messages WHERE session_id = s.id ORDER BY created_at DESC LIMIT 1) as last_message
       FROM chat_sessions s
       WHERE s.user_id = $1
       ORDER BY s.updated_at DESC
       LIMIT 4`,
      [userId]
    );

    res.json({
      counts: {
        farms: parseInt(countsRes.rows[0].farm_count || '0', 10),
        diagnoses: parseInt(countsRes.rows[0].diagnosis_count || '0', 10),
        adviceReports: parseInt(countsRes.rows[0].advice_count || '0', 10),
        chatSessions: parseInt(countsRes.rows[0].chat_count || '0', 10),
      },
      recentDiagnoses: recentDiagnosesRes.rows,
      recentAdvice: recentAdviceRes.rows,
      recentChats: recentChatsRes.rows,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
