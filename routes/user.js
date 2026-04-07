const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// MongoDB collections will be injected
let tablesCollection;
let slotsCollection;
let bookingsCollection;

// Set collections (called from index.js)
function setCollections(collections) {
  tablesCollection = collections.tables;
  slotsCollection = collections.time_slots;
  bookingsCollection = collections.bookings;
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get time slots for a date
router.get('/slots', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const slots = await slotsCollection.find({ date }).sort({ startTime: 1 }).toArray();

    res.json({ slots });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get available tables for a slot
router.get('/tables/available', async (req, res) => {
  try {
    const { date, slotId } = req.query;

    if (!date || !slotId) {
      return res.status(400).json({ message: 'Date and slot ID are required' });
    }

    // Get all active tables
    const tables = await tablesCollection.find({ isActive: true }).toArray();

    // Get existing bookings for this slot
    const bookings = await bookingsCollection.find({ date, slotId }).toArray();

    const bookedTableIds = bookings.map(booking => booking.tableId);
    const availableTables = tables.filter(table => !bookedTableIds.includes(table._id));

    res.json({ tables: availableTables });
  } catch (error) {
    console.error('Get available tables error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create booking
router.post('/bookings', authenticateToken, async (req, res) => {
  try {
    const { tableId, slotId, date, numberOfGuests } = req.body;

    if (!tableId || !slotId || !date || !numberOfGuests) {
      return res.status(400).json({ message: 'Table ID, slot ID, date, and number of guests are required' });
    }

    // Check if table exists and is active
    const table = await tablesCollection.findOne({ _id: tableId });
    if (!table || !table.isActive) {
      return res.status(400).json({ message: 'Table not available' });
    }

    // Check if slot exists and is active
    const slot = await slotsCollection.findOne({ _id: slotId });
    if (!slot || !slot.isActive) {
      return res.status(400).json({ message: 'Time slot not available' });
    }

    // Check if table capacity is sufficient
    if (numberOfGuests > table.capacity) {
      return res.status(400).json({ message: 'Number of guests exceeds table capacity' });
    }

    // Check if booking already exists
    const existingBooking = await bookingsCollection.findOne({ tableId, slotId, date });

    if (existingBooking) {
      return res.status(400).json({ message: 'Table is already booked for this time slot' });
    }

    const booking = {
      _id: Date.now().toString(),
      userId: req.user.id,
      tableId,
      slotId,
      date,
      numberOfGuests,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await bookingsCollection.insertOne(booking);

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user bookings
router.get('/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await bookingsCollection.find({ userId: req.user.id }).sort({ createdAt: -1 }).toArray();

    // Get table and slot details for each booking
    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const table = await tablesCollection.findOne({ _id: booking.tableId });
        const slot = await slotsCollection.findOne({ _id: booking.slotId });

        return {
          ...booking,
          table,
          slot
        };
      })
    );

    res.json({ bookings: bookingsWithDetails });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel booking
router.delete('/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await bookingsCollection.findOne({ _id: req.params.id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    await bookingsCollection.deleteOne({ _id: req.params.id });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = { router, setCollections };