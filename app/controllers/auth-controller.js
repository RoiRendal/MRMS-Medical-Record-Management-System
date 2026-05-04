const authClient = require('../clients/authClient');
const { requireFields } = require('../utils/validators');

async function login(req, res, next) {
  try {
    requireFields(req.body, ['username', 'password']);
    const { username, password } = req.body;

    const data = await authClient.login({ username, password });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const data = await authClient.invalidateToken(req.token);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function validateCurrentToken(req, res, next) {
  try {
    const data = await authClient.validateToken(req.token);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  logout,
  validateCurrentToken,
};
