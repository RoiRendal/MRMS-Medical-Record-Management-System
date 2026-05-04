const adapterClient = require('../clients/adapterClient');

async function createPatientProfile(req, res, next) {
  try {
    const { name, birthdate, address, phone } = req.body;
    if (!name || !birthdate || !address || !phone) {
      const err = new Error('name, birthdate, address, and phone are required');
      err.status = 400;
      err.expose = true;
      throw err;
    }

    const patient = await adapterClient.createPatientProfile(
      { name, birthdate, address, phone },
      req.token
    );
    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
}

async function getAllPatients(req, res, next) {
  try {
    const patients = await adapterClient.getPatientProfiles(req.token);
    res.status(200).json(patients);
  } catch (error) {
    next(error);
  }
}

async function getPatientRecordsById(req, res, next) {
  try {
    const { patientId } = req.params;
    if (!patientId) {
      const err = new Error('patientId is required');
      err.status = 400;
      err.expose = true;
      throw err;
    }

    const records = await adapterClient.getPatientRecords(patientId, req.token);
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPatientProfile,
  getAllPatients,
  getPatientRecordsById,
};
