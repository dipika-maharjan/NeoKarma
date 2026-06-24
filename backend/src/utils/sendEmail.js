/**
 * Email Utility
 * Sends emails using nodemailer
 */
const config = require('../config/env');
const AppError = require('./AppError');

const sendEmail = async (options) => {
  if (!config.EMAIL_USER || !config.EMAIL_PASS) {
    throw new AppError('Email service is not configured. Set EMAIL_USER and EMAIL_PASS.', 500);
  }

  const nodemailer = require('nodemailer');

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
