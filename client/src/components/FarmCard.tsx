import React from 'react';
import { MapPin, Droplets, Layers, Ruler, Edit2, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

export interface Farm {
  id: string;
  name: string;
  state: string;
  district?: string | null;
  soilType: string;
  soilPh?: number | null;
  organicMatter?: string | null;
  irrigationMethod: string;
  farmSizeAcres?: number | null;
  primaryCrops: string[];
  notes?: string | null;
  createdAt: string;
}

interface FarmCardProps {
  farm: Farm;
  onEdit: (farm: Farm) => void;
  onDelete: (id: string) => void;
}

export const FarmCard: React.FC<FarmCardProps> = ({ farm, onEdit, onDelete }) => {
  const { t } = useLanguage();

  return (
    <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-200 border border-slate-200/90 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
              {farm.name}
            </h3>
            <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              {farm.district ? `${farm.district}, ` : ''}{farm.state}
            </p>
          </div>
          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(farm)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
              title={t('edit')}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(farm.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
              title={t('delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 text-slate-700">
            <Layers className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <div className="truncate">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                {t('soilType')}
              </span>
              <span className="font-semibold text-slate-800">{farm.soilType}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 text-slate-700">
            <Droplets className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="truncate">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                {t('irrigationMethod')}
              </span>
              <span className="font-semibold text-slate-800">{farm.irrigationMethod}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 text-slate-700">
            <span className="text-sm font-bold text-emerald-700">pH</span>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                {t('soilPh')}
              </span>
              <span className="font-semibold text-slate-800">
                {farm.soilPh !== null && farm.soilPh !== undefined ? farm.soilPh : 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 text-slate-700">
            <Ruler className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                {t('farmSize')}
              </span>
              <span className="font-semibold text-slate-800">
                {farm.farmSizeAcres ? `${farm.farmSizeAcres} ac` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Primary crops pills */}
        {farm.primaryCrops && farm.primaryCrops.length > 0 && (
          <div className="mt-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
              {t('primaryCrops')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {farm.primaryCrops.map((crop, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                >
                  {crop}
                </span>
              ))}
            </div>
          </div>
        )}

        {farm.notes && (
          <p className="mt-3 text-xs text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
            "{farm.notes}"
          </p>
        )}
      </div>
    </div>
  );
};
