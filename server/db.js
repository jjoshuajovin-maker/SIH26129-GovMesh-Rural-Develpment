import fs from 'fs';
import path from 'path';

const STORE_FILE = path.resolve(process.cwd(), 'data_store.json');

const initialUsers = [
  { id: 'usr-1', username: 'officer_pune', name: 'Rural Officer (Rajesh Patil)', role: 'Rural Development Officer', department: 'Rural Development & Panchayat Raj', district: 'Pune' },
  { id: 'usr-2', username: 'panchayat_admin', name: 'Suresh Deshmukh', role: 'Panchayat Officer', department: 'Rural Development & Panchayat Raj', district: 'Nashik' },
  { id: 'usr-3', username: 'senior_officer', name: 'Dr. Anand Kulkarni', role: 'Senior Officer', department: 'Rural Development & Panchayat Raj', district: 'State Headquarters' },
  { id: 'usr-4', username: 'admin', name: 'Department Admin System', role: 'Department Admin', department: 'Rural Development & Panchayat Raj', district: 'All' },
  { id: 'usr-5', username: 'auditor', name: 'CA Meera Joshi', role: 'Auditor', department: 'State Audit Bureau', district: 'Audit Division' }
];

const initialFiles = [];
const initialRecords = [
  {
    id: 'REC-000124',
    applicationId: 'GM-2026-000124',
    departmentApplicationId: 'RD-2026-000124',
    citizenRef: 'CIT-MH-1001',
    citizenId: 'CIT-MH-1001',
    citizenName: 'Rajesh Shantaram Patil',
    name: 'Rajesh Shantaram Patil',
    address: 'Flat 402, Shivshankar Heights, Karve Road, Kothrud, Haveli, Pune - 411038',
    addressObj: {
      line1: 'Flat 402, Shivshankar Heights, Karve Road, Kothrud',
      district: 'Pune',
      state: 'Maharashtra'
    },
    district: 'Pune',
    state: 'Maharashtra',
    service: 'ADDRESS CHANGE',
    operation: 'UPDATE_REVENUE_ADDRESS',
    receivedDate: '2026-09-05T04:30:05.000Z',
    receivedAt: '2026-09-05T04:30:05.000Z',
    submittedAt: '2026-09-05T04:30:00.000Z',
    status: 'RECEIVED',
    lastUpdated: '2026-09-05T04:30:05.000Z',
    updatedAt: '2026-09-05T04:30:05.000Z',
    consentId: 'GM-CONSENT-2026-000124',
    correlationId: 'GM-CORR-2026-000124',
    verified: true,
    priority: 'HIGH',
    source: 'GOVMESH',
    gateway: 'GovMesh Interoperability Gateway',
    description: 'Cross-department address amendment request submitted via GovMesh Citizen Portal',
    isDemo: true
  },
  {
    id: 'REC-000125',
    applicationId: 'GM-2026-000125',
    departmentApplicationId: 'RD-2026-000125',
    citizenRef: 'CIT-DEMO-001',
    citizenId: 'CIT-DEMO-001',
    citizenName: 'Rural Demo Citizen 01',
    name: 'Rural Demo Citizen 01',
    address: 'House 14, Gram Panchayat Road, Village Dindori, Nashik, Maharashtra',
    addressObj: {
      line1: 'House 14, Gram Panchayat Road, Village Dindori',
      district: 'Nashik',
      state: 'Maharashtra'
    },
    district: 'Nashik',
    state: 'Maharashtra',
    service: 'Rural Housing Assistance',
    receivedDate: '2026-09-05T03:30:00.000Z',
    receivedAt: '2026-09-05T03:30:00.000Z',
    status: 'UNDER_REVIEW',
    lastUpdated: '2026-09-05T03:45:00.000Z',
    updatedAt: '2026-09-05T03:45:00.000Z',
    consentId: 'DEMO-CONSENT-001',
    correlationId: 'DEMO-CORR-001',
    verified: true,
    priority: 'Medium',
    source: 'GOVMESH — DEMO',
    gateway: 'GovMesh Interoperability Gateway',
    reviewedBy: 'OFFICER-NASHIK-01',
    description: 'Application for rural housing subsidy and village dwelling verification',
    isDemo: true
  },
  {
    id: 'REC-000126',
    applicationId: 'GM-2026-000126',
    departmentApplicationId: 'RD-2026-000126',
    citizenRef: 'CIT-DEMO-002',
    citizenId: 'CIT-DEMO-002',
    citizenName: 'Rural Demo Citizen 02',
    name: 'Rural Demo Citizen 02',
    address: 'Sector 3, Gram Panchayat Square, Village Kalmeshwar, Nagpur, Maharashtra',
    addressObj: {
      line1: 'Sector 3, Gram Panchayat Square, Village Kalmeshwar',
      district: 'Nagpur',
      state: 'Maharashtra'
    },
    district: 'Nagpur',
    state: 'Maharashtra',
    service: 'Community Infrastructure Request',
    receivedDate: '2026-09-05T03:00:00.000Z',
    receivedAt: '2026-09-05T03:00:00.000Z',
    status: 'APPROVED',
    lastUpdated: '2026-09-05T03:20:00.000Z',
    updatedAt: '2026-09-05T03:20:00.000Z',
    consentId: 'DEMO-CONSENT-002',
    correlationId: 'DEMO-CORR-002',
    verified: true,
    priority: 'High',
    source: 'GOVMESH — DEMO',
    gateway: 'GovMesh Interoperability Gateway',
    reviewedBy: 'OFFICER-NAGPUR-01',
    approvedBy: 'OFFICER-NAGPUR-01',
    description: 'Community drinking water connection and local Panchayat approval',
    isDemo: true
  },
  {
    id: 'REC-000127',
    applicationId: 'GM-2026-000127',
    departmentApplicationId: 'RD-2026-000127',
    citizenRef: 'CIT-DEMO-003',
    citizenId: 'CIT-DEMO-003',
    citizenName: 'Rural Demo Citizen 03',
    name: 'Rural Demo Citizen 03',
    address: 'Main Bazaar, Village Panhala, Kolhapur, Maharashtra',
    addressObj: {
      line1: 'Main Bazaar, Village Panhala',
      district: 'Kolhapur',
      state: 'Maharashtra'
    },
    district: 'Kolhapur',
    state: 'Maharashtra',
    service: 'Village Development Assistance',
    receivedDate: '2026-09-05T02:30:00.000Z',
    receivedAt: '2026-09-05T02:30:00.000Z',
    status: 'RECEIVED',
    lastUpdated: '2026-09-05T02:30:00.000Z',
    updatedAt: '2026-09-05T02:30:00.000Z',
    consentId: 'DEMO-CONSENT-003',
    correlationId: 'DEMO-CORR-003',
    verified: true,
    priority: 'Low',
    source: 'GOVMESH — DEMO',
    gateway: 'GovMesh Interoperability Gateway',
    description: 'Panchayat cottage industry grant verification',
    isDemo: true
  },
  {
    id: 'REC-000128',
    applicationId: 'GM-2026-000128',
    departmentApplicationId: 'RD-2026-000128',
    citizenRef: 'CIT-DEMO-004',
    citizenId: 'CIT-DEMO-004',
    citizenName: 'Rural Demo Citizen 04',
    name: 'Rural Demo Citizen 04',
    address: 'Old Fort Road, Village Wai, Satara, Maharashtra',
    addressObj: {
      line1: 'Old Fort Road, Village Wai',
      district: 'Satara',
      state: 'Maharashtra'
    },
    district: 'Satara',
    state: 'Maharashtra',
    service: 'Rural Beneficiary Verification',
    receivedDate: '2026-09-05T02:00:00.000Z',
    receivedAt: '2026-09-05T02:00:00.000Z',
    status: 'UNDER_REVIEW',
    lastUpdated: '2026-09-05T02:15:00.000Z',
    updatedAt: '2026-09-05T02:15:00.000Z',
    consentId: 'DEMO-CONSENT-004',
    correlationId: 'DEMO-CORR-004',
    verified: true,
    priority: 'Medium',
    source: 'GOVMESH — DEMO',
    gateway: 'GovMesh Interoperability Gateway',
    reviewedBy: 'OFFICER-SATARA-01',
    description: 'Gram Panchayat farmer welfare scheme beneficiary audit',
    isDemo: true
  },
  {
    id: 'REC-000129',
    applicationId: 'GM-2026-000129',
    departmentApplicationId: 'RD-2026-000129',
    citizenRef: 'CIT-DEMO-005',
    citizenName: 'Rural Demo Citizen 05',
    name: 'Rural Demo Citizen 05',
    address: 'Plot 88, Near Temple, Village Pandharpur, Solapur, Maharashtra',
    addressObj: {
      line1: 'Plot 88, Near Temple, Village Pandharpur',
      district: 'Solapur',
      state: 'Maharashtra'
    },
    district: 'Solapur',
    state: 'Maharashtra',
    service: 'Local Development Service',
    receivedDate: '2026-09-05T01:30:00.000Z',
    receivedAt: '2026-09-05T01:30:00.000Z',
    status: 'APPROVED',
    lastUpdated: '2026-09-05T01:50:00.000Z',
    updatedAt: '2026-09-05T01:50:00.000Z',
    consentId: 'DEMO-CONSENT-005',
    correlationId: 'DEMO-CORR-005',
    verified: true,
    priority: 'High',
    source: 'GOVMESH — DEMO',
    gateway: 'GovMesh Interoperability Gateway',
    reviewedBy: 'OFFICER-SOLAPUR-01',
    approvedBy: 'OFFICER-SOLAPUR-01',
    description: 'Rural sanitation and drainage approval certificate',
    isDemo: true
  },
  {
    id: 'REC-000130',
    applicationId: 'GM-2026-000130',
    departmentApplicationId: 'RD-2026-000130',
    citizenRef: 'CIT-DEMO-006',
    citizenName: 'Rural Demo Citizen 06',
    name: 'Rural Demo Citizen 06',
    address: 'Ward 2, Village Sangamner, Ahilyanagar, Maharashtra',
    addressObj: {
      line1: 'Ward 2, Village Sangamner',
      district: 'Ahilyanagar',
      state: 'Maharashtra'
    },
    district: 'Ahilyanagar',
    state: 'Maharashtra',
    service: 'Rural Scheme Application',
    receivedDate: '2026-09-05T01:00:00.000Z',
    receivedAt: '2026-09-05T01:00:00.000Z',
    status: 'RECEIVED',
    lastUpdated: '2026-09-05T01:00:00.000Z',
    updatedAt: '2026-09-05T01:00:00.000Z',
    consentId: 'DEMO-CONSENT-006',
    correlationId: 'DEMO-CORR-006',
    verified: true,
    priority: 'Medium',
    source: 'GOVMESH — DEMO',
    gateway: 'GovMesh Interoperability Gateway',
    description: 'Panchayat solar electrification assistance application',
    isDemo: true
  },
  {
    id: 'REC-000131',
    applicationId: 'GM-2026-000131',
    departmentApplicationId: 'RD-2026-000131',
    citizenRef: 'CIT-DEMO-007',
    citizenName: 'Rural Demo Citizen 07',
    name: 'Rural Demo Citizen 07',
    address: 'Near Bus Stand, Village Achalpur, Amravati, Maharashtra',
    addressObj: {
      line1: 'Near Bus Stand, Village Achalpur',
      district: 'Amravati',
      state: 'Maharashtra'
    },
    district: 'Amravati',
    state: 'Maharashtra',
    service: 'Gram Panchayat Address Update',
    receivedDate: '2026-09-04T22:00:00.000Z',
    receivedAt: '2026-09-04T22:00:00.000Z',
    status: 'UNDER_REVIEW',
    lastUpdated: '2026-09-04T22:30:00.000Z',
    updatedAt: '2026-09-04T22:30:00.000Z',
    consentId: 'DEMO-CONSENT-007',
    correlationId: 'DEMO-CORR-007',
    verified: true,
    priority: 'High',
    source: 'GOVMESH — DEMO',
    gateway: 'GovMesh Interoperability Gateway',
    reviewedBy: 'OFFICER-AMRAVATI-01',
    description: 'Gram Panchayat residency re-allocation for agricultural census',
    isDemo: true
  },
  {
    id: 'REC-000132',
    applicationId: 'GM-2026-000132',
    departmentApplicationId: 'RD-2026-000132',
    citizenRef: 'CIT-DEMO-008',
    citizenName: 'Rural Demo Citizen 08',
    name: 'Rural Demo Citizen 08',
    address: 'Lane 5, Village Kandhar, Nanded, Maharashtra',
    addressObj: {
      line1: 'Lane 5, Village Kandhar',
      district: 'Nanded',
      state: 'Maharashtra'
    },
    district: 'Nanded',
    state: 'Maharashtra',
    service: 'Rural Housing Assistance',
    receivedDate: '2026-09-04T18:00:00.000Z',
    receivedAt: '2026-09-04T18:00:00.000Z',
    status: 'REJECTED',
    lastUpdated: '2026-09-04T18:30:00.000Z',
    updatedAt: '2026-09-04T18:30:00.000Z',
    consentId: 'DEMO-CONSENT-008',
    correlationId: 'DEMO-CORR-008',
    verified: true,
    priority: 'Medium',
    source: 'GOVMESH — DEMO',
    gateway: 'GovMesh Interoperability Gateway',
    reviewedBy: 'OFFICER-NANDED-01',
    rejectedBy: 'OFFICER-NANDED-01',
    rejectionReason: 'Land survey certificate not matching local Gram Panchayat registry',
    description: 'Housing reconstruction assistance application',
    isDemo: true
  },
  {
    id: 'REC-000133',
    applicationId: 'GM-2026-000133',
    departmentApplicationId: 'RD-2026-000133',
    citizenRef: 'CIT-DEMO-009',
    citizenName: 'Rural Demo Citizen 09',
    name: 'Rural Demo Citizen 09',
    address: 'Gram Panchayat Ward 1, Village Paithan, Chhatrapati Sambhajinagar, Maharashtra',
    addressObj: {
      line1: 'Gram Panchayat Ward 1, Village Paithan',
      district: 'Chhatrapati Sambhajinagar',
      state: 'Maharashtra'
    },
    district: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    service: 'Village Development Assistance',
    receivedDate: '2026-09-04T12:00:00.000Z',
    receivedAt: '2026-09-04T12:00:00.000Z',
    status: 'APPROVED',
    lastUpdated: '2026-09-04T12:30:00.000Z',
    updatedAt: '2026-09-04T12:30:00.000Z',
    consentId: 'DEMO-CONSENT-009',
    correlationId: 'DEMO-CORR-009',
    verified: true,
    priority: 'Low',
    source: 'GOVMESH — DEMO',
    gateway: 'GovMesh Interoperability Gateway',
    reviewedBy: 'OFFICER-CSN-01',
    approvedBy: 'OFFICER-CSN-01',
    description: 'Panchayat rural artisan promotion scheme',
    isDemo: true
  }
];

