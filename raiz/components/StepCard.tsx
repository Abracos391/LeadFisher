import React from 'react';

interface StepCardProps {
  title: string;
  icon: React.ReactNode;
  stepNumber: number;
  children: React.ReactNode;
  colorClass?: string;
}

const StepCard: React.FC<StepCardProps> = ({ title, icon, stepNumber, children, colorClass = "text-emerald-400" }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg mb-6 relative overflow-hidden group hover:border-slate-600 transition-all duration-300">
      <div className="absolute -right-4 -top-4 text-9xl font-bold text-slate-700/10 pointer-events-none select-none">
        {stepNumber}
      </div>
      
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className={`p-2 rounded-lg bg-slate-900 ${colorClass}`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">{title}</h3>
      </div>
      
      <div className="relative z-10 text-slate-300">
        {children}
      </div>
    </div>
  );
};

export default StepCard;
