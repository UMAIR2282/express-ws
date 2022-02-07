const nodemailer = require('nodemailer');
const config = require('config');

const mailConfig = config.get('mail');

console.log('mailConfig', mailConfig);

const transporter = nodemailer.createTransport({ ...mailConfig });

module.exports = transporter;
