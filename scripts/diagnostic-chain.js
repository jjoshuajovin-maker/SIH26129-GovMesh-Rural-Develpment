import app from '../server/app.js';
import { db } from '../server/db.js';
import http from 'http';

const PORT = 5901;
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

async function runDiagnosticChain() {
  server = app.listen(PORT, async () => {
    console.log(`\n==================================================`);
    console.log(`RURAL BACKEND DIAGNOSTIC TRACE CHAIN`);
    console.log(`==================================================\n`);

    const timestamp = Date.now();
    const traceAppId = `RURAL-TRACE-${timestamp}`;
    const traceCitizenId = `CIT-TRACE-${timestamp}`;
    const traceCorrId = `CORR-TRACE-${timestamp}`;

    const tracePayload = {
      applicationId: traceAppId,
      citizenId: traceCitizenId,
      name: 'Diagnostic Test Citizen',
      address: {
        line1: '100 Diagnostic Plaza',
        district: 'Pune',
        state: 'Maharashtra'
      }
    };

    console.log(`Targeting application: ${traceAppId}`);

    // Step 1: HTTP POST submission & HTTP response check
    console.log('\n--- Diagnostic Step 1: HTTP POST /api/rural/address-update ---');
    const httpRes = await request('POST', '/api/rural/address-update', tracePayload, {
      'X-Correlation-ID': traceCorrId,
      'X-GovMesh-App-ID': traceAppId
    });

    const step1Pass = (httpRes.statusCode === 202 && httpRes.body.success === true && httpRes.body.status === 'RECEIVED');
    console.log(step1Pass ? `✓ Step 1 PASSED: HTTP 202 RECEIVED response received` : `✗ Step 1 FAILED (Routing/Ingress issue):`, httpRes);

    // Step 2: Database record existence check
    console.log('\n--- Diagnostic Step 2: Database Record Persistence ---');
    const dbRecord = await db.getRecordByAppIdOrDeptId(traceAppId);
    const step2Pass = (dbRecord && dbRecord.applicationId === traceAppId && dbRecord.status === 'RECEIVED');
    console.log(step2Pass ? `✓ Step 2 PASSED: Application persisted in database` : `✗ Step 2 FAILED (Persistence issue)`);

    // Step 3: GET Application status API lookup check
    console.log('\n--- Diagnostic Step 3: GET /api/rural/application/:id ---');
    const getRes = await request('GET', `/api/rural/application/${traceAppId}`);
    const step3Pass = (getRes.statusCode === 200 && getRes.body.success === true && getRes.body.application?.applicationId === traceAppId);
    console.log(step3Pass ? `✓ Step 3 PASSED: GET API returned persisted application` : `✗ Step 3 FAILED (API lookup issue)`);

    // Step 4: GET Applications list (Dashboard fetch) check
    console.log('\n--- Diagnostic Step 4: GET /api/rural/applications (Dashboard List) ---');
    const listRes = await request('GET', '/api/rural/applications');
    const inList = Array.isArray(listRes.body?.applications) && listRes.body.applications.some(a => a.applicationId === traceAppId);
    console.log(inList ? `✓ Step 4 PASSED: Application visible in applications list for Dashboard` : `✗ Step 4 FAILED (Dashboard fetch issue)`);

    // Step 5: Health Check Diagnostic
    console.log('\n--- Diagnostic Step 5: Health Endpoint Inspection ---');
    const healthRes = await request('GET', '/health');
    const step5Pass = (healthRes.statusCode === 200 && healthRes.body.status === 'UP' && healthRes.body.service === 'RURAL_DEVELOPMENT');
    console.log(step5Pass ? `✓ Step 5 PASSED: Health endpoint active: ${JSON.stringify(healthRes.body)}` : `✗ Step 5 FAILED:`, healthRes);

    console.log(`\n==================================================`);
    console.log(`DIAGNOSTIC CHAIN SUMMARY:`);
    console.log(`1. Ingress Response:     ${step1Pass ? 'PASS' : 'FAIL'}`);
    console.log(`2. Persistence:          ${step2Pass ? 'PASS' : 'FAIL'}`);
    console.log(`3. Status API Lookup:    ${step3Pass ? 'PASS' : 'FAIL'}`);
    console.log(`4. Dashboard Visibility: ${inList ? 'PASS' : 'FAIL'}`);
    console.log(`5. Health Endpoint:      ${step5Pass ? 'PASS' : 'FAIL'}`);
    console.log(`==================================================\n`);

    server.close(() => process.exit(step1Pass && step2Pass && step3Pass && inList && step5Pass ? 0 : 1));
  });
}

runDiagnosticChain();
