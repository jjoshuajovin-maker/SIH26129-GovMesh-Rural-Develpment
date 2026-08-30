import express from 'express';
import path from 'path';
import fs from 'fs';
import { db } from '../db.js';
import { sftpSimulator } from '../sftpSimulator.js';
import { validationEngine } from '../validationEngine.js';

const router = express.Router();

// Helper for session token simulation
let activeSession = {
  user: null,
  loginTime: null,
  expiresInMinutes: 15
};

// ------------------------------------------------------------
// 1. AUTHENTICATION APIs
// ------------------------------------------------------------
router.post('/auth/login', (req, res) => {
  const { username, password, role, otp } = req.body;

  // Simple demo auth check
  const users = db.get('users');
  let user = users.find(u => u.username === username || u.role === role);

  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      username: username || 'demo_officer',
      name: 'Demo Officer',
      role: role || 'Rural Development Officer',
      department: 'Rural Development & Panchayat Raj',
      district: 'Pune'
    };
  }

  // OTP check for demo
  if (otp && otp !== '123456') {
    return res.status(400).json({ error: 'Invalid OTP code. For demo, use 123456.' });
  }

  activeSession = {
    user,
    loginTime: new Date().toISOString(),
    expiresInMinutes: 15
  };

  db.addAuditLog('OFFICER_LOGIN', 'N/A', 'N/A', user.name, 'SUCCESS');

  res.json({
    success: true,
    user,
    sessionExpiresInMinutes: 15
  });
});

router.post('/auth/logout', (req, res) => {
  if (activeSession.user) {
    db.addAuditLog('OFFICER_LOGOUT', 'N/A', 'N/A', activeSession.user.name, 'SUCCESS');
  }
  activeSession = { user: null, loginTime: null, expiresInMinutes: 15 };
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/auth/me', (req, res) => {
  res.json({
    session: activeSession,
    authenticated: !!activeSession.user
  });
});

// ------------------------------------------------------------
// 2. DASHBOARD & SYSTEM MONITORING APIs
// ------------------------------------------------------------
router.get('/dashboard', (req, res) => {
  const files = db.get('files') || [];
  const records = db.get('records') || [];
  const exceptions = db.get('exceptions') || [];
  const transfers = db.get('transfers') || [];
  const systemHealth = db.get('systemHealth');
  const demoControls = db.get('demoControls');

  const filesReceivedToday = files.length + 6;
  const recordsImported = 124;
  const pendingApplications = exceptions.filter(e => e.status === 'Pending').length + 8;
  const processingCount = 7;
  const completedCount = 96;
  const rejectedCount = 4;
  const invalidRecordsCount = exceptions.length;
  const failedTransfersCount = transfers.filter(t => t.status === 'FAILED').length;

  res.json({
    kpis: {
      filesReceivedToday,
      recordsImported,
      pendingApplications,
      processing: processingCount,
      completed: completedCount,
      rejected: rejectedCount,
      invalidRecords: invalidRecordsCount,
      failedTransfers: failedTransfersCount
    },
    legacyConnector: {
      status: demoControls?.simulateSftpFailure ? 'OFFLINE / ERROR' : 'ONLINE',
      type: 'SFTP / CSV File Connector',
      lastTransfer: '10:18 AM',
      lastFile: files[0]?.fileName || 'GM_2026_000124.csv',
      pendingFiles: 2
    },
    systemHealth,
    demoControls
  });
});

// ------------------------------------------------------------
// 3. FILE INGESTION & MANAGEMENT APIs
// ------------------------------------------------------------
router.get('/files', (req, res) => {
  const files = db.get('files') || [];
  res.json(files);
});

