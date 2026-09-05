import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { sftpSimulator } from '../sftpSimulator.js';
import { validationEngine } from '../validationEngine.js';

const router = express.Router();

let activeSession = {
  user: null,
  loginTime: null,
  expiresInMinutes: 15
};

// ------------------------------------------------------------
// 1. AUTHENTICATION APIs
// ------------------------------------------------------------
router.post('/auth/login', async (req, res) => {
  const { username, password, role, otp } = req.body;
  const users = await db.getUsers();
  let user = users.find(u => u.username === username || u.role === role);

  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      username: username || 'officer_pune',
      name: 'Demo Officer (Rajesh Patil)',
      role: role || 'Rural Development Officer',
      department: 'Rural Development & Panchayat Raj',
      district: 'Pune'
    };
  }

  if (otp && otp !== '123456') {
    return res.status(400).json({ error: 'Invalid OTP code. For demo, use 123456.' });
  }

  activeSession = {
    user,
    loginTime: new Date().toISOString(),
    expiresInMinutes: 15
  };

  await db.addAuditLog('OFFICER_LOGIN', 'N/A', 'N/A', user.name, 'SUCCESS');

  res.json({
    success: true,
    user,
    sessionExpiresInMinutes: 15
  });
});

router.post('/auth/logout', async (req, res) => {
  if (activeSession.user) {
    await db.addAuditLog('OFFICER_LOGOUT', 'N/A', 'N/A', activeSession.user.name, 'SUCCESS');
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
router.get(['/dashboard', '/api/dashboard'], async (req, res) => {
  const files = await db.getFiles();
  const records = await db.getRecords();
  const exceptions = await db.getExceptions();
  const transfers = await db.getTransfers();
  const systemHealth = await db.getSystemHealth();
  const demoControls = await db.getDemoControls();

  const filesReceivedToday = files.length + records.length;
  const recordsImported = records.length;
  const pendingApplications = records.filter(r => (r.status || 'RECEIVED').toUpperCase() === 'RECEIVED' || (r.status || '').toUpperCase() === 'UNDER_REVIEW').length;
  const processingCount = records.filter(r => (r.status || '').toUpperCase() === 'UNDER_REVIEW').length;
  const completedCount = records.filter(r => (r.status || '').toUpperCase() === 'APPROVED' || (r.status || '').toUpperCase() === 'COMPLETED').length;
  const rejectedCount = records.filter(r => (r.status || '').toUpperCase() === 'REJECTED' || (r.status || '').toUpperCase() === 'FAILED').length;
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
      failedTransfers: failedTransfersCount,
      govmeshRequestsCount: records.length
    },
    legacyConnector: {
      status: demoControls?.simulateSftpFailure ? 'OFFLINE / ERROR' : 'ONLINE',
      type: 'SFTP / CSV File Connector',
      lastTransfer: records[0]?.receivedDate || 'N/A',
      lastFile: files[0]?.fileName || 'N/A',
      pendingFiles: 0
    },
    systemHealth,
    demoControls
  });
});

router.get(['/health', '/rural/health', '/api/health', '/api/rural/health'], (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'RURAL_DEVELOPMENT',
    environment: process.env.NODE_ENV || 'production',
    version: process.env.DEPLOYMENT_VERSION || '1.0.0-realtime-v2'
  });
});

