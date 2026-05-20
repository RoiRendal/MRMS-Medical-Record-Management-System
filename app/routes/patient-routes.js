const express = require('express');

const {
  createPatientProfile,
  getAllPatients,
  getPatientRecordsById,
} = require('../controllers/patient-controller');
const { requireStaffOrAdmin } = require('../middleware/requireAuth');

const router = express.Router();

router.route('/patients')
  .post(requireStaffOrAdmin, createPatientProfile)
  .get(requireStaffOrAdmin, getAllPatients);

router.get('/patients/:patientId/records', requireStaffOrAdmin, getPatientRecordsById);

module.exports = router;
