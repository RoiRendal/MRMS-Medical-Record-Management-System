function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  console.error(err);
  const status = err.status || err.statusCode || 500;
  const body =
    typeof err.expose === 'boolean' && err.expose
      ? { error: err.message }
      : { error: status === 500 ? 'Internal server error' : err.message };
  body.path = req.path;
  res.status(status).json(body);
}

module.exports = { errorHandler };
