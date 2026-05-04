/**
 * HTTP client for the Authentication & Authorization service.
 * Phase 1: configuration only; verify token / provision accounts added with auth slice.
 */

function getBaseUrl() {
  const url = (process.env.AUTH_BASE_URL || '').trim();
  return url.replace(/\/$/, '');
}

function isMockMode() {
  if (process.env.AUTH_USE_MOCK === 'true') return true;
  return getBaseUrl() === '';
}

module.exports = {
  getBaseUrl,
  isMockMode,
};
