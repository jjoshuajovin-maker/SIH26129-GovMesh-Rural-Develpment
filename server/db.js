import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';

const IS_VERCEL = !!process.env.VERCEL;
const DB_FILE = IS_VERCEL
  ? path.join(os.tmpdir(), 'data_store.json')
  : path.resolve(process.cwd(), 'data_store.json');

// Initial seed data
const initialData = {
  users: [
    { id: 'usr-1', username: 'officer_pune', name: 'Demo Officer (Rajesh Patil)', role: 'Rural Development Officer', department: 'Rural Development & Panchayat Raj', district: 'Pune' },
    { id: 'usr-2', username: 'panchayat_admin', name: 'Suresh Deshmukh', role: 'Panchayat Officer', department: 'Rural Development & Panchayat Raj', district: 'Nashik' },
    { id: 'usr-3', username: 'senior_officer', name: 'Dr. Anand Kulkarni', role: 'Senior Officer', department: 'Rural Development & Panchayat Raj', district: 'State Headquarters' },
    { id: 'usr-4', username: 'admin', name: 'Department Admin System', role: 'Department Admin', department: 'Rural Development & Panchayat Raj', district: 'All' },
    { id: 'usr-5', username: 'auditor', name: 'CA Meera Joshi', role: 'Auditor', department: 'State Audit Bureau', district: 'Audit Division' }
  ],
  files: [
    {
      id: 'FILE-000124',
      fileName: 'GM_2026_000124.csv',
      applicationId: 'GM-2026-000124',
      source: 'GovMesh Legacy Adapter',
      receivedTime: '2026-08-30T10:15:00.000Z',
      recordsCount: 1,
      fileSize: '142 B',
      fileType: 'CSV',
      transferMethod: 'SFTP',
      checksumAlg: 'SHA-256',
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      senderChecksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      integrityVerified: true,
      status: 'RECEIVED',
      manifest: {
        application: 'GM-2026-000124',
        consent: 'CONSENT-00124',
        purpose: 'Rural service record update',
        created: '2026-08-30T10:15:00.000Z',
        checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        allowedFields: ['citizen_name', 'address', 'district', 'verified']
      }
    },
    {
      id: 'FILE-000125',
      fileName: 'GM_BATCH_002.csv',
      applicationId: 'Multiple (100 Records)',
      source: 'GovMesh Legacy Batch Adapter',
      receivedTime: '2026-08-30T10:18:00.000Z',
      recordsCount: 100,
      fileSize: '6.4 KB',
      fileType: 'CSV',
      transferMethod: 'SFTP',
      checksumAlg: 'SHA-256',
      checksum: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
      senderChecksum: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
      integrityVerified: true,
      status: 'PROCESSED',
      manifest: {
        application: 'GM_BATCH_002',
        consent: 'CONSENT-BATCH-002',
        purpose: 'Bulk Local Rural Record Update',
        created: '2026-08-30T10:18:00.000Z',
        checksum: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        allowedFields: ['citizen_name', 'address', 'district', 'verified']
      }
    }
  ],
  records: [
    {
      id: 'REC-001',
      applicationId: 'GM-2026-000124',
      citizenRef: 'CITIZEN-001',
      citizenName: 'Demo Citizen',
      address: 'Gram Panchayat Ward No. 4, Village Khed',
      district: 'Pune',
      service: 'Local Rural Record Update',
      receivedDate: '2026-08-30T10:15:00.000Z',
      status: 'RECEIVED',
      lastUpdated: '2026-08-30T10:15:00.000Z',
      consentId: 'CONSENT-00124',
      verified: true
    }
  ],
  exceptions: [
    {
      id: 'EXP-001',
      applicationId: 'GM-2026-000125',
      fileId: 'FILE-000125',
      errorType: 'MISSING_DISTRICT',
      description: 'District field is empty in row 1',
      citizenName: 'Ramesh Patil',
      address: 'Plot 12 Gram Panchayat Road',
      district: '',
      created: '2026-08-30T10:20:00.000Z',
      priority: 'Medium',
      status: 'Pending',
      consentId: 'CONSENT-00125'
    },
    {
      id: 'EXP-002',
      applicationId: 'GM-2026-000128',
      fileId: 'FILE-000125',
      errorType: 'INVALID_APPLICATION_ID',
      description: 'Invalid application ID format: INVALID_APP_ID_999',
      citizenName: 'INVALID_APP_ID_999',
      address: 'Subhash Nagar Post Office',
      district: 'Kolhapur',
      created: '2026-08-30T10:21:00.000Z',
      priority: 'High',
      status: 'Pending',
      consentId: 'CONSENT-00128'
    },
    {
      id: 'EXP-003',
      applicationId: 'GM-2026-000132',
      fileId: 'FILE-000125',
      errorType: 'DUPLICATE_RECORD',
      description: 'Duplicate record detected in same file batch',
      citizenName: 'Prakash Jadhav',
      address: 'Old Fort Road Village Wai',
      district: 'Satara',
      created: '2026-08-30T10:22:00.000Z',
      priority: 'Low',
      status: 'Pending',
      consentId: 'CONSENT-00132'
    }
  ],
  transfers: [
    {
      id: 'TX-00042',
      fileName: 'GM_2026_000130.csv',
      destination: 'Legacy SFTP',
      status: 'FAILED',
      reason: 'Legacy SFTP service temporarily unavailable',
      time: '2026-08-30T10:30:00.000Z',
      retryAttempts: 1,
      maxRetries: 3
    }
  ],
  auditLogs: [
    { id: 'LOG-001', timestamp: '2026-08-30T10:15:01.000Z', event: 'FILE_CREATED', applicationId: 'GM-2026-000124', fileId: 'FILE-000124', officer: 'SYSTEM', result: 'SUCCESS', checksum: 'e3b0c442...' },
    { id: 'LOG-002', timestamp: '2026-08-30T10:15:03.000Z', event: 'FILE_RECEIVED', applicationId: 'GM-2026-000124', fileId: 'FILE-000124', officer: 'SYSTEM', result: 'SUCCESS', checksum: 'e3b0c442...' },
    { id: 'LOG-003', timestamp: '2026-08-30T10:15:04.000Z', event: 'CHECKSUM_VERIFIED', applicationId: 'GM-2026-000124', fileId: 'FILE-000124', officer: 'SYSTEM', result: 'SUCCESS', checksum: 'e3b0c442...' },
    { id: 'LOG-004', timestamp: '2026-08-30T10:15:05.000Z', event: 'FILE_PARSED', applicationId: 'GM-2026-000124', fileId: 'FILE-000124', officer: 'SYSTEM', result: 'SUCCESS', checksum: 'e3b0c442...' },
    { id: 'LOG-005', timestamp: '2026-08-30T10:15:06.000Z', event: 'VALIDATION_COMPLETED', applicationId: 'GM-2026-000124', fileId: 'FILE-000124', officer: 'SYSTEM', result: 'SUCCESS', checksum: 'e3b0c442...' },
    { id: 'LOG-006', timestamp: '2026-08-30T10:15:08.000Z', event: 'RECORD_PROCESSED', applicationId: 'GM-2026-000124', fileId: 'FILE-000124', officer: 'OFFICER-001', result: 'SUCCESS', checksum: 'e3b0c442...' }
  ],
  systemHealth: {
    sftpConnector: 'ONLINE',
    csvParser: 'ONLINE',
    validationEngine: 'ONLINE',
    batchProcessor: 'ONLINE',
    database: 'ONLINE',
    resultGenerator: 'ONLINE',
    govmeshConnector: 'ONLINE',
    lastSuccessfulImport: '10:18 AM',
    lastSuccessfulExport: '10:20 AM',
    failedTransfersCount: 1,
    pendingFilesCount: 2,
    averageProcessingTimeMs: 140,
    systemUptime: '99.98%'
  },
  demoControls: {
    simulateSftpFailure: false,
    simulateCorruptedFile: false,
    simulateInvalidSchema: false,
    simulateMissingColumn: false,
    simulateDuplicateFile: false
  }
};

class DataStore {
  constructor() {
    this.data = JSON.parse(JSON.stringify(initialData));
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (e) {
      this.data = JSON.parse(JSON.stringify(initialData));
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      // In-memory data is updated even if write to filesystem fails on serverless environments
    }
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    this.save();
  }

  addAuditLog(event, applicationId, fileId, officer, result, checksum = '') {
    const log = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      event,
      applicationId: applicationId || 'N/A',
      fileId: fileId || 'N/A',
      officer: officer || 'OFFICER-001',
      result: result || 'SUCCESS',
      checksum: checksum || 'SHA-256'
    };
    this.data.auditLogs.unshift(log);
    this.save();
    return log;
  }

  resetDemo() {
    this.data = JSON.parse(JSON.stringify(initialData));
    this.save();
    return this.data;
  }
}

export const db = new DataStore();
