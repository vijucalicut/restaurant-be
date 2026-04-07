const { MongoClient } = require('mongodb');

const mongoConnectionString = process.env.MONGODB_CONNECTION_STRING || 'YOUR_MONGODB_CONNECTION_STRING';
const databaseId = 'restaurantdb';

const client = new MongoClient(mongoConnectionString);
let database;

async function connectDB() {
  try {
    await client.connect();
    database = client.db(databaseId);
    console.log('Connected to MongoDB');

    // Create collections if they don't exist
    const collectionNames = ['restaurants', 'users', 'tables', 'time_slots', 'bookings', 'booking_queue', 'audit_logs'];
    for (const collectionName of collectionNames) {
      const collectionExists = await database
        .listCollections({ name: collectionName })
        .toArray();

      if (collectionExists.length === 0) {
        await database.createCollection(collectionName);
        console.log(`Created collection: ${collectionName}`);
      }
    }
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

function getDatabase() {
  return database;
}

function getCollections() {
  return {
    restaurants: database.collection('restaurants'),
    users: database.collection('users'),
    tables: database.collection('tables'),
    time_slots: database.collection('time_slots'),
    bookings: database.collection('bookings'),
    booking_queue: database.collection('booking_queue'),
    audit_logs: database.collection('audit_logs')
  };
}

module.exports = { connectDB, getDatabase, getCollections, client };
