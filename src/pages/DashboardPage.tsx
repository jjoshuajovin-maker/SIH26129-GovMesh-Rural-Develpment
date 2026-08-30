import React from 'react';
import { PipelineVisualizer } from '../components/PipelineVisualizer';
import { DemoControlsPanel } from '../components/DemoControlsPanel';
import { DemoControls } from '../types';
import {
  FileText,
  Database,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  WifiOff,
  Radio,
  ArrowRight,
  ShieldCheck,
  Server
} from 'lucide-react';

interface DashboardPageProps {
  kpis: any;
  legacyConnector: any;
  demoControls: DemoControls;
  onToggleFailure: (type: string) => void;
  onResetDemo: () => void;
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  kpis,
  legacyConnector,
  demoControls,
  onToggleFailure,
  onResetDemo,
  onNavigate
}) => {
  return (
    <div className="space-y-6">
      {/* Header Titles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Rural Development & Panchayat Raj
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Legacy File Processing & Rural Service Integration Dashboard
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center border border-emerald-300">
            <Radio className="w-3.5 h-3.5 mr-1.5 text-emerald-600 animate-pulse" />
            Legacy SFTP Connector: {legacyConnector?.status || 'ONLINE'}
          </span>
        </div>
      </div>

      {/* Presenter Failure Simulation Control Bar */}
      <DemoControlsPanel
        demoControls={demoControls}
        onToggleFailure={onToggleFailure}
        onResetDemo={onResetDemo}
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div
          onClick={() => onNavigate('incoming-files')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow transition cursor-pointer"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Files Received</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{kpis?.filesReceivedToday || 8}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">Today</div>
        </div>

        <div
          onClick={() => onNavigate('records')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow transition cursor-pointer"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Records Imported</div>
          <div className="text-xl font-extrabold text-blue-900 mt-1">{kpis?.recordsImported || 124}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">Validated & Seeded</div>
        </div>

        <div
          onClick={() => onNavigate('records')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow transition cursor-pointer"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Apps</div>
          <div className="text-xl font-extrabold text-amber-600 mt-1">{kpis?.pendingApplications || 11}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">Awaiting Review</div>
        </div>

        <div
          onClick={() => onNavigate('file-processing')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow transition cursor-pointer"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Processing</div>
          <div className="text-xl font-extrabold text-indigo-600 mt-1">{kpis?.processing || 7}</div>
          <div className="text-[10px] text-indigo-600 font-semibold mt-1">Active Batch</div>
        </div>

        <div
          onClick={() => onNavigate('records')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow transition cursor-pointer"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Completed</div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">{kpis?.completed || 96}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">Success Result</div>
        </div>

        <div
          onClick={() => onNavigate('batch-results')}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow transition cursor-pointer"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rejected</div>
          <div className="text-xl font-extrabold text-red-600 mt-1">{kpis?.rejected || 4}</div>
          <div className="text-[10px] text-red-600 font-semibold mt-1">Failed Schema</div>
        </div>

        <div
          onClick={() => onNavigate('exception-queue')}
          className="bg-white p-3 rounded-lg border border-amber-300 bg-amber-50/40 shadow-sm hover:shadow transition cursor-pointer"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Invalid Records</div>
          <div className="text-xl font-extrabold text-amber-700 mt-1">{kpis?.invalidRecords || 4}</div>
          <div className="text-[10px] text-amber-800 font-semibold mt-1">Exception Queue</div>
        </div>

        <div
          onClick={() => onNavigate('failed-transfers')}
          className="bg-white p-3 rounded-lg border border-red-200 bg-red-50/40 shadow-sm hover:shadow transition cursor-pointer"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-red-900">Failed Transfers</div>
          <div className="text-xl font-extrabold text-red-700 mt-1">{kpis?.failedTransfers || 1}</div>
          <div className="text-[10px] text-red-800 font-semibold mt-1">Auto Retry Active</div>
        </div>
      </div>

      {/* Legacy Connector Monitor Block */}
      <div className="bg-slate-900 text-white rounded-lg p-4 shadow-md border-l-4 border-emerald-500 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-4 mb-3 md:mb-0">
          <div className="p-3 bg-slate-800 rounded-full border border-slate-700">
            <Server className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              Legacy File Connector Monitor
            </div>
            <div className="text-base font-bold text-white flex items-center space-x-2">
              <span>SFTP / File Transfer Protocol</span>
              <span className={`px-2 py-0.5 text-xs rounded font-bold ${demoControls.simulateSftpFailure ? 'bg-red-500 text-white' : 'bg-emerald-500 text-slate-950'}`}>
                {demoControls.simulateSftpFailure ? 'OFFLINE' : 'ONLINE'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 text-center text-xs font-mono">
          <div>
            <div className="text-slate-400 text-[10px]">LAST TRANSFER</div>
            <div className="text-amber-300 font-bold">10:18 AM</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">LAST FILE</div>
            <div className="text-emerald-300 font-bold truncate max-w-[120px]">
              {legacyConnector?.lastFile || 'GM_2026_000124.csv'}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">PENDING FILES</div>
            <div className="text-blue-300 font-bold">2</div>
          </div>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <PipelineVisualizer />

      {/* Architectural Callout & Interoperability Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center">
          <ShieldCheck className="w-4 h-4 text-gov-blue mr-2" />
          Legacy Interoperability Demonstration Architecture
        </h3>
        <blockquote className="text-xs text-slate-600 bg-slate-50 p-3 rounded border-l-4 border-gov-blue mb-4">
          &ldquo;GovMesh enables the Rural Development &amp; Panchayat Raj Department to receive standardized information through a reusable legacy adapter, transform it into CSV, transfer it through a simulated SFTP channel, validate and process the records, and return structured results.&rdquo;
        </blockquote>

        <div className="bg-slate-900 p-4 rounded-lg text-white font-mono text-xs overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] text-center">
            <div className="p-2 bg-blue-900 rounded border border-blue-700">GovMesh Core</div>
            <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="p-2 bg-blue-900 rounded border border-blue-700">Canonical Model</div>
            <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="p-2 bg-amber-900 rounded border border-amber-700 text-amber-200">CSV Adapter</div>
            <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="p-2 bg-amber-900 rounded border border-amber-700 text-amber-200">SFTP Transfer</div>
            <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="p-2 bg-emerald-950 rounded border border-emerald-700 text-emerald-300">Rural Dept Legacy System</div>
            <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="p-2 bg-slate-800 rounded border border-slate-700">CSV Parser &amp; Validation</div>
            <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="p-2 bg-emerald-900 rounded border border-emerald-700">Result File</div>
          </div>
        </div>
      </div>
    </div>
  );
};
