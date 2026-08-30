import React from 'react';
import { ValidationResult, FileItem } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

interface ValidationResultsPageProps {
  file: FileItem;
  result: ValidationResult;
  onProcessBatch: () => void;
  onNavigateToExceptions: () => void;
  onNavigate: (page: string) => void;
}

export const ValidationResultsPage: React.FC<ValidationResultsPageProps> = ({
  file,
  result,
  onProcessBatch,
  onNavigateToExceptions,
  onNavigate
}) => {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Incoming Files', page: 'incoming-files' },
          { label: file.fileName, page: 'file-details' },
          { label: 'Validation Results' }
        ]}
        onNavigate={onNavigate}
      />

      {/* Top Banner Result */}
      <div className={`p-6 rounded-lg shadow-md border-l-8 text-white flex items-center justify-between ${
        result.valid ? 'bg-emerald-900 border-emerald-500' : 'bg-red-950 border-red-500'
      }`}>
        <div className="flex items-center space-x-4">
          {result.valid ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          ) : (
            <XCircle className="w-10 h-10 text-red-400" />
          )}
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-300 font-bold">
              Automated Schema &amp; Data Validation Status
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              {result.valid ? 'VALIDATION PASSED' : 'VALIDATION FAILED'}
            </h2>
            <p className="text-xs text-slate-200 mt-1">
              File: <span className="font-mono text-amber-300 font-bold">{file.fileName}</span> | Application ID: <span className="font-mono text-amber-300 font-bold">{file.applicationId}</span>
            </p>
          </div>
        </div>

        <div>
          {result.valid ? (
            <button
              onClick={onProcessBatch}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-5 py-3 rounded-lg shadow-lg flex items-center space-x-2 transition transform hover:scale-105"
            >
              <Cpu className="w-4 h-4 text-slate-950" />
              <span>Proceed to Batch Processing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onNavigateToExceptions}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-5 py-3 rounded-lg shadow-lg flex items-center space-x-2 transition"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>View Exception Queue ({result.invalidCount || 4})</span>
            </button>
          )}
        </div>
      </div>

      {/* Validation Checklist Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b pb-3 flex items-center">
          <ShieldCheck className="w-4 h-4 text-gov-blue mr-2" />
          Automated Schema Verification Report
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {result.checks.map((check, index) => (
            <div
              key={index}
              className={`p-3 rounded-md border flex items-start space-x-3 ${
                check.status === 'PASSED'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-red-50/50 border-red-200'
              }`}
            >
              {check.status === 'PASSED' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              )}
              <div>
                <div className="font-bold text-slate-900">{check.name}</div>
                <div className="text-[11px] text-slate-600 mt-0.5">{check.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Details Section if Invalid */}
      {!result.valid && result.errors && (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 space-y-4">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wide">
              Invalid Record Diagnostics ({result.errors.length} Errors Found)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-red-50 text-red-900 font-bold border-b border-red-200 uppercase text-[10px]">
                  <th className="p-3">CSV Line #</th>
                  <th className="p-3">Application ID</th>
                  <th className="p-3">Error Code</th>
                  <th className="p-3">Diagnostic Message</th>
                  <th className="p-3 text-right">Action Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.errors.map((err, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 font-mono">
                    <td className="p-3 font-bold text-slate-700">Line {err.row}</td>
                    <td className="p-3 text-gov-blue font-bold">{err.appId || 'N/A'}</td>
                    <td className="p-3 text-red-600 font-bold">{err.error}</td>
                    <td className="p-3 text-slate-800">{err.message}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={onNavigateToExceptions}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2.5 py-1 rounded text-[11px] transition"
                      >
                        Review in Queue
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
