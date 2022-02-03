const User = require('../models/User');
const bcrypt = require('bcryptjs');

const __invoke = async (body) => {
  try {
    const hash = await bcrypt.hash(body.password, 10);
    const user = { ...body, password: hash };
    /*const user = Object.assign({}, body, { password: hash });
            const user = {
            username: body.username,
            email: body.email,
            password: hash,
            };*/
    const savedUser = await User.create(user);
    return { status: 201, message: 'User Created', success: true, response: savedUser };
  } catch (error) {
    return { status: 400, message: 'User could not be Created', error: error, success: false };
  }
};

module.exports = { __invoke };
