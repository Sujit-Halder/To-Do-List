const jwt = require('jsonwebtoken');
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

module.exports = {
  generateAccessToken,
  // generateRefreshToken,
};
