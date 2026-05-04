const adapterClient = require('../clients/adapterClient');
const { requireFields, requireMongoObjectId } = require('../utils/validators');

async function createPatientProfile(req, res, next) {
  try {
    requireFields(req.body, ['name', 'birthdate', 'address', 'phone']);
    const { name, birthdate, address, phone } = req.body;

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
    requireMongoObjectId(patientId, 'patientId');

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
