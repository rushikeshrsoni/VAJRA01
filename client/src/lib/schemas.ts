import { z } from 'zod';

export const LoginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;

export const RegisterFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  preferredLanguage: z.enum(['en', 'hi']).default('en'),
  regionState: z.string().optional(),
});

export type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export const FarmFormSchema = z.object({
  name: z.string().min(2, 'Farm name must be at least 2 characters'),
  state: z.string().min(1, 'State is required'),
  district: z.string().optional(),
  soilType: z.string().min(1, 'Soil type is required'),
  soilPh: z.preprocess((val) => (val === '' || val === undefined ? null : Number(val)), z.number().min(0).max(14).nullable().optional()),
  organicMatter: z.string().optional(),
  irrigationMethod: z.string().min(1, 'Irrigation method is required'),
  farmSizeAcres: z.preprocess((val) => (val === '' || val === undefined ? null : Number(val)), z.number().positive().nullable().optional()),
  primaryCrops: z.string().optional(), // Comma-separated on form
  notes: z.string().optional(),
});

export type FarmFormValues = z.infer<typeof FarmFormSchema>;

export const DiagnosisFormSchema = z.object({
  farmId: z.string().optional(),
  cropName: z.string().min(2, 'Crop name is required'),
  growthStage: z.string().optional(),
  whenNoticed: z.string().optional(),
  symptomsText: z.string().optional(),
  additionalNotes: z.string().optional(),
  language: z.enum(['en', 'hi']).default('en'),
});

export type DiagnosisFormValues = z.infer<typeof DiagnosisFormSchema>;

export const AdviceFormSchema = z.object({
  farmId: z.string().min(1, 'Please select a farm profile'),
  goal: z.string().min(1, 'Please select a goal'),
  season: z.string().min(1, 'Please select a season'),
  currentCrops: z.string().optional(),
  specificQuestions: z.string().optional(),
  language: z.enum(['en', 'hi']).default('en'),
});

export type AdviceFormValues = z.infer<typeof AdviceFormSchema>;
