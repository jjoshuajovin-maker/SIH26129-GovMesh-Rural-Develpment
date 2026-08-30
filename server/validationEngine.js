import { db } from './db.js';

const MAHARASHTRA_DISTRICTS = [
  'Pune', 'Nashik', 'Nagpur', 'Chhatrapati Sambhajinagar', 'Aurangabad',
  'Kolhapur', 'Satara', 'Solapur', 'Ahmednagar', 'Ahilyanagar',
  'Nanded', 'Amravati', 'Ratnagiri', 'Sangli', 'Jalgaon',
  'Sindhudurg', 'Latur', 'Osmanabad', 'Dharashiv', 'Parbhani',
  'Beed', 'Nandurbar', 'Buldhana', 'Washim', 'Jalna',
  'Hingoli', 'Gadchiroli', 'Raigad', 'Akola', 'Yavatmal',
  'Wardha', 'Chandrapur', 'Gondia', 'Bhandara', 'Palghar', 'Thane'
];

const REQUIRED_HEADERS = ['application_id', 'citizen_name', 'address', 'district', 'verified'];

export const validationEngine = {
  validateFileSchema(parsedCsv, fileChecksum, existingFiles = []) {
    const checks = [];

    // Check Demo Controls for failure injection
    const demoControls = db.get('demoControls');

    if (demoControls?.simulateCorruptedFile) {
      return {
        valid: false,
        status: 'CORRUPTED',
        checks: [{ name: 'Checksum Verification', status: 'FAILED', message: 'File checksum mismatch. File is corrupted during transfer.' }]
      };
    }

    if (demoControls?.simulateDuplicateFile) {
      return {
        valid: false,
        status: 'DUPLICATE_FILE',
        checks: [{ name: 'Duplicate File Detection', status: 'FAILED', message: 'This file checksum already exists in system archives. Rejecting duplicate ingestion.' }]
      };
    }

    // 1. Required columns present
    const missingHeaders = REQUIRED_HEADERS.filter(h => !parsedCsv.headers.includes(h));
    checks.push({
      name: 'Required Columns Present',
      status: missingHeaders.length === 0 ? 'PASSED' : 'FAILED',
      message: missingHeaders.length === 0 ? 'All 5 required columns present' : `Missing columns: ${missingHeaders.join(', ')}`
    });

    // 2. Correct column order
    let orderMatch = true;
    if (parsedCsv.headers.length >= REQUIRED_HEADERS.length) {
      for (let i = 0; i < REQUIRED_HEADERS.length; i++) {
        if (parsedCsv.headers[i] !== REQUIRED_HEADERS[i]) {
          orderMatch = false;
          break;
        }
      }
    } else {
      orderMatch = false;
    }
    checks.push({
      name: 'Correct Column Order',
      status: orderMatch ? 'PASSED' : 'FAILED',
      message: orderMatch ? 'Column order matches canonical specification' : 'Column order does not match standard schema'
    });

    // 3. Valid Data Types & Mandatory values
    let invalidRecordsCount = 0;
    const recordErrors = [];
    const seenAppIds = new Set();

    parsedCsv.rows.forEach((row, idx) => {
      const appId = row.application_id;

      // Check app ID format
      if (!appId || !appId.startsWith('GM-')) {
        invalidRecordsCount++;
        recordErrors.push({ row: idx + 2, appId, error: 'INVALID_APPLICATION_ID', message: 'Invalid Application ID format' });
      } else if (seenAppIds.has(appId)) {
        invalidRecordsCount++;
        recordErrors.push({ row: idx + 2, appId, error: 'DUPLICATE_RECORD', message: 'Duplicate Application ID in same file' });
      } else {
        seenAppIds.add(appId);
      }

      // Check district
      if (!row.district || row.district.trim() === '') {
        invalidRecordsCount++;
        recordErrors.push({ row: idx + 2, appId, error: 'MISSING_DISTRICT', message: 'District field is empty' });
      }

      // Check address
      if (!row.address || row.address.trim() === '') {
        invalidRecordsCount++;
        recordErrors.push({ row: idx + 2, appId, error: 'MISSING_ADDRESS', message: 'Address field is empty' });
      }
    });

    checks.push({
      name: 'Valid Application IDs',
      status: recordErrors.filter(e => e.error === 'INVALID_APPLICATION_ID').length === 0 ? 'PASSED' : 'FAILED',
      message: recordErrors.filter(e => e.error === 'INVALID_APPLICATION_ID').length === 0 ? 'All Application IDs formatted correctly' : 'Contains invalid application ID format'
    });

    checks.push({
      name: 'Mandatory District & Address Fields',
      status: recordErrors.filter(e => e.error.includes('MISSING')).length === 0 ? 'PASSED' : 'FAILED',
      message: recordErrors.filter(e => e.error.includes('MISSING')).length === 0 ? 'No empty mandatory values found' : `Contains ${recordErrors.filter(e => e.error.includes('MISSING')).length} empty mandatory field errors`
    });

    checks.push({
      name: 'Duplicate Record Detection',
      status: recordErrors.filter(e => e.error === 'DUPLICATE_RECORD').length === 0 ? 'PASSED' : 'FAILED',
      message: recordErrors.filter(e => e.error === 'DUPLICATE_RECORD').length === 0 ? 'No duplicate records found' : 'Duplicate records detected in file'
    });

    const isAllValid = checks.every(c => c.status === 'PASSED') && invalidRecordsCount === 0;

    return {
      valid: isAllValid,
      status: isAllValid ? 'VALID' : 'INVALID',
      checks,
      invalidCount: invalidRecordsCount,
      errors: recordErrors
    };
  }
};
