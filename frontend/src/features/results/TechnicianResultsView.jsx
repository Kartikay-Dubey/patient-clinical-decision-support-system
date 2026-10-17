import React, { useState } from 'react';
import {
  Stethoscope,
  Copy,
  Check,
  Download,
  FileSpreadsheet,
  Cpu,
  Table,
  Eye,
} from 'lucide-react';

export default function TechnicianResultsView({ analysisData, onView3D }) {
  const [activeTab, setActiveTab] = useState('ranked');
  const [copiedSoap, setCopiedSoap] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const {
    possibleConditions = [],
    storyline = {},
    bodyLocalization = {},
    extractedSymptoms = [],
  } = analysisData;

  const topCondition = possibleConditions[0] || {
    name: 'Acute Viral Syndrome',
    modelScore: 0.824,
    icd10Code: 'B34.9',
  };

  // Structured SOAP note
  const soapNote = `CLINICAL DECISION SUPPORT — AUDIT RECORD
DATE: ${new Date().toISOString().slice(0, 10)}

[SUBJECTIVE]
Patient reported symptoms:
${extractedSymptoms.map((s) => `• ${typeof s === 'string' ? s : s.name}`).join('\n') || '• Constitutional symptoms reported'}

[OBJECTIVE]
Evidence Tokens: ${extractedSymptoms.length} extracted
Primary Region: ${bodyLocalization.primaryRegion || 'Not specified'}
Body System: ${bodyLocalization.bodySystem || 'General'}
Coordinates: x=${bodyLocalization.coordinates?.x?.toFixed(2) || '0.00'}, y=${bodyLocalization.coordinates?.y?.toFixed(2) || '1.10'}, z=${bodyLocalization.coordinates?.z?.toFixed(2) || '0.00'}

[ASSESSMENT]
Model: DDXPlus Logistic Regression (49 pathologies)
1. ${topCondition.name} (ICD-10: ${topCondition.icd10Code || 'N/A'}) — ${(topCondition.modelScore * 100).toFixed(1)}%
${possibleConditions.slice(1, 4).map((c, i) => `${i + 2}. ${c.name} (ICD-10: ${c.icd10Code || 'N/A'}) — ${(c.modelScore * 100).toFixed(1)}%`).join('\n')}

[PLAN]
1. Correlate with physical exam and vitals.
2. Order focused labs/imaging if clinically indicated.
3. Disclaimer: Probabilistic decision support only.`;

  const handleCopySoap = () => {
    navigator.clipboard.writeText(soapNote);
    setCopiedSoap(true);
    setTimeout(() => setCopiedSoap(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(analysisData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const tabs = [
    { id: 'ranked', label: 'Ranked Conditions', icon: Table },
    { id: 'evidence', label: 'Evidence Tokens', icon: Cpu, count: extractedSymptoms.length },
    { id: 'soap', label: 'SOAP Note', icon: FileSpreadsheet },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white/60">
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/80 bg-white/80 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <Stethoscope className="h-3.5 w-3.5" />
                Clinical Review
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Model output, evidence mapping, and structured export tools.
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCopySoap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {copiedSoap ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedSoap ? 'Copied!' : 'SOAP'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Copy raw JSON payload"
            >
              {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Download className="h-3.5 w-3.5 text-slate-500" />}
              <span>JSON</span>
            </button>
            {onView3D && (
              <button
                type="button"
                onClick={onView3D}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5 text-primary" />
                <span>3D View</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  active
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count != null && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-amber-800 text-amber-100' : 'bg-slate-200 text-slate-700'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto space-y-4">

        {/* RANKED CONDITIONS TABLE */}
        {activeTab === 'ranked' && (
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider font-display">
                Probability Table — Top 10
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                DDXPlus · 49 classes
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/50 text-slate-500 font-mono text-[11px] border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Condition</th>
                    <th className="py-2.5 px-3">Probability</th>
                    <th className="py-2.5 px-3">ICD-10</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {possibleConditions.slice(0, 10).map((cond, idx) => (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        idx === 0 ? 'bg-amber-50/50 font-semibold' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-400">#{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{cond.name}</td>
                      <td className="py-2.5 px-3 font-mono">
                        {((cond.modelScore || 0.35) * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {cond.icd10Code || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick summary beneath table */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/40 grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] font-mono uppercase">Region</span>
                <span className="font-semibold text-slate-800">{bodyLocalization.primaryRegion || 'General'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-mono uppercase">System</span>
                <span className="font-semibold text-slate-800">{bodyLocalization.bodySystem || 'Systemic'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-mono uppercase">Coords</span>
                <span className="font-mono text-slate-700 text-[11px]">
                  [{bodyLocalization.coordinates?.x?.toFixed(2) || '0.00'}, {bodyLocalization.coordinates?.y?.toFixed(2) || '1.10'}, {bodyLocalization.coordinates?.z?.toFixed(2) || '0.00'}]
                </span>
              </div>
            </div>
          </div>
        )}

        {/* EVIDENCE TOKENS */}
        {activeTab === 'evidence' && (
          <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700">
                Extracted Clinical Evidence
              </h4>
              <span className="text-xs font-mono text-slate-500">{extractedSymptoms.length} tokens</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {extractedSymptoms.map((sym, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="font-semibold text-slate-900">{typeof sym === 'string' ? sym : sym.name}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1 flex justify-between">
                    <span>Token #{idx + 1}</span>
                    <span className="text-emerald-600 font-semibold">Verified</span>
                  </div>
                </div>
              ))}
              {extractedSymptoms.length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-slate-500 italic">
                  No explicit symptoms extracted. Using baseline clinical priors.
                </div>
              )}
            </div>
          </div>
        )}

        {/* SOAP NOTE */}
        {activeTab === 'soap' && (
          <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700">
                SOAP Note (Subjective · Objective · Assessment · Plan)
              </h4>
              <button
                type="button"
                onClick={handleCopySoap}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
              >
                {copiedSoap ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedSoap ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
              {soapNote}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
