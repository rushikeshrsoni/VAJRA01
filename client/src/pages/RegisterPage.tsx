import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { RegisterFormSchema, RegisterFormValues } from '../lib/schemas.js';
import { UserPlus, Sparkles, User, Mail, Lock, Phone, Globe, MapPin } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const { success, error } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      preferredLanguage: 'en',
      regionState: 'Maharashtra',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setSubmitting(true);
    try {
      await registerAuth(data);
      success('Account Created', 'Welcome to CropPilot AI! Your agricultural dashboard is ready.');
      navigate('/dashboard');
    } catch (err: any) {
      error('Registration Failed', err.response?.data?.error || 'Could not register user account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 border border-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-100 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/20">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('registerTitle')}
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            {t('registerSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t('fullNameLabel')} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                {...register('fullName')}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
              />
            </div>
            {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('emailLabel')} *
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
                {t('phoneLabel')}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  {...register('phone')}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t('passwordLabel')} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="At least 6 characters"
                {...register('password')}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
              />
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('preferredLangLabel')}
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select
                  {...register('preferredLanguage')}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-xs transition"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('regionStateLabel')}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select
                  {...register('regionState')}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-xs transition"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 text-sm mt-3"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t('registerBtn')}
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 underline">
            {t('loginBtn')}
          </Link>
        </p>
      </div>
    </div>
  );
};
