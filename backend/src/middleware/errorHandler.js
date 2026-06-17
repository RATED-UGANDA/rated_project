function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const response = {
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR',
    },
  };
  res.status(status).json(response);
}

module.exports = { errorHandler };
