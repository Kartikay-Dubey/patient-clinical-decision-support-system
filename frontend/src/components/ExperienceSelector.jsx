import React from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, Stethoscope, ArrowRight, Check, Sparkles, X } from 'lucide-react';
import { PERSONAS, usePersona } from '../context/PersonaContext';

export default function ExperienceSelector({ isModal = false, onClose }) {
  const { persona, selectPersonaAndProceed } = usePersona();

  const cards = [
    {
      ...PERSONAS.patient,
      avatarBg: 'bg-blue-500/10 text-blue-600',
      tag: 'Everyday Care',
      ringColor: 'ring-blue-500',
    },
    {
      ...PERSONAS.student,
      avatarBg: 'bg-emerald-500/10 text-emerald-600',
      tag: 'Academic OSCE',
      ringColor: 'ring-emerald-500',
    },
    {
      ...PERSONAS.technician,
      avatarBg: 'bg-amber-500/10 text-amber-600',
      tag: 'Clinical Review',
      ringColor: 'ring-amber-500',
    },
  ];

  const content = (
    <div className="w-full max-w-6xl mx-auto flex flex-col justify-center items-center py-6 px-4">
      {/* Header section */}
      <div className="text-center max-w-2xl mx-auto mb-8 relative">
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute -top-3 right-0 p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          Tailored Clinical Interface
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
          Choose Your Experience
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Select how you would like to interact with the clinical decision support system. You can switch between views anytime from the header.
        </p>
      </div>

      {/* 3 Experience Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full items-stretch">
        {cards.map((card) => {
          const Icon = card.icon;
          const isCurrent = persona === card.id;

          return (
            <motion.div
              key={card.id}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`relative flex flex-col justify-between rounded-2xl p-6 sm:p-7 bg-white/95 border backdrop-blur-xl shadow-sm transition-all duration-200 cursor-pointer ${
                isCurrent
                  ? `border-primary ring-2 ring-primary/20 shadow-md ${card.cardBorder}`
                  : `border-slate-200/90 ${card.cardBorder}`
              }`}
              onClick={() => selectPersonaAndProceed(card.id)}
            >
              {/* Top Tag & Active Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}>
                  {card.tag}
                </span>
                {isCurrent && (
                  <span className="text-[10px] font-semibold text-primary flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
                    <Check className="h-3 w-3" /> Active
                  </span>
                )}
              </div>

              {/* Avatar Icon & Title */}
              <div className="mb-5">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3.5 ${card.avatarBg}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-display font-bold text-foreground">
                  {card.heading}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {card.tagline}
                </p>
              </div>

              {/* Bullet Features */}
              <div className="space-y-2.5 mb-6 flex-1">
                {card.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <div className="h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-primary">
                      <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                    </div>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  selectPersonaAndProceed(card.id);
                }}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm font-display flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md cursor-pointer ${card.buttonColor}`}
              >
                <span>{card.buttonText}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Clinical decision support platform &bull; Evidence-based &bull; Non-diagnostic guidance
      </p>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 max-w-5xl w-full">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
