const express = require('express');
const router = express.Router();
const UserService = require('../../../domains/users/UserService');

const { check, validationResult } = require('express-validator');
const InvalidTokenException = require('../../../domains/users/exceptions/InvalidTokenException');
const ValidationException = require('../../../domains/common/exceptions/ValidationException');

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
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new ValidationException(req.t('user_datainvalid'), errors.array()));
      }
      const response = await UserService.register(req.body);
      return res.status(response.status).send({
        message: req.t(response.message),
        user: response.user,
        success: response.success,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/api/1.0/users/token/:token', async (req, res, next) => {
  try {
    const response = await UserService.activateAccount(req.params.token);
    return res.status(response.status).send({
      message: req.t(response.message),
      user: response.user,
      success: response.success,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/api/1.0/testexception', async (req, res, next) => {
  next(new InvalidTokenException());
});

module.exports = router;
