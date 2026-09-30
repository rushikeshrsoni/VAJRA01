import { userQuery } from '../db/index.js';
import { FarmCreateRequest, FarmUpdateRequest } from '../schemas/index.js';

export interface FarmDTO {
  id: string;
  userId: string;
  name: string;
  state: string;
  district?: string | null;
  soilType: string;
  soilPh?: number | null;
  organicMatter?: string | null;
  irrigationMethod: string;
  farmSizeAcres?: number | null;
  primaryCrops: string[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

const mapRowToFarm = (row: any): FarmDTO => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  state: row.state,
  district: row.district,
  soilType: row.soil_type,
  soilPh: row.soil_ph !== null ? parseFloat(row.soil_ph) : null,
  organicMatter: row.organic_matter,
  irrigationMethod: row.irrigation_method,
  farmSizeAcres: row.farm_size_acres !== null ? parseFloat(row.farm_size_acres) : null,
  primaryCrops: row.primary_crops || [],
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class FarmService {
  static async listFarms(userId: string): Promise<FarmDTO[]> {
    const res = await userQuery(
      userId,
      `SELECT * FROM farms WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows.map(mapRowToFarm);
  }

  static async getFarmById(userId: string, farmId: string): Promise<FarmDTO | null> {
    const res = await userQuery(
      userId,
      `SELECT * FROM farms WHERE id = $1 AND user_id = $2`,
      [farmId, userId]
    );
    if (res.rows.length === 0) return null;
    return mapRowToFarm(res.rows[0]);
  }

  static async createFarm(userId: string, data: FarmCreateRequest): Promise<FarmDTO> {
    const res = await userQuery(
      userId,
      `INSERT INTO farms (
        user_id, name, state, district, soil_type, soil_ph, organic_matter,
        irrigation_method, farm_size_acres, primary_crops, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        userId,
        data.name.trim(),
        data.state.trim(),
        data.district?.trim() || null,
        data.soilType.trim(),
        data.soilPh ?? null,
        data.organicMatter?.trim() || null,
        data.irrigationMethod.trim(),
        data.farmSizeAcres ?? null,
        data.primaryCrops || [],
        data.notes?.trim() || null,
      ]
    );
    return mapRowToFarm(res.rows[0]);
  }

  static async updateFarm(userId: string, farmId: string, data: FarmUpdateRequest): Promise<FarmDTO> {
    const existing = await this.getFarmById(userId, farmId);
    if (!existing) {
      const err = new Error('Farm not found.');
      (err as any).status = 404;
      throw err;
    }

    const updatedName = data.name !== undefined ? data.name.trim() : existing.name;
    const updatedState = data.state !== undefined ? data.state.trim() : existing.state;
    const updatedDistrict = data.district !== undefined ? (data.district?.trim() || null) : existing.district;
    const updatedSoilType = data.soilType !== undefined ? data.soilType.trim() : existing.soilType;
    const updatedSoilPh = data.soilPh !== undefined ? data.soilPh : existing.soilPh;
    const updatedOrganicMatter = data.organicMatter !== undefined ? (data.organicMatter?.trim() || null) : existing.organicMatter;
    const updatedIrrigationMethod = data.irrigationMethod !== undefined ? data.irrigationMethod.trim() : existing.irrigationMethod;
    const updatedFarmSizeAcres = data.farmSizeAcres !== undefined ? data.farmSizeAcres : existing.farmSizeAcres;
    const updatedPrimaryCrops = data.primaryCrops !== undefined ? data.primaryCrops : existing.primaryCrops;
    const updatedNotes = data.notes !== undefined ? (data.notes?.trim() || null) : existing.notes;

    const res = await userQuery(
      userId,
      `UPDATE farms SET
        name = $1, state = $2, district = $3, soil_type = $4, soil_ph = $5,
        organic_matter = $6, irrigation_method = $7, farm_size_acres = $8,
        primary_crops = $9, notes = $10, updated_at = NOW()
       WHERE id = $11 AND user_id = $12
       RETURNING *`,
      [
        updatedName,
        updatedState,
        updatedDistrict,
        updatedSoilType,
        updatedSoilPh,
        updatedOrganicMatter,
        updatedIrrigationMethod,
        updatedFarmSizeAcres,
        updatedPrimaryCrops,
        updatedNotes,
        farmId,
        userId,
      ]
    );

    return mapRowToFarm(res.rows[0]);
  }

  static async deleteFarm(userId: string, farmId: string): Promise<boolean> {
    const res = await userQuery(
      userId,
      `DELETE FROM farms WHERE id = $1 AND user_id = $2 RETURNING id`,
      [farmId, userId]
    );
    return res.rows.length > 0;
  }
}
