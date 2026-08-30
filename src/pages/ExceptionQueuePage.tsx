import React from 'react';
import { ExceptionItem } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { AlertTriangle, ShieldAlert, CheckCircle2, UserCheck, Eye, ArrowRight } from 'lucide-react';

interface ExceptionQueuePageProps {
  exceptions: ExceptionItem[];
  onReviewException: (exc: ExceptionItem) => void;
  onNavigate: (page: string) => void;
}

export const ExceptionQueuePage: React.FC<ExceptionQueuePageProps> = ({
  exceptions,
  onReviewException,
  onNavigate
}) => {
  const pendingCount = exceptions.filter(e => e.status === 'Pending').length;
  const criticalCount = exceptions.filter(e => e.priority === 'High').length;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Exception Queue' }]} onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Exception Queue Management
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Review invalid records, fix field validation errors, or reprocess exception cases.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-slate-500">Total Exceptions</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{exceptions.length}</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>

        <div className="bg-white p-4 rounded-lg border border-red-200 bg-red-50/40 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-red-900">Critical High Priority</div>
            <div className="text-2xl font-extrabold text-red-700 mt-1">{criticalCount}</div>
          </div>
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>

        <div className="bg-white p-4 rounded-lg border border-amber-200 bg-amber-50/40 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-amber-900">Pending Review</div>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">{pendingCount}</div>
          </div>
          <UserCheck className="w-8 h-8 text-amber-600" />
        </div>
      </div>

      {/* Exception Records Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Pending Exception Items
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Real-time Officer Queue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <th className="p-3">Application ID</th>
                <th className="p-3">Error Type</th>
                <th className="p-3">Description</th>
                <th className="p-3">Created</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exceptions.map((exc) => (
                <tr key={exc.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-gov-blue">{exc.applicationId}</td>
                  <td className="p-3">
                    <span className="bg-red-100 text-red-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {exc.errorType}
                    </span>
                  </td>
                  <td className="p-3 text-slate-800 font-medium">{exc.description}</td>
                  <td className="p-3 text-slate-500">
                    {new Date(exc.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      exc.priority === 'High' ? 'bg-red-600 text-white' : exc.priority === 'Medium' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {exc.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      exc.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {exc.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onReviewException(exc)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1 rounded text-xs transition inline-flex items-center space-x-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{exc.status === 'Resolved' ? 'View' : 'Review'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
