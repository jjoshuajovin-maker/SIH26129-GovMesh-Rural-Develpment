import React, { useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { BarChart3, Download, FileText, CheckCircle2 } from 'lucide-react';

interface ReportsPageProps {
  onNavigate: (page: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  const [reportType, setReportType] = useState('Daily File Processing');
  const [generated, setGenerated] = useState(false);

  const reportsList = [
    'Daily File Processing',
    'Batch Processing Performance',
    'Invalid Records & Schema Diagnostics',
    'Exception Summary Report',
    'Transfer Failures & Network Recovery',
    'Department Processing Statistics'
  ];

  const handleGenerateReport = () => {
    setGenerated(true);
  };

  const handleDownloadReport = () => {
    const reportText = `GOVERNMENT OF MAHARASHTRA
RURAL DEVELOPMENT & PANCHAYAT RAJ DEPARTMENT
GOVMESH - SIH26129 DEMO REPORT

Report Title: ${reportType}
Generated Date: ${new Date().toLocaleString()}
State: Maharashtra
Department: Rural Development & Panchayat Raj

SUMMARY METRICS:
Total Files Ingested: 8
Total Records Validated: 124
Successful Ingestions: 96
Exceptions Resolved: 4
Failed Transfers Recovered: 1
SFTP Connector Integrity: 100% Verified (SHA-256)

This document is generated from stored department system data.`;

    const element = document.createElement("a");
    const blob = new Blob([reportText], { type: 'text/plain' });
    element.href = URL.createObjectURL(blob);
    element.download = `${reportType.replace(/\s+/g, '_')}_Report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Reports & Analytics' }]} onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Department Performance Reports
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Generate and export daily file processing, batch audit, and exception diagnostic summaries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Selector Panel */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold uppercase tracking-wider text-slate-900 border-b pb-2 flex items-center">
            <BarChart3 className="w-4 h-4 text-gov-blue mr-2" /> Select Report Template
          </h3>
          <div className="space-y-1">
            {reportsList.map(r => (
              <button
                key={r}
                onClick={() => { setReportType(r); setGenerated(false); }}
                className={`w-full text-left px-3 py-2 rounded font-medium transition ${
                  reportType === r ? 'bg-gov-blue text-white font-bold' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerateReport}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-4 rounded shadow transition text-xs uppercase tracking-wider"
          >
            Generate Report
          </button>
        </div>

        {/* Report Preview Panel */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-900 uppercase">
              {reportType}
            </h3>
            {generated && (
              <button
                onClick={handleDownloadReport}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-3 py-1.5 rounded flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </button>
            )}
          </div>

          {generated ? (
            <div className="bg-slate-50 p-4 rounded border border-slate-200 font-mono space-y-3 text-slate-800">
              <div className="font-bold text-gov-blue text-sm border-b border-slate-200 pb-2">
                RURAL DEVELOPMENT &amp; PANCHAYAT RAJ DEPARTMENT - OFFICIAL SUMMARY
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Report Title: <span className="font-bold">{reportType}</span></div>
                <div>Generated: <span className="font-bold">{new Date().toLocaleString()}</span></div>
                <div>State: <span className="font-bold">Government of Maharashtra</span></div>
                <div>Integration Mode: <span className="font-bold text-amber-700">GovMesh Legacy SFTP/CSV</span></div>
              </div>
              <div className="border-t border-slate-200 pt-2 space-y-1 text-slate-700">
                <p>• Total Files Received: <strong>8 Files</strong></p>
                <p>• Total Records Ingested: <strong>124 Records</strong></p>
                <p>• Validation Pass Rate: <strong>96.77%</strong></p>
                <p>• Exception Queue Items Resolved: <strong>4 Records</strong></p>
                <p>• File Integrity Verification (SHA-256): <strong>100% Passed</strong></p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Click &quot;Generate Report&quot; to compile stored data for {reportType}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
