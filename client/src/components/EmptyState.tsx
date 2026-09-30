import React from 'react';
import { LucideIcon, FolderSearch } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionTo?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderSearch,
  title,
  description,
  actionText,
  actionTo,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-500 max-w-md leading-relaxed">{description}</p>
      {(actionText && actionTo) && (
        <Link
          to={actionTo}
          className="mt-6 inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
        >
          {actionText}
        </Link>
      )}
      {(actionText && onAction && !actionTo) && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
