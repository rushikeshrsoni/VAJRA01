import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
  phone: z.string().optional().nullable(),
  preferredLanguage: z.enum(['en', 'hi']).default('en'),
  regionState: z.string().optional().nullable(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
  phone: z.string().optional().nullable(),
  preferredLanguage: z.enum(['en', 'hi']).default('en'),
  regionState: z.string().optional().nullable(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;

export const FarmCreateSchema = z.object({
  name: z.string().min(2, 'Farm name must be at least 2 characters long'),
  state: z.string().min(1, 'State is required'),
  district: z.string().optional().nullable(),
  soilType: z.string().min(1, 'Soil type is required'),
  soilPh: z.coerce.number().min(0).max(14).optional().nullable(),
  organicMatter: z.string().optional().nullable(),
  irrigationMethod: z.string().min(1, 'Irrigation method is required'),
  farmSizeAcres: z.coerce.number().positive('Farm size must be positive').optional().nullable(),
  primaryCrops: z.array(z.string()).default([]),
  notes: z.string().optional().nullable(),
});

export type FarmCreateRequest = z.infer<typeof FarmCreateSchema>;

export const FarmUpdateSchema = FarmCreateSchema.partial();
export type FarmUpdateRequest = z.infer<typeof FarmUpdateSchema>;

export const DiagnosisRequestSchema = z.object({
  farmId: z.string().uuid().optional().nullable().or(z.literal('')),
  cropName: z.string().min(2, 'Crop name is required'),
  growthStage: z.string().optional().nullable(),
  symptomsText: z.string().optional().nullable(),
  whenNoticed: z.string().optional().nullable(),
  additionalNotes: z.string().optional().nullable(),
  language: z.enum(['en', 'hi']).default('en'),
});

export type DiagnosisRequest = z.infer<typeof DiagnosisRequestSchema>;

export const DiagnosisAIResponseSchema = z.object({
  disease_name: z.string(),
  scientific_name: z.string().nullable().optional(),
  confidence_score: z.number().min(0).max(100),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  matched_symptoms: z.array(z.string()),
  possible_causes: z.array(z.string()),
  immediate_actions: z.array(z.string()),
  treatment_organic: z.array(z.string()),
  treatment_chemical: z.array(z.string()),
  prevention_tips: z.array(z.string()),
  when_to_seek_help: z.string(),
  disclaimer: z.string(),
});

export type DiagnosisAIResponse = z.infer<typeof DiagnosisAIResponseSchema>;

export const AdviceRequestSchema = z.object({
  farmId: z.string().uuid('Please select a valid farm profile'),
  goal: z.string().min(1, 'Farming goal is required'),
  season: z.string().min(1, 'Season is required'),
  currentCrops: z.string().optional().nullable(),
  specificQuestions: z.string().optional().nullable(),
  language: z.enum(['en', 'hi']).default('en'),
});

export type AdviceRequest = z.infer<typeof AdviceRequestSchema>;

export const AdviceAIResponseSchema = z.object({
  crop_recommendations: z.array(
    z.object({
      crop_name: z.string(),
      variety_suggestions: z.array(z.string()),
      suitability_reason: z.string(),
      expected_duration: z.string(),
    })
  ),
  soil_health_assessment: z.object({
    current_status: z.string(),
    organic_matter_advice: z.string(),
    ph_correction: z.string(),
    deficiencies_to_watch: z.array(z.string()),
  }),
  fertilizer_schedule: z.array(
    z.object({
      stage: z.string(),
      nutrients: z.string(),
      organic_alternative: z.string(),
      application_method: z.string(),
    })
  ),
  irrigation_plan: z.object({
    method: z.string(),
    frequency: z.string(),
    water_conservation_tips: z.array(z.string()),
  }),
  pest_and_disease_risk: z.object({
    key_threats: z.array(z.string()),
    preventive_measures: z.array(z.string()),
  }),
  climate_resilience_tips: z.array(z.string()),
  actionable_summary: z.string(),
  disclaimer: z.string(),
});

export type AdviceAIResponse = z.infer<typeof AdviceAIResponseSchema>;

export const CreateChatSessionSchema = z.object({
  title: z.string().optional(),
  language: z.enum(['en', 'hi']).default('en'),
});

export const SendChatMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
  language: z.enum(['en', 'hi']).default('en'),
  useFarmContext: z.boolean().default(true),
});

export type SendChatMessageRequest = z.infer<typeof SendChatMessageSchema>;