// ------------------------------------------------------------
// 3. GOVMESH LIVE INTEROPERABILITY & INGRESS ENDPOINTS
// ------------------------------------------------------------
router.post(['/rural/address-update', '/api/rural/address-update', '/govmesh/requests', '/api/govmesh/requests'], async (req, res) => {
  try {
    const correlationId = req.headers['x-correlation-id'] ||
                          req.headers['x-govmesh-correlation-id'] ||
                          req.body?.correlationId ||
                          `CORR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    res.setHeader('X-Correlation-ID', correlationId);

    const demoControls = (await db.getDemoControls()) || {};
    if (demoControls.simulateSftpFailure) {
      return res.status(503).json({
        success: false,
        department: 'RURAL_DEVELOPMENT',
        status: 'FAILED',
        error: {
          code: 'SERVICE_TEMPORARILY_UNAVAILABLE',
          message: 'Rural Development server / SFTP connector is temporarily offline.'
        },
        correlationId
      });
    }

    const body = req.body || {};
    const appId = body.applicationId || body.appId || body.citizen?.applicationId;
    const citizenId = body.citizenId || body.citizenRef || body.citizen?.citizenRef || body.citizen?.id;
    const name = body.name || body.citizenName || body.citizen?.name;
    const rawAddress = body.address || body.citizen?.address;

    // Strict validation
    if (!appId || !citizenId || !name || !rawAddress) {
      return res.status(400).json({
        success: false,
        department: 'RURAL_DEVELOPMENT',
        status: 'REJECTED',
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing required application fields: applicationId, citizenId, name, and address are mandatory.'
        },
        correlationId
      });
    }

    // Format address
    let addressStr = '';
    let addressObj = {};
    let district = 'Pune';
    let state = 'Maharashtra';

    if (typeof rawAddress === 'string') {
      addressStr = rawAddress;
      district = body.district || 'Pune';
      state = body.state || 'Maharashtra';
      addressObj = { line1: addressStr, district, state };
    } else if (typeof rawAddress === 'object') {
      addressObj = rawAddress;
      district = rawAddress.district || body.district || 'Pune';
      state = rawAddress.state || body.state || 'Maharashtra';
      addressStr = [rawAddress.line1, rawAddress.line2, rawAddress.city, district, state, rawAddress.pincode].filter(Boolean).join(', ');
    }

    // Idempotency check
    const existing = await db.getRecordByAppIdOrDeptId(appId);
    if (existing) {
      return res.status(200).json({
        success: true,
        department: 'RURAL_DEVELOPMENT',
        applicationId: existing.applicationId,
        departmentApplicationId: existing.departmentApplicationId || existing.id,
        status: existing.status || 'RECEIVED',
        message: 'Application already received and registered in Rural Development datastore',
        correlationId
      });
    }

    const departmentApplicationId = `RD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const consentId = body.consentId || `CONSENT-${Math.floor(10000 + Math.random() * 90000)}`;

    const newRecord = {
      id: `REC-${Date.now()}`,
      applicationId: appId,
      departmentApplicationId,
      citizenRef: citizenId,
      citizenId,
      citizenName: name,
      name,
      address: addressStr,
      addressObj,
      district,
      state,
      service: 'Gram Panchayat Address Update',
      receivedDate: now,
      receivedAt: now,
      status: 'RECEIVED',
      lastUpdated: now,
      updatedAt: now,
      consentId,
      verified: true,
      correlationId
    };

    await db.addRecord(newRecord);
    await db.addAuditLog('APPLICATION_RECEIVED', appId, departmentApplicationId, 'SYSTEM', 'SUCCESS', `CORR:${correlationId}`);

    return res.status(202).json({
      success: true,
      department: 'RURAL_DEVELOPMENT',
      applicationId: appId,
      departmentApplicationId,
      status: 'RECEIVED',
      message: 'Application received and queued for officer review',
      correlationId
    });
  } catch (err) {
    console.error('[RURAL] Ingress error:', err);
    return res.status(500).json({
      success: false,
      status: 'FAILED',
      error: { code: 'INTERNAL_PROCESSING_ERROR', message: err.message }
    });
  }
});

