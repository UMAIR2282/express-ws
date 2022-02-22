const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const EmailService = require('../../emails/EmailService');
const sequelize = require('../../../config/database');
const EmailSendingFailure = require('../../emails/exceptions/EmailSendingFailure');

const generateToken = (length = 16) => {
  return crypto.randomBytes(length).toString('hex');
};

const __invoke = async (body) => {
  let transaction = {},
    savedUser = {};
  const { username, email, password } = body;
  const hash = await bcrypt.hash(password, 10);
  const user = { username, email, password: hash, activationToken: generateToken() };

  try {
    /*const user = Object.assign({}, body, { password: hash });
            const user = {
            username: body.username,
            email: body.email,
            password: hash,
            };*/
    transaction = await sequelize.transaction();
    savedUser = await User.create(user, { transaction });
  } catch (error) {
    return {
      status: 400,
      message: 'user_notcreated',
      validationErrors: { email: 'email_inuse' },
      error: error,
      success: false,
    };
  }
  try {
    const emailSentStatus = await EmailService.sendActivationEmail(email, user.activationToken);
    await transaction.commit();
    return {
      status: 201,
      message: 'user_created',
      success: true,
      response: { user: savedUser, emailSentStatus: emailSentStatus },
    };
  } catch (error) {
    await transaction.rollback();
    const exception = new EmailSendingFailure();
    return {
      status: exception.status,
      message: exception.message,
      success: exception.success,
      validationErrors: { email: 'email_failure' },
      error: error,
    };
  }
};

module.exports = { __invoke };
