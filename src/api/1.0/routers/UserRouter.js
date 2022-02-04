const express = require('express');
const router = express.Router();
const RegisterUser = require('../../../domains/users/actions/Register');
const FetchUser = require('../../../domains/users/actions/Fetch');
const { check, validationResult } = require('express-validator');

router.post(
  '/api/1.0/users',
  check('username')
    .notEmpty()
    .withMessage('Username cannot be null')
    .bail()
    .isLength({ min: 6, max: 32 })
    .withMessage('Username cannot be less than 6 and more than 32 characters'),
  check('email')
    .notEmpty()
    .withMessage('Email cannot be null')
    .bail()
    .isEmail()
    .withMessage('Email is not Valid')
    .bail()
    .custom(async (email) => {
      const user = await FetchUser.findByEmail(email);
      if (user) {
        throw new Error('Email is in use');
      }
    }),
  check('password')
    .notEmpty()
    .withMessage('Password cannot be null')
    .bail()
    .isLength({ min: 8, max: 128 })
    .withMessage('Password cannot be less than 8 and more than 128 characters')
    .bail()
    .isStrongPassword()
    .withMessage('Password must have at least 1 uppercase, 1 lowercase, and 1 number'),
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
