import { userQuery } from '../db/index.js';
import { FarmService } from './farm.service.js';
import { DiagnosisService } from './diagnosis.service.js';
import { GeminiService } from './gemini.service.js';

export interface ChatSessionDTO {
  id: string;
  userId: string;
  title: string;
  language: 'en' | 'hi';
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  lastMessage?: string | null;
}

export interface ChatMessageDTO {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export class ChatService {
  static async listSessions(userId: string): Promise<ChatSessionDTO[]> {
    const res = await userQuery(
      userId,
      `SELECT
        s.id, s.user_id, s.title, s.language, s.created_at, s.updated_at,
        COUNT(m.id)::int as message_count,
        (
          SELECT content FROM chat_messages
          WHERE session_id = s.id
          ORDER BY created_at DESC LIMIT 1
        ) as last_message
       FROM chat_sessions s
       LEFT JOIN chat_messages m ON s.id = m.session_id
       WHERE s.user_id = $1
       GROUP BY s.id
       ORDER BY s.updated_at DESC`,
      [userId]
    );

    return res.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      language: row.language,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      messageCount: row.message_count,
      lastMessage: row.last_message,
    }));
  }

  static async createSession(
    userId: string,
    title?: string,
    language: 'en' | 'hi' = 'en'
  ): Promise<ChatSessionDTO> {
    const defaultTitle = language === 'hi' ? 'नया कृषि परामर्श' : 'Agronomist Consultation';
    const finalTitle = title && title.trim().length > 0 ? title.trim() : defaultTitle;

    const res = await userQuery(
      userId,
      `INSERT INTO chat_sessions (user_id, title, language)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, finalTitle, language]
    );

    const row = res.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      language: row.language,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      messageCount: 0,
      lastMessage: null,
    };
  }

  static async getSession(userId: string, sessionId: string): Promise<ChatSessionDTO | null> {
    const res = await userQuery(
      userId,
      `SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      language: row.language,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async getMessages(userId: string, sessionId: string): Promise<ChatMessageDTO[]> {
    const session = await this.getSession(userId, sessionId);
    if (!session) {
      const err = new Error('Chat session not found.');
      (err as any).status = 404;
      throw err;
    }

    const res = await userQuery(
      userId,
      `SELECT id, session_id, role, content, created_at
       FROM chat_messages
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [sessionId]
    );

    return res.rows.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      role: row.role,
      content: row.content,
      createdAt: row.created_at,
    }));
  }

  static async sendMessage(
    userId: string,
    sessionId: string,
    content: string,
    language: 'en' | 'hi' = 'en',
    useFarmContext: boolean = true
  ): Promise<{ userMessage: ChatMessageDTO; assistantMessage: ChatMessageDTO }> {
    const session = await this.getSession(userId, sessionId);
    if (!session) {
      const err = new Error('Chat session not found.');
      (err as any).status = 404;
      throw err;
    }

    // Insert user message
    const userMsgRes = await userQuery(
      userId,
      `INSERT INTO chat_messages (session_id, role, content)
       VALUES ($1, 'user', $2)
       RETURNING *`,
      [sessionId, content.trim()]
    );
    const userMessage: ChatMessageDTO = {
      id: userMsgRes.rows[0].id,
      sessionId: userMsgRes.rows[0].session_id,
      role: 'user',
      content: userMsgRes.rows[0].content,
      createdAt: userMsgRes.rows[0].created_at,
    };

    // Gather history
    const existingMessages = await this.getMessages(userId, sessionId);
    const history = existingMessages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Gather contextual data if requested
    let farmContext: string | null = null;
    let diagnosisContext: string | null = null;

    if (useFarmContext) {
      const farms = await FarmService.listFarms(userId);
      if (farms.length > 0) {
        farmContext = farms
          .map(
            (f) =>
              `- ${f.name} in ${f.district || ''} ${f.state} (Soil: ${f.soilType}, pH: ${f.soilPh || 'N/A'}, Crops: ${f.primaryCrops.join(', ') || 'N/A'})`
          )
          .join('\n');
      }

      const recentDiagnoses = await DiagnosisService.listDiagnoses(userId);
      if (recentDiagnoses.length > 0) {
        diagnosisContext = recentDiagnoses
          .slice(0, 3)
          .map(
            (d) =>
              `- Crop: ${d.cropName}, Diagnosed with: ${d.aiResponse.disease_name} (Severity: ${d.aiResponse.severity}) on ${new Date(d.createdAt).toLocaleDateString()}`
          )
          .join('\n');
      }
    }

    // Call Gemini AI
    const assistantReply = await GeminiService.chatWithAgronomist({
      userMessage: content,
      history,
      language: language || session.language || 'en',
      farmContext,
      diagnosisContext,
    });

    // Save assistant message
    const assistantMsgRes = await userQuery(
      userId,
      `INSERT INTO chat_messages (session_id, role, content)
       VALUES ($1, 'assistant', $2)
       RETURNING *`,
      [sessionId, assistantReply]
    );

    const assistantMessage: ChatMessageDTO = {
      id: assistantMsgRes.rows[0].id,
      sessionId: assistantMsgRes.rows[0].session_id,
      role: 'assistant',
      content: assistantMsgRes.rows[0].content,
      createdAt: assistantMsgRes.rows[0].created_at,
    };

    // Update session timestamp and dynamic title if it's the first message
    let newTitle: string | null = null;
    if (existingMessages.length <= 1) {
      newTitle = content.length > 35 ? content.slice(0, 35) + '...' : content;
      await userQuery(
        userId,
        `UPDATE chat_sessions SET title = $1, language = $2, updated_at = NOW() WHERE id = $3`,
        [newTitle, language, sessionId]
      );
    } else {
      await userQuery(
        userId,
        `UPDATE chat_sessions SET language = $1, updated_at = NOW() WHERE id = $2`,
        [language, sessionId]
      );
    }

    return { userMessage, assistantMessage };
  }

  static async deleteSession(userId: string, sessionId: string): Promise<boolean> {
    const res = await userQuery(
      userId,
      `DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2 RETURNING id`,
      [sessionId, userId]
    );
    return res.rows.length > 0;
  }
}
