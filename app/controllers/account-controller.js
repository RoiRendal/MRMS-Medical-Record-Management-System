const authClient = require('../clients/authClient');
const { requireFields } = require('../utils/validators');

/**
 * Create a doctor account via the Auth system.
 * Step 1: Register user via Auth system (gets 'patient' role by default)
 * Step 2: Promote user to 'doctor' role using assignRole()
 */
async function createDoctorAccount(req, res, next) {
  try {
    requireFields(req.body, ['firstName', 'lastName', 'email', 'password']);
    const { firstName, lastName, email, password } = req.body;

    // Step 1: Register user via Auth system (will get 'patient' role by default)
    const account = await authClient.register({
      firstName,
      lastName,
      email,
      password,
    });

    // Step 2: Promote user to 'doctor' role
    const userId = account.user?.id;
    if (userId) {
      try {
        const roleResult = await authClient.assignRole({
          userId,
          role: 'doctor',
        });
        // Include role assignment result in response
        account.roleAssignment = roleResult;
      } catch (roleError) {
        // Log the error but don't fail the account creation
        console.warn('Failed to assign doctor role:', roleError.message);
        account.roleAssignment = {
          message: 'Account created but role assignment failed',
          error: roleError.message,
        };
      }
    }

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
