const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const ActivationEmail = require('../../emails/actions/ActivationEmail');

const generateToken = (length = 16) => {
  return crypto.randomBytes(length).toString('hex');
};

const __invoke = async (body) => {
  try {
    const { username, email, password } = body;
    const hash = await bcrypt.hash(password, 10);
    const user = { username, email, password: hash, activationToken: generateToken() };
    /*const user = Object.assign({}, body, { password: hash });
            const user = {
            username: body.username,
            email: body.email,
            password: hash,
            };*/
    const savedUser = await User.create(user);
    const emailSentStatus = await ActivationEmail.__invoke(email, user.activationToken);
    return {
      status: 201,
      message: 'user_created',
      success: true,
      response: { user: savedUser, emailSentStatus: emailSentStatus },
    };
  } catch (error) {
    return {
      status: 400,
      message: 'user_notcreated',
      validationErrors: { email: 'email_inuse' },
      error: error,
      success: false,
    };
  }
};

module.exports = { __invoke };
