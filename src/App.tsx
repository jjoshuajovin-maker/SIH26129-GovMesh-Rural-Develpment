import React, { useState, useEffect } from 'react';
import { User, FileItem, ExceptionItem, ServiceRecord, FailedTransfer, AuditLog, DemoControls } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Banner } from './components/Banner';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncomingFilesPage } from './pages/IncomingFilesPage';
import { FileDetailsPage } from './pages/FileDetailsPage';
import { ValidationResultsPage } from './pages/ValidationResultsPage';
import { BatchProcessingPage } from './pages/BatchProcessingPage';
import { ExceptionQueuePage } from './pages/ExceptionQueuePage';
import { OfficerReviewPage } from './pages/OfficerReviewPage';
import { FailedTransfersPage } from './pages/FailedTransfersPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { ServiceRecordsPage } from './pages/ServiceRecordsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  const [user, setUser] = useState<User | null>({
    id: 'usr-1',
    username: 'officer_pune',
    name: 'Demo Officer (Rajesh Patil)',
    role: 'Rural Development Officer',
    department: 'Rural Development & Panchayat Raj',
    district: 'Pune'
  });

  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  // Application Data State
  const [kpis, setKpis] = useState<any>(null);
  const [legacyConnector, setLegacyConnector] = useState<any>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [transfers, setTransfers] = useState<FailedTransfer[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [demoControls, setDemoControls] = useState<DemoControls>({
    simulateSftpFailure: false,
    simulateCorruptedFile: false,
    simulateInvalidSchema: false,
    simulateMissingColumn: false,
    simulateDuplicateFile: false
  });

  // Selection States
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [selectedFileContent, setSelectedFileContent] = useState<any>({ headers: [], rows: [], raw: '' });
  const [validationResult, setValidationResult] = useState<any>(null);
  const [batchSummary, setBatchSummary] = useState<any>(null);
  const [selectedException, setSelectedException] = useState<ExceptionItem | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ServiceRecord | null>(null);

  // Load Data from Backend API
  const loadDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setKpis(data.kpis);
        setLegacyConnector(data.legacyConnector);
        setSystemHealth(data.systemHealth);
        setDemoControls(data.demoControls || {});
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    }
  };

  const loadFiles = async () => {
    try {
      const res = await fetch('/api/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
        if (data.length > 0 && !selectedFileId) {
          setSelectedFileId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load files:', e);
    }
  };

  const loadExceptions = async () => {
    try {
      const res = await fetch('/api/exceptions');
      if (res.ok) {
        const data = await res.json();
        setExceptions(data);
      }
    } catch (e) {
      console.error('Failed to load exceptions:', e);
    }
  };

  const loadRecords = async () => {
    try {
      const res = await fetch('/api/records');
      if (res.ok) {
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : (data.applications || []));
      }
    } catch (e) {
      console.error('Failed to load records:', e);
    }
  };

  const loadTransfers = async () => {
    try {
      const res = await fetch('/api/transfers/failed');
      if (res.ok) {
        const data = await res.json();
        setTransfers(data);
      }
    } catch (e) {
      console.error('Failed to load transfers:', e);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    }
  };

  const refreshAll = () => {
    loadDashboardData();
    loadFiles();
    loadExceptions();
    loadRecords();
    loadTransfers();
    loadAuditLogs();
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => {
      refreshAll();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleSelectFile = async (fileId: string) => {
    setSelectedFileId(fileId);
    try {
      const res = await fetch(`/api/files/${fileId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedFileContent(data.content);
      }
    } catch (e) {
      console.error('Failed to load file details:', e);
    }
    setCurrentPage('file-details');
  };

  const handleUploadDemoFile = async () => {
    try {
      const res = await fetch('/api/files/upload', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        refreshAll();
        handleSelectFile(data.file.id);
      }
    } catch (e) {
      console.error('Failed to upload demo file:', e);
    }
  };

  const handleValidateFile = async () => {
    try {
      const res = await fetch(`/api/files/${selectedFileId}/validate`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setValidationResult(data.validationResult);
        setCurrentPage('validation-results');
        refreshAll();
      }
    } catch (e) {
      console.error('Failed to validate file:', e);
    }
  };

  const handleProcessBatch = async () => {
    try {
      const res = await fetch(`/api/files/${selectedFileId}/process`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setBatchSummary(data.batchSummary);
        setCurrentPage('batch-results');
        refreshAll();
      }
    } catch (e) {
      console.error('Failed to process batch:', e);
    }
  };

  const handleSendToGovMesh = async () => {
    try {
      await fetch(`/api/files/${selectedFileId}/send-to-govmesh`, { method: 'POST' });
      refreshAll();
    } catch (e) {
      console.error('Failed to send to GovMesh:', e);
    }
  };

  // Officer Decision Handlers
  const handleReviewRecord = async (appId: string) => {
    try {
      await fetch(`/api/rural/application/${appId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId: user?.id || 'OFFICER-001' })
      });
      refreshAll();
      if (selectedRecord && selectedRecord.applicationId === appId) {
        setSelectedRecord({ ...selectedRecord, status: 'UNDER_REVIEW' });
      }
    } catch (e) {
      console.error('Failed to review record:', e);
    }
  };

  const handleApproveRecord = async (appId: string) => {
    try {
      await fetch(`/api/rural/application/${appId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId: user?.id || 'OFFICER-001' })
      });
      refreshAll();
      if (selectedRecord && selectedRecord.applicationId === appId) {
        setSelectedRecord({ ...selectedRecord, status: 'APPROVED' });
      }
    } catch (e) {
      console.error('Failed to approve record:', e);
    }
  };

  const handleRejectRecord = async (appId: string, reason: string) => {
    try {
      await fetch(`/api/rural/application/${appId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId: user?.id || 'OFFICER-001', reason })
      });
      refreshAll();
      if (selectedRecord && selectedRecord.applicationId === appId) {
        setSelectedRecord({ ...selectedRecord, status: 'REJECTED', rejectionReason: reason });
      }
    } catch (e) {
      console.error('Failed to reject record:', e);
    }
  };

  const handleSaveCorrection = async (district: string, address: string) => {
    if (!selectedException) return;
    try {
      const res = await fetch(`/api/exceptions/${selectedException.id}/correct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district, address })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedException(data.exception);
        refreshAll();
      }
    } catch (e) {
      console.error('Failed to save correction:', e);
    }
  };

  const handleReprocessException = async () => {
    if (!selectedException) return;
    try {
      const res = await fetch(`/api/exceptions/${selectedException.id}/reprocess`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSelectedException(data.exception);
        refreshAll();
      }
    } catch (e) {
      console.error('Failed to reprocess exception:', e);
    }
  };

  const handleRetryTransfer = async (id: string) => {
    try {
      await fetch(`/api/transfers/${id}/retry`, { method: 'POST' });
      refreshAll();
    } catch (e) {
      console.error('Failed to retry transfer:', e);
    }
  };

  const handleToggleFailure = async (type: string) => {
    try {
      const res = await fetch('/api/demo/failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        const data = await res.json();
        setDemoControls(data.demoControls);
        refreshAll();
      }
    } catch (e) {
      console.error('Failed to toggle failure control:', e);
    }
  };

  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        refreshAll();
      }
    } catch (e) {
      console.error('Failed to reset demo environment:', e);
    }
  };

  if (!user) {
    return <LoginPage onLoginSuccess={(u) => setUser(u)} />;
  }

  const selectedFile = files.find(f => f.id === selectedFileId) || files[0];
  const pendingReviewCount = records.filter(r => (r.status || 'RECEIVED').toUpperCase() === 'RECEIVED' || (r.status || '').toUpperCase() === 'UNDER_REVIEW').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      <Header user={user} onLogout={() => setUser(null)} onNavigate={setCurrentPage} />
      <Banner />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => {
            if (page === 'officer-review') {
              // When navigating from sidebar, don't force a single exception or record
            }
            setCurrentPage(page);
          }}
          exceptionCount={exceptions.filter(e => e.status === 'Pending').length}
          failedTransferCount={transfers.filter(t => t.status === 'FAILED').length}
          pendingReviewCount={pendingReviewCount}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage
              kpis={kpis}
              legacyConnector={legacyConnector}
              demoControls={demoControls}
              onToggleFailure={handleToggleFailure}
              onResetDemo={handleResetDemo}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'incoming-files' && (
            <IncomingFilesPage
              files={files}
              onRefresh={refreshAll}
              onUploadDemoFile={handleUploadDemoFile}
              onSelectFile={handleSelectFile}
            />
          )}

          {currentPage === 'file-details' && selectedFile && (
            <FileDetailsPage
              file={selectedFile}
              content={selectedFileContent}
              onValidate={handleValidateFile}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'validation-results' && selectedFile && (
            <ValidationResultsPage
              file={selectedFile}
              result={validationResult || { valid: true, checks: [] }}
              onProcessBatch={handleProcessBatch}
              onNavigateToExceptions={() => setCurrentPage('exception-queue')}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'file-processing' && selectedFile && (
            <ValidationResultsPage
              file={selectedFile}
              result={validationResult || { valid: true, checks: [] }}
              onProcessBatch={handleProcessBatch}
              onNavigateToExceptions={() => setCurrentPage('exception-queue')}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'batch-results' && (
            <BatchProcessingPage
              batchSummary={batchSummary}
              onSendToGovMesh={handleSendToGovMesh}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'exception-queue' && (
            <ExceptionQueuePage
              exceptions={exceptions}
              onReviewException={(exc) => {
                setSelectedException(exc);
                setSelectedRecord(null);
                setCurrentPage('officer-review');
              }}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'officer-review' && (
            <OfficerReviewPage
              selectedRecord={selectedRecord}
              selectedException={selectedException}
              records={records}
              exceptions={exceptions}
              onSelectRecord={(rec) => {
                setSelectedRecord(rec);
                setSelectedException(null);
              }}
              onSelectException={(exc) => {
                setSelectedException(exc);
                setSelectedRecord(null);
              }}
              onReviewRecord={handleReviewRecord}
              onApproveRecord={handleApproveRecord}
              onRejectRecord={handleRejectRecord}
              onSaveCorrection={handleSaveCorrection}
              onReprocess={handleReprocessException}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'failed-transfers' && (
            <FailedTransfersPage
              transfers={transfers}
              onRetryTransfer={handleRetryTransfer}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'audit-logs' && (
            <AuditLogsPage logs={auditLogs} onNavigate={setCurrentPage} />
          )}

          {currentPage === 'system-health' && (
            <SystemHealthPage health={systemHealth} onNavigate={setCurrentPage} />
          )}

          {currentPage === 'records' && (
            <ServiceRecordsPage
              records={records}
              onSelectRecord={(rec) => {
                setSelectedRecord(rec);
                setSelectedException(null);
              }}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'reports' && (
            <ReportsPage onNavigate={setCurrentPage} />
          )}

          {currentPage === 'profile' && (
            <ProfilePage user={user} onNavigate={setCurrentPage} />
          )}
        </main>
      </div>
    </div>
  );
}
