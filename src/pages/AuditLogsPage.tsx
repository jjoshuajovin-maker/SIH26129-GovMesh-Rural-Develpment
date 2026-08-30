import React from 'react';
import { AuditLog } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ClipboardList, ShieldCheck, Download } from 'lucide-react';

interface AuditLogsPageProps {
  logs: AuditLog[];
  onNavigate: (page: string) => void;
}

export const AuditLogsPage: React.FC<AuditLogsPageProps> = ({ logs, onNavigate }) => {
  const handleExportAudit = () => {
    let csv = 'Timestamp,Event,Application_ID,File_ID,Officer,Result,Checksum\n';
    logs.forEach(l => {
      csv += `${l.timestamp},${l.event},${l.applicationId},${l.fileId},${l.officer},${l.result},${l.checksum}\n`;
    });
    const element = document.createElement("a");
    const blob = new Blob([csv], { type: 'text/csv' });
    element.href = URL.createObjectURL(blob);
    element.download = `Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Audit Logs' }]} onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Department Transaction Audit Trail
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Immutable audit log capturing all file lifecycle events, checksum verifications, and officer actions.
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
          <button
            onClick={handleExportAudit}
            className="flex items-center space-x-1 bg-white hover:bg-slate-50 text-slate-700 text-xs px-3 py-2 rounded border border-slate-300 font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Log CSV</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Event Type</th>
                <th className="p-3">Application ID</th>
                <th className="p-3">File ID</th>
                <th className="p-3">Officer / Actor</th>
                <th className="p-3">Result</th>
                <th className="p-3 font-mono">Checksum / Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 font-mono text-[11px]">
                  <td className="p-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-bold text-gov-blue">{log.event}</td>
                  <td className="p-3 text-slate-800">{log.applicationId}</td>
                  <td className="p-3 text-slate-600">{log.fileId}</td>
                  <td className="p-3 font-sans font-semibold text-slate-900">{log.officer}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.result === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.result}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-[10px] truncate max-w-[120px]">{log.checksum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
