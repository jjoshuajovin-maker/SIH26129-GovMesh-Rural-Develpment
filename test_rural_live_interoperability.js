import http from 'http';
import crypto from 'crypto';
import app from './server/app.js';
import { sftpSimulator } from './server/sftpSimulator.js';

let server;
const PORT = 5055;

async function startServer() {
  return new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`[Test Server] Rural Development test server listening on http://localhost:${PORT}`);
      resolve();
    });
  });
}

async function stopServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(`http://localhost:${PORT}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...headers
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('GOVMESH SIH 2026 — RURAL DEVELOPMENT LIVE INTEROP TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      if (details) console.log(`       ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (details) console.error(`       ${details}`);
    }
  }

  await startServer();

  try {
    // Test 1: Health endpoint
    const healthRes = await makeRequest('/api/health');
    assert(healthRes.status === 200 && healthRes.body.status === 'ok', '1. System Health API check', `Status: ${healthRes.body.status}`);

    // Test 2: Ingress with authoritative timestamps and SHA-256 hashes
    const testAppId = `GM-2026-TEST-${Date.now()}`;
    const testCorrId = `CORR-26-${Date.now()}`;
    const createdAt = new Date(Date.now() - 6000).toISOString();
    const sentAt = new Date(Date.now() - 3000).toISOString();

    const canonicalString = `${testAppId}|${testCorrId}|ADDRESS_CHANGE|GM-CIT-9901|Amit Shinde|Ward 3, Village Baramati|Pune`;
    const canonicalHash = `sha256:${crypto.createHash('sha256').update(canonicalString).digest('hex')}`;
    const docHash = `sha256:${crypto.createHash('sha256').update('MOCK_PDF_BINARY_EVIDENCE').digest('hex')}`;

    const ingressPayload = {
      applicationId: testAppId,
      correlationId: testCorrId,
      requestVersion: 1,
      requestType: 'ADDRESS_CHANGE',
      serviceCode: 'ADDRESS_CHANGE',
      sourceDepartment: 'GovMesh Core Interoperability Orchestrator',
      citizen: {
        citizenRef: 'GM-CIT-9901',
        name: 'Amit Shinde',
        address: {
          line1: 'Ward 3, Village Baramati',
          currentAddress: 'Old Gram Quarters, Baramati',
          district: 'Pune',
          taluka: 'Baramati',
          state: 'Maharashtra',
          pincode: '413102'
        }
      },
      consentId: 'CONSENT-9901',
      canonicalRequestHash: canonicalHash,
      documentHash: docHash,
      document: {
        documentId: 'DOC-9901',
        documentName: 'address_proof.pdf',
        documentType: 'application/pdf',
        documentSize: '185 KB'
      },
      createdAt,
      sentAt
    };

    const ingressRes = await makeRequest('/api/rural/address-update', 'POST', ingressPayload, {
      'X-GovMesh-API-Key': 'govmesh-live-secure-key-2026'
    });

    assert(ingressRes.status === 200 && ingressRes.body.success === true, '2. Ingress POST /api/rural/address-update', `ACK: ${ingressRes.body.acknowledgementId}`);

    const receivedAt = ingressRes.body.receivedAt;
    const timeOrderValid = (new Date(createdAt) <= new Date(sentAt)) && (new Date(sentAt) <= new Date(receivedAt));
    assert(timeOrderValid && (receivedAt !== sentAt), '3. Authoritative Timestamp Monotonicity (createdAt <= sentAt <= Rural.receivedAt)', `createdAt=${createdAt} sentAt=${sentAt} receivedAt=${receivedAt}`);

    assert(ingressRes.body.hashStatus === 'VERIFIED', '4. Cryptographic SHA-256 Hash Verification', `Status: ${ingressRes.body.hashStatus}, canonical=${ingressRes.body.canonicalRequestHash.substring(0, 20)}...`);

    assert(ingressRes.body.evidenceDisclaimer && ingressRes.body.evidenceDisclaimer.includes('Document binary retained in GovMesh Evidence Store'), '5. Honest Evidence Retention Disclaimer Preserved', ingressRes.body.evidenceDisclaimer);

    // Test 6: Idempotent Deduplication
    const dupRes = await makeRequest('/api/rural/address-update', 'POST', ingressPayload);
    assert(dupRes.status === 200 && dupRes.body.applicationId === testAppId, '6. Idempotent Deduplication on Duplicate Packet', `Returned existing application ${dupRes.body.applicationId}`);

    // Test 7: Officer Review & Full Lifecycle Progression
    const validateRes = await makeRequest(`/api/rural/govmesh-requests/${testAppId}/validate`, 'POST', {
      remarks: 'Validated by Pune RDO',
      reviewedBy: 'Rajesh Patil (Pune RDO)'
    });
    assert(validateRes.status === 200 && validateRes.body.status === 'VALIDATING' && validateRes.body.validatedAt, '7. Officer Action: VALIDATE -> VALIDATING', `ValidatedAt: ${validateRes.body.validatedAt}`);

    const acceptRes = await makeRequest(`/api/rural/govmesh-requests/${testAppId}/accept`, 'POST', {
      remarks: 'Accepted into Gram Panchayat record queue'
    });
    assert(acceptRes.status === 200 && acceptRes.body.status === 'ACCEPTED' && acceptRes.body.acceptedAt, '8. Officer Action: ACCEPT -> ACCEPTED', `AcceptedAt: ${acceptRes.body.acceptedAt}`);

    const procRes = await makeRequest(`/api/rural/govmesh-requests/${testAppId}/start-processing`, 'POST', {
      remarks: 'Gram Panchayat registry ledger updated'
    });
    assert(procRes.status === 200 && procRes.body.status === 'PROCESSING' && procRes.body.processingStartedAt, '9. Officer Action: START PROCESSING -> PROCESSING', `ProcessingStartedAt: ${procRes.body.processingStartedAt}`);

    const compRes = await makeRequest(`/api/rural/govmesh-requests/${testAppId}/complete`, 'POST', {
      remarks: 'Rural Development address records fully synchronized with GovMesh.'
    });
    assert(compRes.status === 200 && compRes.body.status === 'COMPLETED' && compRes.body.completedAt, '10. Officer Action: COMPLETE -> COMPLETED', `CompletedAt: ${compRes.body.completedAt}`);

    // Test 11: Security & Path Traversal Rejection
    let pathTraversalBlocked = false;
    try {
      sftpSimulator.getSafeSftpPath('mock_sftp/incoming', '../../etc/passwd');
    } catch (e) {
      pathTraversalBlocked = true;
    }
    assert(pathTraversalBlocked, '11. SFTP Path Traversal Rejection (../../etc/passwd blocked)', 'Path traversal successfully blocked with error');

    console.log('\n================================================================');
    console.log(`TEST SUMMARY: ${passed}/${total} PASSED`);
    console.log('================================================================');

    if (passed !== total) {
      process.exit(1);
    }
  } finally {
    await stopServer();
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
