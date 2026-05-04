const express = require('express');

const { login, logout, validateCurrentToken } = require('../controllers/auth-controller');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.post('/auth/login', login);
router.post('/auth/logout', requireAuth(), logout);
router.get('/auth/validate', requireAuth(), validateCurrentToken);

module.exports = router;
