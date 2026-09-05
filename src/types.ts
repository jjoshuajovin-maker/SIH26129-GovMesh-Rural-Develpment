export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  department: string;
  district: string;
}

export interface FileManifest {
  application: string;
  consent: string;
  purpose: string;
  created: string;
  checksum: string;
  allowedFields: string[];
}

export interface FileItem {
  id: string;
  fileName: string;
  applicationId: string;
  source: string;
  receivedTime: string;
  recordsCount: number;
  fileSize: string;
  fileType: string;
  transferMethod: string;
  checksumAlg: string;
  checksum: string;
  senderChecksum: string;
  integrityVerified: boolean;
  status: 'RECEIVED' | 'VALIDATING' | 'PROCESSING' | 'PROCESSED' | 'COMPLETED' | 'INVALID' | 'FAILED' | 'DUPLICATE';
  manifest?: FileManifest;
}

export interface ValidationCheck {
  name: string;
  status: 'PASSED' | 'FAILED';
  message: string;
}

export interface ValidationErrorDetail {
  row: number;
  appId: string;
  error: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  status: string;
  checks: ValidationCheck[];
  invalidCount?: number;
  errors?: ValidationErrorDetail[];
}

export interface ExceptionItem {
  id: string;
  applicationId: string;
  fileId: string;
  errorType: string;
  description: string;
  citizenName: string;
  address: string;
  district: string;
  created: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Corrected' | 'Resolved' | 'Rejected';
  consentId?: string;
}

export interface ServiceRecord {
  id: string;
  departmentApplicationId?: string;
  applicationId: string;
  citizenRef: string;
  citizenName: string;
  address: string;
  district: string;
  state?: string;
  service: string;
  receivedDate: string;
  receivedAt?: string;
  status: string;
  lastUpdated: string;
  updatedAt?: string;
  consentId: string;
  verified: boolean;
  correlationId?: string;
  rejectionReason?: string;
}

export interface FailedTransfer {
  id: string;
  fileName: string;
  destination: string;
  status: 'FAILED' | 'QUEUED' | 'TRANSFERRING' | 'RECEIVED' | 'SUCCESS';
  reason: string;
  time: string;
  retryAttempts: number;
  maxRetries: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  applicationId: string;
  fileId: string;
  officer: string;
  result: string;
  checksum: string;
}

export interface GovMeshRequest {
  id: string;
  applicationId: string;
  correlationId: string;
  requestVersion: number;
  requestType: string;
  serviceCode: string;
  sourceDepartment: string;
  targetDepartment: string;
  citizenRef: string;
  citizenName: string;
  requestedAddress: string;
  currentAddress: string;
  district: string;
  taluka: string;
  state: string;
  pincode: string;
  consentId: string;
  canonicalRequestHash: string;
  documentHash: string;
  hashStatus: string;
  documentId?: string;
  documentName?: string;
  documentType?: string;
  documentSize?: string;
  acknowledgementId: string;
  status: 'RECEIVED' | 'VALIDATING' | 'ACCEPTED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  sentAt: string;
  receivedAt: string;
  validatedAt?: string | null;
  acceptedAt?: string | null;
  processingStartedAt?: string | null;
  completedAt?: string | null;
  officerRemarks?: string;
  reviewedBy?: string;
  rawSourceJson?: string;
}

export interface DemoControls {
  simulateSftpFailure: boolean;
  simulateCorruptedFile: boolean;
  simulateInvalidSchema: boolean;
  simulateMissingColumn: boolean;
  simulateDuplicateFile: boolean;
}
