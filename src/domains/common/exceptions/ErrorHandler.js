// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  let { status, message, success, validationErrors, validationErrorsArray, error } = err;

  if (validationErrorsArray) {
    if (!validationErrors) {
      validationErrors = {};
    }
    validationErrorsArray.forEach((error) => {
      validationErrors[error.param] = req.t(error.msg);
    });
  }

  res.status(status).send({
    message: req.t(message),
    success: success,
    validationErrors: validationErrors,
    error: error,
  });
};