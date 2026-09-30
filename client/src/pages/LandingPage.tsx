import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  ShieldAlert,
  Sprout,
  MessageSquareText,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Globe2,
  Check,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    try {
      await login({
        email: 'kisan@croppilot.ai',
        password: 'FarmPilot@2025',
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login error', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-800 text-xs sm:text-sm font-semibold border border-emerald-200 shadow-xs mb-8">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            {t('heroBadge')}
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
            Smart Farming Advisory for <span className="gradient-heading">Higher Yields</span> & Healthier Soil
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-xl transition-all group"
              >
                {t('heroExploreDashboard')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-xl transition-all group text-base"
                >
                  {t('heroStartDiagnosis')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-2xl border border-slate-300 shadow-sm transition-all text-sm"
                >
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {t('demoFillBtn')}
                </button>
              </>
            )}
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Free for Smallholder Farmers
            </span>
            <span className="flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-emerald-600" /> Full Hindi & English Support
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-600" /> Safe Chemical & Organic Guidance
            </span>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {t('heroFeaturesTitle')}
            </h2>
            <p className="mt-3 text-base text-slate-600">
              {t('heroFeaturesSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-emerald-50/30 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-6 shadow-xs">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {t('feature1Title')}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t('feature1Desc')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-bold text-emerald-700">
                <span>Gemini Vision AI</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-emerald-50/30 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6 shadow-xs">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {t('feature2Title')}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t('feature2Desc')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-bold text-emerald-700">
                <span>Tailored NPK & Irrigation</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-emerald-50/30 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 shadow-xs">
                  <MessageSquareText className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {t('feature3Title')}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t('feature3Desc')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-bold text-emerald-700">
                <span>English & हिन्दी Audio-Ready</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-emerald-50/30 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6 shadow-xs">
                  <Sprout className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {t('feature4Title')}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t('feature4Desc')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-bold text-emerald-700">
                <span>Plot RLS Data Security</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Steps */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              How CropPilot AI Works For You
            </h2>
            <p className="mt-2 text-slate-600">
              From quick smartphone photo to actionable rescue plan in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs relative">
              <span className="text-5xl font-black text-emerald-100 absolute top-6 right-6">01</span>
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-6">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Snap & Upload</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Take a close-up photo of infected leaves or stems using your mobile camera or type symptoms.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs relative">
              <span className="text-5xl font-black text-emerald-100 absolute top-6 right-6">02</span>
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-6">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">AI Diagnostic Inspection</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Gemini Vision matches cellular foliar patterns, lesions, and fungal spores against plant pathology databases.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs relative">
              <span className="text-5xl font-black text-emerald-100 absolute top-6 right-6">03</span>
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-6">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Actionable Treatment Plan</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive organic remedies, bio-stimulants, and exact chemical dosages with critical safety warnings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-16 bg-gradient-to-tr from-emerald-800 to-teal-900 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Protect Your Crops and Boost Soil Health?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto">
            Join CropPilot AI today. No credit card required. Free for all farmers, agronomists, and growers.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 font-bold rounded-xl shadow-lg transition"
            >
              {t('navRegister')}
            </Link>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700/60 hover:bg-emerald-700 text-white font-semibold rounded-xl border border-emerald-500/50 transition"
            >
              {t('demoFillBtn')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌾</span>
            <span className="text-sm font-bold text-white">CropPilot AI</span>
            <span>– AI-Powered Agriculture Crop Advisory Assistant</span>
          </div>
          <div className="text-center sm:text-right">
            <p>Developed with Google Gemini AI + PostgreSQL Row Level Security.</p>
            <p className="mt-1 text-slate-500">
              Disclaimer: AI recommendations should be corroborated with local extension officers for final application.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
