const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

const router = express.Router();

// MongoDB will be injected from index.js
let usersCollection;

// Set collections (called from index.js)
function setCollections(collections) {
  usersCollection = collections.users;
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// Generate OTP
function generateOTP() {
  return speakeasy.totp({
    secret: speakeasy.generateSecret().base32,
    encoding: 'base32',
    digits: 6,
    step: 300 // 5 minutes validity
  });
}

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: User signup
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - phone
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists or invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, name, phone } = req.body;

    if (!email || !name || !phone) {
      return res.status(400).json({ message: 'Email, name, and phone are required' });
    }

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = {
      _id: Date.now().toString(),
      email,
      name,
      phone,
      role: 'user',
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await usersCollection.insertOne(user);
    const createdUser = user;

    res.status(201).json({
      message: 'User created successfully. Please verify your phone number.',
      user: { _id: createdUser._id, email: createdUser.email, name: createdUser.name, phone: createdUser.phone }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send OTP for login/verification
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Find user by phone
    const user = await usersCollection.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please sign up first.' });
    }
    const otp = generateOTP();

    // Store OTP (in production, send via SMS)
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 300000, // 5 minutes
      userId: user.id
    });

    // In production, integrate with SMS service like Twilio
    console.log(`OTP for ${phone}: ${otp}`);

    res.json({
      message: 'OTP sent successfully',
      // Remove this in production - only for development
      otp: otp
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify OTP and login
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const storedOTP = otpStore.get(phone);

    if (!storedOTP || storedOTP.otp !== otp || Date.now() > storedOTP.expiresAt) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // Get user details
    const user = await usersCollection.findOne({ _id: storedOTP.userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mark user as verified
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { isVerified: true, updatedAt: new Date().toISOString() } }
    );
    user.isVerified = true;
    user.updatedAt = new Date().toISOString();

    // Generate JWT token
    const token = jwt.sign(
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

    // Clear OTP
    otpStore.delete(phone);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin login (password-based)
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await usersCollection.findOne({ email, role: 'admin' });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Admin login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await usersCollection.findOne({ _id: decoded.id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = { router, setCollections };