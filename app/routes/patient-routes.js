const express = require('express');

const {
  createPatientProfile,
  getAllPatients,
  getPatientRecordsById,
} = require('../controllers/patient-controller');
const { requireStaffOrAdmin } = require('../middleware/requireAuth');

const router = express.Router();

router.post('/patients', requireStaffOrAdmin, createPatientProfile);
router.get('/patients', requireStaffOrAdmin, getAllPatients);
router.get('/patients/:patientId/records', requireStaffOrAdmin, getPatientRecordsById);

module.exports = router;
