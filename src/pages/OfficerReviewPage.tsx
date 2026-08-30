import React, { useState } from 'react';
import { ExceptionItem } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CorrectionModal } from './CorrectionModal';
import { UserCheck, Edit3, RefreshCw, CheckCircle, XCircle, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

interface OfficerReviewPageProps {
  exception: ExceptionItem;
  onSaveCorrection: (district: string, address: string) => void;
  onReprocess: () => void;
  onNavigate: (page: string) => void;
}

export const OfficerReviewPage: React.FC<OfficerReviewPageProps> = ({
  exception,
  onSaveCorrection,
  onReprocess,
  onNavigate
}) => {
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const handleAction = (type: string) => {
    setActionMessage(`Officer action '${type}' recorded in Audit Logs.`);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Exception Queue', page: 'exception-queue' },
          { label: `Officer Review: ${exception.applicationId}` }
        ]}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-gov-blue text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
              APPLICATION: {exception.applicationId}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              exception.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              STATUS: {exception.status}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            Officer Case Review &amp; Exception Handling
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 sm:mt-0 flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleAction('Approved')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded shadow transition flex items-center space-x-1"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Approve</span>
          </button>

          <button
            onClick={() => setShowCorrectionModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-2 rounded shadow transition flex items-center space-x-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Correct</span>
          </button>

          <button
            onClick={() => handleAction('Information Requested')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded shadow transition flex items-center space-x-1"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Request Info</span>
          </button>

          <button
            onClick={onReprocess}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-2 rounded shadow transition flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reprocess</span>
          </button>

          <button
            onClick={() => handleAction('Rejected')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-2 rounded shadow transition flex items-center space-x-1"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 text-xs text-emerald-800 font-semibold rounded">
          ✓ {actionMessage}
        </div>
      )}

      {/* Grid of Information Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Application Information */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-2 flex items-center">
            <UserCheck className="w-4 h-4 text-gov-blue mr-2" /> Application Information
          </h3>
          <div className="grid grid-cols-2 gap-y-2 text-slate-600">
            <div><span className="font-semibold text-slate-900">Application ID:</span></div>
            <div className="font-mono text-gov-blue font-bold">{exception.applicationId}</div>

            <div><span className="font-semibold text-slate-900">Citizen Reference:</span></div>
            <div className="font-mono text-slate-700">CITIZEN-001 (Demo Citizen)</div>

            <div><span className="font-semibold text-slate-900">Service Category:</span></div>
            <div>Local Rural Record Update</div>

            <div><span className="font-semibold text-slate-900">Assigned District:</span></div>
            <div className="font-bold text-amber-700">{exception.district || '(Empty / Missing Field)'}</div>

            <div><span className="font-semibold text-slate-900">Gram Panchayat Address:</span></div>
            <div>{exception.address || 'Plot 12 Gram Panchayat Road'}</div>

            <div><span className="font-semibold text-slate-900">Panchayat Verification:</span></div>
            <div><span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">VERIFIED</span></div>
          </div>
        </div>

        {/* Panel 2: Consent Details */}
        <div className="bg-slate-900 text-white p-5 rounded-lg border border-slate-800 shadow-sm space-y-3 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2 flex items-center">
            <ShieldCheck className="w-4 h-4 text-amber-400 mr-2" /> Citizen Consent Verification
          </h3>
          <div className="grid grid-cols-2 gap-y-2 text-slate-300">
            <div><span className="text-slate-400">Consent Reference:</span></div>
            <div className="font-mono text-amber-300 font-bold">{exception.consentId || 'CONSENT-00125'}</div>

            <div><span className="text-slate-400">Consent Purpose:</span></div>
            <div>Rural local-government address update</div>

            <div><span className="text-slate-400">Consent Status:</span></div>
            <div><span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-700">ACTIVE &amp; VALID</span></div>

            <div><span className="text-slate-400">Permitted Fields:</span></div>
            <div className="font-mono text-[10px] text-slate-300">citizen_name, address, district, verified</div>
          </div>
        </div>
      </div>

      {/* Panel 3: Incoming CSV Data vs Validation Result */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-2">
          Received CSV Raw Row &amp; Validation Check Breakdown
        </h3>

        <div className="bg-slate-950 text-amber-300 font-mono text-xs p-3 rounded overflow-x-auto">
          application_id,citizen_name,address,district,verified<br />
          {exception.applicationId},{exception.citizenName},{exception.address},{exception.district || ''},true
        </div>

        <div className="bg-red-50 border border-red-200 p-4 rounded text-xs space-y-2">
          <div className="flex items-center space-x-2 text-red-800 font-bold">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>Validation Failure Diagnostic: {exception.errorType}</span>
          </div>
          <p className="text-slate-700">{exception.description}</p>
        </div>
      </div>

      {/* Correction Modal */}
      {showCorrectionModal && (
        <CorrectionModal
          exception={exception}
          onClose={() => setShowCorrectionModal(false)}
          onSaveCorrection={(d, a) => {
            onSaveCorrection(d, a);
            setShowCorrectionModal(false);
          }}
        />
      )}
    </div>
  );
};
