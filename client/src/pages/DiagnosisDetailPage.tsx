import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useToast } from '../context/ToastContext.js';
import { LoadingSkeleton } from '../components/LoadingSkeleton.js';
import { formatDate } from '../lib/utils.js';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  MessageSquareText,
  Calendar,
  Layers,
  Leaf,
  FlaskConical,
  HelpCircle,
  AlertOctagon,
} from 'lucide-react';

interface DiagnosisDetail {
  id: string;
  cropName: string;
  farmName?: string | null;
  imageUrl?: string | null;
  symptomsText?: string | null;
  confidenceScore: number;
  language: string;
  createdAt: string;
  aiResponse: {
    disease_name: string;
    scientific_name?: string | null;
    confidence_score: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    matched_symptoms: string[];
    possible_causes: string[];
    immediate_actions: string[];
    treatment_organic: string[];
    treatment_chemical: string[];
    prevention_tips: string[];
    when_to_seek_help: string;
    disclaimer: string;
  };
}

export const DiagnosisDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { error } = useToast();

  const [diagnosis, setDiagnosis] = useState<DiagnosisDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/diagnoses/${id}`)
      .then((res) => {
        setDiagnosis(res.data.diagnosis);
      })
      .catch((err) => {
        error('Error', err.response?.data?.error || 'Could not find diagnosis record');
        navigate('/diagnose');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingSkeleton type="article" />
      </div>
    );
  }

  if (!diagnosis) return null;

  const ai = diagnosis.aiResponse;

  const getSeverityColor = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return {
          bg: 'bg-red-500',
          badge: 'bg-red-100 text-red-800 border-red-200',
          text: 'text-red-700',
        };
      case 'high':
        return {
          bg: 'bg-amber-500',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          text: 'text-amber-700',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-500',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          text: 'text-yellow-700',
        };
      default:
        return {
          bg: 'bg-emerald-500',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          text: 'text-emerald-700',
        };
    }
  };

  const severityStyle = getSeverityColor(ai.severity);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back button & Action Bar */}
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
            initialQuery: `I need further advice on my recent diagnosis for ${diagnosis.cropName} affected by ${ai.disease_name}.`,
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <MessageSquareText className="w-4 h-4" />
          Ask Agronomist About This Issue
        </Link>
      </div>

      {/* Disease Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                {diagnosis.cropName}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${severityStyle.badge}`}
              >
                Severity: {ai.severity}
              </span>
              {diagnosis.farmName && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {diagnosis.farmName}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {ai.disease_name}
            </h1>

            {ai.scientific_name && (
              <p className="text-sm text-slate-500 italic font-serif">
                Scientific Identifier: {ai.scientific_name}
              </p>
            )}

            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
              <Calendar className="w-3.5 h-3.5" /> Diagnosed on {formatDate(diagnosis.createdAt)}
            </p>
          </div>

          {/* Confidence Score Gauge */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center flex-shrink-0 min-w-[140px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {t('confidence')}
            </span>
            <div className="text-3xl font-black text-emerald-700">
              {ai.confidence_score}%
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${ai.confidence_score}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">
              High Neural Match
            </span>
          </div>
        </div>

        {/* Image Attachment Preview if present */}
        {diagnosis.imageUrl && (
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 flex-shrink-0 shadow-sm">
              <img
                src={diagnosis.imageUrl}
                alt="Analyzed plant sample"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-xs text-slate-500">
              <p className="font-bold text-slate-700">Uploaded Sample Image</p>
              <p className="mt-0.5">Cellular and foliar leaf discoloration verified via Gemini Vision analysis.</p>
            </div>
          </div>
        )}
      </div>

      {/* Immediate Rescue Action Plan */}
      {ai.immediate_actions && ai.immediate_actions.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-300 rounded-3xl p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-lg">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            {t('immediateActions')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {ai.immediate_actions.map((act, i) => (
              <div
                key={i}
                className="p-3.5 bg-white/90 rounded-2xl border border-amber-200 text-xs text-slate-800 font-medium flex items-start gap-2 shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  {i + 1}
                </div>
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Symptoms & Causes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Symptoms */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            {t('matchedSymptoms')}
          </h2>
          <ul className="space-y-2 mt-2">
            {ai.matched_symptoms.map((sym, i) => (
              <li key={i} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                <span>{sym}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Possible Causes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-700" />
            {t('possibleCauses')}
          </h2>
          <ul className="space-y-2 mt-2">
            {ai.possible_causes.map((cause, i) => (
              <li key={i} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></span>
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Treatment Protocols: Organic vs Chemical */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organic Remedies */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('organicTreatments')}</h2>
              <p className="text-xs text-emerald-700">Eco-friendly & residue-free options</p>
            </div>
          </div>

          <div className="space-y-3">
            {ai.treatment_organic.map((treat, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-700 leading-relaxed">
                {treat}
              </div>
            ))}
          </div>
        </div>

        {/* Chemical Treatments (with Safety Precautions) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('chemicalTreatments')}</h2>
              <p className="text-xs text-slate-500">Requires protective equipment & proper dosage</p>
            </div>
          </div>

          <div className="space-y-3">
            {ai.treatment_chemical.map((treat, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {treat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prevention Checklist */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emerald-600" />
          {t('preventionTips')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {ai.prevention_tips.map((tip, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* When to seek expert help & Scientific Disclaimer */}
      <div className="space-y-4">
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-amber-950">{t('whenToSeekHelp')}</p>
            <p className="mt-1 leading-relaxed">{ai.when_to_seek_help}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-100 text-slate-500 text-[11px] leading-relaxed">
          <strong className="text-slate-700 block mb-0.5">{t('disclaimer')}:</strong>
          {ai.disclaimer}
        </div>
      </div>
    </div>
  );
};
