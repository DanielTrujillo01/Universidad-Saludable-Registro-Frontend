import React from 'react';
import { BarChart3 } from 'lucide-react';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const DataCardGrid = ({ 
  title = "Acciones Vinculadas", 
  icon: Icon = BarChart3, 
  data = [], 
  totalCount,
  labelTotal = "acciones",
  onItemClick 
}) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-slate-800 font-semibold flex items-center gap-2">
          <Icon className="w-4 h-4 text-violet-500" />
          {title}
        </h3>
        <span className="text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-semibold">
          {totalCount ?? data.length} {labelTotal}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((item, index) => {
          // Determinamos si es presionable
          const isClickable = !!onItemClick;

          return (
            <div
              key={item.id || index}
              onClick={() => isClickable && onItemClick(item)}
              role={isClickable ? "button" : "article"}
              tabIndex={isClickable ? 0 : undefined}
              className={`
                border border-slate-200 rounded-xl p-4 transition
                ${isClickable 
                  ? 'bg-slate-50 hover:bg-slate-100 hover:border-slate-300 cursor-pointer active:scale-[0.98]' 
                  : 'bg-slate-50'}
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-slate-800">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{item.subtitle}</p>
                </div>
                <div
                  className="w-3 h-3 rounded-full mt-1"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {item.stats?.map((stat, sIndex) => (
                  <div key={sIndex} className="bg-white border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-500 uppercase">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DataCardGrid;