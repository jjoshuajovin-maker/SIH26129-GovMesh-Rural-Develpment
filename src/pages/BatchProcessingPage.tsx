import React, { useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Layers, CheckCircle2, Download, Send, Eye, Filter, Cpu, ArrowRight } from 'lucide-react';

interface BatchProcessingPageProps {
  batchSummary: any;
  onSendToGovMesh: () => void;
  onNavigate: (page: string) => void;
}

export const BatchProcessingPage: React.FC<BatchProcessingPageProps> = ({
  batchSummary,
  onSendToGovMesh,
  onNavigate
}) => {
  const [filter, setFilter] = useState('ALL');
  const [showResultModal, setShowResultModal] = useState(false);
  const [govmeshSent, setGovmeshSent] = useState(false);

  const sampleResults = [
    { appId: 'GM-2026-000124', validation: 'Valid', processing: 'Completed', result: 'SUCCESS', message: '' },
    { appId: 'GM-2026-000125', validation: 'Invalid', processing: 'Rejected', result: 'FAILED', message: 'Missing district field' },
    { appId: 'GM-2026-000126', validation: 'Valid', processing: 'Completed', result: 'SUCCESS', message: '' },
    { appId: 'GM-2026-000127', validation: 'Valid', processing: 'Completed', result: 'SUCCESS', message: '' },
    { appId: 'GM-2026-000128', validation: 'Invalid', processing: 'Rejected', result: 'FAILED', message: 'Invalid Application ID format' },
    { appId: 'GM-2026-000129', validation: 'Valid', processing: 'Completed', result: 'SUCCESS', message: '' },
    { appId: 'GM-2026-000130', validation: 'Valid', processing: 'Completed', result: 'SUCCESS', message: '' },
    { appId: 'GM-2026-000131', validation: 'Valid', processing: 'Completed', result: 'SUCCESS', message: '' },
    { appId: 'GM-2026-000132', validation: 'Invalid', processing: 'Rejected', result: 'DUPLICATE', message: 'Duplicate application in batch' }
  ];

  const filteredResults = sampleResults.filter(r => {
    if (filter === 'SUCCESS') return r.result === 'SUCCESS';
    if (filter === 'INVALID' || filter === 'REJECTED') return r.validation === 'Invalid';
    if (filter === 'DUPLICATE') return r.result === 'DUPLICATE';
    return true;
  });

  const resultCsvContent = `application_id,status,error_code,error_message
GM-2026-000124,SUCCESS,,
GM-2026-000125,FAILED,MISSING_DISTRICT,Required district field is missing
GM-2026-000126,SUCCESS,,
GM-2026-000127,SUCCESS,,
GM-2026-000128,FAILED,INVALID_APP_ID,Invalid Application ID format
GM-2026-000129,SUCCESS,,
GM-2026-000130,SUCCESS,,
GM-2026-000131,SUCCESS,,
GM-2026-000132,FAILED,DUPLICATE_RECORD,Application already processed`;

  const handleDownloadResult = () => {
    const element = document.createElement("a");
    const blob = new Blob([resultCsvContent], { type: 'text/csv' });
    element.href = URL.createObjectURL(blob);
    element.download = "GM_BATCH_002_RESULT.csv";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendToGovMesh = () => {
    setGovmeshSent(true);
    onSendToGovMesh();
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Batch Processing Results' }]} onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Batch Processing &amp; Result File Generator
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Execution overview for file batch: <span className="font-mono font-bold text-gov-blue">GM_BATCH_002.csv</span>
          </p>
        </div>
        <div className="mt-3 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={() => setShowResultModal(true)}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-900 text-slate-200 text-xs px-3 py-2 rounded font-semibold transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Result File</span>
          </button>

          <button
            onClick={handleDownloadResult}
            className="flex items-center space-x-1 bg-white hover:bg-slate-50 text-slate-700 text-xs px-3 py-2 rounded border border-slate-300 font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Result CSV</span>
          </button>

          <button
            onClick={handleSendToGovMesh}
            disabled={govmeshSent}
            className={`flex items-center space-x-1.5 font-bold text-xs px-4 py-2 rounded shadow transition ${
              govmeshSent ? 'bg-emerald-600 text-white cursor-default' : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{govmeshSent ? '✓ Sent to GovMesh' : 'Send to GovMesh'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Workflow */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Batch Execution Pipeline Status
        </h3>

        <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
          <div className="p-3 bg-emerald-50 text-emerald-900 rounded border border-emerald-300 flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>1. Validation ✓</span>
          </div>

          <div className="p-3 bg-emerald-50 text-emerald-900 rounded border border-emerald-300 flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>2. Processing ✓</span>
          </div>

          <div className="p-3 bg-emerald-50 text-emerald-900 rounded border border-emerald-300 flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>3. Result Generation ✓</span>
          </div>

          <div className={`p-3 rounded border flex items-center justify-center space-x-2 ${
            govmeshSent ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-amber-50 text-amber-900 border-amber-300'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>4. Result Transfer {govmeshSent ? '✓' : '●'}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards for Batch */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Total Records</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">100</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-emerald-200 bg-emerald-50/40">
          <div className="text-[10px] font-bold text-emerald-800 uppercase">Valid Records</div>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">96</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-red-200 bg-red-50/40">
          <div className="text-[10px] font-bold text-red-800 uppercase">Invalid Records</div>
          <div className="text-xl font-extrabold text-red-700 mt-1">4</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-emerald-200 bg-emerald-50/40">
          <div className="text-[10px] font-bold text-emerald-800 uppercase">Processed</div>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">96</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-red-200 bg-red-50/40">
          <div className="text-[10px] font-bold text-red-800 uppercase">Rejected</div>
          <div className="text-xl font-extrabold text-red-700 mt-1">4</div>
        </div>
      </div>

      {/* Filterable Batch Results Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden space-y-3 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Batch Record Execution Matrix
          </h3>

          <div className="flex items-center space-x-1 mt-2 sm:mt-0 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {['ALL', 'SUCCESS', 'INVALID', 'REJECTED', 'DUPLICATE'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded font-bold text-[10px] transition ${
                  filter === f ? 'bg-gov-blue text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <th className="p-3">Application ID</th>
                <th className="p-3">Validation Status</th>
                <th className="p-3">Processing Status</th>
                <th className="p-3">Result</th>
                <th className="p-3">Message / Error Diagnostic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 font-mono">
                  <td className="p-3 font-bold text-gov-blue">{r.appId}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.validation === 'Valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {r.validation}
                    </span>
                  </td>
                  <td className="p-3">{r.processing}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.result === 'SUCCESS' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {r.result}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{r.message || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Raw Result CSV */}
      {showResultModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                Generated Outbound Result CSV: GM_BATCH_002_RESULT.csv
              </h3>
              <button
                onClick={() => setShowResultModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <pre className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded max-h-80 overflow-y-auto">
              {resultCsvContent}
            </pre>
            <div className="flex justify-end space-x-2 border-t pt-3">
              <button
                onClick={handleDownloadResult}
                className="bg-gov-blue hover:bg-blue-900 text-white text-xs px-3 py-1.5 rounded font-bold"
              >
                Download CSV File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
