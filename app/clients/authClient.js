/**
 * HTTP client for the Authentication & Authorization service.
 * Works in live mode or mock mode (default until Auth service is available).
 */

function getBaseUrl() {
  const url = (process.env.AUTH_BASE_URL || '').trim();
  return url.replace(/\/$/, '');
}

function isMockMode() {
  if (process.env.AUTH_USE_MOCK === 'true') return true;
  return getBaseUrl() === '';
}

function createPublicError(message, status) {
  const err = new Error(message);
  err.status = status;
  err.expose = true;
  return err;
}

async function authRequest(path, options = {}) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw createPublicError('Auth service base URL is not configured', 503);
  }

  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
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
    const message = data?.error || data?.message || `Auth request failed (${res.status})`;
    throw createPublicError(message, res.status >= 500 ? 502 : res.status);
  }

  return data;
}

async function login(credentials) {
  if (isMockMode()) {
    if (credentials?.username === 'admin' && credentials?.password === 'admin123') {
      return {
        token: 'mock-token-admin',
        user: {
          id: 'staff-001',
          role: 'staff',
          username: 'admin',
        },
      };
    }
    throw createPublicError('Invalid credentials', 401);
  }

  return authRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials || {}),
  });
}

async function createUserAccount(payload) {
  if (isMockMode()) {
    if (!payload?.username || !payload?.password || !payload?.role) {
      throw createPublicError('username, password, and role are required', 400);
    }
    return {
      message: 'Account created',
      user: {
        id: `mock-${payload.role}-${Date.now()}`,
        username: payload.username,
        role: payload.role,
      },
    };
  }

  return authRequest('/accounts', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

async function assignRole(payload) {
  if (isMockMode()) {
    if (!payload?.userId || !payload?.role) {
      throw createPublicError('userId and role are required', 400);
    }
    return {
      message: 'Role assigned',
      userId: payload.userId,
      role: payload.role,
    };
  }

  return authRequest('/roles/assign', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

async function validateToken(token) {
  if (!token) {
    throw createPublicError('Authentication token is required', 401);
  }

  if (isMockMode()) {
    if (token === 'mock-token-admin') {
      return {
        valid: true,
        user: {
          id: 'staff-001',
          role: 'staff',
          username: 'admin',
        },
      };
    }
    throw createPublicError('Invalid or expired token', 401);
  }

  return authRequest('/auth/validate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function invalidateToken(token) {
  if (!token) {
    throw createPublicError('Authentication token is required', 400);
  }

  if (isMockMode()) {
    return { message: 'Token invalidated' };
  }

  return authRequest('/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

module.exports = {
  getBaseUrl,
  isMockMode,
  login,
  createUserAccount,
  assignRole,
  validateToken,
  invalidateToken,
};
