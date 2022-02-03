const express = require('express');
const router = express.Router();
const RegisterUser = require('../../../domains/users/actions/Register');

const validateUserRequest = (req, res, next) => {
  const body = req.body;
  if (body.username === undefined || body.username === null) {
    return res.status(400).send({
      message: 'User could not be Created.',
      error: 'User could not be Created because the User data is Invalid.',
      validationErrors: {
        username: 'Username cannot be null',
      },
      success: false,
    });
  }
  if (body.email === undefined || body.email === null) {
    return res.status(400).send({
      status: 400,
      message: 'User could not be Created.',
      error: 'User could not be Created because the User data is Invalid.',
      validationErrors: {
        email: 'Email cannot be null',
      },
      success: false,
    });
  }
  next();
};

router.post('/api/1.0/users', validateUserRequest, async (req, res) => {
  const response = await RegisterUser.__invoke(req.body);
  return res.status(response.status).send({
    message: response.message,
    error: response.error,
    validationErrors: response.validationErrors,
    user: response.user,
    success: response.success,
  });
});

module.exports = router;
