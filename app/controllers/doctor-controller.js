const Doctor = require('../models/doctor');
const {
  requireFields,
  requireMongoObjectId,
  validateAvailability,
} = require('../utils/validators');

async function createDoctor(req, res, next) {
  try {
    const { firstName, lastName, specialization, phone, email, availability } = req.body;
    requireFields(req.body, ['firstName', 'lastName', 'specialization', 'phone', 'email']);
    validateAvailability(availability);

    const doctor = await Doctor.create({
      firstName,
      lastName,
      specialization,
      phone,
      email,
      availability: Array.isArray(availability) ? availability : [],
    });

    res.status(201).json(doctor);
  } catch (error) {
    next(error);
  }
}

async function getAllDoctors(req, res, next) {
  try {
    const doctors = await Doctor.find({}).sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (error) {
    next(error);
  }
}

async function getDoctorById(req, res, next) {
  try {
    const { doctorId } = req.params;
    requireMongoObjectId(doctorId, 'doctorId');
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      const err = new Error('Doctor not found');
      err.status = 404;
      err.expose = true;
      throw err;
    }

    res.status(200).json(doctor);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
};
