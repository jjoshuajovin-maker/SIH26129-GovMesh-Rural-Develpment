import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

export const PipelineVisualizer: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<number>(5);

  const stages = [
    { id: 1, name: 'GovMesh', status: 'completed', desc: 'Standardized intent broadcast from GovMesh orchestrator.' },
    { id: 2, name: 'Canonical Data', status: 'completed', desc: 'Normalized citizen address change payload created.' },
    { id: 3, name: 'CSV Transformation', status: 'completed', desc: 'GovMesh Legacy Adapter maps canonical JSON to legacy CSV structure.' },
    { id: 4, name: 'File Created', status: 'completed', desc: 'Generated CSV file: GM_2026_000124.csv with manifest.' },
    { id: 5, name: 'SFTP Transfer', status: 'completed', desc: 'Transferred via encrypted SSH SFTP to demo-sftp.internal.' },
    { id: 6, name: 'File Received', status: 'completed', desc: 'Inbound directory watcher picked up GM_2026_000124.csv.' },
    { id: 7, name: 'Checksum Verification', status: 'completed', desc: 'SHA-256 integrity check verified against sender manifest.' },
    { id: 8, name: 'CSV Parsing', status: 'completed', desc: 'Parsed CSV rows, headers, and delimiter structure.' },
    { id: 9, name: 'Validation', status: 'completed', desc: 'Executed 9 schema checks & mandatory field verifications.' },
    { id: 10, name: 'Batch Processing', status: 'processing', desc: 'Ingesting records into Rural Development database.' },
    { id: 11, name: 'Result File', status: 'pending', desc: 'Generating outbound GM_2026_000124_RESULT.csv file.' },
    { id: 12, name: 'GovMesh Callback', status: 'pending', desc: 'Outbound status acknowledgment return to GovMesh timeline.' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Legacy Interoperability Pipeline Visualization
          </h3>
          <p className="text-xs text-slate-500">
            Click any stage in the 12-step adapter flow to view technical execution details.
          </p>
        </div>
        <span className="bg-blue-50 text-blue-700 text-xs font-mono font-semibold px-2.5 py-1 rounded border border-blue-200">
          GovMesh Legacy Adapter v2.4
        </span>
      </div>

      {/* Pipeline Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
        {stages.map((stage) => {
          const isSelected = selectedStage === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`p-3 rounded-lg border text-left transition relative flex flex-col justify-between h-24 ${
                isSelected
                  ? 'border-amber-500 ring-2 ring-amber-400/30 bg-amber-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 font-mono">
                  STAGE {stage.id.toString().padStart(2, '0')}
                </span>
                {getStatusBadge(stage.status)}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 line-clamp-1">{stage.name}</div>
                <div className="text-[10px] capitalize font-medium text-slate-500 mt-0.5">
                  {stage.status}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Card */}
      {selectedStage && (
        <div className="bg-slate-900 text-white p-4 rounded-md text-xs flex items-start justify-between border-l-4 border-amber-500">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-amber-400 font-bold">
                STAGE {selectedStage}: {stages[selectedStage - 1].name}
              </span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                {stages[selectedStage - 1].status}
              </span>
            </div>
            <p className="text-slate-300 mt-1">{stages[selectedStage - 1].desc}</p>
          </div>
          <button
            onClick={() => setSelectedStage(selectedStage % 12 + 1)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] px-3 py-1 rounded transition"
          >
            Next Stage &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
