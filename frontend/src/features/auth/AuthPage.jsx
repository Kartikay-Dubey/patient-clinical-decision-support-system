import React, { useState } from 'react';
import { SignIn, SignUp } from '@clerk/react';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity, Brain, Lock, Stethoscope, Sparkles } from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';

export default function AuthPage({ isConfigured = true }) {
  const [authMode, setAuthMode] = useState('sign-in'); // 'sign-in' | 'sign-up'

  return (
    <div className="min-h-screen bg-[#F3F7FB] flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient glow matching CDSS theme */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] bg-cyan-300/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl" />
      </div>

      {/* Top bar with branding */}
      {/* Top bar with branding */}
      <header className="relative z-10 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-[56px] sm:h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <BrandLogo />
            <div>
              <p className="font-display font-bold text-sm sm:text-[15px] text-foreground tracking-tight">
                Clinical Decision Support
              </p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium hidden xs:block">
                Probabilistic Triage & 3D Anatomical Atlas
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-teal-200/60 font-display">
            <Lock className="h-3.5 w-3.5 text-teal-600" />
            <span className="hidden sm:inline">Secure Clinical Portal</span>
            <span className="sm:hidden">Secure</span>
          </div>
        </div>
      </header>

      {/* Main split grid */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6 sm:py-10 px-4 sm:px-6">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Clerk Sign-In / Sign-Up: FIRST on mobile (order-1), SECOND on desktop (order-2) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-center justify-center w-full"
          >
            {!isConfigured ? (
              <div className="w-full max-w-md bg-white p-6 sm:p-7 rounded-3xl border border-teal-200/80 shadow-xl shadow-teal-900/5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mx-auto mb-4">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-foreground font-display">
                  Clerk Publishable Key Required
                </h2>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Authentication is ready to activate! Follow these quick steps to connect your Clerk project:
                </p>

                <div className="text-left bg-slate-50 border border-border rounded-2xl p-4 my-5 space-y-2.5 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-teal-700 bg-teal-100/70 rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                    <span>Go to <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="text-teal-600 font-semibold underline">dashboard.clerk.com</a> and sign in.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-teal-700 bg-teal-100/70 rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                    <span>Create a new application or open existing one.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-teal-700 bg-teal-100/70 rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
                    <span>Under <strong>API Keys</strong>, copy <strong>Publishable key</strong> (starts with <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">pk_test_...</code>).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-teal-700 bg-teal-100/70 rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">4</span>
                    <span>Open <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">frontend/.env</code> and paste:</span>
                  </div>
                </div>

                <div className="bg-slate-900 text-teal-300 font-mono text-[11px] p-3 rounded-xl text-left overflow-x-auto select-all">
                  VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
                </div>

                <p className="text-[11px] text-muted-foreground mt-4">
                  Once pasted, restart dev server or reload the page.
                </p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                {authMode === 'sign-in' ? (
                  <div className="w-full flex flex-col items-center">
                    <SignIn 
                      routing="hash"
                      appearance={{
                        variables: {
                          colorPrimary: '#0d9488',
                          colorText: '#1e293b',
                          borderRadius: '1.25rem',
                        },
                        elements: {
                          card: 'shadow-xl shadow-teal-900/5 border border-border bg-white/95 backdrop-blur-xl w-full max-w-md',
                          headerTitle: 'font-display font-bold text-foreground',
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setAuthMode('sign-up')}
                      className="mt-3 text-xs text-teal-700 hover:text-teal-900 font-medium underline"
                    >
                      Need an account? Sign up
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <SignUp 
                      routing="hash"
                      appearance={{
                        variables: {
                          colorPrimary: '#0d9488',
                          colorText: '#1e293b',
                          borderRadius: '1.25rem',
                        },
                        elements: {
                          card: 'shadow-xl shadow-teal-900/5 border border-border bg-white/95 backdrop-blur-xl w-full max-w-md',
                          headerTitle: 'font-display font-bold text-foreground',
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setAuthMode('sign-in')}
                      className="mt-3 text-xs text-teal-700 hover:text-teal-900 font-medium underline"
                    >
                      Already have an account? Sign in
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Left Hero & Clinical Highlights: SECOND on mobile (order-2), FIRST on desktop (order-1) */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="order-2 lg:order-1 lg:col-span-6 flex flex-col gap-4 sm:gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/60 border border-teal-200/80 text-teal-900 text-xs font-semibold w-fit">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>Next-Gen Medical Decision Support</span>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground font-display tracking-tight leading-tight">
                Clinical diagnostic workstation
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm lg:text-base leading-relaxed">
                Empowering healthcare practitioners with differential diagnosis support, real-time BodyParts3D localization, and evidence validation.
              </p>
            </div>

            {/* Feature cards: hidden on mobile, visible on tablet & desktop */}
            <div className="hidden sm:grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/80 border border-border shadow-xs backdrop-blur-sm">
                <div className="h-8 w-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-2">
                  <Activity className="h-4 w-4" />
                </div>
                <h2 className="text-xs font-bold text-foreground font-display">Probabilistic Triage</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  Validated against 49+ pathologies with clinical matching.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-border shadow-xs backdrop-blur-sm">
                <div className="h-8 w-8 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 mb-2">
                  <Brain className="h-4 w-4" />
                </div>
                <h2 className="text-xs font-bold text-foreground font-display">3D Spatial Anatomy</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  BodyParts3D WebGL atlas pinned to physiological foci.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-border shadow-xs backdrop-blur-sm">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h2 className="text-xs font-bold text-foreground font-display">Evidence Gated</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  Strictly corroborates symptoms against medical datasets.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-border shadow-xs backdrop-blur-sm">
                <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-2">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <h2 className="text-xs font-bold text-foreground font-display">Practitioner UI</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  Ergonomic patient intake, vitals, and structured notes.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer disclaimer */}
      <footer className="relative z-10 border-t border-border/40 py-4 text-center text-xs text-muted-foreground bg-white/40">
        Clinical Decision Support System &bull; Designed for medical workflow assistance &bull; Not for standalone diagnostic reliance
      </footer>
    </div>
  );
}
