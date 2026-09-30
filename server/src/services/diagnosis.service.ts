import fs from 'fs';
import { userQuery } from '../db/index.js';
import { FarmService } from './farm.service.js';
import { GeminiService } from './gemini.service.js';
import { DiagnosisRequest, DiagnosisAIResponse } from '../schemas/index.js';

export interface DiagnosisDTO {
  id: string;
  userId: string;
  farmId?: string | null;
  farmName?: string | null;
  cropName: string;
  imageUrl?: string | null;
  symptomsText?: string | null;
  requestPayload: any;
  aiResponse: DiagnosisAIResponse;
  confidenceScore?: number | null;
  language: string;
  createdAt: string;
}

const mapRowToDiagnosis = (row: any): DiagnosisDTO => ({
  id: row.id,
  userId: row.user_id,
  farmId: row.farm_id,
  farmName: row.farm_name || null,
  cropName: row.crop_name,
  imageUrl: row.image_url,
  symptomsText: row.symptoms_text,
  requestPayload: row.request_payload,
  aiResponse: row.ai_response,
  confidenceScore: row.confidence_score,
  language: row.language,
  createdAt: row.created_at,
});

export class DiagnosisService {
  static async createDiagnosis(
    userId: string,
    data: DiagnosisRequest,
    file?: Express.Multer.File
  ): Promise<DiagnosisDTO> {
    let farmContext: string | null = null;
    let farmName: string | null = null;

    if (data.farmId && data.farmId.trim() !== '') {
      const farm = await FarmService.getFarmById(userId, data.farmId);
      if (farm) {
        farmName = farm.name;
        farmContext = `Farm: ${farm.name}, Location: ${farm.district ? farm.district + ', ' : ''}${farm.state}, Soil: ${farm.soilType}, Irrigation: ${farm.irrigationMethod}`;
      }
    }

    let imageBuffer: Buffer | null = null;
    let imageUrl: string | null = null;

    if (file) {
      imageBuffer = fs.readFileSync(file.path);
      // Relative path for client serving
      imageUrl = `/uploads/${file.filename}`;
    }

    // Call Gemini AI service
    const aiResponse = await GeminiService.diagnoseDisease({
      cropName: data.cropName,
      growthStage: data.growthStage,
      symptomsText: data.symptomsText,
      whenNoticed: data.whenNoticed,
      additionalNotes: data.additionalNotes,
      language: data.language,
      farmContext,
      imageBuffer,
      imageMimeType: file?.mimetype || null,
    });

    const res = await userQuery(
      userId,
      `INSERT INTO diagnoses (
        user_id, farm_id, crop_name, image_url, symptoms_text,
        request_payload, ai_response, confidence_score, language
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        userId,
        data.farmId && data.farmId.trim() !== '' ? data.farmId : null,
        data.cropName.trim(),
        imageUrl,
        data.symptomsText?.trim() || null,
        JSON.stringify({
          ...data,
          hasImage: !!file,
          imageOriginalName: file?.originalname || null,
        }),
        JSON.stringify(aiResponse),
        aiResponse.confidence_score,
        data.language,
      ]
    );

    const created = res.rows[0];
    created.farm_name = farmName;
    return mapRowToDiagnosis(created);
  }

  static async listDiagnoses(userId: string): Promise<DiagnosisDTO[]> {
    const res = await userQuery(
      userId,
      `SELECT d.*, f.name as farm_name
       FROM diagnoses d
       LEFT JOIN farms f ON d.farm_id = f.id
       WHERE d.user_id = $1
       ORDER BY d.created_at DESC`,
      [userId]
    );
    return res.rows.map(mapRowToDiagnosis);
  }

  static async getDiagnosisById(userId: string, id: string): Promise<DiagnosisDTO | null> {
    const res = await userQuery(
      userId,
      `SELECT d.*, f.name as farm_name
       FROM diagnoses d
       LEFT JOIN farms f ON d.farm_id = f.id
       WHERE d.id = $1 AND d.user_id = $2`,
      [id, userId]
    );
    if (res.rows.length === 0) return null;
    return mapRowToDiagnosis(res.rows[0]);
  }

  static async deleteDiagnosis(userId: string, id: string): Promise<boolean> {
    const res = await userQuery(
      userId,
      `DELETE FROM diagnoses WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    return res.rows.length > 0;
  }
}
