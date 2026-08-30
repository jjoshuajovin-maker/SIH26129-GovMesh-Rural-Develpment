# GOVMESH API DOCUMENTATION

## Department 3 – Rural Development & Panchayat Raj Department (Maharashtra)
### Legacy CSV / SFTP Integration Sandbox APIs

**Base Production URL**:  
`https://sih-26129-gov-mesh-rural-develpment.vercel.app`

---

## Overview

This document provides complete technical documentation for all backend REST API endpoints implemented for **Department 3 (Rural Development & Panchayat Raj)** of the GovMesh SIH26129 project. All endpoints run as serverless functions on Vercel and handle authentications, CSV parsing, file integrity checks, schema validation, exception processing, batch results generation, and audit logging.

---

## 1. Authentication APIs

### 1.1 POST `/api/auth/login`
* **Description**: Officer authentication with designated role selection and 2FA OTP verification simulation.
* **Authentication Required**: No
* **Implementation File**: `server/routes/api.js` (Line 20)
* **Request Body**:
  ```json
  {
    "username": "officer_pune",
    "password": "demo1234",
    "role": "Rural Development Officer",
    "otp": "123456"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "usr-1",
      "username": "officer_pune",
      "name": "Demo Officer (Rajesh Patil)",
      "role": "Rural Development Officer",
      "department": "Rural Development & Panchayat Raj",
      "district": "Pune"
    },
    "sessionExpiresInMinutes": 15
  }
  ```
* **Error Codes**:
  * `400 Bad Request`: Invalid OTP code (For demo, use `123456`).

---

### 1.2 POST `/api/auth/logout`
* **Description**: Terminate active officer session and record logout in audit log.
* **Authentication Required**: Yes (Session token)
* **Implementation File**: `server/routes/api.js` (Line 58)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

### 1.3 GET `/api/auth/me`
* **Description**: Retrieve active officer session telemetry and remaining session time.
* **Authentication Required**: No
* **Implementation File**: `server/routes/api.js` (Line 66)
* **Success Response (200 OK)**:
  ```json
  {
    "session": {
      "user": {
        "id": "usr-1",
        "name": "Demo Officer (Rajesh Patil)",
        "role": "Rural Development Officer"
      },
      "loginTime": "2026-08-30T10:15:00.000Z",
      "expiresInMinutes": 15
    },
    "authenticated": true
  }
  ```

---

## 2. Dashboard & System Monitoring APIs

### 2.1 GET `/api/dashboard`
* **Description**: Retrieve real-time KPI metrics, legacy connector status, and system health counters.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 76)
* **Success Response (200 OK)**:
  ```json
  {
    "kpis": {
      "filesReceivedToday": 8,
      "recordsImported": 124,
      "pendingApplications": 11,
      "processing": 7,
      "completed": 96,
      "rejected": 4,
      "invalidRecords": 3,
      "failedTransfers": 1
    },
    "legacyConnector": {
      "status": "ONLINE",
      "type": "SFTP / CSV File Connector",
      "lastTransfer": "10:18 AM",
      "lastFile": "GM_2026_000124.csv",
      "pendingFiles": 2
    },
    "systemHealth": {
      "sftpConnector": "ONLINE",
      "csvParser": "ONLINE",
      "validationEngine": "ONLINE",
      "batchProcessor": "ONLINE",
      "database": "ONLINE",
      "resultGenerator": "ONLINE",
      "govmeshConnector": "ONLINE",
      "systemUptime": "99.98%"
    }
  }
  ```

---

### 2.2 GET `/api/system-health`
* **Description**: Monitor internal component statuses and local SFTP directory configurations.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 446)
* **Success Response (200 OK)**:
  ```json
  {
    "sftpConnector": "ONLINE",
    "csvParser": "ONLINE",
    "validationEngine": "ONLINE",
    "batchProcessor": "ONLINE",
    "database": "ONLINE",
    "resultGenerator": "ONLINE",
    "govmeshConnector": "ONLINE",
    "lastSuccessfulImport": "10:18 AM",
    "lastSuccessfulExport": "10:20 AM",
    "systemUptime": "99.98%"
  }
  ```

---

## 3. File Ingestion & Management APIs

