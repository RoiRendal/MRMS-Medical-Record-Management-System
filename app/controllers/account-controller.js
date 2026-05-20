const authClient = require('../clients/authClient');
const { requireFields } = require('../utils/validators');

async function createDoctorAccount(req, res, next) {
  try {
    requireFields(req.body, ['firstName', 'lastName', 'email', 'password']);
    const { firstName, lastName, email, password } = req.body;

    const account = await authClient.register({
      firstName,
      lastName,
      email,
      password,
    });

    const userId = account.user?.id;
    if (userId) {
      try {
        const roleResult = await authClient.assignRole({
          userId,
          role: 'doctor',
        });
        account.roleAssignment = roleResult;
      } catch (roleError) {
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

async function createPatientAccount(req, res, next) {
  try {
    requireFields(req.body, ['firstName', 'lastName', 'email', 'password']);
    const { firstName, lastName, email, password } = req.body;

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
