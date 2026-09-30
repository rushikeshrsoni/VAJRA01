import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useToast } from '../context/ToastContext.js';
import { formatDate } from '../lib/utils.js';
import {
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  ShieldCheck,
  Sparkles,
  Save,
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { t, setLanguage } = useLanguage();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'hi'>(
    user?.preferredLanguage || 'en'
  );
  const [regionState, setRegionState] = useState(user?.regionState || 'Maharashtra');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        fullName,
        phone,
        preferredLanguage,
        regionState,
      });
      setLanguage(preferredLanguage);
      success('Profile Updated', 'Your settings have been saved.');
    } catch (err: any) {
      error('Update Error', err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-8 h-8 text-emerald-600" />
          {t('navProfile')} & Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal details, language preference, and regional context.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-600 text-white text-3xl font-extrabold flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            {user?.fullName?.charAt(0).toUpperCase() || 'F'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.fullName}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>

          <div className="pt-4 border-t border-slate-100 text-left space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Row Level Security (RLS) Enforced</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Joined {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}</span>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('fullNameLabel')}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('emailLabel')} (Read-only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('phoneLabel')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('preferredLangLabel')}
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value as 'en' | 'hi')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-xs transition"
                >
                  <option value="en">English (Default)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('regionStateLabel')}
                </label>
                <select
                  value={regionState}
                  onChange={(e) => setRegionState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-xs transition"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-2 text-sm"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : t('save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
