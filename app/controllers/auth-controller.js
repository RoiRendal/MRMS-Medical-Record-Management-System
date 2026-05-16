const authClient = require('../clients/authClient');
const { requireFields } = require('../utils/validators');

async function register(req, res, next) {
  try {
    requireFields(req.body, ['firstName', 'lastName', 'email', 'password']);
    const { firstName, lastName, email, password } = req.body;

    const data = await authClient.register({
      firstName,
      lastName,
      email,
      password,
    });
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    requireFields(req.body, ['email', 'password']);
    const { email, password } = req.body;

    const data = await authClient.login({ email, password });
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
  register,
  login,
  logout,
  validateCurrentToken,
};
