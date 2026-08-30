import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export const Banner: React.FC = () => {
  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm border-b border-amber-600">
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 text-slate-950 shrink-0" />
        <span>
          <strong>DEMO MODE:</strong> This environment simulates a legacy CSV / SFTP government integration for Rural Development & Panchayat Raj Department.
        </span>
      </div>
      <div className="hidden md:flex items-center space-x-2 bg-slate-950/15 px-2.5 py-0.5 rounded text-[11px] font-mono">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
        <span>Simulated SFTP Connector Active</span>
      </div>
    </div>
  );
};
