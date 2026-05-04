function createHttpError(message, status = 500, expose = true) {
  const err = new Error(message);
  err.status = status;
  err.expose = expose;
  return err;
}

module.exports = {
  createHttpError,
};
