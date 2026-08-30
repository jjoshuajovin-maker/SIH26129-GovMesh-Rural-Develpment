import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Activity, Server, Radio, CheckCircle2, Cpu, HardDrive, ShieldCheck, Folder } from 'lucide-react';

interface SystemHealthPageProps {
  health: any;
  onNavigate: (page: string) => void;
}

export const SystemHealthPage: React.FC<SystemHealthPageProps> = ({ health, onNavigate }) => {
  const components = [
    { name: 'SFTP Connector', status: 'ONLINE', desc: 'Secure File Transfer Adapter for incoming/outgoing CSV files' },
    { name: 'CSV Parser', status: 'ONLINE', desc: 'Delimiter parsing and structure transformation engine' },
    { name: 'Validation Engine', status: 'ONLINE', desc: 'Schema, header, and data integrity verification' },
    { name: 'Batch Processor', status: 'ONLINE', desc: 'High-throughput database record ingestion engine' },
    { name: 'Database Engine', status: 'ONLINE', desc: 'Persistent local SQLite / JSON store' },
    { name: 'Result Generator', status: 'ONLINE', desc: 'Outbound CSV result file generator' },
    { name: 'GovMesh Connector', status: 'ONLINE', desc: 'Interoperability orchestrator callback bridge' }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'System Health & Legacy Connector Monitor' }]} onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            System Health &amp; Legacy Connector Monitor
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Real-time status monitoring for legacy CSV/SFTP adapters and processing engines.
          </p>
        </div>
      </div>

      {/* Component Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {components.map((c, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">{c.name}</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse"></span>
                {c.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* Detailed Legacy SFTP Connector Monitor */}
      <div className="bg-slate-900 text-white rounded-lg p-6 shadow-md border-l-4 border-amber-500 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center">
          <Server className="w-4 h-4 mr-2 text-amber-400" />
          Legacy Connector Configuration &amp; Directory Paths
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-800 p-3 rounded border border-slate-700">
            <div className="text-slate-400 text-[10px]">HOST / DOMAIN</div>
            <div className="text-amber-300 font-bold mt-1">demo-sftp.internal</div>
          </div>
          <div className="bg-slate-800 p-3 rounded border border-slate-700">
            <div className="text-slate-400 text-[10px]">PORT / AUTH</div>
            <div className="text-emerald-300 font-bold mt-1">Port 22 (SSH RSA 4096)</div>
          </div>
          <div className="bg-slate-800 p-3 rounded border border-slate-700">
            <div className="text-slate-400 text-[10px]">SYSTEM UPTIME</div>
            <div className="text-blue-300 font-bold mt-1">{health?.systemUptime || '99.98%'}</div>
          </div>
          <div className="bg-slate-800 p-3 rounded border border-slate-700">
            <div className="text-slate-400 text-[10px]">AVG LATENCY</div>
            <div className="text-amber-300 font-bold mt-1">{health?.averageProcessingTimeMs || 140} ms</div>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2 text-xs font-mono">
          <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2 flex items-center">
            <Folder className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Simulated SFTP Local Directory Structure
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="text-emerald-400 font-bold">Inbound Directory:</span>
              <span className="bg-slate-900 px-2 py-0.5 rounded text-amber-300 border border-slate-800">/mock_sftp/incoming</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="text-emerald-400 font-bold">Processed Archive:</span>
              <span className="bg-slate-900 px-2 py-0.5 rounded text-amber-300 border border-slate-800">/mock_sftp/processed</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="text-emerald-400 font-bold">Error Directory:</span>
              <span className="bg-slate-900 px-2 py-0.5 rounded text-amber-300 border border-slate-800">/mock_sftp/error</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="text-emerald-400 font-bold">Outbound Directory:</span>
              <span className="bg-slate-900 px-2 py-0.5 rounded text-amber-300 border border-slate-800">/mock_sftp/outgoing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
