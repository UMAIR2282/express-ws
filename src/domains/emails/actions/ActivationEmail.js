const transporter = require('../../../config/emailTransporter');

const __invoke = async (email, activationToken) => {
  return await transporter.sendMail({
    from: 'My App <info@my-app.com>',
    to: email,
    subject: 'MyApp Account Activation',
    html: `Token is ${activationToken}`,
  });
};

module.exports = { __invoke };
