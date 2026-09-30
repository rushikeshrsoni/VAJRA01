import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useToast } from '../context/ToastContext.js';
import { FarmModal } from '../components/FarmModal.js';
import { LoadingSkeleton } from '../components/LoadingSkeleton.js';
import { formatDate } from '../lib/utils.js';
import {
  Sprout,
  ShieldAlert,
  FileSpreadsheet,
  MessageSquareText,
  Plus,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Calendar,
  CloudSun,
} from 'lucide-react';

interface DashboardData {
  counts: {
    farms: number;
    diagnoses: number;
    adviceReports: number;
    chatSessions: number;
  };
  recentDiagnoses: Array<{
    id: string;
    crop_name: string;
    image_url: string | null;
    confidence_score: number;
    created_at: string;
    disease_name: string;
    severity: string;
    farm_name: string | null;
  }>;
  recentAdvice: Array<{
    id: string;
    created_at: string;
    goal: string;
    season: string;
    farm_name: string | null;
  }>;
  recentChats: Array<{
    id: string;
    title: string;
    updated_at: string;
    last_message: string | null;
  }>;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [farmModalOpen, setFarmModalOpen] = useState(false);
  const [savingFarm, setSavingFarm] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/stats/dashboard');
      setData(res.data);
    } catch (err: any) {
      error('Dashboard Load Error', err.response?.data?.error || 'Could not fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateFarm = async (farmValues: any) => {
    setSavingFarm(true);
    try {
      await api.post('/farms', farmValues);
      success('Farm Added', 'New farm profile has been created.');
      setFarmModalOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      error('Error', err.response?.data?.error || 'Could not create farm profile');
    } finally {
      setSavingFarm(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <LoadingSkeleton type="cards" rows={4} />
        <LoadingSkeleton type="table" rows={4} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Weather Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-100/90 relative overflow-hidden bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              {t('dashboardTitle')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('dashboardWelcome')} {user?.fullName}!
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-xl">
              Monitor active plots, analyze plant health issues with Gemini Vision, and receive real-time agronomic recommendations.
            </p>
          </div>

          {/* Quick weather / location badge */}
          <div className="flex items-center gap-4 bg-white/90 p-4 rounded-2xl border border-slate-200/80 shadow-xs flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CloudSun className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Agro-Climate Zone
              </span>
              <span className="font-extrabold text-slate-800 text-sm">
                {user?.regionState || 'Central Agricultural Zone'}
              </span>
              <span className="text-[11px] text-emerald-700 block font-medium">Optimal Planting Season</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Farms Stat */}
        <Link
          to="/farms"
          className="glass-card rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-all duration-200 group border border-slate-200/80"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('statFarms')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{data?.counts.farms || 0}</div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 group-hover:text-emerald-700 transition">
            Manage profiles <ArrowRight className="w-3 h-3" />
          </p>
        </Link>

        {/* Diagnoses Stat */}
        <Link
          to="/diagnose"
          className="glass-card rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-all duration-200 group border border-slate-200/80"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('statDiagnoses')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{data?.counts.diagnoses || 0}</div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 group-hover:text-emerald-700 transition">
            Scan new crop <ArrowRight className="w-3 h-3" />
          </p>
        </Link>

        {/* Advice Stat */}
        <Link
          to="/advice"
          className="glass-card rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-all duration-200 group border border-slate-200/80"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('statAdvice')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{data?.counts.adviceReports || 0}</div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 group-hover:text-emerald-700 transition">
            View plans <ArrowRight className="w-3 h-3" />
          </p>
        </Link>

        {/* Chats Stat */}
        <Link
          to="/chat"
          className="glass-card rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-all duration-200 group border border-slate-200/80"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('statChats')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquareText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{data?.counts.chatSessions || 0}</div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 group-hover:text-emerald-700 transition">
            Open chat <ArrowRight className="w-3 h-3" />
          </p>
        </Link>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">{t('quickActions')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/diagnose"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 shadow-xs transition duration-150 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                {t('actionDiagnose')}
              </p>
              <p className="text-xs text-slate-500">Photo / symptoms scan</p>
            </div>
          </Link>

          <Link
            to="/advice"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 shadow-xs transition duration-150 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition">
                {t('actionAdvice')}
              </p>
              <p className="text-xs text-slate-500">Customized soil & NPK</p>
            </div>
          </Link>

          <Link
            to="/chat"
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 shadow-xs transition duration-150 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                {t('actionChat')}
              </p>
              <p className="text-xs text-slate-500">English & हिन्दी Chat</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setFarmModalOpen(true)}
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-dashed border-emerald-400 hover:bg-emerald-50/40 shadow-xs transition duration-150 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                {t('actionNewFarm')}
              </p>
              <p className="text-xs text-slate-500">Register new field plot</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Grids: Recent Diagnoses & Recent Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Diagnoses Card */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-bold text-slate-900">{t('recentDiagnoses')}</h2>
            </div>
            <Link
              to="/history"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              All Records <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {(!data?.recentDiagnoses || data.recentDiagnoses.length === 0) ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">{t('noRecentDiagnoses')}</p>
              <Link
                to="/diagnose"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition"
              >
                Start First Diagnosis <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentDiagnoses.map((diag) => (
                <div
                  key={diag.id}
                  onClick={() => navigate(`/diagnose/${diag.id}`)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/60 border border-slate-200/60 hover:border-emerald-300 transition cursor-pointer group"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition truncate">
                        {diag.crop_name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                          diag.severity
                        )}`}
                      >
                        {diag.severity?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 truncate font-medium">
                      {diag.disease_name || 'Crop pathology evaluated'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formatDate(diag.created_at)}
                      {diag.farm_name && ` • ${diag.farm_name}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-emerald-700 block">
                      {diag.confidence_score}% match
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-0.5 justify-end group-hover:text-emerald-700 font-semibold">
                      {t('viewDetails')} <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Advice Reports Card */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">{t('recentAdvice')}</h2>
            </div>
            <Link
              to="/history"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              All Plans <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {(!data?.recentAdvice || data.recentAdvice.length === 0) ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">{t('noRecentAdvice')}</p>
              <Link
                to="/advice"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition"
              >
                Create Soil & Crop Plan <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentAdvice.map((adv) => (
                <div
                  key={adv.id}
                  onClick={() => navigate(`/advice/${adv.id}`)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/60 border border-slate-200/60 hover:border-emerald-300 transition cursor-pointer group"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition truncate">
                        {adv.farm_name || 'Farm Advisory Plan'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {adv.season}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 truncate font-medium">
                      Goal: {adv.goal?.replace('_', ' ')}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formatDate(adv.created_at)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[11px] text-slate-400 flex items-center gap-0.5 justify-end group-hover:text-emerald-700 font-semibold">
                      {t('viewDetails')} <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Chats Card */}
      {data?.recentChats && data.recentChats.length > 0 && (
        <div className="glass-card rounded-3xl p-6 border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquareText className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">{t('recentChats')}</h2>
            </div>
            <Link
              to="/chat"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Open Agronomist <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.recentChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => navigate('/chat', { state: { sessionId: chat.id } })}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/60 hover:border-blue-300 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition truncate">
                    {chat.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">
                    {formatDate(chat.updated_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {chat.last_message || 'Consultation thread active'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Farm Create Modal */}
      <FarmModal
        isOpen={farmModalOpen}
        onClose={() => setFarmModalOpen(false)}
        onSubmit={handleCreateFarm}
        loading={savingFarm}
      />
    </div>
  );
};
