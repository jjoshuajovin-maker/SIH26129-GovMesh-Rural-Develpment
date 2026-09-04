import crypto from 'crypto';
import pg from 'pg';

const { Pool } = pg;

// Initial seed data
const initialUsers = [
  { id: 'usr-1', username: 'officer_pune', name: 'Demo Officer (Rajesh Patil)', role: 'Rural Development Officer', department: 'Rural Development & Panchayat Raj', district: 'Pune' },
  { id: 'usr-2', username: 'panchayat_admin', name: 'Suresh Deshmukh', role: 'Panchayat Officer', department: 'Rural Development & Panchayat Raj', district: 'Nashik' },
  { id: 'usr-3', username: 'senior_officer', name: 'Dr. Anand Kulkarni', role: 'Senior Officer', department: 'Rural Development & Panchayat Raj', district: 'State Headquarters' },
  { id: 'usr-4', username: 'admin', name: 'Department Admin System', role: 'Department Admin', department: 'Rural Development & Panchayat Raj', district: 'All' },
  { id: 'usr-5', username: 'auditor', name: 'CA Meera Joshi', role: 'Auditor', department: 'State Audit Bureau', district: 'Audit Division' }
];

const initialFiles = [
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
    },
    csvContent: `application_id,citizen_name,address,district,verified\nGM-2026-000124,Demo Citizen,Gram Panchayat Ward No 4 Village Khed,Pune,true`
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
    },
    csvContent: `application_id,citizen_name,address,district,verified\nGM-2026-000125,Ramesh Patil,Plot 12 Gram Panchayat Road,,true`
  }
];

const initialRecords = [
  {
    id: 'REC-001',
    departmentApplicationId: 'RURAL-000124',
    applicationId: 'GM-2026-000124',
    citizenRef: 'CITIZEN-001',
    citizenName: 'Demo Citizen',
    address: 'Gram Panchayat Ward No. 4, Village Khed',
    district: 'Pune',
    state: 'Maharashtra',
    service: 'Local Rural Record Update',
    receivedDate: '2026-08-30T10:15:00.000Z',
    receivedAt: '2026-08-30T10:15:00.000Z',
    status: 'COMPLETED',
    lastUpdated: '2026-08-30T10:15:00.000Z',
    updatedAt: '2026-08-30T10:15:00.000Z',
    consentId: 'CONSENT-00124',
    verified: true,
    correlationId: 'CORR-000124'
  }
];

const initialExceptions = [
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
];

const initialTransfers = [
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
];

const initialAuditLogs = [
  { id: 'LOG-001', timestamp: '2026-08-30T10:15:01.000Z', event: 'FILE_CREATED', applicationId: 'GM-2026-000124', fileId: 'FILE-000124', officer: 'SYSTEM', result: 'SUCCESS', checksum: 'e3b0c442...' },
  { id: 'LOG-002', timestamp: '2026-08-30T10:15:03.000Z', event: 'FILE_RECEIVED', applicationId: 'GM-2026-000124', fileId: 'FILE-000124', officer: 'SYSTEM', result: 'SUCCESS', checksum: 'e3b0c442...' },
  { id: 'LOG-003', timestamp: '2026-08-30T10:15:04.000Z', event: 'CHECKSUM_VERIFIED', applicationId: 'GM-2026-000124', fileId: 'FILE-000124', officer: 'SYSTEM', result: 'SUCCESS', checksum: 'e3b0c442...' },
  { id: 'LOG-004', timestamp: '2026-08-30T10:15:05.000Z', event: 'FILE_PARSED', applicationId: 'GM-2026-000124', fileId: 'FILE-000124', officer: 'SYSTEM', result: 'SUCCESS', checksum: 'e3b0c442...' },
  { id: 'LOG-005', timestamp: '2026-08-30T10:15:06.000Z', event: 'VALIDATION_COMPLETED', applicationId: 'GM-2026-000124', fileId: 'FILE-000124', officer: 'SYSTEM', result: 'SUCCESS', checksum: 'e3b0c442...' },
  { id: 'LOG-006', timestamp: '2026-08-30T10:15:08.000Z', event: 'RECORD_PROCESSED', applicationId: 'GM-2026-000124', fileId: 'FILE-000124', officer: 'OFFICER-001', result: 'SUCCESS', checksum: 'e3b0c442...' }
];

const initialSystemHealth = {
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
};

const initialDemoControls = {
  simulateSftpFailure: false,
  simulateCorruptedFile: false,
  simulateInvalidSchema: false,
  simulateMissingColumn: false,
  simulateDuplicateFile: false
};

