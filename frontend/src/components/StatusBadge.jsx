import React from 'react';

export default function StatusBadge({ status = 'ready', text }) {
  const styles = {
    ready: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 dot-bg-emerald-400',
    analyzing: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const currentStyle = styles[status] || styles.ready;
  const label = text || (status === 'analyzing' ? 'Model Analyzing...' : status === 'completed' ? 'Analysis Complete' : 'System Ready');

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${currentStyle}`}>
      <span className="relative flex h-2 w-2">
        {status === 'analyzing' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'analyzing' ? 'bg-cyan-400' : 'bg-emerald-400'}`}></span>
      </span>
      <span>{label}</span>
    </div>
  );
}
