import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import { useLanguage } from '../context/LanguageContext.js';
import { LoadingSkeleton } from '../components/LoadingSkeleton.js';
import { EmptyState } from '../components/EmptyState.js';
import { formatDate } from '../lib/utils.js';
import {
  History,
  ShieldAlert,
  FileSpreadsheet,
  MessageSquareText,
  Search,
  Calendar,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'all' | 'diagnoses' | 'advice' | 'chats'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [adviceReports, setAdviceReports] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/diagnoses'),
      api.get('/advice'),
      api.get('/chat/sessions'),
    ])
      .then(([diagRes, advRes, chatRes]) => {
        setDiagnoses(diagRes.data.diagnoses || []);
        setAdviceReports(advRes.data.reports || []);
        setChats(chatRes.data.sessions || []);
      })
      .catch((err) => {
        console.error('Failed to load history', err);
      })
      .finally(() => setLoading(false));
  }, []);

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

  // Combine and filter records
  const q = searchQuery.toLowerCase().trim();

  const filteredDiagnoses = diagnoses.filter(
    (d) =>
      !q ||
      d.cropName?.toLowerCase().includes(q) ||
      d.farmName?.toLowerCase().includes(q) ||
      d.aiResponse?.disease_name?.toLowerCase().includes(q)
  );

  const filteredAdvice = adviceReports.filter(
    (a) =>
      !q ||
      a.farmName?.toLowerCase().includes(q) ||
      a.requestPayload?.goal?.toLowerCase().includes(q) ||
      a.requestPayload?.season?.toLowerCase().includes(q)
  );

  const filteredChats = chats.filter(
    (c) =>
      !q ||
      c.title?.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
  );

  const totalFilteredCount =
    (activeTab === 'all' || activeTab === 'diagnoses' ? filteredDiagnoses.length : 0) +
    (activeTab === 'all' || activeTab === 'advice' ? filteredAdvice.length : 0) +
    (activeTab === 'all' || activeTab === 'chats' ? filteredChats.length : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-8 h-8 text-emerald-600" />
            {t('historyTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('historySubtitle')}</p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm bg-white shadow-2xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('tabAll')} ({diagnoses.length + adviceReports.length + chats.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('diagnoses')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'diagnoses'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          {t('tabDiagnoses')} ({diagnoses.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('advice')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'advice'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          {t('tabAdvice')} ({adviceReports.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chats')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'chats'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquareText className="w-3.5 h-3.5" />
          {t('tabChats')} ({chats.length})
        </button>
      </div>

      {/* Content Stream */}
      {loading ? (
        <LoadingSkeleton type="table" rows={5} />
      ) : totalFilteredCount === 0 ? (
        <EmptyState
          icon={History}
          title="No records matching filter"
          description="Try changing your search query or start a new crop diagnosis or advisory session."
        />
      ) : (
        <div className="space-y-4">
          {/* Diagnoses Section */}
          {(activeTab === 'all' || activeTab === 'diagnoses') && filteredDiagnoses.length > 0 && (
            <div className="space-y-3">
              {activeTab === 'all' && (
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-2">
                  Plant Disease Diagnoses
                </h3>
              )}
              {filteredDiagnoses.map((diag) => (
                <div
                  key={diag.id}
                  onClick={() => navigate(`/diagnose/${diag.id}`)}
                  className="glass-card rounded-2xl p-4 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/90 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">
                          {diag.cropName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                            diag.aiResponse?.severity
                          )}`}
                        >
                          {diag.aiResponse?.severity?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {diag.aiResponse?.disease_name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> {formatDate(diag.createdAt)}
                        {diag.farmName && ` • Plot: ${diag.farmName}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4 justify-between sm:justify-end">
                    <span className="text-xs font-bold text-emerald-700">
                      {diag.confidenceScore}% confidence
                    </span>
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-emerald-700 flex items-center gap-1">
                      {t('viewDetails')} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Advice Reports Section */}
          {(activeTab === 'all' || activeTab === 'advice') && filteredAdvice.length > 0 && (
            <div className="space-y-3">
              {activeTab === 'all' && (
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-4">
                  Crop & Soil Advisory Reports
                </h3>
              )}
              {filteredAdvice.map((adv) => (
                <div
                  key={adv.id}
                  onClick={() => navigate(`/advice/${adv.id}`)}
                  className="glass-card rounded-2xl p-4 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/90 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">
                          {adv.farmName || 'Farm Advisory Plan'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {adv.requestPayload?.season}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        Goal: {adv.requestPayload?.goal?.replace('_', ' ')}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> {formatDate(adv.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4 justify-between sm:justify-end">
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-emerald-700 flex items-center gap-1">
                      {t('viewDetails')} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Agronomist Chats Section */}
          {(activeTab === 'all' || activeTab === 'chats') && filteredChats.length > 0 && (
            <div className="space-y-3">
              {activeTab === 'all' && (
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-4">
                  Agronomist Chat Consultations
                </h3>
              )}
              {filteredChats.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate('/chat', { state: { sessionId: c.id } })}
                  className="glass-card rounded-2xl p-4 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/90 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <MessageSquareText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition">
                          {c.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                          {c.language}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {c.lastMessage || 'Active session'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> {formatDate(c.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4 justify-between sm:justify-end">
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-700 flex items-center gap-1">
                      Continue Chat <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