class DataStore {
  constructor() {
    this.usePostgres = !!process.env.DATABASE_URL;
    this.memory = {
      users: JSON.parse(JSON.stringify(initialUsers)),
      files: JSON.parse(JSON.stringify(initialFiles)),
      records: JSON.parse(JSON.stringify(initialRecords)),
      exceptions: JSON.parse(JSON.stringify(initialExceptions)),
      transfers: JSON.parse(JSON.stringify(initialTransfers)),
      auditLogs: JSON.parse(JSON.stringify(initialAuditLogs)),
      systemHealth: JSON.parse(JSON.stringify(initialSystemHealth)),
      demoControls: JSON.parse(JSON.stringify(initialDemoControls))
    };

    if (this.usePostgres) {
      try {
        this.pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        });
        this.initPostgres();
      } catch (e) {
        console.error('Failed to initialize PostgreSQL connection pool:', e);
        this.usePostgres = false;
      }
    }
  }

  async initPostgres() {
    if (!this.pool) return;
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(100) PRIMARY KEY,
          username VARCHAR(100),
          name VARCHAR(200),
          role VARCHAR(100),
          department VARCHAR(200),
          district VARCHAR(100)
        );

        CREATE TABLE IF NOT EXISTS files (
          id VARCHAR(100) PRIMARY KEY,
          file_name VARCHAR(200),
          application_id VARCHAR(100),
          source VARCHAR(200),
          received_time VARCHAR(100),
          records_count INT,
          file_size VARCHAR(50),
          file_type VARCHAR(50),
          transfer_method VARCHAR(50),
          checksum_alg VARCHAR(50),
          checksum VARCHAR(256),
          sender_checksum VARCHAR(256),
          integrity_verified BOOLEAN,
          status VARCHAR(50),
          manifest JSONB,
          csv_content TEXT
        );

        CREATE TABLE IF NOT EXISTS records (
          id VARCHAR(100) PRIMARY KEY,
          application_id VARCHAR(100),
          citizen_ref VARCHAR(100),
          citizen_name VARCHAR(200),
          address TEXT,
          district VARCHAR(100),
          service VARCHAR(200),
          received_date VARCHAR(100),
          status VARCHAR(50),
          last_updated VARCHAR(100),
          consent_id VARCHAR(100),
          verified BOOLEAN
        );

        CREATE TABLE IF NOT EXISTS exceptions (
          id VARCHAR(100) PRIMARY KEY,
          application_id VARCHAR(100),
          file_id VARCHAR(100),
          error_type VARCHAR(100),
          description TEXT,
          citizen_name VARCHAR(200),
          address TEXT,
          district VARCHAR(100),
          created VARCHAR(100),
          priority VARCHAR(50),
          status VARCHAR(50),
          consent_id VARCHAR(100)
        );

        CREATE TABLE IF NOT EXISTS transfers (
          id VARCHAR(100) PRIMARY KEY,
          file_name VARCHAR(200),
          destination VARCHAR(100),
          status VARCHAR(50),
          reason TEXT,
          time VARCHAR(100),
          retry_attempts INT,
          max_retries INT
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id VARCHAR(100) PRIMARY KEY,
          timestamp VARCHAR(100),
          event VARCHAR(100),
          application_id VARCHAR(100),
          file_id VARCHAR(100),
          officer VARCHAR(200),
          result VARCHAR(50),
          checksum VARCHAR(256)
        );

        CREATE TABLE IF NOT EXISTS system_state (
          key VARCHAR(100) PRIMARY KEY,
          data JSONB
        );
      `);

      // Check if users exist; if empty, seed
      const userRes = await this.pool.query('SELECT COUNT(*) FROM users');
      if (parseInt(userRes.rows[0].count, 10) === 0) {
        for (const u of initialUsers) {
          await this.pool.query(
            'INSERT INTO users (id, username, name, role, department, district) VALUES ($1, $2, $3, $4, $5, $6)',
            [u.id, u.username, u.name, u.role, u.department, u.district]
          );
        }
        for (const f of initialFiles) {
          await this.pool.query(
            `INSERT INTO files (id, file_name, application_id, source, received_time, records_count, file_size, file_type, transfer_method, checksum_alg, checksum, sender_checksum, integrity_verified, status, manifest, csv_content)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
            [f.id, f.fileName, f.applicationId, f.source, f.receivedTime, f.recordsCount, f.fileSize, f.fileType, f.transferMethod, f.checksumAlg, f.checksum, f.senderChecksum, f.integrityVerified, f.status, JSON.stringify(f.manifest), f.csvContent]
          );
        }
        for (const r of initialRecords) {
          await this.pool.query(
            `INSERT INTO records (id, application_id, citizen_ref, citizen_name, address, district, service, received_date, status, last_updated, consent_id, verified)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [r.id, r.applicationId, r.citizenRef, r.citizenName, r.address, r.district, r.service, r.receivedDate, r.status, r.lastUpdated, r.consentId, r.verified]
          );
        }
        for (const e of initialExceptions) {
          await this.pool.query(
            `INSERT INTO exceptions (id, application_id, file_id, error_type, description, citizen_name, address, district, created, priority, status, consent_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [e.id, e.applicationId, e.fileId, e.errorType, e.description, e.citizenName, e.address, e.district, e.created, e.priority, e.status, e.consentId]
          );
        }
        for (const t of initialTransfers) {
          await this.pool.query(
            `INSERT INTO transfers (id, file_name, destination, status, reason, time, retry_attempts, max_retries)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [t.id, t.fileName, t.destination, t.status, t.reason, t.time, t.retryAttempts, t.maxRetries]
          );
        }
        for (const l of initialAuditLogs) {
          await this.pool.query(
            `INSERT INTO audit_logs (id, timestamp, event, application_id, file_id, officer, result, checksum)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [l.id, l.timestamp, l.event, l.applicationId, l.fileId, l.officer, l.result, l.checksum]
          );
        }
        await this.pool.query('INSERT INTO system_state (key, data) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', ['health', JSON.stringify(initialSystemHealth)]);
        await this.pool.query('INSERT INTO system_state (key, data) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', ['demo_controls', JSON.stringify(initialDemoControls)]);
      }
    } catch (e) {
      console.error('PostgreSQL init error:', e);
    }
  }

  // --- Async Accessors ---
  async getUsers() {
    if (this.usePostgres && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM users');
        return res.rows;
      } catch (e) { console.error('PG error:', e); }
    }
    return this.memory.users;
  }

  async getFiles() {
    if (this.usePostgres && this.pool) {
      try {
        const res = await this.pool.query('SELECT id, file_name as "fileName", application_id as "applicationId", source, received_time as "receivedTime", records_count as "recordsCount", file_size as "fileSize", file_type as "fileType", transfer_method as "transferMethod", checksum_alg as "checksumAlg", checksum, sender_checksum as "senderChecksum", integrity_verified as "integrityVerified", status, manifest, csv_content as "csvContent" FROM files ORDER BY received_time DESC');
        return res.rows;
      } catch (e) { console.error('PG error:', e); }
    }
    return this.memory.files;
  }

  async getFile(id) {
    const files = await this.getFiles();
    return files.find(f => f.id === id || f.fileName === id);
  }

  async addFile(fileObj) {
    if (this.usePostgres && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO files (id, file_name, application_id, source, received_time, records_count, file_size, file_type, transfer_method, checksum_alg, checksum, sender_checksum, integrity_verified, status, manifest, csv_content)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [fileObj.id, fileObj.fileName, fileObj.applicationId, fileObj.source, fileObj.receivedTime, fileObj.recordsCount, fileObj.fileSize, fileObj.fileType, fileObj.transferMethod, fileObj.checksumAlg, fileObj.checksum, fileObj.senderChecksum, fileObj.integrityVerified, fileObj.status, JSON.stringify(fileObj.manifest), fileObj.csvContent || '']
        );
      } catch (e) { console.error('PG error:', e); }
    }
    this.memory.files.unshift(fileObj);
    return fileObj;
  }

  async updateFileStatus(id, status) {
    if (this.usePostgres && this.pool) {
      try {
        await this.pool.query('UPDATE files SET status = $1 WHERE id = $2 OR file_name = $2', [status, id]);
      } catch (e) { console.error('PG error:', e); }
    }
    const file = this.memory.files.find(f => f.id === id || f.fileName === id);
    if (file) file.status = status;
  }

  async getRecords() {
    if (this.usePostgres && this.pool) {
      try {
        const res = await this.pool.query('SELECT id, application_id as "applicationId", citizen_ref as "citizenRef", citizen_name as "citizenName", address, district, service, received_date as "receivedDate", status, last_updated as "lastUpdated", consent_id as "consentId", verified FROM records');
        return res.rows;
      } catch (e) { console.error('PG error:', e); }
    }
    return this.memory.records;
  }

  async addRecord(recordObj) {
    if (this.usePostgres && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO records (id, application_id, citizen_ref, citizen_name, address, district, service, received_date, status, last_updated, consent_id, verified)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [recordObj.id, recordObj.applicationId, recordObj.citizenRef, recordObj.citizenName, typeof recordObj.address === 'object' ? JSON.stringify(recordObj.address) : recordObj.address, recordObj.district, recordObj.service, recordObj.receivedDate || recordObj.receivedAt, recordObj.status, recordObj.lastUpdated || recordObj.updatedAt, recordObj.consentId, recordObj.verified]
        );
      } catch (e) { console.error('PG error:', e); }
    }
    this.memory.records.push(recordObj);
    return recordObj;
  }

  async getRecordByAppIdOrDeptId(id) {
    const records = await this.getRecords();
    return records.find(r => r.applicationId === id || r.departmentApplicationId === id || r.id === id);
  }

  async updateRecordStatus(appIdOrDeptId, status) {
    const record = await this.getRecordByAppIdOrDeptId(appIdOrDeptId);
    if (record) {
      record.status = status;
      record.lastUpdated = new Date().toISOString();
      record.updatedAt = record.lastUpdated;
      if (this.usePostgres && this.pool) {
        try {
          await this.pool.query('UPDATE records SET status = $1, last_updated = $2 WHERE id = $3 OR application_id = $3', [status, record.lastUpdated, appIdOrDeptId]);
        } catch (e) { console.error('PG error:', e); }
      }
    }
    return record;
  }

  async getExceptions() {
    if (this.usePostgres && this.pool) {
      try {
        const res = await this.pool.query('SELECT id, application_id as "applicationId", file_id as "fileId", error_type as "errorType", description, citizen_name as "citizenName", address, district, created, priority, status, consent_id as "consentId" FROM exceptions');
        return res.rows;
      } catch (e) { console.error('PG error:', e); }
    }
    return this.memory.exceptions;
  }

  async correctException(id, district, address) {
    if (this.usePostgres && this.pool) {
      try {
        await this.pool.query('UPDATE exceptions SET district = $1, address = $2, status = $3 WHERE id = $4', [district, address, 'Corrected', id]);
      } catch (e) { console.error('PG error:', e); }
    }
    const exc = this.memory.exceptions.find(e => e.id === id);
    if (exc) {
      if (district) exc.district = district;
      if (address) exc.address = address;
      exc.status = 'Corrected';
    }
    return exc;
  }

  async reprocessException(id) {
    if (this.usePostgres && this.pool) {
      try {
        await this.pool.query('UPDATE exceptions SET status = $1 WHERE id = $2', ['Resolved', id]);
      } catch (e) { console.error('PG error:', e); }
    }
    const exc = this.memory.exceptions.find(e => e.id === id);
    if (exc) exc.status = 'Resolved';
    return exc;
  }

  async getTransfers() {
    if (this.usePostgres && this.pool) {
      try {
        const res = await this.pool.query('SELECT id, file_name as "fileName", destination, status, reason, time, retry_attempts as "retryAttempts", max_retries as "maxRetries" FROM transfers');
        return res.rows;
      } catch (e) { console.error('PG error:', e); }
    }
    return this.memory.transfers;
  }

  async retryTransfer(id) {
    if (this.usePostgres && this.pool) {
      try {
        await this.pool.query('UPDATE transfers SET retry_attempts = retry_attempts + 1, status = $1, reason = $2 WHERE id = $3', ['SUCCESS', 'Retry successful after connection re-established', id]);
      } catch (e) { console.error('PG error:', e); }
    }
    const t = this.memory.transfers.find(tr => tr.id === id);
    if (t) {
      t.retryAttempts = (t.retryAttempts || 1) + 1;
      t.status = 'SUCCESS';
      t.reason = 'Retry successful after connection re-established';
    }
    return t;
  }

  async getAuditLogs() {
    if (this.usePostgres && this.pool) {
      try {
        const res = await this.pool.query('SELECT id, timestamp, event, application_id as "applicationId", file_id as "fileId", officer, result, checksum FROM audit_logs ORDER BY timestamp DESC');
        return res.rows;
      } catch (e) { console.error('PG error:', e); }
    }
    return this.memory.auditLogs;
  }

  async addAuditLog(event, applicationId, fileId, officer, result, checksum = '') {
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

    if (this.usePostgres && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO audit_logs (id, timestamp, event, application_id, file_id, officer, result, checksum)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [log.id, log.timestamp, log.event, log.applicationId, log.fileId, log.officer, log.result, log.checksum]
        );
      } catch (e) { console.error('PG error:', e); }
    }
    this.memory.auditLogs.unshift(log);
    return log;
  }

  async getSystemHealth() {
    return this.memory.systemHealth;
  }

  async getDemoControls() {
    return this.memory.demoControls;
  }

  async toggleDemoControl(type, enabled) {
    if (type) {
      this.memory.demoControls[type] = enabled !== undefined ? enabled : !this.memory.demoControls[type];
    }
    return this.memory.demoControls;
  }

  async resetDemo() {
    this.memory = {
      users: JSON.parse(JSON.stringify(initialUsers)),
      files: JSON.parse(JSON.stringify(initialFiles)),
      records: JSON.parse(JSON.stringify(initialRecords)),
      exceptions: JSON.parse(JSON.stringify(initialExceptions)),
      transfers: JSON.parse(JSON.stringify(initialTransfers)),
      auditLogs: JSON.parse(JSON.stringify(initialAuditLogs)),
      systemHealth: JSON.parse(JSON.stringify(initialSystemHealth)),
      demoControls: JSON.parse(JSON.stringify(initialDemoControls))
    };
    return this.memory;
  }
}

export const db = new DataStore();
