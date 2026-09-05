import React, { useState } from 'react';
import { ExceptionItem, ServiceRecord } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CorrectionModal } from './CorrectionModal';
import {
  UserCheck,
  Edit3,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  ArrowRight,
  Filter,
  Search,
  ChevronRight,
  MapPin,
  Building2,
  FileText,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';

interface OfficerReviewPageProps {
  selectedRecord?: ServiceRecord | null;
  selectedException?: ExceptionItem | null;
  records: ServiceRecord[];
  exceptions: ExceptionItem[];
  onSelectRecord: (rec: ServiceRecord | null) => void;
  onSelectException: (exc: ExceptionItem | null) => void;
  onReviewRecord: (id: string) => Promise<void>;
  onApproveRecord: (id: string) => Promise<void>;
  onRejectRecord: (id: string, reason: string) => Promise<void>;
  onSaveCorrection: (district: string, address: string) => void;
  onReprocess: () => void;
  onNavigate: (page: string) => void;
}

export const OfficerReviewPage: React.FC<OfficerReviewPageProps> = ({
  selectedRecord,
  selectedException,
  records,
  exceptions,
  onSelectRecord,
  onSelectException,
  onReviewRecord,
  onApproveRecord,
  onRejectRecord,
  onSaveCorrection,
  onReprocess,
  onNavigate
}) => {
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState<'APPLICATIONS' | 'EXCEPTIONS'>('APPLICATIONS');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // ---------------------------------------------------------
  // 1. SPECIFIC EXCEPTION REVIEW VIEW
  // ---------------------------------------------------------
  if (selectedException) {
    return (
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Exception Queue', page: 'exception-queue' },
            { label: `Officer Review: ${selectedException.applicationId}` }
          ]}
          onNavigate={onNavigate}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-gov-blue text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                APPLICATION: {selectedException.applicationId}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                selectedException.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                STATUS: {selectedException.status}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              Officer Case Review &amp; Exception Handling
            </h2>
          </div>

          <div className="mt-3 sm:mt-0 flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectException(null)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-3 py-2 rounded shadow-sm transition"
            >
              ← Back to Queue
            </button>
            <button
              onClick={() => setShowCorrectionModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-2 rounded shadow transition flex items-center space-x-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Correct Data</span>
            </button>
            <button
              onClick={onReprocess}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-2 rounded shadow transition flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reprocess</span>
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 text-xs text-emerald-800 font-semibold rounded">
            ✓ {actionMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-2 flex items-center">
              <UserCheck className="w-4 h-4 text-gov-blue mr-2" /> Application Information
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-slate-600">
              <div><span className="font-semibold text-slate-900">Application ID:</span></div>
              <div className="font-mono text-gov-blue font-bold">{selectedException.applicationId}</div>

              <div><span className="font-semibold text-slate-900">Citizen Name:</span></div>
              <div className="font-bold text-slate-900">{selectedException.citizenName}</div>

              <div><span className="font-semibold text-slate-900">Service Category:</span></div>
              <div>Local Rural Record Update</div>

              <div><span className="font-semibold text-slate-900">Assigned District:</span></div>
              <div className="font-bold text-amber-700">{selectedException.district || '(Empty / Missing Field)'}</div>

              <div><span className="font-semibold text-slate-900">Gram Panchayat Address:</span></div>
              <div>{selectedException.address || 'N/A'}</div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-5 rounded-lg border border-slate-800 shadow-sm space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2 flex items-center">
              <ShieldCheck className="w-4 h-4 text-amber-400 mr-2" /> Citizen Consent Verification
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-slate-300">
              <div><span className="text-slate-400">Consent Reference:</span></div>
              <div className="font-mono text-amber-300 font-bold">{selectedException.consentId || 'CONSENT-VERIFIED'}</div>

              <div><span className="text-slate-400">Consent Purpose:</span></div>
              <div>Rural local-government address update</div>

              <div><span className="text-slate-400">Consent Status:</span></div>
              <div><span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-700">ACTIVE &amp; VALID</span></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-2">
            Validation Check Diagnostic
          </h3>
          <div className="bg-red-50 border border-red-200 p-4 rounded text-xs space-y-2">
            <div className="flex items-center space-x-2 text-red-800 font-bold">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Validation Failure Diagnostic: {selectedException.errorType}</span>
            </div>
            <p className="text-slate-700">{selectedException.description}</p>
          </div>
        </div>

        {showCorrectionModal && (
          <CorrectionModal
            exception={selectedException}
            onClose={() => setShowCorrectionModal(false)}
            onSaveCorrection={(d, a) => {
              onSaveCorrection(d, a);
              setShowCorrectionModal(false);
              setActionMessage('Correction applied successfully.');
            }}
          />
        )}
      </div>
    );
  }

  // ---------------------------------------------------------
  // 2. SPECIFIC APPLICATION RECORD REVIEW VIEW (E.G. GM-2026-000124)
  // ---------------------------------------------------------
  if (selectedRecord) {
    const isApp124 = selectedRecord.applicationId === 'GM-2026-000124';
    const st = (selectedRecord.status || 'RECEIVED').toUpperCase();
    let badgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
    let humanReviewStatus = 'PENDING';
    if (st === 'UNDER_REVIEW') {
      badgeClass = 'bg-purple-100 text-purple-800 border-purple-300';
      humanReviewStatus = 'UNDER_REVIEW';
    } else if (st === 'APPROVED' || st === 'COMPLETED') {
      badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      humanReviewStatus = 'APPROVED';
    } else if (st === 'REJECTED' || st === 'FAILED') {
      badgeClass = 'bg-red-100 text-red-800 border-red-300';
      humanReviewStatus = 'REJECTED';
    }

    return (
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Rural Review Queue', page: 'officer-review' },
            { label: `Officer Review: ${selectedRecord.applicationId}` }
          ]}
          onNavigate={onNavigate}
        />

        {/* Header with Officer Decision Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-gov-blue text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                APPLICATION: {selectedRecord.applicationId}
              </span>
              <span className="bg-slate-800 text-slate-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                DEPT REF: {selectedRecord.departmentApplicationId || selectedRecord.id}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}>
                STATUS: {st}
              </span>
              <span className="bg-slate-100 text-slate-700 font-sans text-[10px] font-bold px-2 py-0.5 rounded border border-slate-300">
                HUMAN REVIEW: {humanReviewStatus}
              </span>
              {isApp124 && (
                <span className="bg-amber-500 text-slate-950 font-sans text-[10px] font-black px-2 py-0.5 rounded inline-flex items-center shadow-xs">
                  <Sparkles className="w-3 h-3 mr-1" /> GovMesh Demo — Recently Received
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              Officer Case Review &amp; Official Approval
            </h2>
          </div>

          <div className="mt-3 sm:mt-0 flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectRecord(null)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-3 py-2 rounded shadow-sm transition"
            >
              ← Back to Review Queue
            </button>

            {st === 'RECEIVED' && (
              <button
                disabled={actionLoading}
                onClick={async () => {
                  setActionLoading(true);
                  try {
                    await onReviewRecord(selectedRecord.applicationId);
                    setActionMessage('Application placed under officer review.');
                  } finally {
                    setActionLoading(false);
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded shadow transition flex items-center space-x-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Start Review</span>
              </button>
            )}

            {(st === 'UNDER_REVIEW' || st === 'RECEIVED') && (
              <>
                <button
                  disabled={actionLoading}
                  onClick={async () => {
                    setActionLoading(true);
                    try {
                      await onApproveRecord(selectedRecord.applicationId);
                      setActionMessage('Application APPROVED by Officer. Gram Panchayat registry updated.');
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded shadow transition flex items-center space-x-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approve Application</span>
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => setRejectModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-2 rounded shadow transition flex items-center space-x-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {(st === 'APPROVED' || st === 'COMPLETED') && (
              <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-2 rounded border border-emerald-300 flex items-center">
                <Check className="w-4 h-4 mr-1 text-emerald-600" /> Authorized &amp; Approved by Officer
              </span>
            )}
          </div>
        </div>

        {actionMessage && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 text-xs text-emerald-800 font-semibold rounded">
            ✓ {actionMessage}
          </div>
        )}

        {/* Workflow Progression Visualizer */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            GovMesh Human-in-the-Loop Workflow Flowchart
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="bg-blue-50 text-gov-blue px-2.5 py-1 rounded border border-blue-200">
              1. Citizen Submission (GovMesh Portal)
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="bg-purple-50 text-purple-800 px-2.5 py-1 rounded border border-purple-200">
              2. Rural Ingress Delivery (/api/rural/address-update)
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className={`px-2.5 py-1 rounded border ${
              st === 'RECEIVED' ? 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse' : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              3. Officer Queue (RECEIVED)
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className={`px-2.5 py-1 rounded border ${
              st === 'UNDER_REVIEW' ? 'bg-purple-100 text-purple-900 border-purple-400 animate-pulse' :
              st === 'APPROVED' ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              4. Officer Decision (UNDER_REVIEW / APPROVED)
            </span>
          </div>
        </div>

        {/* Detailed Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panel 1: Citizen & Application Information */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-2 flex items-center">
              <Building2 className="w-4 h-4 text-gov-blue mr-2" /> Application &amp; Citizen Information
            </h3>
            <div className="grid grid-cols-2 gap-y-2.5 text-slate-600">
              <div><span className="font-semibold text-slate-900">Application ID:</span></div>
              <div className="font-mono text-gov-blue font-bold">{selectedRecord.applicationId}</div>

              <div><span className="font-semibold text-slate-900">Source:</span></div>
              <div><span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-200">{selectedRecord.source || (isApp124 ? 'GOVMESH — DEMO' : 'GOVMESH')}</span></div>

              <div><span className="font-semibold text-slate-900">Received Through:</span></div>
              <div className="font-semibold text-slate-800">{selectedRecord.gateway || 'GovMesh Interoperability Gateway'}</div>

              <div><span className="font-semibold text-slate-900">Priority:</span></div>
              <div>
                <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                  selectedRecord.priority === 'HIGH' || isApp124 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                }`}>
                  {selectedRecord.priority || (isApp124 ? 'HIGH' : 'Medium')}
                </span>
              </div>

              <div><span className="font-semibold text-slate-900">Citizen Name:</span></div>
              <div className="font-bold text-slate-900">{selectedRecord.citizenName}</div>

              <div><span className="font-semibold text-slate-900">Citizen Reference:</span></div>
              <div className="font-mono text-slate-700">{selectedRecord.citizenRef || selectedRecord.citizenId}</div>

              <div><span className="font-semibold text-slate-900">Service Category:</span></div>
              <div className="font-semibold text-slate-900">{selectedRecord.service || 'Rural Address Update'}</div>

              <div><span className="font-semibold text-slate-900">Assigned District:</span></div>
              <div className="font-bold text-amber-700">{selectedRecord.district || 'Pune'}</div>

              <div><span className="font-semibold text-slate-900">State:</span></div>
              <div>{selectedRecord.state || 'Maharashtra'}</div>

              <div><span className="font-semibold text-slate-900">Received At:</span></div>
              <div className="font-mono">{new Date(selectedRecord.receivedDate || selectedRecord.receivedAt || Date.now()).toLocaleString()}</div>

              <div><span className="font-semibold text-slate-900">Requested Address:</span></div>
              <div className="col-span-2 bg-slate-50 p-2.5 rounded border border-slate-200 font-sans text-slate-900 font-medium">
                {selectedRecord.address}
              </div>
            </div>
          </div>

          {/* Panel 2: Citizen Consent & Cryptographic Integrity */}
          <div className="bg-slate-900 text-white p-5 rounded-lg border border-slate-800 shadow-sm space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2 flex items-center">
              <ShieldCheck className="w-4 h-4 text-amber-400 mr-2" /> Consent &amp; Cryptographic Verification
            </h3>
            <div className="grid grid-cols-2 gap-y-2.5 text-slate-300">
              <div><span className="text-slate-400">Consent Reference:</span></div>
              <div className="font-mono text-amber-300 font-bold">{selectedRecord.consentId || 'DEMO-CONSENT-124'}</div>

              <div><span className="text-slate-400">Consent Purpose:</span></div>
              <div>Cross-department address amendment</div>

              <div><span className="text-slate-400">Consent Status:</span></div>
              <div><span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-700">ACTIVE &amp; VALID</span></div>

              <div><span className="text-slate-400">Correlation ID:</span></div>
              <div className="font-mono text-[10px] text-amber-300 truncate">{selectedRecord.correlationId || 'DEMO-CORR-124'}</div>

              <div><span className="text-slate-400">Cryptographic Integrity:</span></div>
              <div><span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-700">SHA-256 VERIFIED</span></div>

              <div><span className="text-slate-400">Officer Decision:</span></div>
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  st === 'APPROVED' ? 'bg-emerald-900 text-emerald-300' :
                  st === 'REJECTED' ? 'bg-red-900 text-red-300' : 'bg-slate-800 text-amber-300'
                }`}>
                  {humanReviewStatus}
                </span>
              </div>

              {selectedRecord.reviewedBy && (
                <>
                  <div className="text-slate-400">Reviewed By:</div>
                  <div className="font-mono text-slate-200">{selectedRecord.reviewedBy}</div>
                </>
              )}

              {selectedRecord.rejectionReason && (
                <>
                  <div className="text-red-400 font-bold">Rejection Reason:</div>
                  <div className="text-red-300 font-semibold">{selectedRecord.rejectionReason}</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reject Modal */}
        {rejectModalOpen && (
          <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" /> Reject Application
              </h3>
              <p className="text-xs text-slate-600">
                Please enter the official reason for rejecting application <code className="font-bold text-gov-blue">{selectedRecord.applicationId}</code>:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Address details could not be verified by Gram Panchayat field staff..."
                rows={3}
                className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  disabled={!rejectReason.trim()}
                  onClick={async () => {
                    await onRejectRecord(selectedRecord.applicationId, rejectReason);
                    setRejectModalOpen(false);
                    setActionMessage('Application rejected with official reason.');
                  }}
                  className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------
  // 3. OFFICER REVIEW QUEUE (DEFAULT VIEW WHEN NAVIGATING)
  // ---------------------------------------------------------
  // Sort with GM-2026-000124 always at the top
  const sortedRecords = [...records].sort((a, b) => {
    if (a.applicationId === 'GM-2026-000124') return -1;
    if (b.applicationId === 'GM-2026-000124') return 1;
    const timeA = new Date(a.receivedDate || a.receivedAt || 0).getTime();
    const timeB = new Date(b.receivedDate || b.receivedAt || 0).getTime();
    return timeB - timeA;
  });

  const pendingApps = sortedRecords.filter(r => (r.status || 'RECEIVED').toUpperCase() === 'RECEIVED' || (r.status || '').toUpperCase() === 'UNDER_REVIEW');
  const filteredRecords = sortedRecords.filter(r => {
    const st = (r.status || 'RECEIVED').toUpperCase();
    const matchesFilter =
      statusFilter === 'ALL' ? true :
      statusFilter === 'PENDING' ? (st === 'RECEIVED' || st === 'UNDER_REVIEW') :
      statusFilter === 'APPROVED' ? (st === 'APPROVED' || st === 'COMPLETED') :
      statusFilter === 'REJECTED' ? (st === 'REJECTED' || st === 'FAILED') :
      st === statusFilter;

    const matchesSearch =
      r.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.service || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Officer Review Queue' }]} onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Officer Case Review &amp; Approval Queue
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Inspect incoming cross-department citizen applications, verify Gram Panchayat records, and authorize state-level updates.
          </p>
        </div>
      </div>

      {/* Quick KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => { setActiveTab('APPLICATIONS'); setStatusFilter('PENDING'); }}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-amber-400 transition"
        >
          <div className="text-[11px] font-bold uppercase text-slate-500">Pending Review</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingApps.length}</div>
        </div>
        <div
          onClick={() => { setActiveTab('APPLICATIONS'); setStatusFilter('APPROVED'); }}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-400 transition"
        >
          <div className="text-[11px] font-bold uppercase text-slate-500">Approved Cases</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {records.filter(r => (r.status || '').toUpperCase() === 'APPROVED' || (r.status || '').toUpperCase() === 'COMPLETED').length}
          </div>
        </div>
        <div
          onClick={() => { setActiveTab('APPLICATIONS'); setStatusFilter('ALL'); }}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 transition"
        >
          <div className="text-[11px] font-bold uppercase text-slate-500">Total Applications</div>
          <div className="text-2xl font-black text-gov-blue mt-1">{records.length}</div>
        </div>
        <div
          onClick={() => setActiveTab('EXCEPTIONS')}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-purple-400 transition"
        >
          <div className="text-[11px] font-bold uppercase text-slate-500">Exceptions Queue</div>
          <div className="text-2xl font-black text-purple-600 mt-1">{exceptions.length}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('APPLICATIONS')}
          className={`pb-2.5 text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'APPLICATIONS'
              ? 'border-b-2 border-gov-blue text-gov-blue'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Citizen Applications ({records.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('EXCEPTIONS')}
          className={`pb-2.5 text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'EXCEPTIONS'
              ? 'border-b-2 border-gov-blue text-gov-blue'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Exceptions &amp; Corrections ({exceptions.length})</span>
        </button>
      </div>

      {activeTab === 'APPLICATIONS' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Application ID, Citizen Name, Service, Address..."
                className="pl-9 w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-gov-blue"
              />
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded text-xs bg-white focus:ring-2 focus:ring-gov-blue"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review (RECEIVED / UNDER_REVIEW)</option>
                <option value="RECEIVED">RECEIVED</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <th className="p-3">Application ID</th>
                    <th className="p-3">Citizen Name</th>
                    <th className="p-3">District</th>
                    <th className="p-3">Service</th>
                    <th className="p-3">Received Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Officer Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 font-sans text-xs">
                        <div className="max-w-sm mx-auto space-y-2">
                          <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
                          <div className="font-bold text-slate-700">No applications in this queue</div>
                          <p className="text-slate-500 text-[11px]">
                            Try adjusting your filters or search query.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => {
                      const isApp124 = rec.applicationId === 'GM-2026-000124';
                      const st = (rec.status || 'RECEIVED').toUpperCase();
                      let badgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
                      if (st === 'UNDER_REVIEW') badgeClass = 'bg-purple-100 text-purple-800 border-purple-300';
                      else if (st === 'APPROVED' || st === 'COMPLETED') badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                      else if (st === 'REJECTED' || st === 'FAILED') badgeClass = 'bg-red-100 text-red-800 border-red-300';

                      return (
                        <tr
                          key={rec.id}
                          className={`transition font-mono ${
                            isApp124 ? 'bg-amber-50/50 hover:bg-amber-50 border-l-4 border-l-amber-500' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-3 font-bold text-gov-blue">
                            <button
                              onClick={() => onSelectRecord(rec)}
                              className="hover:underline flex flex-col items-start space-y-0.5"
                            >
                              <span className="flex items-center space-x-1">
                                <span>{rec.applicationId}</span>
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                              </span>
                              {isApp124 && (
                                <span className="bg-amber-500 text-slate-950 font-sans text-[9px] font-black px-1.5 py-0.2 rounded inline-flex items-center shadow-xs">
                                  <Sparkles className="w-2.5 h-2.5 mr-0.5" /> GovMesh Demo — Recently Received
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="p-3 font-sans font-semibold text-slate-900">{rec.citizenName}</td>
                          <td className="p-3 font-sans font-bold text-amber-700">{rec.district}</td>
                          <td className="p-3 font-sans text-slate-700 font-medium truncate max-w-[180px]">{rec.service || 'Rural Address Update'}</td>
                          <td className="p-3 text-slate-500">{new Date(rec.receivedDate || rec.receivedAt || Date.now()).toLocaleDateString()}</td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center border ${badgeClass}`}>
                              {st}
                            </span>
                          </td>
                          <td className="p-3 text-right font-sans">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => onSelectRecord(rec)}
                                className="bg-gov-blue hover:bg-blue-800 text-white font-bold text-[10px] px-2.5 py-1 rounded shadow-xs"
                              >
                                View Case
                              </button>
                              {st === 'RECEIVED' && (
                                <button
                                  onClick={async () => {
                                    await onReviewRecord(rec.applicationId);
                                  }}
                                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] px-2 py-1 rounded"
                                >
                                  Review
                                </button>
                              )}
                              {(st === 'UNDER_REVIEW' || st === 'RECEIVED') && (
                                <button
                                  onClick={async () => {
                                    await onApproveRecord(rec.applicationId);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1 rounded"
                                >
                                  Approve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'EXCEPTIONS' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <th className="p-3">Application ID</th>
                  <th className="p-3">Citizen Name</th>
                  <th className="p-3">Error Diagnostic</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exceptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-sans text-xs">
                      No active exceptions in the queue.
                    </td>
                  </tr>
                ) : (
                  exceptions.map((exc) => (
                    <tr key={exc.id} className="hover:bg-slate-50 transition font-mono">
                      <td className="p-3 font-bold text-gov-blue">{exc.applicationId}</td>
                      <td className="p-3 font-sans font-semibold text-slate-900">{exc.citizenName}</td>
                      <td className="p-3 font-sans text-red-700 font-semibold">{exc.errorType}</td>
                      <td className="p-3 font-sans">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          exc.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {exc.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          exc.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {exc.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-sans">
                        <button
                          onClick={() => onSelectException(exc)}
                          className="bg-gov-blue hover:bg-blue-800 text-white font-bold text-[10px] px-2.5 py-1 rounded"
                        >
                          Review &amp; Fix
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
