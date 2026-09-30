import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, userQuery } from '../db/index.js';
import { env } from '../config/env.js';
import { RegisterRequest, LoginRequest, UpdateProfileRequest } from '../schemas/index.js';

export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  preferredLanguage: 'en' | 'hi';
  regionState?: string | null;
  createdAt: string;
}

export class AuthService {
  static async register(data: RegisterRequest): Promise<{ user: UserDTO; token: string }> {
    const existing = await query('SELECT id FROM users WHERE email = $1', [data.email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      const err = new Error('An account with this email address already exists.');
      (err as any).status = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const res = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, preferred_language, region_state)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, phone, preferred_language, region_state, created_at`,
      [
        data.email.toLowerCase().trim(),
        passwordHash,
        data.fullName.trim(),
        data.phone || null,
        data.preferredLanguage || 'en',
        data.regionState || null,
      ]
    );

    const row = res.rows[0];
    const user: UserDTO = {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      phone: row.phone,
      preferredLanguage: row.preferred_language,
      regionState: row.region_state,
      createdAt: row.created_at,
    };

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    return { user, token };
  }

  static async login(data: LoginRequest): Promise<{ user: UserDTO; token: string }> {
    const res = await query(
      `SELECT id, email, password_hash, full_name, phone, preferred_language, region_state, created_at
       FROM users WHERE email = $1`,
      [data.email.toLowerCase().trim()]
    );

    if (res.rows.length === 0) {
      const err = new Error('Invalid email or password.');
      (err as any).status = 401;
      throw err;
    }

    const row = res.rows[0];
    const match = await bcrypt.compare(data.password, row.password_hash);
    if (!match) {
      const err = new Error('Invalid email or password.');
      (err as any).status = 401;
      throw err;
    }

    const user: UserDTO = {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      phone: row.phone,
      preferredLanguage: row.preferred_language,
      regionState: row.region_state,
      createdAt: row.created_at,
    };

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    return { user, token };
  }

  static async getProfile(userId: string): Promise<UserDTO> {
    const res = await userQuery(
      userId,
      `SELECT id, email, full_name, phone, preferred_language, region_state, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (res.rows.length === 0) {
      const err = new Error('User not found.');
      (err as any).status = 404;
      throw err;
    }

    const row = res.rows[0];
    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      phone: row.phone,
      preferredLanguage: row.preferred_language,
      regionState: row.region_state,
      createdAt: row.created_at,
    };
  }

  static async updateProfile(userId: string, data: UpdateProfileRequest): Promise<UserDTO> {
    const res = await userQuery(
      userId,
      `UPDATE users
       SET full_name = $1, phone = $2, preferred_language = $3, region_state = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, full_name, phone, preferred_language, region_state, created_at`,
      [data.fullName.trim(), data.phone || null, data.preferredLanguage, data.regionState || null, userId]
    );

    if (res.rows.length === 0) {
      const err = new Error('User not found.');
      (err as any).status = 404;
      throw err;
    }

    const row = res.rows[0];
    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      phone: row.phone,
      preferredLanguage: row.preferred_language,
      regionState: row.region_state,
      createdAt: row.created_at,
    };
  }
}
