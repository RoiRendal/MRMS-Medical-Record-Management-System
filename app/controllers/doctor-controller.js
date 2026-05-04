const Doctor = require('../models/doctor');

async function createDoctor(req, res, next) {
  try {
    const { firstName, lastName, specialization, phone, email, availability } = req.body;

    if (!firstName || !lastName || !specialization || !phone || !email) {
      const err = new Error(
        'firstName, lastName, specialization, phone, and email are required'
      );
      err.status = 400;
      err.expose = true;
      throw err;
    }

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
