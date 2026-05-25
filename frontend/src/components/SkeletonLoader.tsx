import React from 'react';

interface SkeletonLoaderProps {
  type: 'card' | 'table' | 'detail' | 'profile';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 1 }) => {
  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-lg h-[400px] flex flex-col p-6 space-y-4">
          <div className="w-full h-44 rounded-xl animate-skeleton shrink-0" />
          <div className="h-4 w-1/4 rounded animate-skeleton" />
          <div className="h-6 w-3/4 rounded animate-skeleton" />
          <div className="space-y-2 flex-grow">
            <div className="h-3 w-full rounded animate-skeleton" />
            <div className="h-3 w-5/6 rounded animate-skeleton" />
            <div className="h-3 w-4/5 rounded animate-skeleton" />
          </div>
          <div className="pt-4 border-t border-white/5 flex justify-between">
            <div className="h-6 w-16 rounded animate-skeleton" />
            <div className="h-6 w-20 rounded animate-skeleton" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderTable = () => (
    <div className="glass-panel border border-white/5 rounded-xl overflow-hidden shadow-md mt-4">
      <div className="animate-skeleton h-12 border-b border-white/5" />
      <div className="divide-y divide-white/5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-5 flex items-center justify-between gap-4">
            <div className="h-4 w-1/4 rounded animate-skeleton" />
            <div className="h-4 w-1/5 rounded animate-skeleton" />
            <div className="h-4 w-1/6 rounded animate-skeleton" />
            <div className="h-4 w-1/12 rounded animate-skeleton" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderDetail = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-6">
        <div className="w-full h-80 sm:h-96 rounded-2xl animate-skeleton" />
        <div className="flex gap-4">
          <div className="h-14 flex-1 rounded-xl animate-skeleton" />
          <div className="h-14 flex-1 rounded-xl animate-skeleton" />
          <div className="h-14 flex-1 rounded-xl animate-skeleton" />
        </div>
        <div className="glass-panel p-8 border border-white/5 rounded-2xl space-y-4 shadow-lg">
          <div className="h-8 w-1/2 rounded animate-skeleton" />
          <div className="h-4 w-1/4 border-b border-white/5 pb-2 animate-skeleton" />
          <div className="space-y-3 pt-2">
            <div className="h-4 w-full rounded animate-skeleton" />
            <div className="h-4 w-full rounded animate-skeleton" />
            <div className="h-4 w-5/6 rounded animate-skeleton" />
            <div className="h-4 w-4/5 rounded animate-skeleton" />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="glass-panel p-8 border border-white/5 rounded-2xl space-y-6 shadow-lg">
          <div className="h-6 w-1/3 rounded animate-skeleton" />
          <div className="flex items-center gap-4 py-4 border-b border-white/5">
            <div className="w-16 h-16 rounded-full animate-skeleton shrink-0" />
            <div className="space-y-2 flex-grow">
              <div className="h-4 w-2/3 rounded animate-skeleton" />
              <div className="h-3.5 w-1/2 rounded animate-skeleton" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded animate-skeleton" />
            <div className="h-3 w-5/6 rounded animate-skeleton" />
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-10 w-full rounded-lg animate-skeleton" />
            <div className="h-10 w-full rounded-lg animate-skeleton" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-xl mx-auto glass-panel p-8 border border-white/5 rounded-2xl space-y-6 shadow-lg text-center">
      <div className="w-28 h-28 rounded-full animate-skeleton mx-auto" />
      <div className="h-6 w-1/3 rounded animate-skeleton mx-auto" />
      <div className="h-4 w-1/4 rounded animate-skeleton mx-auto" />
      <div className="space-y-2 py-4">
        <div className="h-3 w-full rounded animate-skeleton" />
        <div className="h-3 w-5/6 rounded animate-skeleton mx-auto" />
      </div>
      <div className="space-y-3 pt-4 text-left border-t border-white/5">
        <div className="h-4 w-1/3 rounded animate-skeleton" />
        <div className="h-4 w-full rounded animate-skeleton" />
        <div className="h-4 w-2/3 rounded animate-skeleton" />
      </div>
    </div>
  );

  switch (type) {
    case 'card':
      return renderCards();
    case 'table':
      return renderTable();
    case 'detail':
      return renderDetail();
    case 'profile':
      return renderProfile();
    default:
      return null;
  }
};