router.get('/files/:id', (req, res) => {
  const { id } = req.params;
  const files = db.get('files') || [];
  const file = files.find(f => f.id === id || f.fileName === id);

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Load CSV content from mock_sftp
  const incomingPath = path.resolve(process.cwd(), 'mock_sftp/incoming', file.fileName);
  let parsedCsv = { headers: [], rows: [], raw: '' };
  
  if (fs.existsSync(incomingPath)) {
    parsedCsv = sftpSimulator.readCSV(incomingPath);
  } else {
    // Return sample rows
    parsedCsv = {
      headers: ['application_id', 'citizen_name', 'address', 'district', 'verified'],
      rows: [
        { application_id: file.applicationId, citizen_name: 'Demo Citizen', address: 'Demo Address, Gram Panchayat Ward 4', district: 'Pune', verified: 'true' }
      ],
      raw: `application_id,citizen_name,address,district,verified\n${file.applicationId},Demo Citizen,"Demo Address, Gram Panchayat Ward 4",Pune,true`
    };
  }

  res.json({
    file,
    content: parsedCsv
  });
});

router.post('/files/upload', (req, res) => {
  const demoControls = db.get('demoControls');
  const files = db.get('files');

  const fileId = `FILE-${Math.floor(100000 + Math.random() * 900000)}`;
  const appId = `GM-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const fileName = `GM_2026_${Math.floor(100000 + Math.random() * 900000)}.csv`;

  const newFileContent = `application_id,citizen_name,address,district,verified\n${appId},Demo Citizen,Gram Panchayat Ward No 2,Nashik,true`;
  const incomingPath = path.resolve(process.cwd(), 'mock_sftp/incoming', fileName);

  try {
    fs.writeFileSync(incomingPath, newFileContent, 'utf-8');
  } catch (e) {
    // Ignore read-only filesystem error on serverless environments
  }

  const checksum = sftpSimulator.calculateStringChecksum(newFileContent);

  const newFile = {
    id: fileId,
    fileName,
    applicationId: appId,
    source: 'GovMesh Legacy Adapter',
    receivedTime: new Date().toISOString(),
    recordsCount: 1,
    fileSize: `${newFileContent.length} B`,
    fileType: 'CSV',
    transferMethod: 'SFTP',
    checksumAlg: 'SHA-256',
    checksum,
    senderChecksum: checksum,
    integrityVerified: true,
    status: 'RECEIVED',
    manifest: {
      application: appId,
      consent: `CONSENT-${Math.floor(10000 + Math.random() * 90000)}`,
      purpose: 'Rural service record update',
      created: new Date().toISOString(),
      checksum,
      allowedFields: ['citizen_name', 'address', 'district', 'verified']
    }
  };

  files.unshift(newFile);
  db.set('files', files);

  db.addAuditLog('FILE_RECEIVED', appId, fileId, 'SYSTEM', 'SUCCESS', checksum);

  res.json({
    success: true,
    file: newFile
  });
});

router.post('/files/:id/validate', (req, res) => {
  const { id } = req.params;
  const files = db.get('files');
  const fileIndex = files.findIndex(f => f.id === id || f.fileName === id);

  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }

  const file = files[fileIndex];
  const incomingPath = path.resolve(process.cwd(), 'mock_sftp/incoming', file.fileName);

  let parsedCsv;
  if (fs.existsSync(incomingPath)) {
    parsedCsv = sftpSimulator.readCSV(incomingPath);
  } else {
    parsedCsv = {
      headers: ['application_id', 'citizen_name', 'address', 'district', 'verified'],
      rows: [{ application_id: file.applicationId, citizen_name: 'Demo Citizen', address: 'Demo Address', district: 'Pune', verified: 'true' }]
    };
  }

  const validationResult = validationEngine.validateFileSchema(parsedCsv, file.checksum, files);

  file.status = validationResult.valid ? 'VALIDATING' : 'INVALID';
  files[fileIndex] = file;
  db.set('files', files);

  db.addAuditLog('VALIDATION_COMPLETED', file.applicationId, file.id, 'SYSTEM', validationResult.valid ? 'SUCCESS' : 'FAILED', file.checksum);

  res.json({
    fileId: file.id,
    fileName: file.fileName,
    validationResult
  });
});

router.post('/files/:id/process', (req, res) => {
  const { id } = req.params;
  const files = db.get('files');
  const fileIndex = files.findIndex(f => f.id === id || f.fileName === id);

  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }

  const file = files[fileIndex];
  file.status = 'PROCESSED';
  files[fileIndex] = file;
  db.set('files', files);

  // Generate batch records summary
  const isBatch = file.recordsCount > 1;
  const batchSummary = {
    fileId: file.id,
    fileName: file.fileName,
    totalRecords: file.recordsCount,
    valid: isBatch ? 96 : 1,
    invalid: isBatch ? 4 : 0,
    processed: isBatch ? 96 : 1,
    rejected: isBatch ? 4 : 0,
    status: 'COMPLETED'
  };

  db.addAuditLog('RECORD_PROCESSED', file.applicationId, file.id, 'OFFICER-001', 'SUCCESS', file.checksum);

  res.json({
    success: true,
    file,
    batchSummary
  });
});

router.post('/files/:id/generate-result', (req, res) => {
  const { id } = req.params;
  const files = db.get('files');
  const file = files.find(f => f.id === id || f.fileName === id);

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  const isBatch = file.recordsCount > 1;
  const batchResults = isBatch ? [
    { applicationId: 'GM-2026-000124', status: 'SUCCESS' },
    { applicationId: 'GM-2026-000125', status: 'FAILED', errorCode: 'MISSING_DISTRICT', errorMessage: 'Required district field is missing' },
    { applicationId: 'GM-2026-000126', status: 'SUCCESS' },
    { applicationId: 'GM-2026-000127', status: 'SUCCESS' }
  ] : [
    { applicationId: file.applicationId, status: 'SUCCESS' }
  ];

  const resultFileInfo = sftpSimulator.generateResultCSV(file.fileName, batchResults);

  db.addAuditLog('RESULT_FILE_GENERATED', file.applicationId, file.id, 'SYSTEM', 'SUCCESS', file.checksum);

  res.json({
    success: true,
    outputFileName: resultFileInfo.outputFileName,
    csvContent: resultFileInfo.csvContent,
    batchResults
  });
});

router.post('/files/:id/send-to-govmesh', (req, res) => {
  const { id } = req.params;
  const files = db.get('files');
  const file = files.find(f => f.id === id || f.fileName === id);

  db.addAuditLog('SENT_TO_GOVMESH', file ? file.applicationId : 'GM-2026-000124', id, 'SYSTEM', 'SUCCESS');

  res.json({
    success: true,
    message: 'Result CSV successfully delivered to GovMesh orchestrator via legacy outbound connector.',
    timestamp: new Date().toISOString()
  });
});

// ------------------------------------------------------------
// 4. EXCEPTION QUEUE & OFFICER REVIEW APIs
// ------------------------------------------------------------
router.get('/exceptions', (req, res) => {
  const exceptions = db.get('exceptions') || [];
  res.json(exceptions);
});

router.post('/exceptions/:id/correct', (req, res) => {
  const { id } = req.params;
  const { district, address } = req.body;
  const exceptions = db.get('exceptions');
  const excIndex = exceptions.findIndex(e => e.id === id);

  if (excIndex === -1) {
    return res.status(404).json({ error: 'Exception record not found' });
  }

  const exc = exceptions[excIndex];
  if (district) exc.district = district;
  if (address) exc.address = address;
  exc.status = 'Corrected';
  exc.lastUpdated = new Date().toISOString();

  exceptions[excIndex] = exc;
  db.set('exceptions', exceptions);

  db.addAuditLog('CORRECTION_RECORDED', exc.applicationId, exc.fileId, 'OFFICER-001', 'SUCCESS');

  res.json({
    success: true,
    message: 'Record correction saved successfully',
    exception: exc
  });
});

router.post('/exceptions/:id/reprocess', (req, res) => {
  const { id } = req.params;
  const exceptions = db.get('exceptions');
  const excIndex = exceptions.findIndex(e => e.id === id);

  if (excIndex === -1) {
    return res.status(404).json({ error: 'Exception record not found' });
  }

  const exc = exceptions[excIndex];
  exc.status = 'Resolved';
  exceptions[excIndex] = exc;
  db.set('exceptions', exceptions);

  // Add to processed service records
  const records = db.get('records');
  records.push({
    id: `REC-${Date.now()}`,
    applicationId: exc.applicationId,
    citizenRef: `CITIZEN-${Math.floor(100 + Math.random() * 900)}`,
    citizenName: exc.citizenName,
    address: exc.address || 'Gram Panchayat Road',
    district: exc.district || 'Pune',
    service: 'Local Rural Record Update',
    receivedDate: exc.created,
    status: 'Completed',
    lastUpdated: new Date().toISOString(),
    consentId: exc.consentId || 'CONSENT-00125',
    verified: true
  });
  db.set('records', records);

  db.addAuditLog('REPROCESS_SUCCESS', exc.applicationId, exc.fileId, 'OFFICER-001', 'SUCCESS');

  res.json({
    success: true,
    message: 'Record successfully revalidated and reprocessed into Rural Service Records.',
    exception: exc
  });
});

// ------------------------------------------------------------
// 5. FAILED TRANSFERS & AUDIT LOGS
// ------------------------------------------------------------
router.get('/transfers/failed', (req, res) => {
  const transfers = db.get('transfers') || [];
  res.json(transfers);
});

router.post('/transfers/:id/retry', (req, res) => {
  const { id } = req.params;
  const transfers = db.get('transfers');
  const tIndex = transfers.findIndex(t => t.id === id);

  if (tIndex === -1) {
    return res.status(404).json({ error: 'Transfer task not found' });
  }

  const transfer = transfers[tIndex];
  transfer.retryAttempts = (transfer.retryAttempts || 1) + 1;
  transfer.status = 'SUCCESS';
  transfer.reason = 'Retry successful after connection re-established';

  transfers[tIndex] = transfer;
  db.set('transfers', transfers);

  db.addAuditLog('TRANSFER_RETRY_SUCCESS', transfer.fileName, transfer.id, 'SYSTEM', 'SUCCESS');

  res.json({
    success: true,
    message: 'Retry attempt succeeded. File transferred to legacy SFTP.',
    transfer
  });
});

router.get('/records', (req, res) => {
  const records = db.get('records') || [];
  res.json(records);
});

router.get('/audit', (req, res) => {
  const auditLogs = db.get('auditLogs') || [];
  res.json(auditLogs);
});

router.get('/system-health', (req, res) => {
  const systemHealth = db.get('systemHealth');
  res.json(systemHealth);
});

// ------------------------------------------------------------
// 6. DEMO FAILURE CONTROLS & RESET
// ------------------------------------------------------------
router.post('/demo/failure', (req, res) => {
  const { type, enabled } = req.body;
  const demoControls = db.get('demoControls') || {};

  if (type) {
    demoControls[type] = enabled !== undefined ? enabled : !demoControls[type];
  }
  db.set('demoControls', demoControls);

  db.addAuditLog('DEMO_FAILURE_INJECTED', 'N/A', 'N/A', 'PRESENTER', `INJECTED_${type}`);

  res.json({
    success: true,
    demoControls
  });
});

router.post('/demo/reset', (req, res) => {
  const resetData = db.resetDemo();
  db.addAuditLog('DEMO_ENVIRONMENT_RESET', 'ALL', 'ALL', 'PRESENTER', 'SUCCESS');
  res.json({
    success: true,
    message: 'Demo environment reset to initial clean state',
    data: resetData
  });
});

export default router;
