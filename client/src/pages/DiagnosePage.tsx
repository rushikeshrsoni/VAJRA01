import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../lib/api.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useToast } from '../context/ToastContext.js';
import { DiagnosisFormSchema, DiagnosisFormValues } from '../lib/schemas.js';
import {
  ShieldAlert,
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  Camera,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const COMMON_CROPS = [
  'Tomato', 'Wheat', 'Rice / Paddy', 'Cotton', 'Potato',
  'Soybean', 'Mustard', 'Maize (Corn)', 'Chilli', 'Onion', 'Sugarcane'
];

const GROWTH_STAGES = [
  'Seedling / Emergence',
  'Vegetative Growth',
  'Flowering / Tasseling',
  'Fruiting / Grain Fill',
  'Maturity / Ripening'
];

export const DiagnosePage: React.FC = () => {
  const { t, language } = useLanguage();
  const { error } = useToast();
  const navigate = useNavigate();

  const [farms, setFarms] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DiagnosisFormValues>({
    resolver: zodResolver(DiagnosisFormSchema),
    defaultValues: {
      cropName: '',
      farmId: '',
      growthStage: 'Vegetative Growth',
      whenNoticed: 'Within the last 3-5 days',
      symptomsText: '',
      additionalNotes: '',
      language: language,
    },
  });

  const selectedCrop = watch('cropName');

  useEffect(() => {
    setValue('language', language);
  }, [language, setValue]);

  useEffect(() => {
    // Fetch registered farms for optional dropdown linking
    api
      .get('/farms')
      .then((res) => {
        setFarms(res.data.farms || []);
      })
      .catch(() => {});
  }, []);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      error('File Too Large', 'Please upload a photo smaller than 10MB.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const onSubmit = async (data: DiagnosisFormValues) => {
    if (!selectedFile && (!data.symptomsText || data.symptomsText.trim().length === 0)) {
      error('Missing Information', 'Please upload a photo of the affected plant or describe the symptoms in detail.');
      return;
    }

    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('cropName', data.cropName);
      if (data.farmId) formData.append('farmId', data.farmId);
      if (data.growthStage) formData.append('growthStage', data.growthStage);
      if (data.whenNoticed) formData.append('whenNoticed', data.whenNoticed);
      if (data.symptomsText) formData.append('symptomsText', data.symptomsText);
      if (data.additionalNotes) formData.append('additionalNotes', data.additionalNotes);
      formData.append('language', data.language);

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const res = await api.post('/diagnoses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const diagnosisId = res.data.diagnosis.id;
      navigate(`/diagnose/${diagnosisId}`);
    } catch (err: any) {
      error('Diagnosis Failed', err.response?.data?.error || 'Could not analyze crop. Please check connection.');
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          Plant Health Emergency Desk
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('diagnoseTitle')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t('diagnoseSubtitle')}</p>
      </div>

      {analyzing ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-emerald-200 shadow-xl space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-emerald-50 flex items-center justify-center text-2xl">
              🌾
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {t('analyzingText')}
            </h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Scanning cellular leaf pigmentation, lesion halos, and environmental factors using Google Gemini multimodal vision.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Dropzone Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t('uploadImageLabel')}
            </label>

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-80 bg-slate-900 flex items-center justify-center group">
                <img
                  src={previewUrl}
                  alt="Crop preview"
                  className="max-h-80 w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => handleFileChange(null)}
                  className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-red-600 text-white rounded-full transition shadow-lg"
                  title="Remove photo"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-8 sm:p-12 text-center bg-emerald-50/20 hover:bg-emerald-50/50 transition cursor-pointer group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-xs">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Click to take or upload a crop photo
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {t('uploadImageHelp')}
                </p>
              </div>
            )}
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Crop & Symptom Details
            </h2>

            {/* Common Crop Badges */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('cropNameLabel')} *
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {COMMON_CROPS.map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => setValue('cropName', crop, { shouldValidate: true })}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      selectedCrop === crop
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or type crop name (e.g. Brinjal, Pomegranate, Groundnut)"
                {...register('cropName')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
              />
              {errors.cropName && <p className="text-xs text-red-600 mt-1">{errors.cropName.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Farm Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('selectFarmOptional')}
                </label>
                <select
                  {...register('farmId')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-xs transition"
                >
                  <option value="">-- No farm selected (General) --</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Growth Stage */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('growthStageLabel')}
                </label>
                <select
                  {...register('growthStage')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-xs transition"
                >
                  {GROWTH_STAGES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('whenNoticedLabel')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2 days ago, after heavy rain"
                  {...register('whenNoticed')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Report Language
                </label>
                <select
                  {...register('language')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-xs transition"
                >
                  <option value="en">English (Scientific & Regional)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('symptomsLabel')}
              </label>
              <textarea
                rows={3}
                placeholder={t('symptomsPlaceholder')}
                {...register('symptomsText')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('additionalNotesLabel')}
              </label>
              <input
                type="text"
                placeholder="e.g., Neighbouring fields also report similar leaf discoloration"
                {...register('additionalNotes')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-xl transition flex items-center justify-center gap-2 text-base"
          >
            <Sparkles className="w-5 h-5" />
            {t('runDiagnosisBtn')}
          </button>
        </form>
      )}
    </div>
  );
};