### 3.1 GET `/api/files`
* **Description**: List all CSV files received from GovMesh legacy adapter via SFTP.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 119)
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "FILE-000124",
      "fileName": "GM_2026_000124.csv",
      "applicationId": "GM-2026-000124",
      "recordsCount": 1,
      "fileSize": "142 B",
      "checksumAlg": "SHA-256",
      "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "integrityVerified": true,
      "status": "RECEIVED"
    }
  ]
  ```

---

### 3.2 GET `/api/files/:id`
* **Description**: Fetch detailed file metadata, manifest, and parsed CSV rows.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 124)
* **Success Response (200 OK)**:
  ```json
  {
    "file": {
      "id": "FILE-000124",
      "fileName": "GM_2026_000124.csv",
      "applicationId": "GM-2026-000124",
      "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "integrityVerified": true
    },
    "content": {
      "headers": ["application_id", "citizen_name", "address", "district", "verified"],
      "rows": [
        {
          "application_id": "GM-2026-000124",
          "citizen_name": "Demo Citizen",
          "address": "Gram Panchayat Ward No 4, Village Khed",
          "district": "Pune",
          "verified": "true"
        }
      ],
      "raw": "application_id,citizen_name,address,district,verified\nGM-2026-000124,Demo Citizen,\"Gram Panchayat Ward No 4, Village Khed\",Pune,true"
    }
  }
  ```
* **Error Codes**:
  * `404 Not Found`: File ID not found.

---

### 3.3 POST `/api/files/upload`
* **Description**: Simulate inbound file upload from GovMesh legacy adapter.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 156)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "file": {
      "id": "FILE-944504",
      "fileName": "GM_2026_814972.csv",
      "applicationId": "GM-2026-364256",
      "recordsCount": 1,
      "checksum": "af90b1d9b353554a71b596f6ed2d21f3a34c97029d2d9988af1985cdd22ea050",
      "status": "RECEIVED"
    }
  }
  ```

---

### 3.4 POST `/api/files/:id/validate`
* **Description**: Execute 9 schema and field validation checks against parsed CSV content.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 207)
* **Success Response (200 OK)**:
  ```json
  {
    "fileId": "FILE-000124",
    "fileName": "GM_2026_000124.csv",
    "validationResult": {
      "valid": true,
      "status": "VALID",
      "checks": [
        { "name": "Required Columns Present", "status": "PASSED", "message": "All 5 required columns present" },
        { "name": "Correct Column Order", "status": "PASSED", "message": "Column order matches canonical specification" },
        { "name": "Valid Application IDs", "status": "PASSED", "message": "All Application IDs formatted correctly" }
      ],
      "invalidCount": 0,
      "errors": []
    }
  }
  ```

---

### 3.5 POST `/api/files/:id/process`
* **Description**: Process validated file records into Rural Service Records database.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 244)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "batchSummary": {
      "fileId": "FILE-000124",
      "fileName": "GM_2026_000124.csv",
      "totalRecords": 1,
      "valid": 1,
      "invalid": 0,
      "processed": 1,
      "status": "COMPLETED"
    }
  }
  ```

---

### 3.6 POST `/api/files/:id/generate-result`
* **Description**: Generate outbound `_RESULT.csv` mapping execution results per record.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 280)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "outputFileName": "GM_2026_000124_RESULT.csv",
    "csvContent": "application_id,status,error_code,error_message\nGM-2026-000124,SUCCESS,,\n",
    "batchResults": [
      { "applicationId": "GM-2026-000124", "status": "SUCCESS" }
    ]
  }
  ```

---

### 3.7 POST `/api/files/:id/send-to-govmesh`
* **Description**: Deliver generated outbound result CSV back to GovMesh orchestrator.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 311)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Result CSV successfully delivered to GovMesh orchestrator via legacy outbound connector.",
    "timestamp": "2026-08-30T13:03:30.000Z"
  }
  ```

---

## 4. Exception Queue & Officer Review APIs

### 4.1 GET `/api/exceptions`
* **Description**: Retrieve exception items requiring officer review and correction.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 328)
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "EXP-001",
      "applicationId": "GM-2026-000125",
      "fileId": "FILE-000125",
      "errorType": "MISSING_DISTRICT",
      "description": "District field is empty in row 1",
      "citizenName": "Ramesh Patil",
      "address": "Plot 12 Gram Panchayat Road",
      "district": "",
      "priority": "Medium",
      "status": "Pending"
    }
  ]
  ```

---

### 4.2 POST `/api/exceptions/:id/correct`
* **Description**: Save officer field corrections (District/Address) while locking metadata.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 333)
* **Request Body**:
  ```json
  {
    "district": "Pune",
    "address": "Gram Panchayat Ward No 4, Village Khed"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Record correction saved successfully",
    "exception": {
      "id": "EXP-001",
      "applicationId": "GM-2026-000125",
      "district": "Pune",
      "status": "Corrected"
    }
  }
  ```

---

