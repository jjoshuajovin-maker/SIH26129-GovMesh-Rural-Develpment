import crypto from 'crypto';

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
    applicationId: 'GM-2026-000124',
    citizenRef: 'CITIZEN-001',
    citizenName: 'Demo Citizen',
    address: 'Gram Panchayat Ward No. 4, Village Khed',
    district: 'Pune',
    service: 'Local Rural Record Update',
    receivedDate: '2026-08-30T10:15:00.000Z',
    status: 'Completed',
    lastUpdated: '2026-08-30T10:15:00.000Z',
    consentId: 'CONSENT-00124',
    verified: true
  }
];

const initialGovMeshRequests = [
  {
    id: 'RURAL-REQ-000124',
    applicationId: 'GM-2026-000124',
    correlationId: 'CORR-26-000124',
    requestVersion: 1,
    requestType: 'ADDRESS_CHANGE',
    serviceCode: 'ADDRESS_CHANGE',
    sourceDepartment: 'Revenue & Forest Department',
    targetDepartment: 'Rural Development & Panchayat Raj',
    citizenRef: 'GM-CIT-10001',
    citizenName: 'Demo Citizen',
    requestedAddress: 'Gram Panchayat Ward No. 4, Village Khed, Pune - 410501',
    currentAddress: 'Old Gram Quarters, Khed Village, Pune',
    district: 'Pune',
    taluka: 'Khed',
    state: 'Maharashtra',
    pincode: '410501',
    consentId: 'CONSENT-00124',
    canonicalRequestHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    documentHash: 'sha256:a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    hashStatus: 'VERIFIED',
    documentId: 'DOC-RURAL-001',
    documentName: 'address_proof.pdf',
    documentType: 'application/pdf',
    documentSize: '142 KB',
    acknowledgementId: 'ACK-RURAL-GM-2026-000124',
    status: 'COMPLETED',
    createdAt: '2026-08-30T10:14:50.000Z',
    sentAt: '2026-08-30T10:14:55.000Z',
    receivedAt: '2026-08-30T10:15:00.000Z',
    validatedAt: '2026-08-30T10:15:01.000Z',
    acceptedAt: '2026-08-30T10:15:02.000Z',
    processingStartedAt: '2026-08-30T10:15:04.000Z',
    completedAt: '2026-08-30T10:15:08.000Z',
    officerRemarks: 'Address record synchronized with Gram Panchayat registry.',
    reviewedBy: 'Rajesh Patil (Rural Development Officer)',
    rawSourceJson: JSON.stringify({
      applicationId: 'GM-2026-000124',
      correlationId: 'CORR-26-000124',
      requestVersion: 1,
      serviceCode: 'ADDRESS_CHANGE',
      citizen: { name: 'Demo Citizen', address: { line1: 'Gram Panchayat Ward No. 4, Village Khed', district: 'Pune' } },
      consentId: 'CONSENT-00124'
    })
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
      govmeshRequests: JSON.parse(JSON.stringify(initialGovMeshRequests)),
      exceptions: JSON.parse(JSON.stringify(initialExceptions)),
      transfers: JSON.parse(JSON.stringify(initialTransfers)),
      auditLogs: JSON.parse(JSON.stringify(initialAuditLogs)),
      systemHealth: JSON.parse(JSON.stringify(initialSystemHealth)),
      demoControls: JSON.parse(JSON.stringify(initialDemoControls))
    };

    if (this.usePostgres) {
      this.initPostgres();
    }
  }

  async initPostgres() {
    try {
      const pgModule = await import('pg');
      const Pool = pgModule.default?.Pool || pgModule.Pool;
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });

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

        CREATE TABLE IF NOT EXISTS govmesh_requests (
          id VARCHAR(100) PRIMARY KEY,
          application_id VARCHAR(100) UNIQUE,
          correlation_id VARCHAR(100),
          request_version INT,
          request_type VARCHAR(100),
          service_code VARCHAR(100),
          source_department VARCHAR(200),
          target_department VARCHAR(200),
          citizen_ref VARCHAR(100),
          citizen_name VARCHAR(200),
          requested_address TEXT,
          current_address TEXT,
          district VARCHAR(100),
          taluka VARCHAR(100),
          state VARCHAR(100),
          pincode VARCHAR(50),
          consent_id VARCHAR(100),
          canonical_request_hash VARCHAR(256),
          document_hash VARCHAR(256),
          hash_status VARCHAR(50),
          document_id VARCHAR(100),
          document_name VARCHAR(200),
          document_type VARCHAR(100),
          document_size VARCHAR(50),
          acknowledgement_id VARCHAR(100),
          status VARCHAR(50),
          created_at VARCHAR(100),
          sent_at VARCHAR(100),
          received_at VARCHAR(100),
          validated_at VARCHAR(100),
          accepted_at VARCHAR(100),
          processing_started_at VARCHAR(100),
          completed_at VARCHAR(100),
          officer_remarks TEXT,
          reviewed_by VARCHAR(200),
          raw_source_json TEXT
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
        for (const gr of initialGovMeshRequests) {
          await this.pool.query(
            `INSERT INTO govmesh_requests (id, application_id, correlation_id, request_version, request_type, service_code, source_department, target_department, citizen_ref, citizen_name, requested_address, current_address, district, taluka, state, pincode, consent_id, canonical_request_hash, document_hash, hash_status, document_id, document_name, document_type, document_size, acknowledgement_id, status, created_at, sent_at, received_at, validated_at, accepted_at, processing_started_at, completed_at, officer_remarks, reviewed_by, raw_source_json)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)
             ON CONFLICT (id) DO NOTHING`,
            [gr.id, gr.applicationId, gr.correlationId, gr.requestVersion, gr.requestType, gr.serviceCode, gr.sourceDepartment, gr.targetDepartment, gr.citizenRef, gr.citizenName, gr.requestedAddress, gr.currentAddress, gr.district, gr.taluka, gr.state, gr.pincode, gr.consentId, gr.canonicalRequestHash, gr.documentHash, gr.hashStatus, gr.documentId, gr.documentName, gr.documentType, gr.documentSize, gr.acknowledgementId, gr.status, gr.createdAt, gr.sentAt, gr.receivedAt, gr.validatedAt, gr.acceptedAt, gr.processingStartedAt, gr.completedAt, gr.officerRemarks, gr.reviewedBy, gr.rawSourceJson]
          );
        }
      }
    } catch (e) {
      console.warn('PostgreSQL not loaded; using in-memory datastore.');
      this.usePostgres = false;
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
        const res = await this.pool.query('SELECT id, application_id as "applicationId", citizen_ref as "citizenRef", citizen_name as "citizenName", address, district, service, received_date as "receivedDate", status, last_updated as "lastUpdated", consent_id as "consentId", verified FROM records ORDER BY received_date DESC');
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
          [recordObj.id, recordObj.applicationId, recordObj.citizenRef, recordObj.citizenName, recordObj.address, recordObj.district, recordObj.service, recordObj.receivedDate, recordObj.status, recordObj.lastUpdated, recordObj.consentId, recordObj.verified]
        );
      } catch (e) { console.error('PG error:', e); }
    }
    this.memory.records.unshift(recordObj);
    return recordObj;
  }

  // --- GovMesh Interoperability Requests Accessors ---
  async getGovMeshRequests() {
    if (this.usePostgres && this.pool) {
      try {
        const res = await this.pool.query(`
          SELECT id, application_id as "applicationId", correlation_id as "correlationId",
                 request_version as "requestVersion", request_type as "requestType", service_code as "serviceCode",
                 source_department as "sourceDepartment", target_department as "targetDepartment",
                 citizen_ref as "citizenRef", citizen_name as "citizenName", requested_address as "requestedAddress",
                 current_address as "currentAddress", district, taluka, state, pincode, consent_id as "consentId",
                 canonical_request_hash as "canonicalRequestHash", document_hash as "documentHash", hash_status as "hashStatus",
                 document_id as "documentId", document_name as "documentName", document_type as "documentType",
                 document_size as "documentSize", acknowledgement_id as "acknowledgementId", status,
                 created_at as "createdAt", sent_at as "sentAt", received_at as "receivedAt",
                 validated_at as "validatedAt", accepted_at as "acceptedAt",
                 processing_started_at as "processingStartedAt", completed_at as "completedAt",
                 officer_remarks as "officerRemarks", reviewed_by as "reviewedBy", raw_source_json as "rawSourceJson"
          FROM govmesh_requests ORDER BY received_at DESC
        `);
        return res.rows;
      } catch (e) { console.error('PG error:', e); }
    }
    return this.memory.govmeshRequests;
  }

  async getGovMeshRequest(id) {
    const requests = await this.getGovMeshRequests();
    return requests.find(r => r.id === id || r.applicationId === id || r.correlationId === id);
  }

  async addGovMeshRequest(reqObj) {
    if (this.usePostgres && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO govmesh_requests (id, application_id, correlation_id, request_version, request_type, service_code, source_department, target_department, citizen_ref, citizen_name, requested_address, current_address, district, taluka, state, pincode, consent_id, canonical_request_hash, document_hash, hash_status, document_id, document_name, document_type, document_size, acknowledgement_id, status, created_at, sent_at, received_at, validated_at, accepted_at, processing_started_at, completed_at, officer_remarks, reviewed_by, raw_source_json)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)
           ON CONFLICT (application_id) DO UPDATE SET
             correlation_id = EXCLUDED.correlation_id,
             status = EXCLUDED.status,
             canonical_request_hash = EXCLUDED.canonical_request_hash,
             document_hash = EXCLUDED.document_hash,
             validated_at = EXCLUDED.validated_at,
             accepted_at = EXCLUDED.accepted_at,
             raw_source_json = EXCLUDED.raw_source_json`,
          [reqObj.id, reqObj.applicationId, reqObj.correlationId, reqObj.requestVersion, reqObj.requestType, reqObj.serviceCode, reqObj.sourceDepartment, reqObj.targetDepartment, reqObj.citizenRef, reqObj.citizenName, reqObj.requestedAddress, reqObj.currentAddress, reqObj.district, reqObj.taluka, reqObj.state, reqObj.pincode, reqObj.consentId, reqObj.canonicalRequestHash, reqObj.documentHash, reqObj.hashStatus, reqObj.documentId, reqObj.documentName, reqObj.documentType, reqObj.documentSize, reqObj.acknowledgementId, reqObj.status, reqObj.createdAt, reqObj.sentAt, reqObj.receivedAt, reqObj.validatedAt, reqObj.acceptedAt, reqObj.processingStartedAt, reqObj.completedAt, reqObj.officerRemarks, reqObj.reviewedBy, reqObj.rawSourceJson]
        );
      } catch (e) { console.error('PG error:', e); }
    }

    const existingIdx = this.memory.govmeshRequests.findIndex(r => r.applicationId === reqObj.applicationId);
    if (existingIdx >= 0) {
      this.memory.govmeshRequests[existingIdx] = { ...this.memory.govmeshRequests[existingIdx], ...reqObj };
    } else {
      this.memory.govmeshRequests.unshift(reqObj);
    }
    return reqObj;
  }

  async updateGovMeshRequestStatus(id, status, officerRemarks = '', reviewedBy = '', timestamps = {}) {
    const req = await this.getGovMeshRequest(id);
    if (!req) return null;

    req.status = status;
    if (officerRemarks) req.officerRemarks = officerRemarks;
    if (reviewedBy) req.reviewedBy = reviewedBy;
    if (timestamps.validatedAt) req.validatedAt = timestamps.validatedAt;
    if (timestamps.acceptedAt) req.acceptedAt = timestamps.acceptedAt;
    if (timestamps.processingStartedAt) req.processingStartedAt = timestamps.processingStartedAt;
    if (timestamps.completedAt) req.completedAt = timestamps.completedAt;

    if (this.usePostgres && this.pool) {
      try {
        await this.pool.query(
          `UPDATE govmesh_requests SET
             status = $1, officer_remarks = $2, reviewed_by = $3,
             validated_at = COALESCE($4, validated_at),
             accepted_at = COALESCE($5, accepted_at),
             processing_started_at = COALESCE($6, processing_started_at),
             completed_at = COALESCE($7, completed_at)
           WHERE id = $8 OR application_id = $8`,
          [req.status, req.officerRemarks, req.reviewedBy, req.validatedAt, req.acceptedAt, req.processingStartedAt, req.completedAt, id]
        );
      } catch (e) { console.error('PG error:', e); }
    }

    return req;
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
      govmeshRequests: JSON.parse(JSON.stringify(initialGovMeshRequests)),
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
