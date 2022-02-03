const express = require('express');
const router = express.Router();
const RegisterUser = require('../../../domains/users/actions/Register');
const { check, validationResult } = require('express-validator');

/*const validateUserName = (req, res, next) => {
  const body = req.body;
  if (body.username === undefined || body.username === null) {
    req.validationErrors = { ...req.validationErrors, username: 'Username cannot be null' };
  }
  next();
};

const validateEmail = (req, res, next) => {
  const body = req.body;
  if (body.email === undefined || body.email === null) {
    req.validationErrors = { ...req.validationErrors, email: 'Email cannot be null' };
  }
  next();
};

const validatePassword = (req, res, next) => {
  const body = req.body;
  if (body.password === undefined || body.password === null) {
    req.validationErrors = { ...req.validationErrors, password: 'Password cannot be null' };
  }
  next();
};*/

router.post(
  '/api/1.0/users',
  check('username').notEmpty().withMessage('Username cannot be null'),
  check('email').notEmpty().withMessage('Email cannot be null'),
  check('password').notEmpty().withMessage('Password cannot be null'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = {};
      errors.array().forEach((error) => {
        validationErrors[error.param] = error.msg;
      });
      return res.status(400).send({
        message: 'User could not be Created.',
        error: 'User could not be Created because the User data is Invalid.',
        validationErrors: validationErrors,
        success: false,
      });
    }
    const response = await RegisterUser.__invoke(req.body);
    return res.status(response.status).send({
      message: response.message,
      error: response.error,
      validationErrors: response.validationErrors,
      user: response.user,
      success: response.success,
    });
  }
);

module.exports = router;
