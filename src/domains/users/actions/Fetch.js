const User = require('../models/User');

const findByEmail = async (email) => {
  return await User.findOne({ where: { email: email } });
};

module.exports = { findByEmail };
