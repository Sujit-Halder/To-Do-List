const jwt = require('jsonwebtoken');
const fs = require('fs');
const path =require('path');

const generateAccessToken = (user) => {
  return jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const base64 = (filePath) => {
  const imagePath = path.join(__dirname, filePath);

  try {
    const file = fs.readFileSync(imagePath);
    return `data:image/png;base64,${file.toString('base64')}`;
  } catch (err) {
    console.error('Could not load default image:', err.message);
    return null; 
  }
};

module.exports = { generateAccessToken, base64 }; 