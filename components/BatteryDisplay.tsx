
import React from 'react';

interface BatteryDisplayProps {
  percentage: number;
  label: string;
  statusTag: string;
}

const BatteryDisplay: React.FC<BatteryDisplayProps> = ({ percentage, label, statusTag }) => {
  const getTextColor = (p: number) => {
    if (p > 70) return 'text-emerald-600';
    if (p > 30) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getBorderColor = (p: number) => {
    if (p > 70) return 'border-emerald-100';
    if (p > 30) return 'border-amber-100';
    return 'border-rose-100';
  };

  // SVG parameters
  const size = 200;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = center - strokeWidth; // Leave room for stroke width
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 w-full overflow-visible">
      <div className="relative w-full max-w-[220px] aspect-square flex items-center justify-center">
        {/* SVG Ring with explicit viewBox to prevent clipping */}
        <svg 
          viewBox={`0 0 ${size} ${size}`} 
          className="w-full h-full transform -rotate-90 overflow-visible"
        >
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-100"
          />
          {/* Progress Indicator */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${getTextColor(percentage)} transition-all duration-1000 ease-out`}
          />
        </svg>
        
        {/* Inner Text content - using flexbox for precise spacing to prevent overlap */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <span className="text-5xl font-black text-gray-900 leading-none">
            {percentage}%
          </span>
          <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${getTextColor(percentage)} mt-3 text-center leading-tight max-w-[120px]`}>
            {label}
          </span>
        </div>
      </div>

      <div className={`mt-8 px-4 py-2 rounded-full bg-gray-50 border ${getBorderColor(percentage)} shadow-inner`}>
         <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">
          {statusTag}
        </span>
      </div>
    </div>
  );
};

export default BatteryDisplay;
