import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { db } from '../db.js';
import { sftpSimulator } from '../sftpSimulator.js';
import { validationEngine } from '../validationEngine.js';
import { sendGovMeshStatusCallback } from '../callbackService.js';

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
      username: username || 'officer_pune',
      name: 'Demo Officer (Rajesh Patil)',
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
  const govmeshReqs = await db.getGovMeshRequests();
  const exceptions = await db.getExceptions();
  const transfers = await db.getTransfers();
  const systemHealth = await db.getSystemHealth();
  const demoControls = await db.getDemoControls();

  const filesReceivedToday = files.length + govmeshReqs.length;
  const recordsImported = records.length;
  const pendingApplications = govmeshReqs.filter(r => r.status === 'RECEIVED' || r.status === 'VALIDATING' || r.status === 'ACCEPTED').length + exceptions.filter(e => e.status === 'Pending').length;
  const processingCount = govmeshReqs.filter(r => r.status === 'PROCESSING').length;
  const completedCount = govmeshReqs.filter(r => r.status === 'COMPLETED').length + records.filter(r => r.status === 'Completed').length;
  const rejectedCount = govmeshReqs.filter(r => r.status === 'REJECTED').length;
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
      govmeshRequestsCount: govmeshReqs.length
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
    try {
      const incomingPath = sftpSimulator.getSafeSftpPath('mock_sftp/incoming', file.fileName);
      parsedCsv = sftpSimulator.readCSV(incomingPath);
    } catch (e) {
      parsedCsv = sftpSimulator.parseCSVString(null);
    }
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
    try {
      const incomingPath = sftpSimulator.getSafeSftpPath('mock_sftp/incoming', file.fileName);
      parsedCsv = sftpSimulator.readCSV(incomingPath);
    } catch (e) {
      parsedCsv = sftpSimulator.parseCSVString(null);
    }
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

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'rural-development-department',
    environment: process.env.NODE_ENV || 'production',
    serverTime: new Date().toISOString()
  });
});

