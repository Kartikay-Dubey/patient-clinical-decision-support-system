import React from 'react';
import { Activity, ShieldCheck, Sparkles } from 'lucide-react';

export default function Header({ onReset }) {
  return (
    <header className="border-b border-[#EAE3D9] bg-[#F8F5EE]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3.5 sm:py-4 gap-3">
          
          {/* System Identity */}
          <div 
            onClick={onReset}
            className={`flex items-center gap-3.5 ${onReset ? 'cursor-pointer group' : ''}`}
          >
            <div className="h-9 w-9 rounded-2xl bg-[#D97757] shadow-pill flex items-center justify-center text-white group-hover:bg-[#C46344] transition-all">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-[#2D2623] text-sm sm:text-base tracking-tight group-hover:text-[#D97757] transition-colors">
                  Patient Clinical Decision Support
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E5EFEA] text-[#2C4F43] border border-[#8AAEA1]/40 font-display">
                  <Sparkles className="h-2.5 w-2.5 text-[#3F6457]" /> 3D AI-Assisted
                </span>
              </div>
              <p className="text-[11px] text-[#8E8078] hidden sm:block">
                Interactive Symptom Analysis & Anatomical Localization
              </p>
            </div>
          </div>

          {/* Clinical Status & Disclaimer */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#5E524C] bg-white px-3.5 py-1 rounded-full border border-[#EAE3D9] shadow-pill font-display">
              <ShieldCheck className="h-3.5 w-3.5 text-[#8AAEA1]" />
              <span>Evidence-Based Decision Support</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}


