const express = require('express');

const {
  createDoctor,
  getAllDoctors,
  getDoctorById,
} = require('../controllers/doctor-controller');
const { requireStaffOrAdmin } = require('../middleware/requireAuth');

const router = express.Router();

router.post('/doctors', requireStaffOrAdmin, createDoctor);
router.get('/doctors', requireStaffOrAdmin, getAllDoctors);
router.get('/doctors/:doctorId', requireStaffOrAdmin, getDoctorById);

module.exports = router;