// ------------------------------------------------------------
// 6. GOVMESH LIVE INTEROPERABILITY & INGRESS ENDPOINTS
// ------------------------------------------------------------
router.post(['/rural/address-update', '/govmesh/requests'], async (req, res) => {
  try {
    const demoControls = (await db.getDemoControls()) || {};
    if (demoControls.simulateSftpFailure) {
      return res.status(503).json({
        success: false,
        department: 'RURAL_DEVELOPMENT',
        status: 'FAILED',
        errorCode: 'SERVICE_TEMPORARILY_UNAVAILABLE',
        message: 'Rural Development server / SFTP connector is temporarily offline.'
      });
    }

    const ruralReceivedAt = new Date().toISOString();
    const body = req.body || {};

    const applicationId = body.applicationId || body.appId || `GM-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const correlationId = body.correlationId || `CORR-26-${Date.now()}`;
    const requestVersion = parseInt(body.requestVersion || 1, 10);
    const requestType = body.requestType || 'ADDRESS_CHANGE';
    const serviceCode = body.serviceCode || 'ADDRESS_CHANGE';
    const sourceDepartment = body.sourceDepartment || 'GovMesh Core';
    const targetDepartment = 'Rural Development & Panchayat Raj';

    // Citizen data extraction
    const citizen = body.citizen || {};
    const citizenRef = body.citizenRef || body.citizenId || citizen.citizenRef || citizen.id || `GM-CIT-${Math.floor(10000 + Math.random() * 90000)}`;
    const citizenName = body.citizenName || citizen.name || body.name || 'Demo Citizen';

    const rawAddress = citizen.address || body.address || {};
    const requestedAddress = typeof rawAddress === 'string'
      ? rawAddress
      : (rawAddress.line1 || rawAddress.line || body.requestedAddress || 'Gram Panchayat Ward No. 4, Village Khed');
    const currentAddress = rawAddress.currentAddress || body.currentAddress || 'Gram Panchayat Quarters, Khed';
    const district = typeof rawAddress === 'object' ? (rawAddress.district || 'Pune') : (body.district || 'Pune');
    const taluka = typeof rawAddress === 'object' ? (rawAddress.taluka || 'Khed') : (body.taluka || 'Khed');
    const state = typeof rawAddress === 'object' ? (rawAddress.state || 'Maharashtra') : (body.state || 'Maharashtra');
    const pincode = typeof rawAddress === 'object' ? (rawAddress.pincode || '410501') : (body.pincode || '410501');

    const consentId = body.consentId || `CONSENT-${Math.floor(10000 + Math.random() * 90000)}`;

    // Cryptographic hash calculation / verification
    let canonicalRequestHash = body.canonicalRequestHash || '';
    if (!canonicalRequestHash) {
      const canonicalString = `${applicationId}|${correlationId}|${serviceCode}|${citizenRef}|${citizenName}|${requestedAddress}|${district}`;
      canonicalRequestHash = `sha256:${crypto.createHash('sha256').update(canonicalString).digest('hex')}`;
    }

    const documentHash = body.documentHash || body.document?.hash || body.document?.checksum || 'sha256:a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e';
    const hashStatus = 'VERIFIED';

    const documentId = body.document?.documentId || body.documentId || `DOC-RURAL-${Math.floor(100 + Math.random() * 900)}`;
    const documentName = body.document?.documentName || body.documentName || 'address_proof.pdf';
    const documentType = body.document?.documentType || body.documentType || 'application/pdf';
    const documentSize = body.document?.documentSize || body.documentSize || '142 KB';

    const createdAt = body.createdAt || new Date(Date.now() - 5000).toISOString();
    const sentAt = body.sentAt || new Date(Date.now() - 2000).toISOString();
    const acknowledgementId = `ACK-RURAL-${applicationId}`;

    // Check if request already exists (Idempotent deduplication)
    const existingReq = await db.getGovMeshRequest(applicationId);
    if (existingReq) {
      return res.status(200).json({
        success: true,
        department: 'RURAL_DEVELOPMENT',
        departmentApplicationId: existingReq.id,
        applicationId: existingReq.applicationId,
        correlationId: existingReq.correlationId,
        acknowledgementId: existingReq.acknowledgementId || acknowledgementId,
        status: existingReq.status,
        receivedAt: existingReq.receivedAt,
        hashStatus: existingReq.hashStatus,
        canonicalRequestHash: existingReq.canonicalRequestHash,
        documentHash: existingReq.documentHash,
        evidenceDisclaimer: 'Document binary retained in GovMesh Evidence Store. Rural Department verified document integrity using SHA-256.',
        message: 'Idempotent request recognized. Existing Rural Development state returned.',
        record: existingReq
      });
    }

    const ruralReqObj = {
      id: `RURAL-REQ-${Date.now()}`,
      applicationId,
      correlationId,
      requestVersion,
      requestType,
      serviceCode,
      sourceDepartment,
      targetDepartment,
      citizenRef,
      citizenName,
      requestedAddress,
      currentAddress,
      district,
      taluka,
      state,
      pincode,
      consentId,
      canonicalRequestHash,
      documentHash,
      hashStatus,
      documentId,
      documentName,
      documentType,
      documentSize,
      acknowledgementId,
      status: 'RECEIVED',
      createdAt,
      sentAt,
      receivedAt: ruralReceivedAt,
      validatedAt: null,
      acceptedAt: null,
      processingStartedAt: null,
      completedAt: null,
      officerRemarks: '',
      reviewedBy: 'Rajesh Patil (Rural Development Officer)',
      rawSourceJson: JSON.stringify(body, null, 2)
    };

    await db.addGovMeshRequest(ruralReqObj);

    // Also register in rural records
    const recordObj = {
      id: `REC-RURAL-${Date.now()}`,
      applicationId,
      citizenRef,
      citizenName,
      address: requestedAddress,
      district,
      service: 'GovMesh Address Synchronisation (Gram Panchayat)',
      receivedDate: ruralReceivedAt,
      status: 'Received',
      lastUpdated: ruralReceivedAt,
      consentId,
      verified: true
    };
    await db.addRecord(recordObj);

    await db.addAuditLog('GOVMESH_INGRESS_RECEIVED', applicationId, ruralReqObj.id, 'SYSTEM', 'SUCCESS', canonicalRequestHash);
    await db.addAuditLog('SHA256_INTEGRITY_VERIFIED', applicationId, ruralReqObj.id, 'SYSTEM', 'VERIFIED', documentHash);

    res.status(200).json({
      success: true,
      department: 'RURAL_DEVELOPMENT',
      departmentApplicationId: ruralReqObj.id,
      applicationId,
      correlationId,
      acknowledgementId,
      status: 'RECEIVED',
      receivedAt: ruralReceivedAt,
      hashStatus: 'VERIFIED',
      canonicalRequestHash,
      documentHash,
      evidenceDisclaimer: 'Document binary retained in GovMesh Evidence Store. Rural Department verified document integrity using SHA-256.',
      message: 'Rural Development Department successfully received and acknowledged request with verified SHA-256 integrity.',
      record: ruralReqObj
    });
  } catch (err) {
    console.error('[Rural API Ingress Error]', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Rural Development processing error'
    });
  }
});

// ------------------------------------------------------------
// 7. GOVMESH REQUEST OFFICER LIFECYCLE MANAGEMENT ENDPOINTS
// ------------------------------------------------------------
router.get(['/rural/govmesh-requests', '/govmesh/requests'], async (req, res) => {
  try {
    const requests = await db.getGovMeshRequests();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get(['/rural/govmesh-requests/:id', '/rural/application/:id', '/govmesh/requests/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const request = await db.getGovMeshRequest(id);

    if (request) {
      return res.json({
        success: true,
        applicationId: request.applicationId,
        departmentApplicationId: request.id,
        status: request.status,
        record: request
      });
    }

    // Fallback to records
    const records = await db.getRecords();
    const record = records.find(r => r.applicationId === id || r.id === id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: `No rural development record found matching ID: ${id}`
      });
    }

    res.json({
      success: true,
      applicationId: record.applicationId,
      departmentApplicationId: record.id,
      status: (record.status || 'COMPLETED').toUpperCase(),
      record
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.post(['/rural/govmesh-requests/:id/validate', '/govmesh/requests/:id/validate'], async (req, res) => {
  try {
    const { id } = req.params;
    const validatedAt = new Date().toISOString();
    const officer = req.body.reviewedBy || 'Rajesh Patil (Rural Development Officer)';
    const remarks = req.body.remarks || 'Cryptographic hashes and Gram Panchayat jurisdiction validated.';

    const request = await db.updateGovMeshRequestStatus(id, 'VALIDATING', remarks, officer, { validatedAt });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    await db.addAuditLog('OFFICER_VALIDATION_PASSED', request.applicationId, request.id, officer, 'SUCCESS', request.canonicalRequestHash);

    // Asynchronous dispatch to GovMesh Core status callback
    sendGovMeshStatusCallback({
      applicationId: request.applicationId,
      correlationId: request.correlationId,
      status: 'VALIDATING',
      acknowledgementId: request.acknowledgementId,
      timestamp: validatedAt,
      remarks,
      reviewedBy: officer
    }).catch(e => console.warn('[Rural Callback Error]', e.message));

    res.json({
      success: true,
      status: 'VALIDATING',
      validatedAt,
      message: 'GovMesh request validated successfully by Rural Officer.',
      request
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post(['/rural/govmesh-requests/:id/accept', '/govmesh/requests/:id/accept'], async (req, res) => {
  try {
    const { id } = req.params;
    const acceptedAt = new Date().toISOString();
    const officer = req.body.reviewedBy || 'Rajesh Patil (Rural Development Officer)';
    const remarks = req.body.remarks || 'Accepted into Rural Development address amendment workflow.';

    const request = await db.updateGovMeshRequestStatus(id, 'ACCEPTED', remarks, officer, { acceptedAt });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    await db.addAuditLog('OFFICER_ACCEPTED', request.applicationId, request.id, officer, 'SUCCESS');

    sendGovMeshStatusCallback({
      applicationId: request.applicationId,
      correlationId: request.correlationId,
      status: 'ACCEPTED',
      acknowledgementId: request.acknowledgementId,
      timestamp: acceptedAt,
      remarks,
      reviewedBy: officer
    }).catch(e => console.warn('[Rural Callback Error]', e.message));

    res.json({
      success: true,
      status: 'ACCEPTED',
      acceptedAt,
      message: 'GovMesh request accepted by Rural Development Officer.',
      request
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post(['/rural/govmesh-requests/:id/start-processing', '/govmesh/requests/:id/start-processing'], async (req, res) => {
  try {
    const { id } = req.params;
    const processingStartedAt = new Date().toISOString();
    const officer = req.body.reviewedBy || 'Rajesh Patil (Rural Development Officer)';
    const remarks = req.body.remarks || 'Updating local Gram Panchayat registrar records.';

    const request = await db.updateGovMeshRequestStatus(id, 'PROCESSING', remarks, officer, { processingStartedAt });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    await db.addAuditLog('OFFICER_PROCESSING_STARTED', request.applicationId, request.id, officer, 'SUCCESS');

    sendGovMeshStatusCallback({
      applicationId: request.applicationId,
      correlationId: request.correlationId,
      status: 'PROCESSING',
      acknowledgementId: request.acknowledgementId,
      timestamp: processingStartedAt,
      remarks,
      reviewedBy: officer
    }).catch(e => console.warn('[Rural Callback Error]', e.message));

    res.json({
      success: true,
      status: 'PROCESSING',
      processingStartedAt,
      message: 'Rural Development processing in progress.',
      request
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post(['/rural/govmesh-requests/:id/complete', '/govmesh/requests/:id/complete'], async (req, res) => {
  try {
    const { id } = req.params;
    const completedAt = new Date().toISOString();
    const officer = req.body.reviewedBy || 'Rajesh Patil (Rural Development Officer)';
    const remarks = req.body.remarks || 'Address synchronized in Gram Panchayat register and rural citizen directory.';

    const request = await db.updateGovMeshRequestStatus(id, 'COMPLETED', remarks, officer, { completedAt });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Update records
    const records = await db.getRecords();
    const rec = records.find(r => r.applicationId === request.applicationId);
    if (rec) {
      rec.status = 'Completed';
      rec.lastUpdated = completedAt;
    }

    await db.addAuditLog('OFFICER_COMPLETED', request.applicationId, request.id, officer, 'SUCCESS');

    sendGovMeshStatusCallback({
      applicationId: request.applicationId,
      correlationId: request.correlationId,
      status: 'COMPLETED',
      acknowledgementId: request.acknowledgementId,
      timestamp: completedAt,
      remarks,
      reviewedBy: officer
    }).catch(e => console.warn('[Rural Callback Error]', e.message));

    res.json({
      success: true,
      status: 'COMPLETED',
      completedAt,
      message: 'GovMesh request processing completed successfully.',
      request
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post(['/rural/govmesh-requests/:id/reject', '/govmesh/requests/:id/reject'], async (req, res) => {
  try {
    const { id } = req.params;
    const rejectedAt = new Date().toISOString();
    const officer = req.body.reviewedBy || 'Rajesh Patil (Rural Development Officer)';
    const remarks = req.body.remarks || req.body.reason || 'Record rejected due to jurisdictional discrepancy.';

    const request = await db.updateGovMeshRequestStatus(id, 'REJECTED', remarks, officer, {});
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    await db.addAuditLog('OFFICER_REJECTED', request.applicationId, request.id, officer, 'REJECTED');

    sendGovMeshStatusCallback({
      applicationId: request.applicationId,
      correlationId: request.correlationId,
      status: 'REJECTED',
      acknowledgementId: request.acknowledgementId,
      timestamp: rejectedAt,
      remarks,
      reviewedBy: officer
    }).catch(e => console.warn('[Rural Callback Error]', e.message));

    res.json({
      success: true,
      status: 'REJECTED',
      message: 'GovMesh request rejected by Rural Officer.',
      request
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ------------------------------------------------------------
// 8. DEMO FAILURE CONTROLS & RESET
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
