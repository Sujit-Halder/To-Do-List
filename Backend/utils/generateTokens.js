const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const logger = require('./logger'); // Import logger
require('dotenv').config();

// Secret keys for token generation
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'defaultAccessTokenSecret';
// const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'defaultRefreshTokenSecret';

// Function to generate an access token
const generateAccessToken = (user) => {
  try {
    const payload = { email: user.email, username: user.username };
    const token = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    logger.info(`Access token generated for user: ${user.email}`);
    return token;
  } catch (error) {
    logger.error(`Error generating access token for user: ${user.email}: ${error.message}`);
    throw new Error('Failed to generate access token');
  }
};

// Function to generate a refresh token
// const generateRefreshToken = (user) => {
//   try {
//     const payload = { email: user.email, username: user.username };
//     const token = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
//     logger.info(`Refresh token generated for user: ${user.email}`);
//     return token;
//   } catch (error) {
//     logger.error(`Error generating refresh token for user: ${user.email}: ${error.message}`);
//     throw new Error('Failed to generate refresh token');
//   }
// };

// Function to encode a file to Base64
const base64 = (filePath) => {
  try {
    const fileData = fs.readFileSync(path.resolve(filePath));
    const base64String = fileData.toString('base64');
    logger.info(`File at ${filePath} successfully encoded to Base64`);
    return base64String;
  } catch (error) {
    logger.error(`Error encoding file at ${filePath} to Base64: ${error.message}`);
    throw new Error('Failed to encode file to Base64');
  }
};

module.exports = {
  generateAccessToken,
  // generateRefreshToken,
  base64,
};