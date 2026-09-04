import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

const STORE_FILE = path.resolve(process.cwd(), 'data_store.json');

const initialUsers = [
  { id: 'usr-1', username: 'officer_pune', name: 'Rural Officer (Rajesh Patil)', role: 'Rural Development Officer', department: 'Rural Development & Panchayat Raj', district: 'Pune' },
  { id: 'usr-2', username: 'panchayat_admin', name: 'Suresh Deshmukh', role: 'Panchayat Officer', department: 'Rural Development & Panchayat Raj', district: 'Nashik' },
  { id: 'usr-3', username: 'senior_officer', name: 'Dr. Anand Kulkarni', role: 'Senior Officer', department: 'Rural Development & Panchayat Raj', district: 'State Headquarters' }
];

const initialSystemHealth = {
  sftpConnector: 'ONLINE',
  csvParser: 'ONLINE',
  validationEngine: 'ONLINE',
  batchProcessor: 'ONLINE',
  database: 'ONLINE',
  resultGenerator: 'ONLINE',
  govmeshConnector: 'ONLINE',
  lastSuccessfulImport: 'N/A',
  lastSuccessfulExport: 'N/A',
  failedTransfersCount: 0,
  pendingFilesCount: 0,
  averageProcessingTimeMs: 120,
  systemUptime: '99.99%'
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
      files: [],
      records: [],
      exceptions: [],
      transfers: [],
      auditLogs: [],
      systemHealth: JSON.parse(JSON.stringify(initialSystemHealth)),
      demoControls: JSON.parse(JSON.stringify(initialDemoControls))
    };

    this.loadFromFile();

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

  loadFromFile() {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const content = fs.readFileSync(STORE_FILE, 'utf8');
        const loaded = JSON.parse(content);
        if (loaded) {
          if (Array.isArray(loaded.records)) this.memory.records = loaded.records;
          if (Array.isArray(loaded.auditLogs)) this.memory.auditLogs = loaded.auditLogs;
          if (Array.isArray(loaded.files)) this.memory.files = loaded.files;
          if (Array.isArray(loaded.exceptions)) this.memory.exceptions = loaded.exceptions;
          if (Array.isArray(loaded.transfers)) this.memory.transfers = loaded.transfers;
        }
      }
    } catch (e) {
      console.error('Error loading data_store.json:', e);
    }
  }

  saveToFile() {
    try {
      const dataToSave = {
        records: this.memory.records,
        auditLogs: this.memory.auditLogs,
        files: this.memory.files,
        exceptions: this.memory.exceptions,
        transfers: this.memory.transfers
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving data_store.json:', e);
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

        CREATE TABLE IF NOT EXISTS records (
          id VARCHAR(100) PRIMARY KEY,
          application_id VARCHAR(100) UNIQUE,
          citizen_ref VARCHAR(100),
          citizen_name VARCHAR(200),
          address TEXT,
          district VARCHAR(100),
          state VARCHAR(100),
          service VARCHAR(200),
          received_date VARCHAR(100),
          status VARCHAR(50),
          last_updated VARCHAR(100),
          consent_id VARCHAR(100),
          verified BOOLEAN,
          correlation_id VARCHAR(200),
          rejection_reason TEXT,
          reviewed_by VARCHAR(100)
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
      `);
    } catch (e) {
      console.error('PostgreSQL init error:', e);
    }
  }

  async getUsers() {
    return this.memory.users;
  }

  async getFiles() {
    return this.memory.files;
  }

  async getFile(id) {
    return this.memory.files.find(f => f.id === id || f.fileName === id);
  }

  async addFile(fileObj) {
    this.memory.files.unshift(fileObj);
    this.saveToFile();
    return fileObj;
  }

  async updateFileStatus(id, status) {
    const file = this.memory.files.find(f => f.id === id || f.fileName === id);
    if (file) {
      file.status = status;
      this.saveToFile();
    }
  }

  async getRecords(statusFilter = null) {
    if (this.usePostgres && this.pool) {
      try {
        let query = 'SELECT id, application_id as "applicationId", department_application_id as "departmentApplicationId", citizen_ref as "citizenRef", citizen_name as "citizenName", address, district, state, service, received_date as "receivedDate", received_at as "receivedAt", status, last_updated as "lastUpdated", updated_at as "updatedAt", consent_id as "consentId", verified, correlation_id as "correlationId", rejection_reason as "rejectionReason" FROM records ORDER BY received_date DESC';
        if (statusFilter) {
          query = `SELECT id, application_id as "applicationId", department_application_id as "departmentApplicationId", citizen_ref as "citizenRef", citizen_name as "citizenName", address, district, state, service, received_date as "receivedDate", received_at as "receivedAt", status, last_updated as "lastUpdated", updated_at as "updatedAt", consent_id as "consentId", verified, correlation_id as "correlationId", rejection_reason as "rejectionReason" FROM records WHERE status = $1 ORDER BY received_date DESC`;
          const res = await this.pool.query(query, [statusFilter]);
          return res.rows;
        }
        const res = await this.pool.query(query);
        return res.rows;
      } catch (e) {
        console.error('PG error getting records:', e);
      }
    }
    if (statusFilter) {
      return this.memory.records.filter(r => r.status === statusFilter);
    }
    return this.memory.records;
  }

  async getRecordByAppIdOrDeptId(id) {
    const records = await this.getRecords();
    return records.find(r => r.applicationId === id || r.departmentApplicationId === id || r.id === id);
  }

  async addRecord(recordObj) {
    // Idempotency check: do not add duplicate applicationId
    const existing = this.memory.records.find(r => r.applicationId === recordObj.applicationId);
    if (existing) return existing;

    if (this.usePostgres && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO records (id, application_id, citizen_ref, citizen_name, address, district, state, service, received_date, status, last_updated, consent_id, verified, correlation_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (application_id) DO NOTHING`,
          [recordObj.id, recordObj.applicationId, recordObj.citizenRef, recordObj.citizenName, typeof recordObj.address === 'object' ? JSON.stringify(recordObj.address) : recordObj.address, recordObj.district, recordObj.state || 'Maharashtra', recordObj.service, recordObj.receivedDate || recordObj.receivedAt, recordObj.status, recordObj.lastUpdated || recordObj.updatedAt, recordObj.consentId, recordObj.verified, recordObj.correlationId]
        );
      } catch (e) { console.error('PG error adding record:', e); }
    }

    this.memory.records.unshift(recordObj);
    this.saveToFile();
    return recordObj;
  }

  async updateRecordStatus(appIdOrDeptId, status, extraFields = {}) {
    const record = await this.getRecordByAppIdOrDeptId(appIdOrDeptId);
    if (record) {
      record.status = status;
      record.lastUpdated = new Date().toISOString();
      record.updatedAt = record.lastUpdated;
      Object.assign(record, extraFields);

      if (this.usePostgres && this.pool) {
        try {
          await this.pool.query('UPDATE records SET status = $1, last_updated = $2 WHERE id = $3 OR application_id = $3', [status, record.lastUpdated, appIdOrDeptId]);
        } catch (e) { console.error('PG error updating record status:', e); }
      }
      this.saveToFile();
    }
    return record;
  }

  async reviewRecord(appIdOrDeptId, officerId = 'OFFICER-001') {
    const record = await this.getRecordByAppIdOrDeptId(appIdOrDeptId);
    if (!record) return null;

    if (record.status !== 'RECEIVED' && record.status !== 'UNDER_REVIEW') {
      throw new Error(`Cannot review application in state ${record.status}`);
    }

    return await this.updateRecordStatus(appIdOrDeptId, 'UNDER_REVIEW', { reviewedBy: officerId, reviewedAt: new Date().toISOString() });
  }

  async approveRecord(appIdOrDeptId, officerId = 'OFFICER-001') {
    const record = await this.getRecordByAppIdOrDeptId(appIdOrDeptId);
    if (!record) return null;

    if (record.status !== 'UNDER_REVIEW' && record.status !== 'RECEIVED') {
      throw new Error(`Application must be UNDER_REVIEW before approval. Current state: ${record.status}`);
    }

    return await this.updateRecordStatus(appIdOrDeptId, 'APPROVED', { approvedBy: officerId, approvedAt: new Date().toISOString() });
  }

  async rejectRecord(appIdOrDeptId, officerId = 'OFFICER-001', reason = 'Application rejected by officer') {
    const record = await this.getRecordByAppIdOrDeptId(appIdOrDeptId);
    if (!record) return null;

    if (record.status !== 'UNDER_REVIEW' && record.status !== 'RECEIVED') {
      throw new Error(`Application must be UNDER_REVIEW before rejection. Current state: ${record.status}`);
    }

    return await this.updateRecordStatus(appIdOrDeptId, 'REJECTED', { rejectedBy: officerId, rejectionReason: reason, rejectedAt: new Date().toISOString() });
  }

  async getExceptions() {
    return this.memory.exceptions;
  }

  async correctException(id, district, address) {
    const exc = this.memory.exceptions.find(e => e.id === id);
    if (exc) {
      if (district) exc.district = district;
      if (address) exc.address = address;
      exc.status = 'Corrected';
      this.saveToFile();
    }
    return exc;
  }

  async reprocessException(id) {
    const exc = this.memory.exceptions.find(e => e.id === id);
    if (exc) {
      exc.status = 'Resolved';
      this.saveToFile();
    }
    return exc;
  }

  async getTransfers() {
    return this.memory.transfers;
  }

  async retryTransfer(id) {
    const t = this.memory.transfers.find(tr => tr.id === id);
    if (t) {
      t.retryAttempts = (t.retryAttempts || 1) + 1;
      t.status = 'SUCCESS';
      t.reason = 'Retry successful after connection re-established';
      this.saveToFile();
    }
    return t;
  }

  async getAuditLogs() {
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

    this.memory.auditLogs.unshift(log);
    this.saveToFile();
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
      files: [],
      records: [],
      exceptions: [],
      transfers: [],
      auditLogs: [],
      systemHealth: JSON.parse(JSON.stringify(initialSystemHealth)),
      demoControls: JSON.parse(JSON.stringify(initialDemoControls))
    };
    if (fs.existsSync(STORE_FILE)) {
      try { fs.unlinkSync(STORE_FILE); } catch (e) {}
    }
    return this.memory;
  }
}

export const db = new DataStore();
