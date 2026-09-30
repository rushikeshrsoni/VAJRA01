# 🌾 CropPilot AI – AI-Powered Agriculture Crop Advisory Assistant

A production-grade, full-stack, mobile-first agricultural advisory platform built with **React (Vite)**, **Node.js/Express (TypeScript)**, **PostgreSQL with Row Level Security (RLS)**, and **Google Gemini AI (`@google/genai`)**.

CropPilot AI empowers farmers and agricultural extension officers to diagnose plant diseases from photos or symptoms, receive tailored soil & fertilizer schedules, consult a bilingual AI Agronomist 24/7 in English or Hindi, and track farm plot health over time.

---

## 🌟 Key Features

1. **Multimodal AI Crop Disease Diagnosis (`/diagnose`)**
   - Upload leaf/plant photos or describe observed symptoms.
   - Powered by Google Gemini Vision multimodal analysis.
   - Structured JSON output with strict Zod validation:
     - Disease Name & Scientific Identifier
     - Confidence Score & Severity Badge (Low / Medium / High / Critical)
     - Matched Symptoms & Environmental Causes
     - Immediate Rescue Steps
     - Eco-friendly / Organic Remedies (Neem oil, Trichoderma, buttermilk)
     - Chemical / Fungicide Treatments with safety gear warnings & pre-harvest waiting periods
     - Cultural Prevention Tips & Expert Escalation Thresholds

2. **Personalized Crop & Soil Advisory (`/advice`)**
   - Context-aware recommendations incorporating farm soil type, pH, organic carbon level, irrigation method, and climate zone.
   - Tailored to farmer goals: Maximum Yield, Low Budget / Cost Minimization, Organic Transition, or Drought Resilience.
   - Stage-by-stage fertilizer schedule (NPK mineral vs organic bio-alternatives), irrigation schedule, and pest risk mitigation.

3. **Multi-Lingual AI Agronomist Chatbot (`/chat`)**
   - Real-time conversational agronomist supporting both **English** and **हिन्दी (Hindi)**.
   - Context-aware: can inject the farmer's registered plots and past diagnoses into the conversation context.
   - Suggested prompts for fast inquiry (stem borer, fertilizer timing, Jeevamrutha preparation, etc.).
   - Full persistence: chat sessions and message threads saved per user.

4. **Farm & Soil Profile Management (`/farms`)**
   - Create, edit, and manage multiple field plots.
   - Tracks state, district, soil type (Alluvial, Black / Regur, Red & Yellow, Laterite, etc.), pH, organic matter, irrigation method (Drip, Sprinkler, Tube Well, Canal), and primary crops.

5. **Farmer Dashboard & Unified History (`/dashboard`, `/history`)**
   - At-a-glance metrics: active plots, total diagnoses, advisory plans, chat consultations.
   - Unified history with tabbed filters and live search by crop, disease, or keyword.

6. **Enterprise Security & Data Isolation**
   - **PostgreSQL Row Level Security (RLS)**: Enforced via `app.current_user_id` session setting on all tables (`farms`, `diagnoses`, `advice_reports`, `chat_sessions`, `chat_messages`).
   - Bcrypt password hashing (cost factor 12).
   - JWT authentication via httpOnly cookies and Bearer tokens.
   - Rate limiting on auth, diagnosis, and chat endpoints.
   - Server-side Gemini API key isolation: keys never leave the server.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, React Router v6, Tailwind CSS, Lucide React, React Hook Form, Zod |
| **Backend** | Node.js, Express.js, TypeScript, Multer, Helmet, CORS, Cookie-Parser, Morgan, Express-Rate-Limit |
| **Database** | PostgreSQL 16 with `pgcrypto` and Row Level Security (RLS) policies |
| **AI Layer** | Google Gemini (`@google/genai` official SDK) with strict JSON response schemas |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** (v14+) running locally or on cloud (e.g. Supabase, Neon, or Homebrew PostgreSQL)

### 2. Clone and Setup Environment Variables

```bash
cd PROJECT1

# Copy environment templates
cp .env.example server/.env
cp .env.example client/.env
```

**`server/.env`**:
```env
PORT=5001
NODE_ENV=development
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/croppilot
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your-google-gemini-api-key
CORS_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=http://localhost:5001/api
```

**`client/.env`**:
```env
VITE_API_BASE_URL=/api
```

### 3. Install Dependencies & Run Database Migrations

```bash
# Server setup
cd server
npm install
npm run migrate
npm run seed     # Seeds realistic demo user, farms, diagnosis, and chat records

# Client setup
cd ../client
npm install
```

### 4. Run Locally

In one terminal, start the backend server:
```bash
cd server
npm run dev
# Server runs on http://localhost:5001
```

In a second terminal, start the frontend client:
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 🌾 Pre-Seeded Demo Account

You can log in instantly using the demo credentials pre-loaded with realistic farm plots, tomato early blight diagnosis, and an agronomy chat session:

- **Email:** `kisan@croppilot.ai`
- **Password:** `FarmPilot@2025`
- *(Or click the one-click **"Auto-Fill"** button on the Login page)*

---

## 🔒 Row Level Security (RLS) Architecture

All database queries for authenticated users execute inside a PostgreSQL connection where `app.current_user_id` is set:

```sql
SELECT set_config('app.current_user_id', '<user_uuid>', false);
```

Every user's farms, diagnoses, soil advisories, and chat logs are strictly isolated:

```sql
CREATE POLICY farms_isolation ON farms
  FOR ALL USING (user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID);

CREATE POLICY diagnoses_isolation ON diagnoses
  FOR ALL USING (user_id = NULLIF(current_setting('app.current_user_id', true), '')::UUID);
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service and database health check |
| `POST` | `/api/auth/register` | Register new farmer account |
| `POST` | `/api/auth/login` | Login and receive JWT cookie & token |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/me` | Fetch authenticated farmer profile |
| `PUT` | `/api/auth/profile` | Update profile and language preferences |
| `GET` | `/api/farms` | List all farm profiles for current user |
| `POST` | `/api/farms` | Create a new farm profile |
| `GET` | `/api/farms/:id` | Fetch specific farm details |
| `PUT` | `/api/farms/:id` | Update farm profile |
| `DELETE` | `/api/farms/:id` | Delete farm profile |
| `POST` | `/api/diagnoses` | Multimodal disease diagnosis (photo or symptoms) |
| `GET` | `/api/diagnoses` | List user diagnoses history |
| `GET` | `/api/diagnoses/:id` | Retrieve detailed diagnosis report |
| `POST` | `/api/advice` | Generate personalized crop & soil advisory plan |
| `GET` | `/api/advice` | List advisory reports |
| `GET` | `/api/advice/:id` | Retrieve detailed advisory report |
| `GET` | `/api/chat/sessions` | List all chat sessions |
| `POST` | `/api/chat/sessions` | Create new consultation thread |
| `GET` | `/api/chat/sessions/:id/messages` | Fetch messages for a session |
| `POST` | `/api/chat/sessions/:id/messages` | Send message and receive AI agronomist reply |
| `GET` | `/api/stats/dashboard` | Aggregated dashboard statistics and recent activity |

---

## 🌾 AI Extension Disclaimer
*CropPilot AI provides computational agronomic advice based on image and symptom recognition models. Growers must confirm chemical dosages with local Krishi Vigyan Kendras (KVKs) and follow all statutory pesticide label regulations.*
