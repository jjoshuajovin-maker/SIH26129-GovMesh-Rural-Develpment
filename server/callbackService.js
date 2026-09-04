/**
 * Dispatches bi-directional status callback to GovMesh Core orchestrator.
 */
export async function sendGovMeshStatusCallback({
  applicationId,
  correlationId,
  department = 'RURAL_DEVELOPMENT',
  status,
  acknowledgementId,
  timestamp = new Date().toISOString(),
  remarks = '',
  reviewedBy = 'Rajesh Patil (Rural Development Officer)'
}) {
  const govmeshUrl = process.env.GOVMESH_CORE_URL || process.env.GOVMESH_URL || 'https://govmesh-core.vercel.app';
  const callbackEndpoint = `${govmeshUrl.replace(/\/$/, '')}/api/govmesh/callbacks/department-status`;
  const apiKey = process.env.GOVMESH_API_KEY || 'govmesh-live-secure-key-2026';

  const payload = {
    applicationId,
    correlationId,
    department,
    status,
    acknowledgementId: acknowledgementId || `ACK-RURAL-${applicationId}`,
    timestamp,
    remarks,
    reviewedBy
  };

  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), 4000) : null;

    const fetchFn = typeof fetch !== 'undefined' ? fetch : globalThis.fetch;
    if (!fetchFn) {
      console.warn('[Rural Callback] Fetch API not available in runtime.');
      return { success: false, error: 'Fetch not available' };
    }

    const response = await fetchFn(callbackEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GovMesh-API-Key': apiKey,
        'User-Agent': 'GovMesh-Rural-Development-Connector/1.0'
      },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    });
    if (timeout) clearTimeout(timeout);

    if (response.ok) {
      console.log(`[Rural Callback] Dispatched ${status} for ${applicationId} to GovMesh Core: HTTP ${response.status}`);
      return { success: true, status: response.status };
    } else {
      console.warn(`[Rural Callback] GovMesh Core returned status ${response.status} for ${applicationId}`);
      return { success: false, status: response.status };
    }
  } catch (err) {
    console.warn(`[Rural Callback] Could not reach GovMesh Core at ${callbackEndpoint} (${err.message}) - state recorded locally.`);
    return { success: false, error: err.message };
  }
}
