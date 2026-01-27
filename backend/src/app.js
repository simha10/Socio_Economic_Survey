const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  console.log('[REQUEST]', new Date().toISOString(), req.method, req.path);
  
  // Log request body for certain routes
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    console.log('[REQUEST-BODY]', req.body);
  }
  
  // Continue with the request
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    console.log('[RESPONSE]', new Date().toISOString(), req.method, req.path, res.statusCode, `${duration}ms`);
    return originalSend.call(this, data);
  };
  
  next();
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const surveyRoutes = require('./routes/survey/surveyRoutes');
const exportRoutes = require('./routes/exportRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/export', exportRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Socio-Economic Survey API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Socio-Economic-Survey')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });

module.exports = app;