### 4.3 POST `/api/exceptions/:id/reprocess`
* **Description**: Revalidate corrected exception record and add it to Rural Service Records.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 361)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Record successfully revalidated and reprocessed into Rural Service Records.",
    "exception": {
      "id": "EXP-001",
      "status": "Resolved"
    }
  }
  ```

---

## 5. Records, Transfers & Audit APIs

### 5.1 GET `/api/records`
* **Description**: Fetch all processed Gram Panchayat citizen service records.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 436)
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "REC-001",
      "applicationId": "GM-2026-000124",
      "citizenRef": "CITIZEN-001",
      "citizenName": "Demo Citizen",
      "district": "Pune",
      "service": "Local Rural Record Update",
      "status": "Completed"
    }
  ]
  ```

---

### 5.2 GET `/api/transfers/failed`
* **Description**: Retrieve failed SFTP network transfers in retry queue.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 405)
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "TX-00042",
      "fileName": "GM_2026_000130.csv",
      "destination": "Legacy SFTP",
      "status": "FAILED",
      "reason": "Legacy SFTP service temporarily unavailable",
      "retryAttempts": 1,
      "maxRetries": 3
    }
  ]
  ```

---

### 5.3 POST `/api/transfers/:id/retry`
* **Description**: Trigger manual or automated transfer recovery attempt.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 410)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Retry attempt succeeded. File transferred to legacy SFTP.",
    "transfer": {
      "id": "TX-00042",
      "status": "SUCCESS",
      "retryAttempts": 2
    }
  }
  ```

---

### 5.4 GET `/api/audit`
* **Description**: Fetch immutable system transaction audit logs.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 441)
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "LOG-001",
      "timestamp": "2026-08-30T10:15:01.000Z",
      "event": "FILE_CREATED",
      "applicationId": "GM-2026-000124",
      "fileId": "FILE-000124",
      "officer": "SYSTEM",
      "result": "SUCCESS",
      "checksum": "e3b0c442..."
    }
  ]
  ```

---

## 6. Presenter Demo Controls APIs

### 6.1 POST `/api/demo/failure`
* **Description**: Inject failure scenarios (SFTP failure, corrupted file, invalid schema, duplicate file).
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 454)
* **Request Body**:
  ```json
  {
    "type": "simulateSftpFailure",
    "enabled": true
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "demoControls": {
      "simulateSftpFailure": true
    }
  }
  ```

---

### 6.2 POST `/api/demo/reset`
* **Description**: Reset demo environment state back to clean initial seed data.
* **Authentication Required**: Yes
* **Implementation File**: `server/routes/api.js` (Line 471)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Demo environment reset to initial clean state"
  }
  ```

---

## Production API Endpoint Summary Table

All 21 endpoints have been deployed to Vercel production and verified live:

| Method | Route | Full Production Vercel URL | Live Status |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/login` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/auth/login` | `✓` |
| `POST` | `/api/auth/logout` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/auth/logout` | `✓` |
| `GET` | `/api/auth/me` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/auth/me` | `✓` |
| `GET` | `/api/dashboard` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/dashboard` | `✓` |
| `GET` | `/api/files` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/files` | `✓` |
| `GET` | `/api/files/:id` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/files/FILE-000124` | `✓` |
| `POST` | `/api/files/upload` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/files/upload` | `✓` |
| `POST` | `/api/files/:id/validate` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/files/FILE-000124/validate` | `✓` |
| `POST` | `/api/files/:id/process` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/files/FILE-000124/process` | `✓` |
| `POST` | `/api/files/:id/generate-result` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/files/FILE-000124/generate-result` | `✓` |
| `POST` | `/api/files/:id/send-to-govmesh` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/files/FILE-000124/send-to-govmesh` | `✓` |
| `GET` | `/api/exceptions` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/exceptions` | `✓` |
| `POST` | `/api/exceptions/:id/correct` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/exceptions/EXP-001/correct` | `✓` |
| `POST` | `/api/exceptions/:id/reprocess` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/exceptions/EXP-001/reprocess` | `✓` |
| `GET` | `/api/transfers/failed` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/transfers/failed` | `✓` |
| `POST` | `/api/transfers/:id/retry` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/transfers/TX-00042/retry` | `✓` |
| `GET` | `/api/records` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/records` | `✓` |
| `GET` | `/api/audit` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/audit` | `✓` |
| `GET` | `/api/system-health` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/system-health` | `✓` |
| `POST` | `/api/demo/failure` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/demo/failure` | `✓` |
| `POST` | `/api/demo/reset` | `https://sih-26129-gov-mesh-rural-develpment.vercel.app/api/demo/reset` | `✓` |
