import { userQuery } from '../db/index.js';
import { FarmService } from './farm.service.js';
import { GeminiService } from './gemini.service.js';
import { AdviceRequest, AdviceAIResponse } from '../schemas/index.js';

export interface AdviceReportDTO {
  id: string;
  userId: string;
  farmId?: string | null;
  farmName?: string | null;
  requestPayload: any;
  aiResponse: AdviceAIResponse;
  language: string;
  createdAt: string;
}

const mapRowToAdvice = (row: any): AdviceReportDTO => ({
  id: row.id,
  userId: row.user_id,
  farmId: row.farm_id,
  farmName: row.farm_name || null,
  requestPayload: row.request_payload,
  aiResponse: row.ai_response,
  language: row.language,
  createdAt: row.created_at,
});

export class AdviceService {
  static async createAdvice(userId: string, data: AdviceRequest): Promise<AdviceReportDTO> {
    const farm = await FarmService.getFarmById(userId, data.farmId);
    if (!farm) {
      const err = new Error('Selected farm profile not found.');
      (err as any).status = 404;
      throw err;
    }

    const aiResponse = await GeminiService.getCropAndSoilAdvice({
      farmName: farm.name,
      state: farm.state,
      district: farm.district,
      soilType: farm.soilType,
      soilPh: farm.soilPh,
      organicMatter: farm.organicMatter,
      irrigationMethod: farm.irrigationMethod,
      farmSizeAcres: farm.farmSizeAcres,
      primaryCrops: farm.primaryCrops,
      goal: data.goal,
      season: data.season,
      currentCrops: data.currentCrops,
      specificQuestions: data.specificQuestions,
      language: data.language,
    });

    const res = await userQuery(
      userId,
      `INSERT INTO advice_reports (
        user_id, farm_id, request_payload, ai_response, language
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        userId,
        farm.id,
        JSON.stringify({ ...data, farmName: farm.name }),
        JSON.stringify(aiResponse),
        data.language,
      ]
    );

    const created = res.rows[0];
    created.farm_name = farm.name;
    return mapRowToAdvice(created);
  }

  static async listAdviceReports(userId: string): Promise<AdviceReportDTO[]> {
    const res = await userQuery(
      userId,
      `SELECT a.*, f.name as farm_name
       FROM advice_reports a
       LEFT JOIN farms f ON a.farm_id = f.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [userId]
    );
    return res.rows.map(mapRowToAdvice);
  }

  static async getAdviceReportById(userId: string, id: string): Promise<AdviceReportDTO | null> {
    const res = await userQuery(
      userId,
      `SELECT a.*, f.name as farm_name
       FROM advice_reports a
       LEFT JOIN farms f ON a.farm_id = f.id
       WHERE a.id = $1 AND a.user_id = $2`,
      [id, userId]
    );
    if (res.rows.length === 0) return null;
    return mapRowToAdvice(res.rows[0]);
  }

  static async deleteAdviceReport(userId: string, id: string): Promise<boolean> {
    const res = await userQuery(
      userId,
      `DELETE FROM advice_reports WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    return res.rows.length > 0;
  }
}
