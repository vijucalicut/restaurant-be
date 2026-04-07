require('dotenv').config();
const { getCollections, connectDB } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    await connectDB();
    const { users, restaurants } = getCollections();

    // Check if admin already exists
    const existingAdmin = await users.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // Create admin user
      const adminUser = {
        _id: 'admin_' + Date.now().toString(),
        email: 'admin@restaurant.com',
        password: hashedPassword,
        name: 'Administrator',
        phone: '+1234567890',
        role: 'admin',
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await users.insertOne(adminUser);
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@restaurant.com');
      console.log('🔐 Password: admin123\n');
    }

    // Check if sample restaurants exist
    const existingRestaurants = await restaurants.countDocuments();

    if (existingRestaurants === 0) {
      // Create sample restaurants
      const sampleRestaurants = [
        {
          _id: 'restaurant_1',
          name: 'Bella Vista Restaurant',
          address: '123 Main Street, Downtown',
          phone: '+1-555-0123',
          email: 'info@bellavista.com',
          description: 'Fine dining Italian restaurant with authentic cuisine',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'restaurant_2',
          name: 'Ocean Blue Seafood',
          address: '456 Harbor View, Waterfront',
          phone: '+1-555-0456',
          email: 'reservations@oceanblue.com',
          description: 'Fresh seafood restaurant with ocean views',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      await restaurants.insertMany(sampleRestaurants);
      console.log('✅ Sample restaurants created successfully');
      console.log('🏪 Restaurants: Bella Vista Restaurant, Ocean Blue Seafood\n');
    } else {
      console.log('✅ Sample restaurants already exist');
    }

    console.log('🎉 Database initialization completed successfully!');
    console.log('📋 Available collections: users, restaurants, tables, time_slots, bookings, booking_queue');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();