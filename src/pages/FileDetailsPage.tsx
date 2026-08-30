import React, { useState } from 'react';
import { FileItem } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ShieldCheck, Download, Code, CheckCircle, FileText, ArrowRight } from 'lucide-react';

interface FileDetailsPageProps {
  file: FileItem;
  content: { headers: string[]; rows: any[]; raw: string };
  onValidate: () => void;
  onNavigate: (page: string) => void;
}

export const FileDetailsPage: React.FC<FileDetailsPageProps> = ({
  file,
  content,
  onValidate,
  onNavigate
}) => {
  const [showRaw, setShowRaw] = useState(false);

  const handleDownloadCSV = () => {
    const element = document.createElement("a");
    const blob = new Blob([content.raw], { type: 'text/csv' });
    element.href = URL.createObjectURL(blob);
    element.download = file.fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Incoming Files', page: 'incoming-files' },
          { label: file.fileName }
        ]}
        onNavigate={onNavigate}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-slate-800 text-amber-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
              FILE ID: {file.id}
            </span>
            <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded flex items-center">
              <ShieldCheck className="w-3 h-3 mr-1" /> INTEGRITY VERIFIED
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            {file.fileName}
          </h2>
        </div>

        <div className="mt-3 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center space-x-1 bg-white hover:bg-slate-50 text-slate-700 text-xs px-3 py-2 rounded border border-slate-300 font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={() => setShowRaw(!showRaw)}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-900 text-slate-200 text-xs px-3 py-2 rounded font-semibold transition"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showRaw ? 'View Table' : 'View Raw CSV'}</span>
          </button>

          <button
            onClick={onValidate}
            className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded shadow transition"
          >
            <CheckCircle className="w-4 h-4 text-slate-950" />
            <span>Validate File</span>
          </button>
        </div>
      </div>

      {/* Grid of File Details & Manifest */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Technical File Attributes */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-gov-blue" /> Technical File Specifications
          </h3>
          <div className="grid grid-cols-2 gap-y-2 text-slate-600">
            <div><span className="font-semibold text-slate-900">Application ID:</span></div>
            <div className="font-mono text-gov-blue font-bold">{file.applicationId}</div>

            <div><span className="font-semibold text-slate-900">Source System:</span></div>
            <div>{file.source}</div>

            <div><span className="font-semibold text-slate-900">Received Timestamp:</span></div>
            <div>{new Date(file.receivedTime).toLocaleString()}</div>

            <div><span className="font-semibold text-slate-900">File Size:</span></div>
            <div>{file.fileSize}</div>

            <div><span className="font-semibold text-slate-900">Record Count:</span></div>
            <div>{file.recordsCount} records</div>

            <div><span className="font-semibold text-slate-900">Transfer Protocol:</span></div>
            <div>{file.transferMethod} (SSH Key Encryption)</div>

            <div><span className="font-semibold text-slate-900">Checksum Algorithm:</span></div>
            <div>{file.checksumAlg}</div>

            <div><span className="font-semibold text-slate-900">SHA-256 Hash:</span></div>
            <div className="font-mono text-[10px] text-slate-700 truncate" title={file.checksum}>
              {file.checksum}
            </div>
          </div>
        </div>

        {/* Card 2: File Manifest & Consent Metadata */}
        <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 shadow-sm space-y-3 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2 text-amber-400" /> Manifest &amp; Consent Verification
          </h3>
          <div className="grid grid-cols-2 gap-y-2 text-slate-300">
            <div><span className="text-slate-400">Consent Reference:</span></div>
            <div className="font-mono text-amber-300 font-bold">{file.manifest?.consent || 'CONSENT-00124'}</div>

            <div><span className="text-slate-400">Declared Purpose:</span></div>
            <div>{file.manifest?.purpose || 'Rural service record update'}</div>

            <div><span className="text-slate-400">Created Date:</span></div>
            <div>{file.manifest?.created ? new Date(file.manifest.created).toLocaleString() : '30 August 2026'}</div>

            <div><span className="text-slate-400">Allowed Data Fields:</span></div>
            <div>
              <span className="bg-slate-800 text-emerald-300 font-mono text-[10px] px-1.5 py-0.5 rounded">
                citizen_name, address, district, verified
              </span>
            </div>

            <div><span className="text-slate-400">Integrity Check:</span></div>
            <div>
              <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700 text-[10px]">
                ✓ INTEGRITY VERIFIED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Content Viewer Table or Raw Viewer */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            CSV Record Content Viewer ({content.rows.length} {content.rows.length === 1 ? 'Record' : 'Records'})
          </h3>
          <span className="text-[10px] font-mono text-slate-500">Standard Delimiter: Comma (,)</span>
        </div>

        {showRaw ? (
          <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre">
            {content.raw}
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <th className="p-3 w-12 text-slate-400 font-mono">#</th>
                  {content.headers.map((h, i) => (
                    <th key={i} className="p-3 font-mono text-gov-blue">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {content.rows.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50 font-mono text-slate-800">
                    <td className="p-3 text-slate-400 font-bold">{index + 1}</td>
                    {content.headers.map((h, i) => (
                      <td key={i} className="p-3">
                        {row[h] !== undefined ? String(row[h]) : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
