const express = require('express');

const {
  createDoctorAccount,
  createPatientAccount,
} = require('../controllers/account-controller');
const { requireStaffOrAdmin } = require('../middleware/requireAuth');

const router = express.Router();

router.post('/accounts/doctor', requireStaffOrAdmin, createDoctorAccount);
router.post('/accounts/patient', requireStaffOrAdmin, createPatientAccount);

module.exports = router;
