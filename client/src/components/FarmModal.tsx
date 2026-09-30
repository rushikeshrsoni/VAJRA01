import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Sprout } from 'lucide-react';
import { FarmFormSchema, FarmFormValues } from '../lib/schemas.js';
import { Farm } from './FarmCard.js';
import { useLanguage } from '../context/LanguageContext.js';

interface FarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  initialData?: Farm | null;
  loading?: boolean;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const SOIL_TYPES = [
  'Black Soil (Regur)',
  'Alluvial Soil',
  'Red & Yellow Soil',
  'Laterite Soil',
  'Clay Loam',
  'Sandy Loam',
  'Arid / Desert Soil',
  'Saline / Alkaline Soil',
  'Peaty / Marshy Soil',
];

const IRRIGATION_METHODS = [
  'Drip Irrigation',
  'Sprinkler Irrigation',
  'Canal / Flood Irrigation',
  'Rainfed (Monsoon Dependent)',
  'Borewell / Tube Well',
  'Furrow / Basin Irrigation',
];

export const FarmModal: React.FC<FarmModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FarmFormValues>({
    resolver: zodResolver(FarmFormSchema),
    defaultValues: {
      name: '',
      state: 'Maharashtra',
      district: '',
      soilType: 'Black Soil (Regur)',
      soilPh: 7.0,
      organicMatter: 'Medium',
      irrigationMethod: 'Drip Irrigation',
      farmSizeAcres: 5,
      primaryCrops: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        state: initialData.state,
        district: initialData.district || '',
        soilType: initialData.soilType,
        soilPh: initialData.soilPh || null,
        organicMatter: initialData.organicMatter || 'Medium',
        irrigationMethod: initialData.irrigationMethod,
        farmSizeAcres: initialData.farmSizeAcres || null,
        primaryCrops: initialData.primaryCrops?.join(', ') || '',
        notes: initialData.notes || '',
      });
    } else {
      reset({
        name: '',
        state: 'Maharashtra',
        district: '',
        soilType: 'Black Soil (Regur)',
        soilPh: 7.0,
        organicMatter: 'Medium',
        irrigationMethod: 'Drip Irrigation',
        farmSizeAcres: 5,
        primaryCrops: '',
        notes: '',
      });
    }
  }, [initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: FarmFormValues) => {
    // Process comma separated primary crops into array
    const cropsArray = data.primaryCrops
      ? data.primaryCrops
          .split(',')
          .map((c) => c.trim())
          .filter((c) => c.length > 0)
      : [];

    await onSubmit({
      ...data,
      primaryCrops: cropsArray,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {initialData ? t('edit') : t('addFarmBtn')}
              </h2>
              <p className="text-xs text-slate-500">{t('farmsSubtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t('farmName')} *
            </label>
            <input
              type="text"
              placeholder="e.g., Sunrise Organic Orchard"
              {...register('name')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('state')} *
              </label>
              <select
                {...register('state')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-xs transition"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('district')}
              </label>
              <input
                type="text"
                placeholder="e.g., Nashik, Pune, etc."
                {...register('district')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('soilType')} *
              </label>
              <select
                {...register('soilType')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-xs transition"
              >
                {SOIL_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {errors.soilType && <p className="text-xs text-red-600 mt-1">{errors.soilType.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('irrigationMethod')} *
              </label>
              <select
                {...register('irrigationMethod')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-xs transition"
              >
                {IRRIGATION_METHODS.map((im) => (
                  <option key={im} value={im}>
                    {im}
                  </option>
                ))}
              </select>
              {errors.irrigationMethod && (
                <p className="text-xs text-red-600 mt-1">{errors.irrigationMethod.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('soilPh')} (0 - 14)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="6.5 - 7.5"
                {...register('soilPh')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('organicMatter')}
              </label>
              <select
                {...register('organicMatter')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white shadow-xs transition"
              >
                <option value="Low">Low (&lt; 0.5%)</option>
                <option value="Medium">Medium (0.5% - 0.75%)</option>
                <option value="High">High (&gt; 0.75%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t('farmSize')}
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="Acres"
                {...register('farmSizeAcres')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t('primaryCrops')} (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g., Tomato, Wheat, Soybean, Cotton"
              {...register('primaryCrops')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t('notes')}
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Plot has gentle eastern slope, borewell water is moderately hard..."
              {...register('notes')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-xs transition"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('loading')}
                </>
              ) : (
                t('save')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
