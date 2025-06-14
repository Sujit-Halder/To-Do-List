const nodemailer = require('nodemailer');
const logger = require('./logger'); // Import logger
require('dotenv').config();

// Configure the email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send an email
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to} with subject: "${subject}"`);
  } catch (error) {
    logger.error(`Error sending email to ${to} with subject: "${subject}": ${error.message}`);
    throw new Error(`Failed to send email to ${to}`);
  }
};

module.exports = sendEmail;