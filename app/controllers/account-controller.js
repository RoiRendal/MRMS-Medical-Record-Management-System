const authClient = require('../clients/authClient');
const { requireFields } = require('../utils/validators');

function buildCreateAccountPayload(body, role, createdByUserId) {
  return {
    username: body.username,
    password: body.password,
    role,
    profileId: body.profileId || null,
    createdBy: createdByUserId,
  };
}

async function createDoctorAccount(req, res, next) {
  try {
    requireFields(req.body, ['username', 'password']);

    const account = await authClient.createUserAccount(
      buildCreateAccountPayload(req.body, 'doctor', req.user.id)
    );

    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
}

async function createPatientAccount(req, res, next) {
  try {
    requireFields(req.body, ['username', 'password']);

    const account = await authClient.createUserAccount(
      buildCreateAccountPayload(req.body, 'patient', req.user.id)
    );

    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDoctorAccount,
  createPatientAccount,
};
