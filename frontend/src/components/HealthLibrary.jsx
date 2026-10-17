import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Thermometer,
  Wind,
  Brain,
  Utensils,
  Activity,
  HeartPulse,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const LIBRARY_TOPICS = [
  {
    id: 'fever',
    title: 'Fever',
    subtitle: 'Causes, care tips, and when to see a doctor',
    icon: Thermometer,
    color: 'bg-rose-50 text-rose-600 border-rose-200/80',
    hoverBorder: 'hover:border-rose-400',
    promptText: 'I have had a mild fever for the past 2 days, feeling warm and fatigued with occasional chills.',
    details: {
      commonCauses: 'Common viral infections, influenza, upper respiratory infections, or mild seasonal bugs.',
      homeCare: 'Rest, stay well-hydrated with water or electrolytes, wear light clothing, and monitor temperature.',
      whenToSeeDoctor: 'Fever exceeding 102°F (38.9°C), lasting more than 4-5 days, or accompanied by severe stiff neck.',
    },
  },
  {
    id: 'cough',
    title: 'Cough',
    subtitle: 'Common causes and supportive home care',
    icon: Wind,
    color: 'bg-sky-50 text-sky-600 border-sky-200/80',
    hoverBorder: 'hover:border-sky-400',
    promptText: 'I have had a dry tickle cough with mild throat irritation and congestion for 3 days.',
    details: {
      commonCauses: 'Post-nasal drip, viral colds, allergies, or acid reflux (GERD).',
      homeCare: 'Warm honey-lemon water, steam inhalation, elevation of head during sleep, and staying hydrated.',
      whenToSeeDoctor: 'Coughing up blood, severe shortness of breath, wheezing, or cough persisting over 3 weeks.',
    },
  },
  {
    id: 'headache',
    title: 'Headache',
    subtitle: 'Types, common triggers, and guidance',
    icon: Brain,
    color: 'bg-purple-50 text-purple-600 border-purple-200/80',
    hoverBorder: 'hover:border-purple-400',
    promptText: 'Throbbing headache behind my forehead and temples since yesterday, worsened by bright screens.',
    details: {
      commonCauses: 'Tension from stress/screens, dehydration, lack of sleep, or migraine.',
      homeCare: 'Rest in a quiet dark room, cold compress across forehead, adequate hydration, and screen breaks.',
      whenToSeeDoctor: 'Sudden "thunderclap" worst headache of life, headache with confusion, weakness, or vision loss.',
    },
  },
  {
    id: 'stomach',
    title: 'Stomach Pain',
    subtitle: 'Possible causes and medical advice',
    icon: Utensils,
    color: 'bg-amber-50 text-amber-600 border-amber-200/80',
    hoverBorder: 'hover:border-amber-400',
    promptText: 'Burning sensation in upper stomach and acid reflux after meals, worse when bending down.',
    details: {
      commonCauses: 'Indigestion, gastroesophageal reflux (GERD), gastritis, or dietary triggers.',
      homeCare: 'Eat smaller meals, avoid spicy/acidic foods, avoid lying down for 2 hours after meals.',
      whenToSeeDoctor: 'Severe sharp localized pain (especially right lower quadrant), bloody stools, or vomiting blood.',
    },
  },
  {
    id: 'breathless',
    title: 'Breathlessness',
    subtitle: 'Causes and emergency warning signs',
    icon: Activity,
    color: 'bg-teal-50 text-teal-600 border-teal-200/80',
    hoverBorder: 'hover:border-teal-400',
    promptText: 'Mild shortness of breath when walking upstairs, accompanied by slight fatigue and dry cough.',
    details: {
      commonCauses: 'Mild respiratory infection, asthma flare-up, anxiety/hyperventilation, or deconditioning.',
      homeCare: 'Pursed-lip breathing, sitting upright in comfortable position, cool airflow across face.',
      whenToSeeDoctor: 'Sudden shortness of breath at rest, chest pressure radiating to arm or jaw (call 911 / emergency immediately).',
    },
  },
  {
    id: 'bodypain',
    title: 'Body Pain',
    subtitle: 'Common reasons and safe self-care',
    icon: HeartPulse,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
    hoverBorder: 'hover:border-emerald-400',
    promptText: 'Generalized muscle aches and joint stiffness all over my body with tired feeling since yesterday.',
    details: {
      commonCauses: 'Viral prodrome, physical overexertion, poor posture, or lack of sleep.',
      homeCare: 'Warm bath with epsom salts, gentle stretching, adequate sleep, and gentle hydration.',
      whenToSeeDoctor: 'Pain accompanied by joint swelling, redness, fever, or inability to bear weight.',
    },
  },
];

export default function HealthLibrary({ onSelectPrompt }) {
  const [selectedTopic, setSelectedTopic] = useState(null);

  return (
    <div className="w-full mt-4 pt-3 border-t border-slate-200/70">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <h4 className="font-display font-bold text-xs text-foreground uppercase tracking-wider">
            Health Library &bull; Quick Symptom Guides
          </h4>
        </div>
        <span className="text-[10px] text-muted-foreground hidden sm:inline">
          Click any card to read guidance or try example
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {LIBRARY_TOPICS.map((topic) => {
          const Icon = topic.icon;
          return (
            <motion.div
              key={topic.id}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              onClick={() => setSelectedTopic(topic)}
              className={`p-2.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between ${topic.hoverBorder}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 ${topic.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="font-display font-bold text-xs text-slate-900 truncate">
                  {topic.title}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug">
                {topic.subtitle}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Modal for Selected Topic */}
      <AnimatePresence>
        {selectedTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${selectedTopic.color}`}>
                    <selectedTopic.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      {selectedTopic.title} Guide
                    </h3>
                    <p className="text-[11px] text-slate-500">{selectedTopic.subtitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTopic(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-800">Common Causes:</span>
                  <p className="text-slate-600 leading-relaxed">{selectedTopic.details.commonCauses}</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Recommended Home Care:
                  </span>
                  <p className="text-emerald-800 leading-relaxed">{selectedTopic.details.homeCare}</p>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 space-y-1">
                  <span className="font-bold text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                    When to See a Doctor:
                  </span>
                  <p className="text-rose-800 leading-relaxed">{selectedTopic.details.whenToSeeDoctor}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                {onSelectPrompt && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPrompt(selectedTopic.promptText);
                      setSelectedTopic(null);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs font-display flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Use as Symptom Input</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedTopic(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
