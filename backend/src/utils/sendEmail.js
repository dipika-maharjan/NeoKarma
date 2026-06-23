/**
 * Email Utility
 * Sends emails using nodemailer
 */
const nodemailer = require('nodemailer');
const config = require('../config/env');

const sendEmail = async (options) => {
  // Create transporter using Gmail service
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS
    }
  });

  // Setup email options
  const mailOptions = {
    from: `"Neoकर्म Team" <${config.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
