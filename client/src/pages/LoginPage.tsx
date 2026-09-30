import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { LoginFormSchema, LoginFormValues } from '../lib/schemas.js';
import { LogIn, Sparkles, Zap, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setSubmitting(true);
    try {
      await login(data);
      success('Logged In Successfully', 'Welcome back to CropPilot AI.');
      navigate(from, { replace: true });
    } catch (err: any) {
      error('Login Failed', err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setValue('email', 'kisan@croppilot.ai');
    setValue('password', 'FarmPilot@2025');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-100 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/20">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('loginTitle')}
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            {t('loginSubtitle')}
          </p>
        </div>

        {/* Demo Account Quick Pill */}
        <div className="mb-6 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold text-emerald-950">Pre-seeded Farmer Profile</p>
              <p className="text-[11px] text-emerald-700">kisan@croppilot.ai</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300 shadow-xs transition"
          >
            Auto-Fill
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t('emailLabel')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="farmer@example.com"
                {...register('email')}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
              />
            </div>
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t('passwordLabel')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
              />
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 text-sm mt-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t('loginBtn')}
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          {t('dontHaveAccount')}{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 underline">
            {t('registerBtn')}
          </Link>
        </p>
      </div>
    </div>
  );
};
