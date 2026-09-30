import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../lib/api.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useToast } from '../context/ToastContext.js';
import { AdviceFormSchema, AdviceFormValues } from '../lib/schemas.js';
import { Farm } from '../components/FarmCard.js';
import {
  FileSpreadsheet,
  Sprout,
  Target,
  SunMedium,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react';

export const AdvicePage: React.FC = () => {
  const { t, language } = useLanguage();
  const { error } = useToast();
  const navigate = useNavigate();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [generating, setGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdviceFormValues>({
    resolver: zodResolver(AdviceFormSchema),
    defaultValues: {
      farmId: '',
      goal: 'maximize_yield',
      season: 'Kharif (Monsoon)',
      currentCrops: '',
      specificQuestions: '',
      language: language,
    },
  });

  const selectedFarmId = watch('farmId');
  const activeFarm = farms.find((f) => f.id === selectedFarmId);

  useEffect(() => {
    setValue('language', language);
  }, [language, setValue]);

  useEffect(() => {
    api
      .get('/farms')
      .then((res) => {
        const fetched = res.data.farms || [];
        setFarms(fetched);
        if (fetched.length > 0) {
          setValue('farmId', fetched[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingFarms(false));
  }, [setValue]);

  const onSubmit = async (data: AdviceFormValues) => {
    setGenerating(true);
    try {
      const res = await api.post('/advice', data);
      navigate(`/advice/${res.data.advice.id}`);
    } catch (err: any) {
      error('Advisory Failed', err.response?.data?.error || 'Could not generate advice report');
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Precision Soil & Crop Advisory Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('adviceTitle')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t('adviceSubtitle')}</p>
      </div>

      {generating ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-emerald-200 shadow-xl space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-emerald-50 flex items-center justify-center text-2xl">
              🌱
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {t('generatingAdviceText')}
            </h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Analyzing soil pH, organic matter baseline, regional rainfall patterns, and optimal variety suitability.
            </p>
          </div>
        </div>
      ) : farms.length === 0 && !loadingFarms ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Please Create a Farm Profile First</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            To generate personalized crop and soil advice, we need your farm's location, soil type, and irrigation data.
          </p>
          <Link
            to="/farms"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Add Your Farm Profile
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Farm Selection Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('selectFarmRequired')}
              </label>
              <Link to="/farms" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                + Manage Farms
              </Link>
            </div>

            <select
              {...register('farmId')}
              className="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-xs font-semibold text-slate-800"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.district ? f.district + ', ' : ''}{f.state} • {f.soilType})
                </option>
              ))}
            </select>
            {errors.farmId && <p className="text-xs text-red-600 mt-1">{errors.farmId.message}</p>}

            {/* Active Farm Quick Context Preview */}
            {activeFarm && (
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-wrap gap-4 text-xs text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Soil Type</span>
                  <span className="font-semibold text-emerald-900">{activeFarm.soilType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">pH Value</span>
                  <span className="font-semibold text-emerald-900">{activeFarm.soilPh || 'Not tested'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Irrigation</span>
                  <span className="font-semibold text-emerald-900">{activeFarm.irrigationMethod}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Size</span>
                  <span className="font-semibold text-emerald-900">{activeFarm.farmSizeAcres || 'N/A'} Acres</span>
                </div>
              </div>
            )}
          </div>

          {/* Goal & Season Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Objectives & Agricultural Timing
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('farmingGoalLabel')}
                </label>
                <select
                  {...register('goal')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-xs transition"
                >
                  <option value="maximize_yield">{t('goalYield')}</option>
                  <option value="minimize_cost">{t('goalCost')}</option>
                  <option value="organic_transition">{t('goalOrganic')}</option>
                  <option value="drought_resilience">{t('goalDrought')}</option>
                  <option value="pest_recovery">{t('goalRecovery')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('seasonLabel')}
                </label>
                <select
                  {...register('season')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-xs transition"
                >
                  <option value="Kharif (Monsoon / June-Oct)">Kharif (Monsoon / June-Oct)</option>
                  <option value="Rabi (Winter / Oct-March)">Rabi (Winter / Oct-March)</option>
                  <option value="Zaid (Summer / March-June)">Zaid (Summer / March-June)</option>
                  <option value="Perennial / Year-Round Planting">Perennial / Year-Round Planting</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('currentCropsLabel')}
              </label>
              <input
                type="text"
                placeholder="e.g., Fallow soil, or harvested wheat stubble"
                {...register('currentCrops')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('specificQuestionsLabel')}
              </label>
              <textarea
                rows={3}
                placeholder="e.g. How to substitute chemical potash with organic alternatives? Should I intercrop pigeonpea with cotton?"
                {...register('specificQuestions')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Advisory Language
              </label>
              <select
                {...register('language')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-xs transition"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-xl transition flex items-center justify-center gap-2 text-base"
          >
            <Sparkles className="w-5 h-5" />
            {t('generateAdviceBtn')}
          </button>
        </form>
      )}
    </div>
  );
};
