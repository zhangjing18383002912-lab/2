import React from 'react';
import { ChevronRight } from 'lucide-react';

interface InfoCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onMore?: () => void;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, icon, children, className = '', onMore }) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          {icon && <div className="text-teal-600 p-2 bg-teal-50 rounded-lg">{icon}</div>}
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
        </div>
        {onMore && (
           <button onClick={onMore} className="text-teal-500 hover:text-teal-700">
             <ChevronRight size={20} />
           </button>
        )}
      </div>
      <div className="text-slate-600 leading-relaxed text-sm md:text-base">
        {children}
      </div>
    </div>
  );
};