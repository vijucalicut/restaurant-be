const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Restaurants]
 */
router.get('/restaurants', userController.getRestaurants);

/**
 * @swagger
 * /api/slots:
 *   get:
 *     summary: Get time slots for a restaurant and date
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/slots', userController.getSlots);

/**
 * @swagger
 * /api/tables/available:
 *   get:
 *     summary: Get available tables for a restaurant, slot and date
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/tables/available', userController.getAvailableTables);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a booking with queue management
 *     tags: [Bookings]
 */
router.post('/bookings', authenticateToken, userController.createBooking);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get user bookings
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 */
router.get('/bookings', authenticateToken, userController.getUserBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 */
router.delete('/bookings/:id', authenticateToken, userController.cancelBooking);

/**
 * @swagger
 * /api/queue:
 *   get:
 *     summary: Get user's queue positions
 *     tags: [Queue]
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 */
router.get('/queue', authenticateToken, userController.getQueuePosition);

module.exports = router;
