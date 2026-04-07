const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/admin/restaurants:
 *   post:
 *     summary: Create a restaurant
 *     tags: [Admin - Restaurants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 description: Restaurant name
 *               address:
 *                 type: string
 *                 description: Restaurant address
 *               phone:
 *                 type: string
 *                 description: Restaurant phone (optional)
 *               email:
 *                 type: string
 *                 description: Restaurant email (optional)
 *               description:
 *                 type: string
 *                 description: Restaurant description (optional)
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 */
router.post('/restaurants', authenticateAdmin, adminController.createRestaurant);

/**
 * @swagger
 * /api/admin/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Admin - Restaurants]
 */
router.get('/restaurants', authenticateAdmin, adminController.getRestaurants);

/**
 * @swagger
 * /api/admin/restaurants/{id}:
 *   put:
 *     summary: Update a restaurant
 *     tags: [Admin - Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 */
router.put('/restaurants/:id', authenticateAdmin, adminController.updateRestaurant);

/**
 * @swagger
 * /api/admin/tables:
 *   post:
 *     summary: Create a table for a restaurant
 *     tags: [Admin - Tables]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tableNumber
 *               - capacity
 *               - restaurantId
 *             properties:
 *               restaurantId:
 *                 type: string
 *                 description: Restaurant ID
 *               tableNumber:
 *                 type: integer
 *                 description: Table number
 *               capacity:
 *                 type: integer
 *                 description: Seating capacity
 *               seatCount:
 *                 type: integer
 *                 description: Actual seat count (optional)
 *               location:
 *                 type: string
 *                 description: Table location (optional)
 *               bookingEnabled:
 *                 type: boolean
 *                 description: Enable booking for this table (optional)
 *     responses:
 *       201:
 *         description: Table created successfully
 */
router.post('/tables', authenticateAdmin, adminController.createTable);

/**
 * @swagger
 * /api/admin/tables:
 *   get:
 *     summary: Get all tables
 *     tags: [Admin - Tables]
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 */
router.get('/tables', authenticateAdmin, adminController.getTables);

/**
 * @swagger
 * /api/admin/tables/{id}:
 *   put:
 *     summary: Update a table
 *     tags: [Admin - Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableNumber:
 *                 type: integer
 *               capacity:
 *                 type: integer
 *               seatCount:
 *                 type: integer
 *               location:
 *                 type: string
 *               bookingEnabled:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Table updated successfully
 */
router.put('/tables/:id', authenticateAdmin, adminController.updateTable);

/**
 * @swagger
 * /api/admin/slots/generate:
 *   post:
 *     summary: Generate time slots for a restaurant
 *     tags: [Admin - Time Slots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - startTime
 *               - endTime
 *               - restaurantId
 *             properties:
 *               restaurantId:
 *                 type: string
 *                 description: Restaurant ID
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date (YYYY-MM-DD)
 *               startTime:
 *                 type: string
 *                 description: Start time (HH:mm)
 *               endTime:
 *                 type: string
 *                 description: End time (HH:mm)
 *               intervalMinutes:
 *                 type: integer
 *                 description: Interval in minutes (default 30)
 *     responses:
 *       200:
 *         description: Time slots generated successfully
 */
router.post('/slots/generate', authenticateAdmin, adminController.generateTimeSlots);

/**
 * @swagger
 * /api/admin/slots/{id}:
 *   put:
 *     summary: Update time slot
 *     tags: [Admin - Time Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Time slot updated successfully
 */
router.put('/slots/:id', authenticateAdmin, adminController.updateTimeSlot);

/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Admin - Bookings]
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 */
router.get('/bookings', authenticateAdmin, adminController.getAllBookings);

/**
 * @swagger
 * /api/admin/bookings/{id}/status:
 *   put:
 *     summary: Update booking status
 *     tags: [Admin - Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, pending, completed, rejected]
 *                 description: Booking status
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 */
router.put('/bookings/:id/status', authenticateAdmin, adminController.updateBookingStatus);

/**
 * @swagger
 * /api/admin/queue:
 *   get:
 *     summary: Get booking queue
 *     tags: [Admin - Queue]
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 */
router.get('/queue', authenticateAdmin, adminController.getBookingQueue);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin - Users]
 */
router.get('/users', authenticateAdmin, adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Admin - Audit]
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *       - in: query
 *         name: adminId
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 */
router.get('/audit-logs', authenticateAdmin, adminController.getAuditLogs);

/**
 * @swagger
 * /api/admin/restaurants/{restaurantId}/audit-logs:
 *   get:
 *     summary: Get audit logs for specific restaurant
 *     tags: [Admin - Audit]
 */
router.get('/restaurants/:restaurantId/audit-logs', authenticateAdmin, adminController.getRestaurantAuditLogs);

/**
 * @swagger
 * /api/admin/admins/{adminId}/activity:
 *   get:
 *     summary: Get admin activity logs
 *     tags: [Admin - Audit]
 */
router.get('/admins/:adminId/activity', authenticateAdmin, adminController.getAdminActivityLogs);

module.exports = router;
