require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const { connectDB } = require('./src/config/database');
const swaggerDefinition = require('./swagger-def');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Restaurant API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', userRoutes);

// Start server
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs\n`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});