import app from './server/app.js';
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  server = app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}...`);
    let passed = 0;
    let failed = 0;

    try {
      // Test 1: Health check
      console.log('\n--- Test 1: GET /health ---');
      const healthRes = await request('GET', '/health');
      if (healthRes.statusCode === 200 && healthRes.body.success === true && healthRes.body.status === 'UP') {
        console.log('✓ Health check PASSED:', healthRes.body);
        passed++;
      } else {
        console.error('✗ Health check FAILED:', healthRes);
        failed++;
      }

      // Test 2: New Valid Application Submission
      console.log('\n--- Test 2: POST /api/rural/address-update (New Valid Application) ---');
      const testAppId = `GM-TEST-${Date.now()}`;
      const testCorrId = `CORR-TEST-${Date.now()}`;
      const validPayload = {
        applicationId: testAppId,
        citizenId: 'CIT-TEST-999',
        name: 'Anita Sharma',
        address: {
          line1: 'House 42, Gram Panchayat Ward 3',
          line2: 'Near Water Tank',
          city: 'Shirur',
          district: 'Pune',
          state: 'Maharashtra',
          pincode: '412210'
        }
      };

      const newAppRes = await request('POST', '/api/rural/address-update', validPayload, {
        'X-Correlation-ID': testCorrId
      });

      if (
        newAppRes.statusCode === 202 &&
        newAppRes.body.success === true &&
        newAppRes.body.status === 'RECEIVED' &&
        newAppRes.body.applicationId === testAppId &&
        newAppRes.body.departmentApplicationId &&
        newAppRes.headers['x-correlation-id'] === testCorrId
      ) {
        console.log('✓ New Application Submission PASSED:', newAppRes.body);
        passed++;
      } else {
        console.error('✗ New Application Submission FAILED:', newAppRes);
        failed++;
      }

      // Test 3: Idempotency (Duplicate Submission)
      console.log('\n--- Test 3: Duplicate Submission (Same applicationId) ---');
      const dupAppRes = await request('POST', '/api/rural/address-update', validPayload, {
        'X-Correlation-ID': testCorrId
      });

      if (
        (dupAppRes.statusCode === 200 || dupAppRes.statusCode === 202) &&
        dupAppRes.body.success === true &&
        dupAppRes.body.applicationId === testAppId &&
        dupAppRes.body.message.includes('already received')
      ) {
        console.log('✓ Duplicate Submission PASSED:', dupAppRes.body);
        passed++;
      } else {
        console.error('✗ Duplicate Submission FAILED:', dupAppRes);
        failed++;
      }

      // Test 4: Invalid Request (Missing applicationId)
      console.log('\n--- Test 4: Invalid Request (Missing applicationId) ---');
      const invalidPayload = {
        citizenId: 'CIT-TEST-999',
        name: 'Anita Sharma',
        address: { line1: 'Ward 3', district: 'Pune', state: 'Maharashtra' }
      };

      const invalidRes = await request('POST', '/api/rural/address-update', invalidPayload);
      if (
        invalidRes.statusCode === 400 &&
        invalidRes.body.success === false &&
        invalidRes.body.status === 'REJECTED' &&
        invalidRes.body.error?.code === 'VALIDATION_ERROR'
      ) {
        console.log('✓ Invalid Request Handling PASSED:', invalidRes.body);
        passed++;
      } else {
        console.error('✗ Invalid Request Handling FAILED:', invalidRes);
        failed++;
      }

      // Test 5: Status API Lookup (Immediate status lookup)
      console.log('\n--- Test 5: GET /api/rural/application/:id (Lookup by GovMesh App ID) ---');
      const statusRes1 = await request('GET', `/api/rural/application/${testAppId}`);
      if (
        statusRes1.statusCode === 200 &&
        statusRes1.body.success === true &&
        statusRes1.body.application?.applicationId === testAppId
      ) {
        console.log('✓ Status Lookup PASSED:', statusRes1.body);
        passed++;
      } else {
        console.error('✗ Status Lookup FAILED:', statusRes1);
        failed++;
      }

      // Test 6: Verify Async Status Transition (RECEIVED -> PROCESSING -> COMPLETED)
      console.log('\n--- Test 6: Verify Status Lifecycle Transition ---');
      console.log('Waiting 2.5s for background status progression to COMPLETED...');
      await sleep(2500);
      const statusRes2 = await request('GET', `/api/rural/application/${testAppId}`);
      if (
        statusRes2.statusCode === 200 &&
        statusRes2.body.application?.status === 'COMPLETED'
      ) {
        console.log('✓ Lifecycle Progression to COMPLETED PASSED:', statusRes2.body);
        passed++;
      } else {
        console.error('✗ Lifecycle Progression FAILED:', statusRes2);
        failed++;
      }

      // Test 7: Unknown Application Lookup (404 Not Found)
      console.log('\n--- Test 7: GET /api/rural/application/:id (Unknown Application ID) ---');
      const unknownRes = await request('GET', '/api/rural/application/GM-NONEXISTENT-999');
      if (
        unknownRes.statusCode === 404 &&
        unknownRes.body.success === false &&
        unknownRes.body.error?.code === 'NOT_FOUND'
      ) {
        console.log('✓ Unknown Application Lookup PASSED:', unknownRes.body);
        passed++;
      } else {
        console.error('✗ Unknown Application Lookup FAILED:', unknownRes);
        failed++;
      }

      console.log(`\n==================================================`);
      console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
      console.log(`==================================================\n`);

    } catch (e) {
      console.error('Error during testing:', e);
    } finally {
      server.close(() => process.exit(failed > 0 ? 1 : 0));
    }
  });
}

runTests();
