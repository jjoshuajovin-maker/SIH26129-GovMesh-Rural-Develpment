import app from './server/app.js';
import { db } from './server/db.js';
import http from 'http';

const PORT = 5899;
let server;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request({
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  server = app.listen(PORT, async () => {
    console.log(`\n==================================================`);
    console.log(`RURAL BACKEND REAL-TIME INTEGRATION TEST SUITE`);
    console.log(`==================================================\n`);
    let passed = 0;
    let failed = 0;

    try {
      // Test 1: New Application Submission
      console.log('--- Test 1: POST /api/rural/address-update (Real Citizen Application) ---');
      const testTimestamp = Date.now();
      const testAppId = `GM-REAL-${testTimestamp}`;
      const testCitizenId = `CIT-REAL-${testTimestamp}`;
      const testCorrId = `CORR-REAL-${testTimestamp}`;

      const validPayload = {
        applicationId: testAppId,
        citizenId: testCitizenId,
        name: 'Ramesh Sundaram',
        address: {
          line1: 'Door No 58, Village Main Street',
          line2: 'Near Gram Panchayat Office',
          city: 'Kinathukadavu',
          district: 'Coimbatore',
          state: 'Tamil Nadu',
          pincode: '642109'
        }
      };

      const res1 = await request('POST', '/api/rural/address-update', validPayload, {
        'X-Correlation-ID': testCorrId
      });

      if (
        res1.statusCode === 202 &&
        res1.body.success === true &&
        res1.body.status === 'RECEIVED' &&
        res1.body.applicationId === testAppId &&
        res1.body.departmentApplicationId &&
        res1.headers['x-correlation-id'] === testCorrId
      ) {
        console.log('✓ Test 1 PASSED: Real application received and queued with status RECEIVED');
        passed++;
      } else {
        console.error('✗ Test 1 FAILED:', res1);
        failed++;
      }

      // Test 2: Idempotent Duplicate Submission
      console.log('\n--- Test 2: Idempotency (Duplicate Submission of Same applicationId) ---');
      const res2 = await request('POST', '/api/rural/address-update', validPayload, {
        'X-Correlation-ID': testCorrId
      });

      if (
        (res2.statusCode === 200 || res2.statusCode === 202) &&
        res2.body.success === true &&
        res2.body.applicationId === testAppId &&
        res2.body.message.includes('already received')
      ) {
        console.log('✓ Test 2 PASSED: Duplicate request returned existing record without duplication');
        passed++;
      } else {
        console.error('✗ Test 2 FAILED:', res2);
        failed++;
      }

      // Test 3: Invalid Request Rejection (Missing Required Fields)
      console.log('\n--- Test 3: Invalid Request Validation Failure ---');
      const invalidPayload = {
        applicationId: `GM-INVALID-${Date.now()}`,
        // citizenId missing!
        name: 'Invalid Citizen',
        address: { line1: 'No Street', district: 'Pune', state: 'Maharashtra' }
      };

      const res3 = await request('POST', '/api/rural/address-update', invalidPayload);
      if (
        res3.statusCode === 400 &&
        res3.body.success === false &&
        res3.body.status === 'REJECTED' &&
        res3.body.error?.code === 'INVALID_REQUEST'
      ) {
        console.log('✓ Test 3 PASSED: Missing field rejected with HTTP 400 Bad Request');
        passed++;
      } else {
        console.error('✗ Test 3 FAILED:', res3);
        failed++;
      }

      // Test 4: Application Status Lookup
      console.log('\n--- Test 4: GET /api/rural/application/:id (Status Lookup) ---');
      const res4 = await request('GET', `/api/rural/application/${testAppId}`);
      if (
        res4.statusCode === 200 &&
        res4.body.success === true &&
        res4.body.application?.applicationId === testAppId &&
        res4.body.application?.status === 'RECEIVED'
      ) {
        console.log('✓ Test 4 PASSED: Status lookup returned valid application object');
        passed++;
      } else {
        console.error('✗ Test 4 FAILED:', res4);
        failed++;
      }

      // Test 5: Manual Officer Review (RECEIVED -> UNDER_REVIEW)
      console.log('\n--- Test 5: POST /api/rural/application/:id/review (Officer Review) ---');
      const res5 = await request('POST', `/api/rural/application/${testAppId}/review`, { officerId: 'OFFICER-PUNE-01' });
      if (
        res5.statusCode === 200 &&
        res5.body.success === true &&
        res5.body.status === 'UNDER_REVIEW'
      ) {
        console.log('✓ Test 5 PASSED: Application status updated to UNDER_REVIEW');
        passed++;
      } else {
        console.error('✗ Test 5 FAILED:', res5);
        failed++;
      }

      // Test 6: Manual Officer Approval (UNDER_REVIEW -> APPROVED)
      console.log('\n--- Test 6: POST /api/rural/application/:id/approve (Officer Approval) ---');
      const res6 = await request('POST', `/api/rural/application/${testAppId}/approve`, { officerId: 'OFFICER-PUNE-01' });
      if (
        res6.statusCode === 200 &&
        res6.body.success === true &&
        res6.body.status === 'APPROVED'
      ) {
        console.log('✓ Test 6 PASSED: Application manually approved');
        passed++;
      } else {
        console.error('✗ Test 6 FAILED:', res6);
        failed++;
      }

      // Test 7: Manual Officer Rejection (UNDER_REVIEW -> REJECTED with Reason)
      console.log('\n--- Test 7: POST /api/rural/application/:id/reject (Officer Rejection) ---');
      const testRejAppId = `GM-REJ-${Date.now()}`;
      await request('POST', '/api/rural/address-update', {
        applicationId: testRejAppId,
        citizenId: `CIT-REJ-${Date.now()}`,
        name: 'Kavitha Nathan',
        address: { line1: '12 Temple St', district: 'Salem', state: 'Tamil Nadu' }
      });
      await request('POST', `/api/rural/application/${testRejAppId}/review`);

      const res7 = await request('POST', `/api/rural/application/${testRejAppId}/reject`, {
        officerId: 'OFFICER-SALEM-02',
        reason: 'Address details could not be verified by Gram Panchayat field staff'
      });

      if (
        res7.statusCode === 200 &&
        res7.body.success === true &&
        res7.body.status === 'REJECTED' &&
        res7.body.reason.includes('Gram Panchayat')
      ) {
        console.log('✓ Test 7 PASSED: Application rejected with mandatory reason recorded');
        passed++;
      } else {
        console.error('✗ Test 7 FAILED:', res7);
        failed++;
      }

      // Test 8: Data Persistence Verification
      console.log('\n--- Test 8: Disk Persistence Verification ---');
      const persistedRecord = await db.getRecordByAppIdOrDeptId(testAppId);
      if (persistedRecord && persistedRecord.status === 'APPROVED') {
        console.log('✓ Test 8 PASSED: Application state successfully persisted to storage');
        passed++;
      } else {
        console.error('✗ Test 8 FAILED:', persistedRecord);
        failed++;
      }

      console.log(`\n==================================================`);
      console.log(`TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
      console.log(`==================================================\n`);

    } catch (e) {
      console.error('Error during testing execution:', e);
    } finally {
      server.close(() => process.exit(failed > 0 ? 1 : 0));
    }
  });
}

runTests();
