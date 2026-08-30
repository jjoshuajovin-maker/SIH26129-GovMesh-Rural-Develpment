import React, { useState } from 'react';
import { FailedTransfer } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { WifiOff, RefreshCw, CheckCircle2, AlertOctagon, ArrowRight } from 'lucide-react';

interface FailedTransfersPageProps {
  transfers: FailedTransfer[];
  onRetryTransfer: (id: string) => void;
  onNavigate: (page: string) => void;
}

export const FailedTransfersPage: React.FC<FailedTransfersPageProps> = ({
  transfers,
  onRetryTransfer,
  onNavigate
}) => {
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const handleRetryClick = (id: string) => {
    setRetryingId(id);
    setTimeout(() => {
      onRetryTransfer(id);
      setRetryingId(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Failed Transfers' }]} onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Failed File Transfer Recovery Queue
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Monitor network transfer failures and initiate manual or automatic retry attempts.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded text-xs text-amber-900 space-y-1">
        <div className="font-bold flex items-center space-x-1.5">
          <AlertOctagon className="w-4 h-4 text-amber-600" />
          <span>AUTOMATED RETRY RECOVERY ENGINE ACTIVE</span>
        </div>
        <p className="text-amber-800">
          When legacy SFTP network connections experience temporary downtime, files are automatically queued for background retry. No citizen manual resubmission is required.
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <th className="p-3">Transfer ID</th>
                <th className="p-3">File Name</th>
                <th className="p-3">Destination</th>
                <th className="p-3">Status</th>
                <th className="p-3">Failure Reason</th>
                <th className="p-3">Attempts</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.map((tx) => {
                const isRetrying = retryingId === tx.id;
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 font-mono">
                    <td className="p-3 font-bold text-slate-900">{tx.id}</td>
                    <td className="p-3 text-gov-blue font-bold">{tx.fileName}</td>
                    <td className="p-3 text-slate-600">{tx.destination}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isRetrying ? 'TRANSFERRING...' : tx.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-sans">{tx.reason}</td>
                    <td className="p-3 font-bold">Attempt #{tx.retryAttempts || 1} / {tx.maxRetries}</td>
                    <td className="p-3 text-right">
                      {tx.status === 'SUCCESS' ? (
                        <span className="text-emerald-600 font-bold text-[11px] inline-flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Recovered
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRetryClick(tx.id)}
                          disabled={isRetrying}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1 rounded text-xs transition inline-flex items-center space-x-1 shadow"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                          <span>{isRetrying ? 'Retrying...' : 'Retry Transfer'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
