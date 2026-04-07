const express = require('express');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const router = express.Router();

// MongoDB collections will be injected
let usersCollection;
let tablesCollection;
let slotsCollection;
let bookingsCollection;

// Set collections (called from index.js)
function setCollections(collections) {
  usersCollection = collections.users;
  tablesCollection = collections.tables;
  slotsCollection = collections.time_slots;
  bookingsCollection = collections.bookings;
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Middleware to verify JWT token and admin role
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = user;
    next();
  });
};

// Table Management

// Create table
router.post('/tables', authenticateAdmin, async (req, res) => {
  try {
    const { tableNumber, capacity, location } = req.body;

    if (!tableNumber || !capacity) {
      return res.status(400).json({ message: 'Table number and capacity are required' });
    }

    // Check if table already exists
    const existingTable = await tablesCollection.findOne({ tableNumber });

    if (existingTable) {
      return res.status(400).json({ message: 'Table number already exists' });
    }

    const table = {
      _id: Date.now().toString(),
      tableNumber,
      capacity,
      location: location || '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await tablesCollection.insertOne(table);

    res.status(201).json({
      message: 'Table created successfully',
      table
    });
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all tables
router.get('/tables', authenticateAdmin, async (req, res) => {
  try {
    const tables = await tablesCollection.find({}).sort({ tableNumber: 1 }).toArray();

    res.json({ tables });
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update table
router.put('/tables/:id', authenticateAdmin, async (req, res) => {
  try {
    const { tableNumber, capacity, location, isActive } = req.body;

    const existingTable = await tablesCollection.findOne({ _id: req.params.id });

    if (!existingTable) {
      return res.status(404).json({ message: 'Table not found' });
    }

    const updatedTable = {
      tableNumber: tableNumber || existingTable.tableNumber,
      capacity: capacity || existingTable.capacity,
      location: location !== undefined ? location : existingTable.location,
      isActive: isActive !== undefined ? isActive : existingTable.isActive,
      updatedAt: new Date().toISOString()
    };

    await tablesCollection.updateOne({ _id: req.params.id }, { $set: updatedTable });
    updatedTable._id = req.params.id;

    res.json({
      message: 'Table updated successfully',
      table: { ...existingTable, ...updatedTable }
    });
  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Time Slot Management

// Generate time slots for a date
router.post('/slots/generate', authenticateAdmin, async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Date, start time, and end time are required' });
    }

    const startMoment = moment(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm');
    const endMoment = moment(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm');

    const slots = [];

    while (startMoment.isBefore(endMoment)) {
      const slotEnd = moment(startMoment).add(30, 'minutes');

      // Check if slot already exists
      const slotId = `${date}_${startMoment.format('HH:mm')}_${slotEnd.format('HH:mm')}`;
      const existingSlot = await slotsCollection.findOne({ _id: slotId });

      if (!existingSlot) {
        const slot = {
          _id: slotId,
          date,
          startTime: startMoment.format('HH:mm'),
          endTime: slotEnd.format('HH:mm'),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        slots.push(slot);
        await slotsCollection.insertOne(slot);
      }

      startMoment.add(30, 'minutes');
    }

    res.json({
      message: 'Time slots generated successfully',
      slots
    });
  } catch (error) {
    console.error('Generate slots error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update slot status (enable/disable)
router.put('/slots/:id', authenticateAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;

    const existingSlot = await slotsCollection.findOne({ _id: req.params.id });

    if (!existingSlot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    const updatedSlot = {
      isActive: isActive !== undefined ? isActive : existingSlot.isActive,
      updatedAt: new Date().toISOString()
    };

    await slotsCollection.updateOne({ _id: req.params.id }, { $set: updatedSlot });

    res.json({
      message: 'Slot updated successfully',
      slot: { ...existingSlot, ...updatedSlot }
    });
  } catch (error) {
    console.error('Update slot error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all bookings (Admin only)
router.get('/bookings', authenticateAdmin, async (req, res) => {
  try {
    const bookings = await bookingsCollection.find({}).sort({ createdAt: -1 }).toArray();

    // Get user, table and slot details for each booking
    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const user = await usersCollection.findOne({ _id: booking.userId });
        const table = await tablesCollection.findOne({ _id: booking.tableId });
        const slot = await slotsCollection.findOne({ _id: booking.slotId });

        return {
          ...booking,
          user: user ? { _id: user._id, name: user.name, email: user.email, phone: user.phone } : null,
          table,
          slot
        };
      })
    );

    res.json({ bookings: bookingsWithDetails });
  } catch (error) {
    console.error('Get admin bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users (Admin only)
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await usersCollection.find({}).sort({ createdAt: -1 }).toArray();

    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = { router, setCollections };