const authClient = require('../clients/authClient');

const ALLOWED_ACCOUNT_ROLES = new Set(['staff', 'admin']);

function extractToken(req) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
    return null;
  }
  return token;
}

function requireAuth(allowedRoles = []) {
  return async function requireAuthMiddleware(req, res, next) {
    try {
      const token = extractToken(req);
      if (!token) {
        const err = new Error('Authorization header with bearer token is required');
        err.status = 401;
        err.expose = true;
        throw err;
      }

      const result = await authClient.validateToken(token);
      const user = result?.user;
      if (!result?.valid || !user?.id || !user?.role) {
        const err = new Error('Token validation failed');
        err.status = 401;
        err.expose = true;
        throw err;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        const err = new Error('Forbidden: insufficient role permissions');
        err.status = 403;
        err.expose = true;
        throw err;
      }

      req.user = {
        id: user.id,
        role: user.role,
        username: user.username || null,
      };
      req.token = token;
      next();
    } catch (error) {
      next(error);
    }
  };
}

function requireStaffOrAdmin(req, res, next) {
  return requireAuth(Array.from(ALLOWED_ACCOUNT_ROLES))(req, res, next);
}

module.exports = {
  extractToken,
  requireAuth,
  requireStaffOrAdmin,
};
