const nodemailer = require('nodemailer');
const transporter = require('../../../config/emailTransporter');

const __invoke = async (email, activationToken) => {
  const info = await transporter.sendMail({
    from: 'My App <info@my-app.com>',
    to: email,
    subject: 'MyApp Account Activation',
    html: `
      <div><b>Please click below link to activate your account.</b></div>
      <div><a href="http://localhost8080/#/login?token=${activationToken}">Activate</a></div>
    `,
  });
  if (process.env.NODE_ENV === 'development') {
    console.log('url', nodemailer.getTestMessageUrl(info));
  }
  return info;
};

module.exports = { __invoke };
