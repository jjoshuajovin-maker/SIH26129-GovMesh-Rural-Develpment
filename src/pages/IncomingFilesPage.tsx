import React, { useState } from 'react';
import { FileItem } from '../types';
import { RefreshCw, Upload, Play, ShieldCheck, Eye, AlertTriangle } from 'lucide-react';

interface IncomingFilesPageProps {
  files: FileItem[];
  onRefresh: () => void;
  onUploadDemoFile: () => void;
  onSelectFile: (fileId: string) => void;
}

export const IncomingFilesPage: React.FC<IncomingFilesPageProps> = ({
  files,
  onRefresh,
  onUploadDemoFile,
  onSelectFile
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">RECEIVED</span>;
      case 'PROCESSED':
      case 'COMPLETED':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">PROCESSED</span>;
      case 'VALIDATING':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">VALIDATING</span>;
      case 'INVALID':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">INVALID</span>;
      case 'DUPLICATE':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">DUPLICATE</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Incoming Files Management
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Monitor and process CSV files received from GovMesh legacy adapter via SFTP.
          </p>
        </div>
        <div className="mt-3 sm:mt-0 flex flex-wrap items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center space-x-1 bg-white hover:bg-slate-50 text-slate-700 text-xs px-3 py-2 rounded border border-slate-300 font-semibold shadow-sm transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={onUploadDemoFile}
            className="flex items-center space-x-1 bg-gov-blue hover:bg-blue-900 text-white text-xs px-3 py-2 rounded font-semibold shadow transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Demo File</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(files.map(f => f.id));
                      else setSelectedIds([]);
                    }}
                    checked={selectedIds.length === files.length && files.length > 0}
                    className="rounded border-slate-300 text-gov-blue focus:ring-gov-blue"
                  />
                </th>
                <th className="p-3">File ID</th>
                <th className="p-3">File Name</th>
                <th className="p-3">Application ID</th>
                <th className="p-3">Received Time</th>
                <th className="p-3">Records</th>
                <th className="p-3">Checksum Integrity</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50 transition">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(file.id)}
                      onChange={() => toggleSelect(file.id)}
                      className="rounded border-slate-300 text-gov-blue focus:ring-gov-blue"
                    />
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-900">{file.id}</td>
                  <td className="p-3 font-mono text-gov-blue font-semibold">{file.fileName}</td>
                  <td className="p-3 font-mono text-slate-700">{file.applicationId}</td>
                  <td className="p-3 text-slate-500">{new Date(file.receivedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-3 font-bold text-slate-800">{file.recordsCount}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                      SHA-256 Verified
                    </span>
                  </td>
                  <td className="p-3">{getStatusBadge(file.status)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onSelectFile(file.id)}
                      className="inline-flex items-center space-x-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2.5 py-1 rounded text-xs transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
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
