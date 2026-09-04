import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
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
router.post('/auth/login', async (req, res) => {
  const { username, password, role, otp } = req.body;

  const users = await db.getUsers();
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
router.get('/dashboard', async (req, res) => {
  const files = await db.getFiles();
  const records = await db.getRecords();
  const exceptions = await db.getExceptions();
  const transfers = await db.getTransfers();
  const systemHealth = await db.getSystemHealth();
  const demoControls = await db.getDemoControls();

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
router.get('/files', async (req, res) => {
  const files = await db.getFiles();
  res.json(files);
});

router.get('/files/:id', async (req, res) => {
  const { id } = req.params;
  const files = await db.getFiles();
  const file = files.find(f => f.id === id || f.fileName === id);

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  let parsedCsv;
  if (file.csvContent) {
    parsedCsv = sftpSimulator.parseCSVString(file.csvContent);
  } else {
    const incomingPath = path.resolve(process.cwd(), 'mock_sftp/incoming', file.fileName);
    parsedCsv = sftpSimulator.readCSV(incomingPath);
  }

  res.json({
    file,
    content: parsedCsv
  });
});

router.post('/files/upload', async (req, res) => {
  const fileId = `FILE-${Math.floor(100000 + Math.random() * 900000)}`;
  const appId = `GM-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const fileName = `GM_2026_${Math.floor(100000 + Math.random() * 900000)}.csv`;

  const newFileContent = `application_id,citizen_name,address,district,verified\n${appId},Demo Citizen,Gram Panchayat Ward No 2,Nashik,true`;
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
    },
    csvContent: newFileContent
  };

  await db.addFile(newFile);
  await db.addAuditLog('FILE_RECEIVED', appId, fileId, 'SYSTEM', 'SUCCESS', checksum);

  res.json({
    success: true,
    file: newFile
  });
});

router.post('/files/:id/validate', async (req, res) => {
  const { id } = req.params;
  const files = await db.getFiles();
  const file = files.find(f => f.id === id || f.fileName === id);

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  let parsedCsv;
  if (file.csvContent) {
    parsedCsv = sftpSimulator.parseCSVString(file.csvContent);
  } else {
    const incomingPath = path.resolve(process.cwd(), 'mock_sftp/incoming', file.fileName);
    parsedCsv = sftpSimulator.readCSV(incomingPath);
  }

  const validationResult = validationEngine.validateFileSchema(parsedCsv, file.checksum, files);

  const newStatus = validationResult.valid ? 'VALIDATING' : 'INVALID';
  await db.updateFileStatus(file.id, newStatus);

  await db.addAuditLog('VALIDATION_COMPLETED', file.applicationId, file.id, 'SYSTEM', validationResult.valid ? 'SUCCESS' : 'FAILED', file.checksum);

  res.json({
    fileId: file.id,
    fileName: file.fileName,
    validationResult
  });
});

router.post('/files/:id/process', async (req, res) => {
  const { id } = req.params;
  const files = await db.getFiles();
  const file = files.find(f => f.id === id || f.fileName === id);

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  await db.updateFileStatus(file.id, 'PROCESSED');
  file.status = 'PROCESSED';

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

  await db.addAuditLog('RECORD_PROCESSED', file.applicationId, file.id, 'OFFICER-001', 'SUCCESS', file.checksum);

  res.json({
    success: true,
    file,
    batchSummary
  });
});

router.post('/files/:id/generate-result', async (req, res) => {
  const { id } = req.params;
  const file = await db.getFile(id);

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

  await db.addAuditLog('RESULT_FILE_GENERATED', file.applicationId, file.id, 'SYSTEM', 'SUCCESS', file.checksum);

  res.json({
    success: true,
    outputFileName: resultFileInfo.outputFileName,
    csvContent: resultFileInfo.csvContent,
    batchResults
  });
});

router.post('/files/:id/send-to-govmesh', async (req, res) => {
  const { id } = req.params;
  const file = await db.getFile(id);

  await db.addAuditLog('SENT_TO_GOVMESH', file ? file.applicationId : 'GM-2026-000124', id, 'SYSTEM', 'SUCCESS');

  res.json({
    success: true,
    message: 'Result CSV successfully delivered to GovMesh orchestrator via legacy outbound connector.',
    timestamp: new Date().toISOString()
  });
});

// ------------------------------------------------------------
// 4. EXCEPTION QUEUE & OFFICER REVIEW APIs
// ------------------------------------------------------------
router.get('/exceptions', async (req, res) => {
  const exceptions = await db.getExceptions();
  res.json(exceptions);
});

router.post('/exceptions/:id/correct', async (req, res) => {
  const { id } = req.params;
  const { district, address } = req.body;
  const exc = await db.correctException(id, district, address);

  if (!exc) {
    return res.status(404).json({ error: 'Exception record not found' });
  }

  await db.addAuditLog('CORRECTION_RECORDED', exc.applicationId, exc.fileId, 'OFFICER-001', 'SUCCESS');

  res.json({
    success: true,
    message: 'Record correction saved successfully',
    exception: exc
  });
});

router.post('/exceptions/:id/reprocess', async (req, res) => {
  const { id } = req.params;
  const exc = await db.reprocessException(id);

  if (!exc) {
    return res.status(404).json({ error: 'Exception record not found' });
  }

  const newRecord = {
    id: `REC-${Date.now()}`,
    applicationId: exc.applicationId,
    citizenRef: `CITIZEN-${Math.floor(100 + Math.random() * 900)}`,
    citizenName: exc.citizenName,
    address: exc.address || 'Gram Panchayat Road',
    district: exc.district || 'Pune',
    service: 'Local Rural Record Update',
    receivedDate: exc.created || new Date().toISOString(),
    status: 'Completed',
    lastUpdated: new Date().toISOString(),
    consentId: exc.consentId || 'CONSENT-00125',
    verified: true
  };
  await db.addRecord(newRecord);

  await db.addAuditLog('REPROCESS_SUCCESS', exc.applicationId, exc.fileId, 'OFFICER-001', 'SUCCESS');

  res.json({
    success: true,
    message: 'Record successfully revalidated and reprocessed into Rural Service Records.',
    exception: exc
  });
});

// ------------------------------------------------------------
// 5. FAILED TRANSFERS & AUDIT LOGS
// ------------------------------------------------------------
router.get('/transfers/failed', async (req, res) => {
  const transfers = await db.getTransfers();
  res.json(transfers);
});

router.post('/transfers/:id/retry', async (req, res) => {
  const { id } = req.params;
  const transfer = await db.retryTransfer(id);

  if (!transfer) {
    return res.status(404).json({ error: 'Transfer task not found' });
  }

  await db.addAuditLog('TRANSFER_RETRY_SUCCESS', transfer.fileName, transfer.id, 'SYSTEM', 'SUCCESS');

  res.json({
    success: true,
    message: 'Retry attempt succeeded. File transferred to legacy SFTP.',
    transfer
  });
});

router.get('/records', async (req, res) => {
  const records = await db.getRecords();
  res.json(records);
});

router.get('/audit', async (req, res) => {
  const auditLogs = await db.getAuditLogs();
  res.json(auditLogs);
});

router.get('/system-health', async (req, res) => {
  const systemHealth = await db.getSystemHealth();
  res.json(systemHealth);
});

router.get(['/health', '/rural/health', '/api/rural/health'], (req, res) => {
  res.status(200).json({
    success: true,
    service: 'RURAL_DEVELOPMENT',
    status: 'UP'
  });
});

// ------------------------------------------------------------
// 6. GOVMESH INTEROPERABILITY & CANONICAL ADAPTER ENDPOINTS
// ------------------------------------------------------------
router.post(['/rural/address-update', '/govmesh/requests'], async (req, res) => {
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

    // Optional Request Hash verification (if secret configured)
    const requestHash = req.headers['x-govmesh-request-hash'];
    const hashSecret = process.env.GOVMESH_REQUEST_HASH_SECRET || process.env.GOVMESH_SECRET;
    if (requestHash && hashSecret) {
      const computedHash = crypto.createHmac('sha256', hashSecret).update(JSON.stringify(req.body)).digest('hex');
      if (computedHash !== requestHash) {
        console.error(`[RURAL] Invalid request hash. Expected ${computedHash}, got ${requestHash}`);
        return res.status(400).json({
          success: false,
          status: 'REJECTED',
          error: {
            code: 'INVALID_REQUEST_HASH',
            message: 'Request payload hash verification failed'
          },
          correlationId
        });
      }
    }

    const { applicationId, citizenId: topCitizenId, name: topName, address: topAddress, citizen } = req.body || {};

    const appId = applicationId;
    const citizenId = topCitizenId || citizen?.id || citizen?.citizenId;
    const citizenName = topName || citizen?.name;
    const addressObj = topAddress || citizen?.address;
    const line1 = addressObj?.line1 || addressObj?.line;
    const district = addressObj?.district;
    const state = addressObj?.state;

    // Strict validation requirement
    const missingFields = [];
    if (!appId || typeof appId !== 'string' || !appId.trim()) missingFields.push('applicationId');
    if (!citizenId || typeof citizenId !== 'string' || !citizenId.trim()) missingFields.push('citizenId');
    if (!citizenName || typeof citizenName !== 'string' || !citizenName.trim()) missingFields.push('name');
    if (!line1 || typeof line1 !== 'string' || !line1.trim()) missingFields.push('address.line1');
    if (!district || typeof district !== 'string' || !district.trim()) missingFields.push('address.district');
    if (!state || typeof state !== 'string' || !state.trim()) missingFields.push('address.state');

    if (missingFields.length > 0) {
      console.log(`[RURAL] Request validation failed. Missing: ${missingFields.join(', ')} applicationId=${appId || 'N/A'} correlationId=${correlationId}`);
      return res.status(400).json({
        success: false,
        status: 'REJECTED',
        error: {
          code: 'VALIDATION_ERROR',
          message: `Missing required field(s): ${missingFields.join(', ')}`
        },
        applicationId: appId || null,
        correlationId
      });
    }

    console.log(`[RURAL] Request received applicationId=${appId} correlationId=${correlationId}`);

    // Idempotency check
    const existing = await db.getRecordByAppIdOrDeptId(appId);
    if (existing) {
      console.log(`[RURAL] Application already received applicationId=${appId} status=${existing.status}`);
      return res.status(200).json({
        success: true,
        department: 'RURAL_DEVELOPMENT',
        departmentApplicationId: existing.departmentApplicationId || existing.id,
        applicationId: existing.applicationId,
        status: existing.status || 'RECEIVED',
        message: 'Application already received',
        correlationId
      });
    }

    const deptAppSuffix = appId.includes('-') ? appId.split('-').slice(1).join('-') : appId;
    const departmentApplicationId = `RURAL-${deptAppSuffix}`;
    const now = new Date().toISOString();

    const formattedAddress = typeof addressObj === 'string'
      ? addressObj
      : `${line1}${addressObj?.line2 ? ', ' + addressObj.line2 : ''}${addressObj?.city ? ', ' + addressObj.city : ''}, ${district}, ${state}${addressObj?.pincode ? ' - ' + addressObj.pincode : ''}`.trim();

    const newRecord = {
      id: departmentApplicationId,
      departmentApplicationId,
      applicationId: appId,
      citizenRef: citizenId,
      citizenId,
      citizenName,
      address: formattedAddress,
      district,
      state,
      service: 'Local Rural Record Update',
      receivedDate: now,
      receivedAt: now,
      status: 'RECEIVED',
      lastUpdated: now,
      updatedAt: now,
      consentId: req.body?.consentId || `CONSENT-${Date.now()}`,
      verified: true,
      correlationId
    };

    await db.addRecord(newRecord);

    console.log(`[RURAL] Application persisted applicationId=${appId} departmentApplicationId=${departmentApplicationId} status=RECEIVED`);
    await db.addAuditLog('GOVMESH_TRANSACTION_RECEIVED', appId, departmentApplicationId, 'SYSTEM', 'SUCCESS');

    // Async lifecycle progression: RECEIVED -> PROCESSING -> COMPLETED
    setTimeout(async () => {
      try {
        console.log(`[RURAL] Application processing applicationId=${appId}`);
        await db.updateRecordStatus(appId, 'PROCESSING');
        await db.addAuditLog('RECORD_PROCESSING', appId, departmentApplicationId, 'SYSTEM', 'SUCCESS');

        setTimeout(async () => {
          console.log(`[RURAL] Application completed applicationId=${appId}`);
          await db.updateRecordStatus(appId, 'COMPLETED');
          await db.addAuditLog('RECORD_PROCESSED', appId, departmentApplicationId, 'OFFICER-001', 'SUCCESS');
        }, 1500);
      } catch (e) {
        console.error(`[RURAL] Application processing failed applicationId=${appId} correlationId=${correlationId}`, e);
        await db.updateRecordStatus(appId, 'FAILED');
      }
    }, 500);

    return res.status(202).json({
      success: true,
      department: 'RURAL_DEVELOPMENT',
      applicationId: appId,
      departmentApplicationId,
      status: 'RECEIVED',
      message: 'Request received successfully',
      correlationId
    });
  } catch (err) {
    console.error(`[RURAL] Application processing error`, err);
    return res.status(500).json({
      success: false,
      status: 'FAILED',
      error: {
        code: 'INTERNAL_PROCESSING_ERROR',
        message: 'Unable to process application'
      },
      applicationId: req.body?.applicationId || null
    });
  }
});

router.get(['/rural/application/:id', '/govmesh/requests/:id'], async (req, res) => {
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
        error: {
          code: 'NOT_FOUND',
          message: `No application found matching ID: ${id}`
        }
      });
    }

    res.status(200).json({
      success: true,
      application: {
        applicationId: record.applicationId,
        departmentApplicationId: record.departmentApplicationId || record.id,
        department: 'RURAL_DEVELOPMENT',
        status: record.status || 'COMPLETED',
        correlationId: record.correlationId || correlationId || 'N/A',
        receivedAt: record.receivedAt || record.receivedDate,
        updatedAt: record.updatedAt || record.lastUpdated
      },
      record
    });
  } catch (err) {
    console.error(`[RURAL] Status lookup error`, err);
    res.status(500).json({
      success: false,
      status: 'FAILED',
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message
      }
    });
  }
});

// ------------------------------------------------------------
// 7. DEMO FAILURE CONTROLS & RESET
// ------------------------------------------------------------
router.post('/demo/failure', async (req, res) => {
  const { type, enabled } = req.body;
  const demoControls = await db.toggleDemoControl(type, enabled);

  await db.addAuditLog('DEMO_FAILURE_INJECTED', 'N/A', 'N/A', 'PRESENTER', `INJECTED_${type}`);

  res.json({
    success: true,
    demoControls
  });
});

router.post('/demo/reset', async (req, res) => {
  const resetData = await db.resetDemo();
  await db.addAuditLog('DEMO_ENVIRONMENT_RESET', 'ALL', 'ALL', 'PRESENTER', 'SUCCESS');
  res.json({
    success: true,
    message: 'Demo environment reset to initial clean state',
    data: resetData
  });
});

export default router;
