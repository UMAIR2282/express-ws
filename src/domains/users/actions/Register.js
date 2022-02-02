const User = require('../models/User');
const bcrypt = require('bcryptjs');

class Register {
  static async __invoke(req) {
    try {
      const hash = await bcrypt.hash(req.body.password, 10);
      const user = { ...req.body, password: hash };
      /*const user = Object.assign({}, req.body, { password: hash });
            const user = {
            username: req.body.username,
            email: req.body.email,
            password: hash,
            };*/
      const savedUser = await User.create(user);
      return { status: 201, message: 'User Created', success: true, response: savedUser };
    } catch (error) {
      return { status: 400, message: 'User could not be Created', error: error, success: false };
    }
  }
}

module.exports = Register;
