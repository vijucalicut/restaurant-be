const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Generate OTP
function generateOTP() {
  return speakeasy.totp({
    secret: speakeasy.generateSecret().base32,
    encoding: 'base32',
    digits: 6,
    step: 300 // 5 minutes validity
  });
}

module.exports = { generateToken, generateOTP };
