import React from 'react';
import { Sliders, RefreshCw, AlertOctagon, FileCode, Copy, ShieldAlert } from 'lucide-react';
import { DemoControls } from '../types';

interface DemoControlsPanelProps {
  demoControls: DemoControls;
  onToggleFailure: (type: string) => void;
  onResetDemo: () => void;
}

export const DemoControlsPanel: React.FC<DemoControlsPanelProps> = ({
  demoControls,
  onToggleFailure,
  onResetDemo
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-lg p-4 border border-amber-500/40 shadow-lg mb-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Presenter Demo Controls & Failure Injection Panel
          </h3>
        </div>
        <button
          onClick={onResetDemo}
          className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs px-2.5 py-1 rounded font-semibold transition border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
        <button
          onClick={() => onToggleFailure('simulateSftpFailure')}
          className={`p-2.5 rounded border flex items-center justify-between transition ${
            demoControls.simulateSftpFailure
              ? 'bg-red-950 border-red-500 text-red-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
        >
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>SFTP Failure</span>
          </div>
          <span className={`w-2 h-2 rounded-full ${demoControls.simulateSftpFailure ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`}></span>
        </button>

        <button
          onClick={() => onToggleFailure('simulateCorruptedFile')}
          className={`p-2.5 rounded border flex items-center justify-between transition ${
            demoControls.simulateCorruptedFile
              ? 'bg-red-950 border-red-500 text-red-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
        >
          <div className="flex items-center space-x-2">
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Corrupted File</span>
          </div>
          <span className={`w-2 h-2 rounded-full ${demoControls.simulateCorruptedFile ? 'bg-amber-500 animate-ping' : 'bg-slate-600'}`}></span>
        </button>

        <button
          onClick={() => onToggleFailure('simulateInvalidSchema')}
          className={`p-2.5 rounded border flex items-center justify-between transition ${
            demoControls.simulateInvalidSchema
              ? 'bg-red-950 border-red-500 text-red-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
        >
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-3.5 h-3.5 text-yellow-400" />
            <span>Invalid Schema</span>
          </div>
          <span className={`w-2 h-2 rounded-full ${demoControls.simulateInvalidSchema ? 'bg-yellow-500 animate-ping' : 'bg-slate-600'}`}></span>
        </button>

        <button
          onClick={() => onToggleFailure('simulateDuplicateFile')}
          className={`p-2.5 rounded border flex items-center justify-between transition ${
            demoControls.simulateDuplicateFile
              ? 'bg-red-950 border-red-500 text-red-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Copy className="w-3.5 h-3.5 text-blue-400" />
            <span>Duplicate File</span>
          </div>
          <span className={`w-2 h-2 rounded-full ${demoControls.simulateDuplicateFile ? 'bg-blue-500 animate-ping' : 'bg-slate-600'}`}></span>
        </button>

        <button
          onClick={() => onToggleFailure('simulateMissingColumn')}
          className={`p-2.5 rounded border flex items-center justify-between transition ${
            demoControls.simulateMissingColumn
              ? 'bg-red-950 border-red-500 text-red-200'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
        >
          <div className="flex items-center space-x-2">
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
            <span>Missing Column</span>
          </div>
          <span className={`w-2 h-2 rounded-full ${demoControls.simulateMissingColumn ? 'bg-purple-500 animate-ping' : 'bg-slate-600'}`}></span>
        </button>
      </div>
    </div>
  );
};
