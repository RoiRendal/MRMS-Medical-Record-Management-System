const authClient = require('../clients/authClient');
const { requireFields } = require('../utils/validators');

/**
 * Create a doctor account via the Auth system.
 * Auth system will create the user with 'doctor' role, or admin will need to assign role afterward.
 * For now, new users default to 'patient' role in Auth system; doctors get promoted via role assignment.
 */
async function createDoctorAccount(req, res, next) {
  try {
    requireFields(req.body, ['firstName', 'lastName', 'email', 'password']);
    const { firstName, lastName, email, password } = req.body;

    // Register user via Auth system (will get 'patient' role by default)
    const account = await authClient.register({
      firstName,
      lastName,
      email,
      password,
    });

    // TODO: Once doctor is created in MRMS DB, call assignRole() to promote user to 'doctor' role
    // This requires admin auth from MRMS, or wait for Group 2 Adapter spec for proper role flow

    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a patient account via the Auth system.
 * Patients are the default role in the Auth system.
 */
async function createPatientAccount(req, res, next) {
  try {
    requireFields(req.body, ['firstName', 'lastName', 'email', 'password']);
    const { firstName, lastName, email, password } = req.body;

    // Register user via Auth system (will get 'patient' role by default)
    const account = await authClient.register({
      firstName,
      lastName,
      email,
      password,
    });

    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDoctorAccount,
  createPatientAccount,
};
