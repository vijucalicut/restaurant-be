const { getCollections } = require('../config/database');
const { sendBookingConfirmation, sendQueueNotification } = require('../utils/whatsappService');

// Get time slots for a restaurant
exports.getSlots = async (req, res) => {
  try {
    const { date, restaurantId } = req.query;
    const { time_slots } = getCollections();

    if (!date || !restaurantId) {
      return res.status(400).json({ message: 'Date and restaurant ID are required' });
    }

    const slots = await time_slots.find({ date, restaurantId, isActive: true }).sort({ startTime: 1 }).toArray();
    res.json({ slots });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get available tables for a restaurant
exports.getAvailableTables = async (req, res) => {
  try {
    const { date, slotId, restaurantId } = req.query;
    const { tables, bookings } = getCollections();

    if (!date || !slotId || !restaurantId) {
      return res.status(400).json({ message: 'Date, slot ID, and restaurant ID are required' });
    }

    const allTables = await tables.find({ restaurantId, isActive: true, bookingEnabled: true }).toArray();
    const reservedBookings = await bookings.find({
      restaurantId,
      date,
      slotId,
      status: { $in: ['confirmed', 'pending'] }
    }).toArray();

    const bookedTableIds = reservedBookings.map(b => b.tableId);
    const availableTables = allTables.filter(t => !bookedTableIds.includes(t._id));

    res.json({ tables: availableTables });
  } catch (error) {
    console.error('Get available tables error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create booking with queue management
exports.createBooking = async (req, res) => {
  try {
    const { tableId, slotId, date, numberOfGuests, restaurantId, phone } = req.body;
    const { tables, time_slots, bookings, booking_queue, restaurants } = getCollections();

    if (!tableId || !slotId || !date || !numberOfGuests || !restaurantId) {
      return res.status(400).json({ message: 'Table ID, slot ID, date, number of guests, and restaurant ID are required' });
    }

    // Check restaurant
    const restaurant = await restaurants.findOne({ _id: restaurantId });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check table
    const table = await tables.findOne({ _id: tableId, restaurantId });
    if (!table || !table.isActive || !table.bookingEnabled) {
      return res.status(400).json({ message: 'Table not available' });
    }

    // Check slot
    const slot = await time_slots.findOne({ _id: slotId, restaurantId });
    if (!slot || !slot.isActive) {
      return res.status(400).json({ message: 'Time slot not available' });
    }

    // Check capacity
    if (numberOfGuests > table.capacity) {
      return res.status(400).json({ message: 'Number of guests exceeds table capacity' });
    }

    // Check if table is already booked
    const existingBooking = await bookings.findOne({
      tableId,
      slotId,
      date,
      restaurantId,
      status: { $in: ['confirmed', 'pending'] }
    });

    if (existingBooking) {
      // Add to queue
      const queueCount = await booking_queue.countDocuments({ restaurantId, date, slotId });
      const queueEntry = {
        _id: Date.now().toString(),
        userId: req.user.id,
        restaurantId,
        tableId,
        slotId,
        date,
        numberOfGuests,
        phone,
        position: queueCount + 1,
        status: 'queued',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await booking_queue.insertOne(queueEntry);

      // Send queue notification
      if (phone) {
        await sendQueueNotification(phone, {
          restaurantName: restaurant.name,
          position: queueEntry.position,
          estimatedWait: queueEntry.position * 15, // 15 minutes per position
          token: queueEntry._id
        });
      }

      return res.status(201).json({
        message: 'Table is booked. You have been added to the queue.',
        booking: queueEntry,
        inQueue: true
      });
    }

    // Create confirmed booking
    const booking = {
      _id: Date.now().toString(),
      userId: req.user.id,
      restaurantId,
      tableId,
      slotId,
      date,
      numberOfGuests,
      phone,
      status: 'confirmed',
      token: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await bookings.insertOne(booking);

    // Send WhatsApp confirmation
    if (phone) {
      await sendBookingConfirmation(phone, {
        restaurantName: restaurant.name,
        tableNumber: table.tableNumber,
        date,
        timeSlot: slot.startTime,
        numberOfGuests,
        token: booking.token
      });
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const { bookings, tables, time_slots, restaurants } = getCollections();

    const query = { userId: req.user.id };
    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    const userBookings = await bookings.find(query).sort({ createdAt: -1 }).toArray();

    const bookingsWithDetails = await Promise.all(
      userBookings.map(async (booking) => {
        const table = await tables.findOne({ _id: booking.tableId });
        const slot = await time_slots.findOne({ _id: booking.slotId });
        const restaurant = await restaurants.findOne({ _id: booking.restaurantId });

        return { ...booking, table, slot, restaurant };
      })
    );

    res.json({ bookings: bookingsWithDetails });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { bookings, booking_queue } = getCollections();

    const booking = await bookings.findOne({ _id: req.params.id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // If cancelling a confirmed booking, check if there's a queue to promote
    if (booking.status === 'confirmed') {
      const nextInQueue = await booking_queue.findOneAndUpdate(
        {
          restaurantId: booking.restaurantId,
          tableId: booking.tableId,
          slotId: booking.slotId,
          date: booking.date,
          status: 'queued'
        },
        {
          $set: {
            status: 'confirmed',
            updatedAt: new Date().toISOString()
          }
        },
        { sort: { position: 1 }, returnDocument: 'after' }
      );

      if (nextInQueue.value) {
        // Move queue entry to bookings
        const promotedBooking = {
          _id: nextInQueue.value._id,
          userId: nextInQueue.value.userId,
          restaurantId: nextInQueue.value.restaurantId,
          tableId: nextInQueue.value.tableId,
          slotId: nextInQueue.value.slotId,
          date: nextInQueue.value.date,
          numberOfGuests: nextInQueue.value.numberOfGuests,
          phone: nextInQueue.value.phone,
          status: 'confirmed',
          token: nextInQueue.value._id,
          createdAt: nextInQueue.value.createdAt,
          updatedAt: new Date().toISOString()
        };

        await bookings.insertOne(promotedBooking);
        await booking_queue.deleteOne({ _id: nextInQueue.value._id });

        // Update remaining queue positions
        await booking_queue.updateMany(
          {
            restaurantId: booking.restaurantId,
            tableId: booking.tableId,
            slotId: booking.slotId,
            date: booking.date,
            position: { $gt: nextInQueue.value.position }
          },
          { $inc: { position: -1 } }
        );
      }
    }

    await bookings.deleteOne({ _id: req.params.id });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's queue position
exports.getQueuePosition = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const { booking_queue } = getCollections();

    const query = { userId: req.user.id };
    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    const queueEntries = await booking_queue.find(query).sort({ createdAt: -1 }).toArray();

    res.json({ queue: queueEntries });
  } catch (error) {
    console.error('Get queue position error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get restaurants list
exports.getRestaurants = async (req, res) => {
  try {
    const { restaurants } = getCollections();

    const restaurantList = await restaurants.find({ isActive: true }).toArray();

    res.json({ restaurants: restaurantList });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