const initialGovMeshRequests = [];
const initialExceptions = [];
const initialTransfers = [];
const initialAuditLogs = [];

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

function sortRecordsWith124Top(recordsList) {
  return [...recordsList].sort((a, b) => {
    if (a.applicationId === 'GM-2026-000124') return -1;
    if (b.applicationId === 'GM-2026-000124') return 1;
    const timeA = new Date(a.receivedDate || a.receivedAt || 0).getTime();
    const timeB = new Date(b.receivedDate || b.receivedAt || 0).getTime();
    return timeB - timeA;
  });
}

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

    this.loadFromFile();

    if (this.usePostgres) {
      this.initPostgres();
    }
  }

  getStoreFilePath() {
    if (process.env.VERCEL || process.env.NODE_ENV === 'production' || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      try {
        return path.resolve('/tmp', 'data_store.json');
      } catch (e) {
        return STORE_FILE;
      }
    }
    return STORE_FILE;
  }

  loadFromFile() {
    try {
      const filePath = this.getStoreFilePath();
      let loadedRecords = null;
      let loadedData = null;

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        loadedData = JSON.parse(content);
      } else if (fs.existsSync(STORE_FILE)) {
        const content = fs.readFileSync(STORE_FILE, 'utf8');
        loadedData = JSON.parse(content);
      }

      if (loadedData) {
        if (Array.isArray(loadedData.records)) loadedRecords = loadedData.records;
        if (Array.isArray(loadedData.govmeshRequests)) this.memory.govmeshRequests = loadedData.govmeshRequests;
        if (Array.isArray(loadedData.auditLogs)) this.memory.auditLogs = loadedData.auditLogs;
        if (Array.isArray(loadedData.files)) this.memory.files = loadedData.files;
        if (Array.isArray(loadedData.exceptions)) this.memory.exceptions = loadedData.exceptions;
        if (Array.isArray(loadedData.transfers)) this.memory.transfers = loadedData.transfers;
      }

      // Merge initial seed records with loaded records without deleting real production records
      const existingMap = new Map();
      if (Array.isArray(loadedRecords)) {
        for (const r of loadedRecords) {
          existingMap.set(r.applicationId, r);
        }
      }

      for (const initRec of initialRecords) {
        if (!existingMap.has(initRec.applicationId)) {
          existingMap.set(initRec.applicationId, { ...initRec });
        } else {
          // Keep current status if officer reviewed/approved, but ensure demo metadata exists
          const cur = existingMap.get(initRec.applicationId);
          existingMap.set(initRec.applicationId, { ...initRec, status: cur.status || initRec.status, lastUpdated: cur.lastUpdated || initRec.lastUpdated, updatedAt: cur.updatedAt || initRec.updatedAt, reviewedBy: cur.reviewedBy || initRec.reviewedBy, approvedBy: cur.approvedBy || initRec.approvedBy, rejectedBy: cur.rejectedBy || initRec.rejectedBy, rejectionReason: cur.rejectionReason || initRec.rejectionReason });
        }
      }

      this.memory.records = sortRecordsWith124Top(Array.from(existingMap.values()));
    } catch (e) {
      console.error('Error loading data store file:', e);
      this.memory.records = sortRecordsWith124Top([...initialRecords]);
    }
  }

  saveToFile() {
    const dataToSave = {
      records: this.memory.records,
      govmeshRequests: this.memory.govmeshRequests || [],
      auditLogs: this.memory.auditLogs,
      files: this.memory.files,
      exceptions: this.memory.exceptions,
      transfers: this.memory.transfers
    };
    const jsonStr = JSON.stringify(dataToSave, null, 2);

    try {
      const filePath = this.getStoreFilePath();
      fs.writeFileSync(filePath, jsonStr, 'utf8');
    } catch (e) {
      try {
        const fallbackPath = path.resolve('/tmp', 'data_store.json');
        fs.writeFileSync(fallbackPath, jsonStr, 'utf8');
      } catch (err) {
        console.error('Error saving data store file:', err);
      }
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

        CREATE TABLE IF NOT EXISTS records (
          id VARCHAR(100) PRIMARY KEY,
          application_id VARCHAR(100) UNIQUE,
          department_application_id VARCHAR(100),
          citizen_ref VARCHAR(100),
          citizen_name VARCHAR(200),
          address TEXT,
          district VARCHAR(100),
          state VARCHAR(100),
          service VARCHAR(200),
          received_date VARCHAR(100),
          received_at VARCHAR(100),
          status VARCHAR(50),
          last_updated VARCHAR(100),
          updated_at VARCHAR(100),
          consent_id VARCHAR(100),
          verified BOOLEAN,
          correlation_id VARCHAR(200),
          rejection_reason TEXT,
          reviewed_by VARCHAR(100)
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
      `);

      // Automatically seed initial demo records into PostgreSQL database
      for (const rec of initialRecords) {
        try {
          await this.pool.query(`
            INSERT INTO records (
              id, application_id, department_application_id, citizen_ref, citizen_name,
              address, district, state, service, received_date, received_at, status,
              last_updated, updated_at, consent_id, verified, correlation_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            ON CONFLICT (application_id) DO UPDATE SET
              received_date = EXCLUDED.received_date,
              received_at = EXCLUDED.received_at,
              service = EXCLUDED.service,
              citizen_name = EXCLUDED.citizen_name,
              district = EXCLUDED.district
          `, [
            rec.id,
            rec.applicationId,
            rec.departmentApplicationId || rec.id,
            rec.citizenRef || rec.citizenId,
            rec.citizenName || rec.name,
            typeof rec.address === 'object' ? JSON.stringify(rec.address) : rec.address,
            rec.district || 'Pune',
            rec.state || 'Maharashtra',
            rec.service || 'Rural Address Update',
            rec.receivedDate || rec.receivedAt,
            rec.receivedAt || rec.receivedDate,
            rec.status || 'RECEIVED',
            rec.lastUpdated || rec.updatedAt,
            rec.updatedAt || rec.lastUpdated,
            rec.consentId,
            true,
            rec.correlationId
          ]);
        } catch (err) {
          console.error('Error seeding record to Postgres:', rec.applicationId, err.message);
        }
      }
    } catch (e) {
      console.warn('PostgreSQL not initialized; using file / in-memory store:', e.message);
      this.usePostgres = false;
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
    let list = this.memory.records;
    if (this.usePostgres && this.pool) {
      try {
        let query = 'SELECT id, application_id as "applicationId", department_application_id as "departmentApplicationId", citizen_ref as "citizenRef", citizen_name as "citizenName", address, district, state, service, received_date as "receivedDate", received_at as "receivedAt", status, last_updated as "lastUpdated", updated_at as "updatedAt", consent_id as "consentId", verified, correlation_id as "correlationId", rejection_reason as "rejectionReason", reviewed_by as "reviewedBy" FROM records ORDER BY CASE WHEN application_id = \'GM-2026-000124\' THEN 0 ELSE 1 END, received_date DESC';
        if (statusFilter) {
          query = `SELECT id, application_id as "applicationId", department_application_id as "departmentApplicationId", citizen_ref as "citizenRef", citizen_name as "citizenName", address, district, state, service, received_date as "receivedDate", received_at as "receivedAt", status, last_updated as "lastUpdated", updated_at as "updatedAt", consent_id as "consentId", verified, correlation_id as "correlationId", rejection_reason as "rejectionReason", reviewed_by as "reviewedBy" FROM records WHERE status = $1 ORDER BY CASE WHEN application_id = 'GM-2026-000124' THEN 0 ELSE 1 END, received_date DESC`;
          const res = await this.pool.query(query, [statusFilter]);
          list = res.rows;
        } else {
          const res = await this.pool.query(query);
          list = res.rows;
        }

        // Merge initial seed records to guarantee presence even if DB was just provisioned
        const existingMap = new Map();
        for (const r of list) existingMap.set(r.applicationId, r);
        for (const initRec of initialRecords) {
          if (!existingMap.has(initRec.applicationId)) {
            existingMap.set(initRec.applicationId, { ...initRec });
          } else {
            const cur = existingMap.get(initRec.applicationId);
            existingMap.set(initRec.applicationId, {
              ...initRec,
              ...cur,
              source: cur.source || initRec.source,
              gateway: cur.gateway || initRec.gateway,
              priority: cur.priority || initRec.priority,
              description: cur.description || initRec.description,
              isDemo: initRec.isDemo
            });
          }
        }
        list = Array.from(existingMap.values());
      } catch (e) {
        console.error('PG error getting records:', e);
      }
    }
    const sorted = sortRecordsWith124Top(list);
    if (statusFilter) {
      return sorted.filter(r => (r.status || '').toUpperCase() === statusFilter.toUpperCase());
    }
    return sorted;
  }

  async getRecordByAppIdOrDeptId(id) {
    const records = await this.getRecords();
    return records.find(r => r.applicationId === id || r.departmentApplicationId === id || r.id === id);
  }

  async addRecord(recordObj) {
    const existing = this.memory.records.find(r => r.applicationId === recordObj.applicationId);
    if (existing) return existing;

    if (this.usePostgres && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO records (id, application_id, department_application_id, citizen_ref, citizen_name, address, district, state, service, received_date, received_at, status, last_updated, updated_at, consent_id, verified, correlation_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
           ON CONFLICT (application_id) DO NOTHING`,
          [
            recordObj.id,
            recordObj.applicationId,
            recordObj.departmentApplicationId || recordObj.id,
            recordObj.citizenRef || recordObj.citizenId,
            recordObj.citizenName || recordObj.name,
            typeof recordObj.address === 'object' ? JSON.stringify(recordObj.address) : recordObj.address,
            recordObj.district || 'Pune',
            recordObj.state || 'Maharashtra',
            recordObj.service || 'Gram Panchayat Address Update',
            recordObj.receivedDate || recordObj.receivedAt,
            recordObj.receivedAt || recordObj.receivedDate,
            recordObj.status || 'RECEIVED',
            recordObj.lastUpdated || recordObj.updatedAt,
            recordObj.updatedAt || recordObj.lastUpdated,
            recordObj.consentId,
            recordObj.verified !== undefined ? recordObj.verified : true,
            recordObj.correlationId
          ]
        );
      } catch (e) { console.error('PG error adding record:', e); }
    }

    this.memory.records.unshift(recordObj);
    this.memory.records = sortRecordsWith124Top(this.memory.records);
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
          await this.pool.query(
            'UPDATE records SET status = $1, last_updated = $2, updated_at = $2, reviewed_by = COALESCE($3, reviewed_by), rejection_reason = COALESCE($4, rejection_reason) WHERE id = $5 OR application_id = $5 OR department_application_id = $5',
            [status, record.lastUpdated, extraFields.reviewedBy || extraFields.approvedBy || extraFields.rejectedBy || null, extraFields.rejectionReason || null, appIdOrDeptId]
          );
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
      throw new Error(`Application must be UNDER_REVIEW or RECEIVED before approval. Current state: ${record.status}`);
    }

    return await this.updateRecordStatus(appIdOrDeptId, 'APPROVED', { approvedBy: officerId, approvedAt: new Date().toISOString() });
  }

  async rejectRecord(appIdOrDeptId, officerId = 'OFFICER-001', reason = 'Application rejected by officer') {
    const record = await this.getRecordByAppIdOrDeptId(appIdOrDeptId);
    if (!record) return null;

    if (record.status !== 'UNDER_REVIEW' && record.status !== 'RECEIVED') {
      throw new Error(`Application must be UNDER_REVIEW or RECEIVED before rejection. Current state: ${record.status}`);
    }

    return await this.updateRecordStatus(appIdOrDeptId, 'REJECTED', { rejectedBy: officerId, rejectionReason: reason, rejectedAt: new Date().toISOString() });
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
    return this.memory.govmeshRequests || [];
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

    if (!this.memory.govmeshRequests) this.memory.govmeshRequests = [];
    const existingIdx = this.memory.govmeshRequests.findIndex(r => r.applicationId === reqObj.applicationId);
    if (existingIdx >= 0) {
      this.memory.govmeshRequests[existingIdx] = { ...this.memory.govmeshRequests[existingIdx], ...reqObj };
    } else {
      this.memory.govmeshRequests.unshift(reqObj);
    }
    this.saveToFile();
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

    this.saveToFile();
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
      govmeshRequests: [],
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