// ------------------------------------------------------------
// 4. APPLICATION QUERY & STATUS LOOKUP ENDPOINTS
// ------------------------------------------------------------
router.get(['/rural/applications', '/api/rural/applications', '/records', '/api/records'], async (req, res) => {
  try {
    const { status } = req.query;
    const records = await db.getRecords(status ? String(status) : null);

    // If calling /api/records or /records, return array directly for frontend compatibility
    if (req.path.includes('/records')) {
      return res.json(records);
    }

    res.json({
      success: true,
      count: records.length,
      applications: records
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get([
  '/rural/application/:id',
  '/api/rural/application/:id',
  '/govmesh/requests/:id',
  '/api/govmesh/requests/:id',
  '/rural/govmesh-requests/:id',
  '/api/rural/govmesh-requests/:id'
], async (req, res) => {
  try {
    const { id } = req.params;
    const correlationId = req.headers['x-correlation-id'] || req.headers['x-govmesh-correlation-id'];
    if (correlationId) {
      res.setHeader('X-Correlation-ID', correlationId);
    }

    const record = await db.getRecordByAppIdOrDeptId(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        status: 'FAILED',
        error: { code: 'NOT_FOUND', message: `No application found matching ID: ${id}` }
      });
    }

    const appObj = {
      applicationId: record.applicationId,
      departmentApplicationId: record.departmentApplicationId || record.id,
      citizenId: record.citizenRef || record.citizenId,
      name: record.citizenName || record.name,
      address: record.addressObj || { line1: record.address, district: record.district, state: record.state || 'Maharashtra' },
      department: 'RURAL_DEVELOPMENT',
      status: record.status || 'RECEIVED',
      correlationId: record.correlationId || correlationId || 'N/A',
      receivedAt: record.receivedDate || record.receivedAt,
      updatedAt: record.lastUpdated || record.updatedAt,
      rejectionReason: record.rejectionReason || null
    };

    res.status(200).json({
      success: true,
      applicationId: record.applicationId,
      departmentApplicationId: record.departmentApplicationId || record.id,
      status: record.status || 'RECEIVED',
      application: appObj,
      record
    });
  } catch (err) {
    res.status(500).json({ success: false, status: 'FAILED', error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ------------------------------------------------------------
// 5. MANUAL OFFICER WORKFLOW & DECISION ENDPOINTS
// ------------------------------------------------------------
router.post(['/rural/application/:id/review', '/api/rural/application/:id/review'], async (req, res) => {
  try {
    const { id } = req.params;
    const officerId = req.body?.officerId || 'OFFICER-001';
    const record = await db.reviewRecord(id, officerId);

    if (!record) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Application not found: ${id}` } });
    }

    await db.addAuditLog('OFFICER_REVIEW_STARTED', record.applicationId, record.departmentApplicationId || record.id, officerId, 'SUCCESS');

    res.json({
      success: true,
      department: 'RURAL_DEVELOPMENT',
      applicationId: record.applicationId,
      departmentApplicationId: record.departmentApplicationId || record.id,
      status: record.status,
      message: 'Application placed under officer review'
    });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ACTION', message: err.message } });
  }
});

router.post(['/rural/application/:id/approve', '/api/rural/application/:id/approve'], async (req, res) => {
  try {
    const { id } = req.params;
    const officerId = req.body?.officerId || 'OFFICER-001';
    const record = await db.approveRecord(id, officerId);

    if (!record) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Application not found: ${id}` } });
    }

    await db.addAuditLog('OFFICER_APPROVED', record.applicationId, record.departmentApplicationId || record.id, officerId, 'SUCCESS');

    res.json({
      success: true,
      department: 'RURAL_DEVELOPMENT',
      applicationId: record.applicationId,
      departmentApplicationId: record.departmentApplicationId || record.id,
      status: record.status,
      message: 'Application approved successfully by officer'
    });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ACTION', message: err.message } });
  }
});

router.post(['/rural/application/:id/reject', '/api/rural/application/:id/reject'], async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, officerId } = req.body || {};

    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_REASON', message: 'Rejection reason is required' }
      });
    }

    const record = await db.rejectRecord(id, officerId || 'OFFICER-001', reason);

    if (!record) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Application not found: ${id}` } });
    }

    await db.addAuditLog('OFFICER_REJECTED', record.applicationId, record.departmentApplicationId || record.id, officerId || 'OFFICER-001', 'REJECTED');

    res.json({
      success: true,
      department: 'RURAL_DEVELOPMENT',
      applicationId: record.applicationId,
      departmentApplicationId: record.departmentApplicationId || record.id,
      status: record.status,
      reason,
      message: 'Application rejected by officer'
    });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'INVALID_ACTION', message: err.message } });
  }
});

// GovMesh alias endpoints
router.get(['/rural/govmesh-requests', '/api/rural/govmesh-requests'], async (req, res) => {
  try {
    const records = await db.getRecords();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(['/rural/govmesh-requests/:id/validate', '/api/rural/govmesh-requests/:id/validate'], async (req, res) => {
  try {
    const { id } = req.params;
    const record = await db.reviewRecord(id, req.body.reviewedBy || 'OFFICER-001');
    if (!record) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, status: record.status, request: record });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.post(['/rural/govmesh-requests/:id/accept', '/api/rural/govmesh-requests/:id/accept'], async (req, res) => {
  try {
    const { id } = req.params;
    const record = await db.reviewRecord(id, req.body.reviewedBy || 'OFFICER-001');
    if (!record) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, status: record.status, request: record });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.post(['/rural/govmesh-requests/:id/complete', '/api/rural/govmesh-requests/:id/complete'], async (req, res) => {
  try {
    const { id } = req.params;
    const record = await db.approveRecord(id, req.body.reviewedBy || 'OFFICER-001');
    if (!record) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, status: record.status, request: record });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// ------------------------------------------------------------
// 6. LEGACY FILE INGESTION & BATCH APIs
// ------------------------------------------------------------
router.get(['/files', '/api/files'], async (req, res) => {
  const files = await db.getFiles();
  res.json(files);
});

router.get(['/files/:id', '/api/files/:id'], async (req, res) => {
  const { id } = req.params;
  const files = await db.getFiles();
  const file = files.find(f => f.id === id || f.fileName === id);
  if (!file) return res.status(404).json({ error: 'File not found' });

  let parsedCsv;
  if (file.csvContent) {
    parsedCsv = sftpSimulator.parseCSVString(file.csvContent);
  } else {
    parsedCsv = { headers: ['application_id', 'citizen_name', 'address', 'district', 'verified'], rows: [] };
  }
  res.json({ file, content: parsedCsv });
});

router.post(['/files/upload', '/api/files/upload'], async (req, res) => {
  const demoControls = await db.getDemoControls();
  let generated;

  if (demoControls.simulateCorruptedFile) {
    generated = sftpSimulator.generateCorruptedFile();
  } else if (demoControls.simulateInvalidSchema) {
    generated = sftpSimulator.generateInvalidSchemaFile();
  } else if (demoControls.simulateMissingColumn) {
    generated = sftpSimulator.generateMissingColumnFile();
  } else {
    generated = sftpSimulator.generateIncomingDemoFile();
  }

  const fileItem = {
    id: `FILE-${Date.now().toString().slice(-6)}`,
    fileName: generated.fileName,
    applicationId: generated.manifest.application,
    source: 'GovMesh Legacy SFTP Connector',
    receivedTime: new Date().toISOString(),
    recordsCount: generated.parsed.rows.length,
    fileSize: `${(generated.csvContent.length / 1024).toFixed(1)} KB`,
    fileType: 'CSV',
    transferMethod: 'SFTP',
    checksumAlg: 'SHA-256',
    checksum: generated.checksum,
    senderChecksum: generated.checksum,
    integrityVerified: true,
    status: 'RECEIVED',
    manifest: generated.manifest,
    csvContent: generated.csvContent
  };

  await db.addFile(fileItem);
  await db.addAuditLog('FILE_RECEIVED', fileItem.applicationId, fileItem.id, 'SYSTEM', 'SUCCESS', fileItem.checksum);

  res.json({ success: true, file: fileItem });
});

router.post(['/files/:id/validate', '/api/files/:id/validate'], async (req, res) => {
  const { id } = req.params;
  const file = await db.getFile(id);
  if (!file) return res.status(404).json({ error: 'File not found' });

  let parsed = file.csvContent
    ? sftpSimulator.parseCSVString(file.csvContent)
    : { headers: [], rows: [] };

  const validationResult = validationEngine.runFullValidation(file, parsed);
  await db.updateFileStatus(id, validationResult.valid ? 'VALIDATED' : 'INVALID');
  await db.addAuditLog('FILE_VALIDATED', file.applicationId, file.id, 'SYSTEM', validationResult.valid ? 'SUCCESS' : 'FAILURE', file.checksum);

  res.json({ success: true, validationResult });
});

router.post(['/files/:id/process', '/api/files/:id/process'], async (req, res) => {
  const { id } = req.params;
  const file = await db.getFile(id);
  if (!file) return res.status(404).json({ error: 'File not found' });

  await db.updateFileStatus(id, 'PROCESSED');
  const batchSummary = {
    fileId: file.id,
    fileName: file.fileName,
    processedTime: new Date().toISOString(),
    totalRows: file.recordsCount || 1,
    successfulImports: file.recordsCount || 1,
    exceptionsCreated: 0
  };

  await db.addAuditLog('BATCH_PROCESSED', file.applicationId, file.id, 'SYSTEM', 'SUCCESS', file.checksum);
  res.json({ success: true, batchSummary });
});

router.post(['/files/:id/send-to-govmesh', '/api/files/:id/send-to-govmesh'], async (req, res) => {
  const { id } = req.params;
  const file = await db.getFile(id);
  if (!file) return res.status(404).json({ error: 'File not found' });

  await db.updateFileStatus(id, 'COMPLETED');
  await db.addAuditLog('EXPORTED_TO_GOVMESH', file.applicationId, file.id, 'SYSTEM', 'SUCCESS', file.checksum);
  res.json({ success: true, message: 'Batch successfully synchronized with GovMesh Core' });
});

// ------------------------------------------------------------
// 7. EXCEPTIONS, TRANSFERS, AUDIT & SYSTEM APIs
// ------------------------------------------------------------
router.get(['/exceptions', '/api/exceptions'], async (req, res) => {
  const exceptions = await db.getExceptions();
  res.json(exceptions);
});

router.post(['/exceptions/:id/correct', '/api/exceptions/:id/correct'], async (req, res) => {
  const { id } = req.params;
  const { district, address } = req.body;
  const exc = await db.correctException(id, district, address);
  await db.addAuditLog('EXCEPTION_CORRECTED', exc?.applicationId || id, exc?.fileId || 'N/A', 'OFFICER-001', 'SUCCESS');
  res.json({ success: true, exception: exc });
});

router.post(['/exceptions/:id/reprocess', '/api/exceptions/:id/reprocess'], async (req, res) => {
  const { id } = req.params;
  const exc = await db.reprocessException(id);
  await db.addAuditLog('EXCEPTION_REPROCESSED', exc?.applicationId || id, exc?.fileId || 'N/A', 'OFFICER-001', 'SUCCESS');
  res.json({ success: true, exception: exc });
});

router.get(['/transfers/failed', '/api/transfers/failed'], async (req, res) => {
  const transfers = await db.getTransfers();
  res.json(transfers);
});

router.post(['/transfers/:id/retry', '/api/transfers/:id/retry'], async (req, res) => {
  const { id } = req.params;
  const transfer = await db.retryTransfer(id);
  await db.addAuditLog('TRANSFER_RETRIED', 'N/A', id, 'OFFICER-001', 'SUCCESS');
  res.json({ success: true, transfer });
});

router.get(['/audit', '/api/audit'], async (req, res) => {
  const logs = await db.getAuditLogs();
  res.json(logs);
});

router.get(['/system-health', '/api/system-health'], async (req, res) => {
  const health = await db.getSystemHealth();
  res.json(health);
});

router.post(['/demo/failure', '/api/demo/failure'], async (req, res) => {
  const { type, enabled } = req.body;
  const demoControls = await db.toggleDemoControl(type, enabled);
  await db.addAuditLog('DEMO_FAILURE_INJECTED', 'N/A', 'N/A', 'PRESENTER', `INJECTED_${type}`);
  res.json({ success: true, demoControls });
});

router.post(['/demo/reset', '/api/demo/reset'], async (req, res) => {
  const resetData = await db.resetDemo();
  await db.addAuditLog('DEMO_ENVIRONMENT_RESET', 'ALL', 'ALL', 'PRESENTER', 'SUCCESS');
  res.json({ success: true, message: 'Demo environment reset', data: resetData });
});

export default router;
