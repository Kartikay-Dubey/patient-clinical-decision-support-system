import React, { useState } from 'react';
import {
  Stethoscope,
  Copy,
  Check,
  Download,
  FileSpreadsheet,
  Table,
  MapPin,
  CheckCircle2,
  FileCode,
  Search,
  Activity,
  Terminal,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

/**
 * TechnicianResultsView — Clinical Technician Experience (Simplified)
 * Focused triage view: DDx probability table + SOAP note + JSON export
 * Color Palette: Light Orange & Laboratory Amber
 */
export default function TechnicianResultsView({ analysisData, onView3D }) {
  const [activeTab, setActiveTab] = useState('matrix');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSoap, setCopiedSoap] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const {
    possibleConditions = [],
    storyline = {},
    bodyLocalization = {},
    extractedSymptoms = [],
  } = analysisData;

  const topCondition = possibleConditions[0] || {
    name: 'Acute Rhinosinusitis',
    modelScore: 0.75,
    icd10Code: 'J01.90',
  };

  const secondCondition = possibleConditions[1];
  const confidenceDelta = secondCondition
    ? ((topCondition.modelScore - secondCondition.modelScore) * 100).toFixed(1)
    : '100.0';

  const targetOrganName = bodyLocalization.targetOrgan || bodyLocalization.primaryRegion || 'Target Organ';

  // Clean, audit-ready SOAP note (no internal spatial coordinates)
  const soapNote = `CLINICAL DECISION SUPPORT — AUDIT RECORD
TIMESTAMP: ${new Date().toISOString()}
MODEL ENGINE: DDXPlus Logistic Regression v1.2 (49 Pathologies)

[SUBJECTIVE]
Patient Reported Symptoms:
${extractedSymptoms.map((s, i) => `  ${i + 1}. ${typeof s === 'string' ? s : (s.name || s.label)}`).join('\n') || '  • Symptoms documented in session'}

[OBJECTIVE — CLINICAL ANALYSIS]
• Evidence Tokens Parsed: ${extractedSymptoms.length}
• Primary Anatomical Region: ${bodyLocalization.primaryRegion || 'Head'}
• Target Organ / Structure: ${targetOrganName}
• Body System Involved: ${bodyLocalization.bodySystem || 'Respiratory'}

[ASSESSMENT — DIFFERENTIAL DIAGNOSIS (RANKED)]
1. ${topCondition.name} | ICD-10: ${topCondition.icd10Code || 'Unspecified'} | ${(topCondition.modelScore * 100).toFixed(1)}% (Lead margin: +${confidenceDelta}% vs #2)
${possibleConditions.slice(1, 6).map((c, i) => `${i + 2}. ${c.name} | ICD-10: ${c.icd10Code || 'Unspecified'} | ${(c.modelScore * 100).toFixed(1)}%`).join('\n')}

[PLAN]
1. Correlate with physical examination findings.
2. Review 3D anatomical target: ${targetOrganName}.
3. Decision support only — clinical validation required.`;

  const handleCopySoap = () => {
    navigator.clipboard.writeText(soapNote);
    setCopiedSoap(true);
    setTimeout(() => setCopiedSoap(false), 2200);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(analysisData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2200);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysisData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cdss_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredConditions = possibleConditions.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.icd10Code && c.icd10Code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">

      {/* HEADER */}
      <div className="p-3.5 sm:p-5 border-b border-orange-200/80 bg-[#FFF7ED] flex-shrink-0 space-y-3">

        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#7C2D12] bg-white px-3 py-1 rounded-full border border-orange-200 flex items-center gap-1.5 shadow-2xs font-display">
                <Terminal className="h-4 w-4 text-orange-600" />
                Clinical Technician View
              </span>
              <span className="text-xs font-mono font-semibold text-[#9A3412]">
                Top: <strong className="text-[#431407]">{topCondition.name}</strong> ({((topCondition.modelScore || 0.75) * 100).toFixed(1)}%)
              </span>
            </div>
            <p className="text-[11px] text-[#9A3412] mt-1">
              Ranked DDx table, SOAP note, and JSON export for documentation.
            </p>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCopySoap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              {copiedSoap ? <Check className="h-3.5 w-3.5 text-emerald-200" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedSoap ? 'Copied' : 'Copy SOAP'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50 text-orange-950 border border-orange-300 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-orange-600" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Summary Stats Strip (simplified — no spatial coords) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-orange-200/90 space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-[#9A3412] block">Engine Status</span>
            <div className="flex items-center gap-1.5 font-bold text-[#431407]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ONLINE (v1.2)</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-orange-200/90 space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-[#9A3412] block">Lead Margin vs #2</span>
            <span className="font-mono font-bold text-orange-700">+{confidenceDelta}%</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-orange-200/90 space-y-0.5 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono uppercase text-[#9A3412] block">Anatomical Target</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-orange-600 flex-shrink-0" />
              <span className="font-semibold text-[#431407] text-[11px] truncate">{targetOrganName}</span>
              {onView3D && (
                <button
                  type="button"
                  onClick={onView3D}
                  className="inline-flex items-center gap-0.5 text-[10px] font-bold text-orange-700 hover:text-orange-900 cursor-pointer ml-auto flex-shrink-0"
                >
                  <span>Atlas</span>
                  <ArrowRight className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'matrix', label: 'Diagnosis Ranking', icon: Table, count: possibleConditions.length },
            { id: 'soap', label: 'SOAP Note', icon: FileSpreadsheet },
            { id: 'json', label: 'Raw JSON Export', icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  active
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-orange-900 hover:text-orange-950 hover:bg-orange-100/70'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count != null && (
                  <span className={`text-[10px] px-1.5 rounded-full font-mono ${active ? 'bg-orange-800 text-white' : 'bg-orange-100 text-[#7C2D12]'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="p-3.5 sm:p-5 flex-1 min-h-0 overflow-y-auto space-y-4">

        {/* TAB 1: DIAGNOSIS RANKING TABLE */}
        {activeTab === 'matrix' && (
          <div className="space-y-4">

            {/* Symptoms Detected */}
            {extractedSymptoms.length > 0 && (
              <div className="rounded-2xl bg-white border border-orange-200/90 shadow-xs p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#431407] font-display text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-orange-600" />
                    Symptoms Detected ({extractedSymptoms.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {extractedSymptoms.map((sym, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-orange-50 border border-orange-200 text-[#431407]"
                    >
                      <Check className="h-3 w-3 text-orange-600" />
                      {typeof sym === 'string' ? sym : (sym.name || sym.label)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ranked Probability Table */}
            <div className="rounded-2xl bg-white border border-orange-200/90 shadow-xs overflow-hidden">
              <div className="p-3 bg-[#FFF7ED] border-b border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#431407] font-display text-[11px]">
                    Differential Diagnosis — Ranked by Match Score
                  </span>
                  <span className="font-mono text-[10px] text-orange-800 bg-orange-100/80 px-2 py-0.5 rounded border border-orange-200">
                    {filteredConditions.length} candidates
                  </span>
                </div>

                <div className="relative w-full sm:w-52">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-orange-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or ICD-10..."
                    className="w-full pl-8 pr-3 py-1 rounded-lg bg-white border border-orange-200 text-xs text-[#431407] placeholder-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-orange-200 bg-orange-50/70 text-[10px] font-mono text-orange-900 uppercase tracking-wider">
                      <th className="py-2.5 px-3.5 font-bold">Rank</th>
                      <th className="py-2.5 px-3.5 font-bold">Condition</th>
                      <th className="py-2.5 px-3.5 font-bold">ICD-10</th>
                      <th className="py-2.5 px-3.5 font-bold">Match Score</th>
                      <th className="py-2.5 px-3.5 font-bold">Distribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100 font-mono">
                    {filteredConditions.map((cond, idx) => {
                      const scorePct = ((cond.modelScore || 0.1) * 100).toFixed(1);
                      const isTop = idx === 0;

                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-orange-50/60 transition-colors ${isTop ? 'bg-orange-50/80 font-semibold' : ''}`}
                        >
                          <td className="py-2.5 px-3.5">
                            <span className={`px-2 py-0.5 rounded text-[11px] ${
                              isTop ? 'bg-orange-600 text-white font-bold' : 'text-orange-900 bg-orange-100'
                            }`}>
                              #{idx + 1}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-[#431407] font-sans font-medium text-xs">
                            {cond.name}
                            {isTop && (
                              <span className="ml-2 text-[10px] font-mono uppercase bg-orange-200/90 text-orange-900 px-1.5 py-0.5 rounded font-bold">
                                Primary
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3.5 text-[#9A3412] text-[11px]">
                            {cond.icd10Code || '—'}
                          </td>
                          <td className="py-2.5 px-3.5 text-[#431407] font-bold">
                            {scorePct}%
                          </td>
                          <td className="py-2.5 px-3.5">
                            <div className="w-28 sm:w-36 bg-orange-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isTop ? 'bg-orange-600' : 'bg-orange-400'}`}
                                style={{ width: `${Math.min(parseFloat(scorePct), 100)}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SOAP NOTE */}
        {activeTab === 'soap' && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-white border border-orange-200/90 shadow-xs p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-orange-600" />
                  <h4 className="font-display font-bold text-sm text-[#431407]">
                    SOAP Documentation
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={handleCopySoap}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  {copiedSoap ? <Check className="h-3.5 w-3.5 text-emerald-200" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSoap ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#2A170A] text-[#FED7AA] text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap select-all border border-orange-900/50">
                {soapNote}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: RAW JSON EXPORT */}
        {activeTab === 'json' && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-white border border-orange-200/90 shadow-xs p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-orange-600" />
                  <h4 className="font-display font-bold text-sm text-[#431407]">
                    Raw Diagnostic JSON
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-orange-50 text-orange-950 border border-orange-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5 text-orange-600" />}
                    <span>{copiedJson ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-xl bg-[#2A170A] text-amber-300 text-xs font-mono leading-relaxed overflow-x-auto max-h-96 select-all border border-orange-900/50">
                {JSON.stringify(analysisData, null, 2)}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
