const authClient = require('../clients/authClient');

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      const err = new Error('username and password are required');
      err.status = 400;
      err.expose = true;
      throw err;
    }

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
