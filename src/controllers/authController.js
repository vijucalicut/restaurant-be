const bcrypt = require('bcryptjs');
const { getCollections } = require('../config/database');
const { generateToken, generateOTP } = require('../utils/helpers');

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

// Signup
exports.signup = async (req, res) => {
  try {
    const { email, name, phone } = req.body;
    const { users } = getCollections();

    if (!email || !name || !phone) {
      return res.status(400).json({ message: 'Email, name, and phone are required' });
    }

    // Check if user already exists
    const existingUser = await users.findOne({ email });
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

    await users.insertOne(user);

    res.status(201).json({
      message: 'User created successfully. Please verify your phone number.',
      user: { _id: user._id, email: user.email, name: user.name, phone: user.phone }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    const { users } = getCollections();

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Find user by phone
    const user = await users.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please sign up first.' });
    }

    const otp = generateOTP();

    // Store OTP
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 300000,
      userId: user._id
    });

    console.log(`OTP for ${phone}: ${otp}`);

    res.json({
      message: 'OTP sent successfully',
      otp: otp // Remove in production
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify OTP & Login
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const { users } = getCollections();

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const storedOTP = otpStore.get(phone);
    if (!storedOTP || storedOTP.otp !== otp || Date.now() > storedOTP.expiresAt) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // Get user
    const user = await users.findOne({ _id: storedOTP.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mark as verified
    await users.updateOne({ _id: user._id }, { $set: { isVerified: true, updatedAt: new Date().toISOString() } });

    // Generate token
    const token = generateToken(user);
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
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { users } = getCollections();

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find admin
    const user = await users.findOne({ email, role: 'admin' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);
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
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const { users } = getCollections();

    const user = await users.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create admin user (admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { email, name, phone, password } = req.body;
    const { users } = getCollections();

    if (!email || !name || !phone || !password) {
      return res.status(400).json({ message: 'Email, name, phone, and password are required' });
    }

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = {
      _id: 'admin_' + Date.now().toString(),
      email,
      name,
      phone,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await users.insertOne(adminUser);

    res.status(201).json({
      message: 'Admin user created successfully',
      admin: { _id: adminUser._id, email: adminUser.email, name: adminUser.name, phone: adminUser.phone, role: adminUser.role }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
