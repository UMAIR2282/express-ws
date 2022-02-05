const transporter = require('../../../config/emailTransporter');

const __invoke = async (email, activationToken) => {
  try {
    return await transporter.sendMail({
      from: 'My App <info@my-app.com>',
      to: email,
      subject: 'MyApp Account Activation',
      html: `Token is ${activationToken}`,
    });
  } catch (error) {
    return {
      status: 503,
      error: error,
      success: false,
    };
  }
};

module.exports = { __invoke };
