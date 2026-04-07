const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

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
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/signup', authController.signup);

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to phone
 *     tags: [Authentication]
 */
router.post('/send-otp', authController.sendOTP);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login
 *     tags: [Authentication]
 */
router.post('/verify-otp', authController.verifyOTP);

/**
 * @swagger
 * /api/auth/admin-login:
 *   post:
 *     summary: Admin login
 *     tags: [Authentication]
 */
router.post('/admin-login', authController.adminLogin);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 */
router.get('/profile', require('../middleware/auth').authenticateToken, authController.getProfile);

/**
 * @swagger
 * /api/auth/create-admin:
 *   post:
 *     summary: Create admin user (admin only)
 *     tags: [Authentication]
 */
router.post('/create-admin', require('../middleware/auth').authenticateAdmin, authController.createAdmin);

module.exports = router;
