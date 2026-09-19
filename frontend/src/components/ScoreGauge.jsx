import React, { useState, useEffect } from 'react';

/**
 * ScoreGauge — Circular pastel ring metric gauge with dynamic filling effect
 * Features smooth ease-out count-up animation and stroke progress filling.
 */
export default function ScoreGauge({ 
  value = 85, 
  size = 110, 
  strokeWidth = 10,
  label = 'Clinical Match', 
  confidence = 'High'
}) {
  const clampedValue = Math.min(Math.max(Math.round(value), 0), 100);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1100; // ms animation duration
    let animId;

    const animateFill = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Cubic ease-out curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(Math.round(easeOut * clampedValue));

      if (progress < 1) {
        animId = requestAnimationFrame(animateFill);
      }
    };

    // Reset to 0 and start animation
    setAnimatedValue(0);
    animId = requestAnimationFrame(animateFill);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [clampedValue]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Gradient Stroke */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
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
            style={{
              transition: 'stroke-dashoffset 80ms linear',
            }}
          />
        </svg>

        {/* Center Metric Display with Animated Count-Up */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-none">
            {animatedValue}%
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
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
