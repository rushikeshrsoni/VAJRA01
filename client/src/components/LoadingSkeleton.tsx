import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; type?: 'cards' | 'table' | 'article' }> = ({
  rows = 3,
  type = 'cards',
}) => {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-slate-200 rounded w-1/2"></div>
              <div className="h-5 bg-slate-100 rounded-full w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6"></div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-slate-100 rounded-full w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 animate-pulse space-y-6 max-w-4xl mx-auto">
      <div className="h-8 bg-slate-200 rounded w-2/3"></div>
      <div className="h-4 bg-slate-100 rounded w-1/3"></div>
      <div className="space-y-3 pt-4">
        <div className="h-4 bg-slate-100 rounded w-full"></div>
        <div className="h-4 bg-slate-100 rounded w-full"></div>
        <div className="h-4 bg-slate-100 rounded w-4/5"></div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="h-24 bg-slate-100 rounded-xl"></div>
        <div className="h-24 bg-slate-100 rounded-xl"></div>
      </div>
    </div>
  );
};
