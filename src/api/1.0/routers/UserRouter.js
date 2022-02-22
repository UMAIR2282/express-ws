const express = require('express');
const router = express.Router();
const UserService = require('../../../domains/users/UserService');

const { check, validationResult } = require('express-validator');

router.post(
  '/api/1.0/users',
  check('username')
    .notEmpty()
    .withMessage('username_null')
    .bail()
    .isLength({ min: 6, max: 32 })
    .withMessage('username_size'),
  check('email')
    .notEmpty()
    .withMessage('email_null')
    .bail()
    .isEmail()
    .withMessage('email_invalid')
    .bail()
    .custom(async (email) => {
      const user = await UserService.findByEmail(email);
      if (user) {
        throw new Error('email_inuse');
      }
    }),
  check('password')
    .notEmpty()
    .withMessage('password_null')
    .bail()
    .isLength({ min: 8, max: 128 })
    .withMessage('password_size')
    .bail()
    .isStrongPassword()
    .withMessage('password_pattern'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = {};
      errors.array().forEach((error) => {
        validationErrors[error.param] = req.t(error.msg);
      });
      return res.status(400).send({
        message: req.t('user_notcreated'),
        error: req.t('user_datainvalid'),
        validationErrors: validationErrors,
        success: false,
      });
    }
    const response = await UserService.register(req.body);
    return res.status(response.status).send({
      message: req.t(response.message),
      error: response.error,
      validationErrors: response.validationErrors,
      user: response.user,
      success: response.success,
    });
  }
);

router.post('/api/1.0/users/token/:token', async (req, res) => {
  const response = await UserService.activateAccount(req.params.token);
  return res.status(response.status).send({
    message: req.t(response.message),
    error: response.error,
    success: response.success,
  });
});

module.exports = router;
