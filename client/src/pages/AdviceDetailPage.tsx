import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useToast } from '../context/ToastContext.js';
import { LoadingSkeleton } from '../components/LoadingSkeleton.js';
import { formatDate } from '../lib/utils.js';
import {
  FileSpreadsheet,
  ArrowLeft,
  Sparkles,
  Sprout,
  Droplets,
  Layers,
  ShieldAlert,
  Sun,
  MessageSquareText,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface AdviceDetail {
  id: string;
  farmName?: string | null;
  language: string;
  createdAt: string;
  requestPayload: any;
  aiResponse: {
    crop_recommendations: Array<{
      crop_name: string;
      variety_suggestions: string[];
      suitability_reason: string;
      expected_duration: string;
    }>;
    soil_health_assessment: {
      current_status: string;
      organic_matter_advice: string;
      ph_correction: string;
      deficiencies_to_watch: string[];
    };
    fertilizer_schedule: Array<{
      stage: string;
      nutrients: string;
      organic_alternative: string;
      application_method: string;
    }>;
    irrigation_plan: {
      method: string;
      frequency: string;
      water_conservation_tips: string[];
    };
    pest_and_disease_risk: {
      key_threats: string[];
      preventive_measures: string[];
    };
    climate_resilience_tips: string[];
    actionable_summary: string;
    disclaimer: string;
  };
}

export const AdviceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { error } = useToast();

  const [report, setReport] = useState<AdviceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/advice/${id}`)
      .then((res) => {
        setReport(res.data.report);
      })
      .catch((err) => {
        error('Error', err.response?.data?.error || 'Could not load advice report');
        navigate('/advice');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <LoadingSkeleton type="article" />
      </div>
    );
  }

  if (!report) return null;

  const ai = report.aiResponse;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> {t('back')} to History
        </Link>

        <Link
          to="/chat"
          state={{
            initialQuery: `I want to discuss my soil and crop advisory report for ${report.farmName}.`,
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <MessageSquareText className="w-4 h-4" />
          Discuss Plan with Agronomist
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md relative overflow-hidden space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
            {report.farmName || 'Agricultural Advisory'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {report.requestPayload?.season || 'Seasonal Plan'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 capitalize">
            Goal: {report.requestPayload?.goal?.replace('_', ' ') || 'High Yield'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Personalized Soil & Crop Advisory
        </h1>

        <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
          <Calendar className="w-3.5 h-3.5" /> Generated on {formatDate(report.createdAt)}
        </p>

        {/* Actionable Executive Summary */}
        <div className="mt-4 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-sm text-emerald-950 font-medium leading-relaxed">
          <div className="flex items-center gap-2 font-extrabold text-emerald-900 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Executive Summary
          </div>
          {ai.actionable_summary}
        </div>
      </div>

      {/* Crop Recommendations Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900">Recommended Crops & Varieties</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ai.crop_recommendations.map((crop, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <h3 className="font-extrabold text-base text-slate-900 mb-1">{crop.crop_name}</h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-3">
                  Duration: {crop.expected_duration}
                </span>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {crop.suitability_reason}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                  High-Yielding Varieties
                </span>
                <div className="flex flex-wrap gap-1">
                  {crop.variety_suggestions.map((v, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Soil Health & Nutrition Audit */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Layers className="w-6 h-6 text-amber-700" />
          <h2 className="text-xl font-bold text-slate-900">Soil Health Assessment & Corrections</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-slate-800 block mb-1">Current Soil Status:</span>
            <p className="text-slate-600 leading-relaxed">{ai.soil_health_assessment.current_status}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-slate-800 block mb-1">Organic Carbon & Matter:</span>
            <p className="text-slate-600 leading-relaxed">{ai.soil_health_assessment.organic_matter_advice}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-slate-800 block mb-1">pH Adjustment Protocol:</span>
            <p className="text-slate-600 leading-relaxed">{ai.soil_health_assessment.ph_correction}</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
            <span className="font-bold text-amber-900 block mb-1.5">Critical Deficiencies to Monitor:</span>
            <div className="flex flex-wrap gap-1.5">
              {ai.soil_health_assessment.deficiencies_to_watch.map((def, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-white text-amber-900 font-bold rounded-md shadow-2xs border border-amber-200 text-[11px]">
                  {def}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stage-by-Stage Fertilizer Schedule */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          Fertilizer & Nutrition Schedule
        </h2>

        <div className="space-y-3">
          {ai.fertilizer_schedule.map((sched, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 md:w-1/3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Crop Stage {idx + 1}
                </span>
                <span className="font-extrabold text-sm text-slate-900 block">{sched.stage}</span>
                <span className="text-[11px] text-slate-500 italic block">{sched.application_method}</span>
              </div>

              <div className="space-y-1 md:w-1/3">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  Nutrients / Mineral Dose
                </span>
                <p className="text-xs font-semibold text-slate-800">{sched.nutrients}</p>
              </div>

              <div className="space-y-1 md:w-1/3">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Organic / Bio Alternative
                </span>
                <p className="text-xs font-medium text-emerald-900 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                  {sched.organic_alternative}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Irrigation & Water Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-blue-600 font-bold">
            <Droplets className="w-5 h-5" />
            <h3 className="text-base text-slate-900">Irrigation & Moisture Schedule</h3>
          </div>
          <div className="text-xs space-y-2 text-slate-600">
            <p>
              <strong>Method:</strong> {ai.irrigation_plan.method}
            </p>
            <p>
              <strong>Frequency:</strong> {ai.irrigation_plan.frequency}
            </p>
            <div className="pt-2">
              <span className="font-bold text-slate-800 block mb-1">Water Conservation:</span>
              <ul className="space-y-1">
                {ai.irrigation_plan.water_conservation_tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Pest & Disease Early Warnings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-red-600 font-bold">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-base text-slate-900">Early Pest & Pathogen Threat Shield</h3>
          </div>
          <div className="text-xs space-y-2 text-slate-600">
            <div>
              <span className="font-bold text-slate-800 block mb-1">Key Seasonal Threats:</span>
              <div className="flex flex-wrap gap-1">
                {ai.pest_and_disease_risk.key_threats.map((threat, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-semibold border border-red-100">
                    {threat}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <span className="font-bold text-slate-800 block mb-1">Preventive Measures:</span>
              <ul className="space-y-1">
                {ai.pest_and_disease_risk.preventive_measures.map((meas, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{meas}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Climate Resilience Tips */}
      {ai.climate_resilience_tips && ai.climate_resilience_tips.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-base">
            <Sun className="w-5 h-5 text-amber-600" />
            Climate Resilience & Weather Defense Strategies
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
            {ai.climate_resilience_tips.map((tip, i) => (
              <div key={i} className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 leading-relaxed">
                {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100 text-slate-500 text-[11px] leading-relaxed">
        <strong className="text-slate-700 block mb-0.5">{t('disclaimer')}:</strong>
        {ai.disclaimer}
      </div>
    </div>
  );
};
