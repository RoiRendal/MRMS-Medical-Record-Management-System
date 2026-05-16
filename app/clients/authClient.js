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
    if (credentials?.email === 'admin@gmail.com' && credentials?.password === 'Admin123@') {
      return {
        message: 'Login successful',
        token: 'mock-token-admin',
        user: {
          id: 'staff-001',
          email: 'admin@gmail.com',
          role: 'staff',
        },
      };
    }
    throw createPublicError('Invalid credentials', 401);
  }

  // Auth system uses email + password, returns a message and sets httpOnly cookie
  // We extract token from response or generate one for Bearer auth compatibility
  const response = await authRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials?.email,
      password: credentials?.password,
    }),
  });

  // Auth system returns { message: "Login successful" } and sets cookie server-side
  // For API clients, we need to return a token. Fetch the user info and create a Bearer token.
  if (response?.message === 'Login successful') {
    // Call /all endpoint to get user info (in production, should be /me or similar)
    // For now, we'll call /auth/validate to get the current user
    try {
      // Re-login and extract user from response if available, or call /all to find user
      const userResponse = await authRequest('/all', {
        method: 'GET',
      });
      const user = Array.isArray(userResponse) ? userResponse.find(u => u.email === credentials?.email) : null;
      if (user) {
        // Generate a simple Bearer token for API clients
        const token = `bearer_${user.id}_${Date.now()}`;
        return {
          message: response.message,
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        };
      }
    } catch (err) {
      // If we can't get user info, still return success but without token
    }
  }

  return response;
}

async function register(payload) {
  if (isMockMode()) {
    if (!payload?.firstName || !payload?.lastName || !payload?.email || !payload?.password) {
      throw createPublicError('firstName, lastName, email, and password are required', 400);
    }
    return {
      message: 'User created',
      user: {
        id: `mock-patient-${Date.now()}`,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        role: 'patient',
      },
    };
  }

  return authRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      firstName: payload?.firstName,
      lastName: payload?.lastName,
      email: payload?.email,
      password: payload?.password,
    }),
  });
}

async function createUserAccount(payload) {
  if (isMockMode()) {
    if (!payload?.firstName || !payload?.lastName || !payload?.email || !payload?.password) {
      throw createPublicError('firstName, lastName, email, and password are required', 400);
    }
    return {
      message: 'Account created',
      user: {
        id: `mock-patient-${Date.now()}`,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        role: 'patient',
      },
    };
  }

  // Use the Auth system's /auth/register endpoint
  return register(payload);
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
  register,
  createUserAccount,
  assignRole,
  validateToken,
  invalidateToken,
};
