const User = require('../models/User');
const InvalidTokenException = require('../exceptions/InvalidTokenException');

const __invoke = async (token) => {
  let user;
  try {
    user = await User.findOne({ where: { activationToken: token } });
    user.inactive = false;
    user.activationToken = null;
  } catch (error) {
    const exception = new InvalidTokenException();
    return {
      status: exception.status,
      message: exception.message,
      success: exception.success,
      error: error,
    };
  }
  try {
    await user.save();
  } catch (error) {
    return {
      status: 404,
      message: 'user_notactivated',
      error: error,
      success: false,
    };
  }
  return {
    status: 200,
    message: 'user_activated',
    success: true,
  };
};

module.exports = { __invoke };
