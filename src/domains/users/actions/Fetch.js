const User = require('../models/User');

const byEmail = async (email) => {
  return await User.findOne({ where: { email: email } });
};

module.exports = { byEmail };
