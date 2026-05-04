/**
 * HTTP client for the Adapter Layer (only path to legacy HAS data).
 * Phase 1: exposes configuration and a no-network health check; CRUD methods added with patient/doctor slices.
 */

function getBaseUrl() {
  const url = (process.env.ADAPTER_BASE_URL || '').trim();
  return url.replace(/\/$/, '');
}

function isMockMode() {
  if (process.env.ADAPTER_USE_MOCK === 'true') return true;
  return getBaseUrl() === '';
}

function assertConfiguredForLive() {
  if (isMockMode()) {
    const err = new Error('Adapter is in mock mode or ADAPTER_BASE_URL is not set');
    err.status = 503;
    err.expose = true;
    throw err;
  }
}

async function adapterRequest(path, options = {}) {
  assertConfiguredForLive();
  const url = `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `Adapter request failed (${res.status})`);
    err.status = res.status >= 500 ? 502 : res.status;
    err.expose = true;
    throw err;
  }
  return data;
}

module.exports = {
  getBaseUrl,
  isMockMode,
  adapterRequest,
};
