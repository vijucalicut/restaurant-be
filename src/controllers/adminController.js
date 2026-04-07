const moment = require('moment');
const { getCollections } = require('../config/database');
const { sendStatusUpdate } = require('../utils/whatsappService');
const { logAudit, AuditActions } = require('../utils/auditService');

// Create restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const { name, address, phone, email, description } = req.body;
    const { restaurants } = getCollections();
    const adminId = req.user.id;

    if (!name || !address) {
      return res.status(400).json({ message: 'Restaurant name and address are required' });
    }

    const existingRestaurant = await restaurants.findOne({ name });
    if (existingRestaurant) {
      return res.status(400).json({ message: 'Restaurant name already exists' });
    }

    const now = new Date().toISOString();
    const restaurant = {
      _id: Date.now().toString(),
      name,
      address,
      phone: phone || '',
      email: email || '',
      description: description || '',
      isActive: true,
      createdBy: adminId,
      createdAt: now,
      updatedBy: adminId,
      updatedAt: now
    };

    await restaurants.insertOne(restaurant);

    // Log audit trail
    await logAudit(AuditActions.RESTAURANT_CREATED, adminId, restaurant._id, {
      name,
      address,
      createdAt: now
    });

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant
    });
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all restaurants
exports.getRestaurants = async (req, res) => {
  try {
    const { restaurants } = getCollections();
    const allRestaurants = await restaurants.find({}).sort({ name: 1 }).toArray();

    res.json({ restaurants: allRestaurants });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const { name, address, phone, email, description, isActive } = req.body;
    const { restaurants } = getCollections();
    const adminId = req.user.id;

    const existingRestaurant = await restaurants.findOne({ _id: req.params.id });
    if (!existingRestaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const now = new Date().toISOString();
    const updatedRestaurant = {
      name: name || existingRestaurant.name,
      address: address || existingRestaurant.address,
      phone: phone !== undefined ? phone : existingRestaurant.phone,
      email: email !== undefined ? email : existingRestaurant.email,
      description: description !== undefined ? description : existingRestaurant.description,
      isActive: isActive !== undefined ? isActive : existingRestaurant.isActive,
      updatedBy: adminId,
      updatedAt: now
    };

    await restaurants.updateOne({ _id: req.params.id }, { $set: updatedRestaurant });

    // Log audit trail
    await logAudit(AuditActions.RESTAURANT_UPDATED, adminId, req.params.id, {
      changes: updatedRestaurant,
      updatedAt: now
    });

    res.json({
      message: 'Restaurant updated successfully',
      restaurant: { ...existingRestaurant, ...updatedRestaurant }
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create table for a restaurant
exports.createTable = async (req, res) => {
  try {
    const { tableNumber, capacity, location, restaurantId, seatCount, bookingEnabled } = req.body;
    const { tables } = getCollections();
    const adminId = req.user.id;

    if (!tableNumber || !capacity || !restaurantId) {
      return res.status(400).json({ message: 'Table number, capacity, and restaurant ID are required' });
    }

    const existingTable = await tables.findOne({ tableNumber, restaurantId });
    if (existingTable) {
      return res.status(400).json({ message: 'Table number already exists for this restaurant' });
    }

    const now = new Date().toISOString();
    const table = {
      _id: Date.now().toString(),
      restaurantId,
      tableNumber,
      capacity,
      seatCount: seatCount || capacity,
      location: location || '',
      bookingEnabled: bookingEnabled !== undefined ? bookingEnabled : true,
      isActive: true,
      createdBy: adminId,
      createdAt: now,
      updatedBy: adminId,
      updatedAt: now
    };

    await tables.insertOne(table);

    // Log audit trail
    await logAudit(AuditActions.TABLE_CREATED, adminId, restaurantId, {
      tableId: table._id,
      tableNumber,
      capacity,
      createdAt: now
    });

    res.status(201).json({
      message: 'Table created successfully',
      table
    });
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all tables for a restaurant
exports.getTables = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const { tables } = getCollections();

    const query = {};
    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    const allTables = await tables.find(query).sort({ tableNumber: 1 }).toArray();

    res.json({ tables: allTables });
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update table
exports.updateTable = async (req, res) => {
  try {
    const { tableNumber, capacity, location, isActive, seatCount, bookingEnabled } = req.body;
    const { tables } = getCollections();
    const adminId = req.user.id;

    const existingTable = await tables.findOne({ _id: req.params.id });
    if (!existingTable) {
      return res.status(404).json({ message: 'Table not found' });
    }

    const now = new Date().toISOString();
    const updatedTable = {
      tableNumber: tableNumber || existingTable.tableNumber,
      capacity: capacity || existingTable.capacity,
      seatCount: seatCount !== undefined ? seatCount : existingTable.seatCount,
      location: location !== undefined ? location : existingTable.location,
      bookingEnabled: bookingEnabled !== undefined ? bookingEnabled : existingTable.bookingEnabled,
      isActive: isActive !== undefined ? isActive : existingTable.isActive,
      updatedBy: adminId,
      updatedAt: now
    };

    await tables.updateOne({ _id: req.params.id }, { $set: updatedTable });

    // Log audit trail
    await logAudit(AuditActions.TABLE_UPDATED, adminId, existingTable.restaurantId, {
      tableId: req.params.id,
      changes: updatedTable,
      updatedAt: now
    });

    res.json({
      message: 'Table updated successfully',
      table: { ...existingTable, ...updatedTable }
    });
  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Generate time slots for a restaurant
exports.generateTimeSlots = async (req, res) => {
  try {
    const { date, startTime, endTime, restaurantId, intervalMinutes } = req.body;
    const { time_slots } = getCollections();
    const adminId = req.user.id;

    if (!date || !startTime || !endTime || !restaurantId) {
      return res.status(400).json({ message: 'Date, start time, end time, and restaurant ID are required' });
    }

    const interval = intervalMinutes || 30; // Default 30 minutes
    const startMoment = moment(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm');
    const endMoment = moment(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm');

    const slots = [];
    const now = new Date().toISOString();

    while (startMoment.isBefore(endMoment)) {
      const slotEnd = moment(startMoment).add(interval, 'minutes');
      const slotId = `${restaurantId}_${date}_${startMoment.format('HH:mm')}_${slotEnd.format('HH:mm')}`;

      const existingSlot = await time_slots.findOne({ _id: slotId });

      if (!existingSlot) {
        const slot = {
          _id: slotId,
          restaurantId,
          date,
          startTime: startMoment.format('HH:mm'),
          endTime: slotEnd.format('HH:mm'),
          isActive: true,
          createdBy: adminId,
          createdAt: now,
          updatedBy: adminId,
          updatedAt: now
        };

        slots.push(slot);
        await time_slots.insertOne(slot);
      }

      startMoment.add(interval, 'minutes');
    }

    // Log audit trail
    await logAudit(AuditActions.TIMESLOT_CREATED, adminId, restaurantId, {
      date,
      startTime,
      endTime,
      intervalMinutes: interval,
      slotsCreated: slots.length,
      createdAt: now
    });

    res.json({
      message: 'Time slots generated successfully',
      slots
    });
  } catch (error) {
    console.error('Generate slots error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update slot status
exports.updateTimeSlot = async (req, res) => {
  try {
    const { isActive } = req.body;
    const { time_slots } = getCollections();
    const adminId = req.user.id;

    const existingSlot = await time_slots.findOne({ _id: req.params.id });
    if (!existingSlot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    const now = new Date().toISOString();
    const updatedSlot = {
      isActive: isActive !== undefined ? isActive : existingSlot.isActive,
      updatedBy: adminId,
      updatedAt: now
    };

    await time_slots.updateOne({ _id: req.params.id }, { $set: updatedSlot });

    // Log audit trail
    await logAudit(AuditActions.TIMESLOT_UPDATED, adminId, existingSlot.restaurantId, {
      slotId: req.params.id,
      changes: updatedSlot,
      updatedAt: now
    });

    res.json({
      message: 'Slot updated successfully',
      slot: { ...existingSlot, ...updatedSlot }
    });
  } catch (error) {
    console.error('Update slot error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all bookings for a restaurant
exports.getAllBookings = async (req, res) => {
  try {
    const { restaurantId, status, date } = req.query;
    const { bookings, users, tables, time_slots, restaurants } = getCollections();

    const query = {};
    if (restaurantId) query.restaurantId = restaurantId;
    if (status) query.status = status;
    if (date) query.date = date;

    const allBookings = await bookings.find(query).sort({ createdAt: -1 }).toArray();

    const bookingsWithDetails = await Promise.all(
      allBookings.map(async (booking) => {
        const user = await users.findOne({ _id: booking.userId });
        const table = await tables.findOne({ _id: booking.tableId });
        const slot = await time_slots.findOne({ _id: booking.slotId });
        const restaurant = await restaurants.findOne({ _id: booking.restaurantId });

        return {
          ...booking,
          user: user ? { _id: user._id, name: user.name, email: user.email, phone: user.phone } : null,
          table,
          slot,
          restaurant
        };
      })
    );

    res.json({ bookings: bookingsWithDetails });
  } catch (error) {
    console.error('Get admin bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { bookings, users, restaurants } = getCollections();
    const adminId = req.user.id;

    const booking = await bookings.findOne({ _id: req.params.id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const oldStatus = booking.status;
    const now = new Date().toISOString();
    const updatedBooking = {
      status,
      updatedBy: adminId,
      updatedAt: now
    };

    await bookings.updateOne({ _id: req.params.id }, { $set: updatedBooking });

    // Log audit trail
    await logAudit(AuditActions.BOOKING_STATUS_UPDATED, adminId, booking.restaurantId, {
      bookingId: req.params.id,
      oldStatus,
      newStatus: status,
      updatedAt: now
    });

    // Send WhatsApp notification if phone number exists
    if (booking.phone && status !== oldStatus) {
      const user = await users.findOne({ _id: booking.userId });
      const restaurant = await restaurants.findOne({ _id: booking.restaurantId });

      if (user && restaurant) {
        await sendStatusUpdate(booking.phone, {
          status,
          restaurantName: restaurant.name,
          date: booking.date,
          tableNumber: booking.tableNumber,
          timeSlot: booking.timeSlot
        });
      }
    }

    res.json({
      message: 'Booking status updated successfully',
      booking: { ...booking, ...updatedBooking }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get booking queue for a restaurant
exports.getBookingQueue = async (req, res) => {
  try {
    const { restaurantId, date } = req.query;
    const { booking_queue, users, tables, time_slots } = getCollections();

    const query = {};
    if (restaurantId) query.restaurantId = restaurantId;
    if (date) query.date = date;

    const queue = await booking_queue.find(query).sort({ position: 1 }).toArray();

    const queueWithDetails = await Promise.all(
      queue.map(async (entry) => {
        const user = await users.findOne({ _id: entry.userId });
        const table = await tables.findOne({ _id: entry.tableId });
        const slot = await time_slots.findOne({ _id: entry.slotId });

        return {
          ...entry,
          user: user ? { _id: user._id, name: user.name, email: user.email, phone: user.phone } : null,
          table,
          slot
        };
      })
    );

    res.json({ queue: queueWithDetails });
  } catch (error) {
    console.error('Get booking queue error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { users } = getCollections();

    const allUsers = await users.find({}).sort({ createdAt: -1 }).toArray();

    const usersWithoutPasswords = allUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get audit logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { restaurantId, adminId, action, startDate, endDate } = req.query;
    const { audit_logs } = getCollections();

    const query = {};
    if (restaurantId) query.restaurantId = restaurantId;
    if (adminId) query.adminId = adminId;
    if (action) query.action = action;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const logs = await audit_logs.find(query).sort({ timestamp: -1 }).toArray();

    res.json({
      totalLogs: logs.length,
      logs
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get audit logs for specific restaurant
exports.getRestaurantAuditLogs = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { audit_logs } = getCollections();

    const logs = await audit_logs
      .find({ restaurantId })
      .sort({ timestamp: -1 })
      .toArray();

    res.json({
      restaurantId,
      totalLogs: logs.length,
      logs
    });
  } catch (error) {
    console.error('Get restaurant audit logs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get admin activity logs
exports.getAdminActivityLogs = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { audit_logs } = getCollections();

    const logs = await audit_logs
      .find({ adminId })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    res.json({
      adminId,
      totalLogs: logs.length,
      logs
    });
  } catch (error) {
    console.error('Get admin activity logs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
