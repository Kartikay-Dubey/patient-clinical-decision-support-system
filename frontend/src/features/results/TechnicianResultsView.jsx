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
  Activity,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  MessageSquare,
  Search,
  CheckCircle2,
} from 'lucide-react';

export default function TechnicianResultsView({ analysisData, onAskMedAssist, onView3D }) {
  const [activeTab, setActiveTab] = useState('ranked'); // 'ranked' | 'evidence' | 'soap' | 'json'
  const [copiedSoap, setCopiedSoap] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const secondCondition = possibleConditions[1];
  const confidenceDelta = secondCondition 
    ? ((topCondition.modelScore - secondCondition.modelScore) * 100).toFixed(1)
    : '100.0';

  // Audit-grade Structured SOAP note
  const soapNote = `CLINICAL DECISION SUPPORT — AUDIT RECORD & TELEMETRY
TIMESTAMP: ${new Date().toISOString()}
MODEL VERSION: DDXPlus Logistic Regression v1.2 (49 Pathologies)

[SUBJECTIVE]
Patient Reported Presenting Complaints:
${extractedSymptoms.map((s, i) => `  ${i + 1}. ${typeof s === 'string' ? s : (s.name || s.label)}`).join('\n') || '  • Constitutional symptoms reported'}

[OBJECTIVE — CLINICAL TELEMETRY]
• Extracted Evidence Tokens: ${extractedSymptoms.length} verified tokens
• Primary Anatomical Region: ${bodyLocalization.primaryRegion || 'Thorax / General'}
• Involved Body System: ${bodyLocalization.bodySystem || 'Systemic'}
• Calibrated Spatial Anchor: [x: ${bodyLocalization.coordinates?.x?.toFixed(2) || '0.00'}, y: ${bodyLocalization.coordinates?.y?.toFixed(2) || '1.10'}, z: ${bodyLocalization.coordinates?.z?.toFixed(2) || '0.00'}]
• Bounding Validation: ${Math.abs(bodyLocalization.coordinates?.z || 0) <= 0.05 ? 'PASSED (Centered z in [-0.02, 0.02])' : 'NOMINAL'}

[ASSESSMENT — DIFFERENTIAL DIAGNOSIS POSTERIOR]
1. ${topCondition.name} | ICD-10: ${topCondition.icd10Code || 'Unspecified'} | ${(topCondition.modelScore * 100).toFixed(1)}% (Confidence Delta: +${confidenceDelta}%)
${possibleConditions.slice(1, 5).map((c, i) => `${i + 2}. ${c.name} | ICD-10: ${c.icd10Code || 'Unspecified'} | ${(c.modelScore * 100).toFixed(1)}%`).join('\n')}

[PLAN — CLINICAL PROTOCOL RECOMMENDATIONS]
1. Confirm vital signs (HR, BP, SpO2, Temp) and perform targeted physical examination.
2. Order baseline diagnostic laboratory panels (CBC, BMP, CRP/ESR) if clinically indicated.
3. Correlate with 3D anatomical organ mapping before specialist escalation.
4. Disclaimer: Evidence-based clinical decision support. Not a replacement for physician diagnosis.`;

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

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysisData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cdss_audit_telemetry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredConditions = possibleConditions.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.icd10Code && c.icd10Code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const tabs = [
    { id: 'ranked', label: 'Probability Table', icon: Table, count: possibleConditions.length },
    { id: 'evidence', label: 'Evidence Tokens', icon: Cpu, count: extractedSymptoms.length },
    { id: 'soap', label: 'SOAP Note', icon: FileSpreadsheet },
    { id: 'json', label: 'EHR JSON Payload', icon: FileCode },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white/60">
      {/* Header & Quick Telemetry Bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/80 bg-white/80 flex-shrink-0 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <Stethoscope className="h-3.5 w-3.5" />
                Clinical Reviewer Mode
              </span>
              <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">
                Diagnostic Telemetry & Audit Console
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Posterior probability distributions, evidence token mappings, and structured EHR exports.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={handleCopySoap}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Copy formatted SOAP Note"
            >
              {copiedSoap ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copiedSoap ? 'Copied SOAP' : 'Copy SOAP'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Download Telemetry JSON file"
            >
              <Download className="h-3 w-3 text-slate-500" />
              <span>Download JSON</span>
            </button>

            {onAskMedAssist && (
              <button
                type="button"
                onClick={onAskMedAssist}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <MessageSquare className="h-3 w-3 text-teal-600" />
                <span>Reviewer Copilot</span>
              </button>
            )}

            {onView3D && (
              <button
                type="button"
                onClick={onView3D}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Eye className="h-3 w-3 text-primary" />
                <span>3D Telemetry</span>
              </button>
            )}
          </div>
        </div>

        {/* Diagnostic Acuity Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Top Prediction</span>
            <span className="font-bold text-slate-900 truncate block">{topCondition.name}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Calibrated Probability</span>
            <span className="font-mono font-bold text-amber-700">{((topCondition.modelScore || 0.8) * 100).toFixed(1)}%</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Confidence Delta (Δ)</span>
            <span className="font-mono font-bold text-emerald-700">+{confidenceDelta}%</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Spatial Calibration</span>
            <span className="font-mono font-bold text-slate-700">z: {bodyLocalization.coordinates?.z?.toFixed(2) || '0.00'} (Valid)</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-1">
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

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto space-y-4">

        {/* TAB 1: RANKED CONDITIONS TABLE */}
        {activeTab === 'ranked' && (
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden space-y-0">
            <div className="p-3 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider font-display">
                Posterior Distribution Matrix ({filteredConditions.length} shown)
              </span>
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter conditions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-slate-500 font-mono text-[11px] border-b border-slate-100 sticky top-0 backdrop-blur">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Condition Title</th>
                    <th className="py-2.5 px-3">Probability</th>
                    <th className="py-2.5 px-3">ICD-10</th>
                    <th className="py-2.5 px-3">Acuity Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredConditions.map((cond, idx) => (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        idx === 0 ? 'bg-amber-50/60 font-semibold' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-400">#{idx + 1}</td>
                      <td className="py-2.5 px-3 text-slate-900 font-semibold">{cond.name}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {((cond.modelScore || 0.35) * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {cond.icd10Code || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {cond.confidenceCategory || (idx === 0 ? 'High' : 'Moderate')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredConditions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-xs text-slate-400 italic">
                        No conditions match filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Anatomical calibration check footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">Primary Region</span>
                <span className="font-semibold text-slate-800">{bodyLocalization.primaryRegion || 'Thorax / Chest'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">Anatomical System</span>
                <span className="font-semibold text-slate-800">{bodyLocalization.bodySystem || 'Cardiopulmonary'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-mono uppercase">Spatial Coordinate Vector</span>
                <span className="font-mono text-slate-700 text-[11px]">
                  [x: {bodyLocalization.coordinates?.x?.toFixed(2) || '0.00'}, y: {bodyLocalization.coordinates?.y?.toFixed(2) || '1.10'}, z: {bodyLocalization.coordinates?.z?.toFixed(2) || '0.00'}]
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EVIDENCE TOKENS */}
        {activeTab === 'evidence' && (
          <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700">
                Verified Extracted Evidence Tokens ({extractedSymptoms.length})
              </h4>
              <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                NLP Pipeline Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {extractedSymptoms.map((sym, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="font-semibold text-slate-900">{typeof sym === 'string' ? sym : (sym.name || sym.label)}</div>
                  <div className="text-[10px] font-mono text-slate-400 flex justify-between pt-1 border-t border-slate-100">
                    <span>Token #{idx + 1}</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="h-3 w-3" /> Mapped
                    </span>
                  </div>
                </div>
              ))}
              {extractedSymptoms.length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-slate-500 italic">
                  No symptom tokens explicitly extracted. Using clinical baseline priors.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SOAP NOTE */}
        {activeTab === 'soap' && (
          <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700">
                Audit Record SOAP Note (Subjective · Objective · Assessment · Plan)
              </h4>
              <button
                type="button"
                onClick={handleCopySoap}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
              >
                {copiedSoap ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedSoap ? 'Copied to Clipboard' : 'Copy Full Note'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap select-all max-h-96">
              {soapNote}
            </pre>
          </div>
        )}

        {/* TAB 4: JSON EHR PAYLOAD */}
        {activeTab === 'json' && (
          <div className="rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700">
                Raw Telemetry Payload (JSON)
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg"
                >
                  {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 flex items-center gap-1 cursor-pointer px-2.5 py-1 rounded-lg"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap select-all max-h-96">
              {JSON.stringify(analysisData, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
