import React from 'react';

/**
 * ScoreGauge — Circular pastel ring metric gauge
 * Inspired by the prominent circular confidence dial in Reference 2.
 */
export default function ScoreGauge({ 
  value = 85, 
  size = 110, 
  strokeWidth = 10,
  label = 'Clinical Match', 
  confidence = 'High'
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EFE8DE"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Gradient Stroke */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8AAEA1" />
              <stop offset="50%" stopColor="#E5CBA2" />
              <stop offset="100%" stopColor="#D97757" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Metric Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-2xl sm:text-3xl font-bold text-[#2D2623] tracking-tight leading-none">
            {clampedValue}%
          </span>
          <span className="text-[10px] font-semibold text-[#8E8078] uppercase tracking-wider mt-0.5">
            {confidence}
          </span>
        </div>
      </div>

      {label && (
        <span className="text-xs font-semibold text-[#5E524C] mt-2">
          {label}
        </span>
      )}
    </div>
  );
}
