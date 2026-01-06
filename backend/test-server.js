require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test auth route
app.post('/auth/test', (req, res) => {
  res.json({ message: 'Auth endpoint working', body: req.body });
});

// MongoDB connection test
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/internalPortal")
  .then(() => {
    console.log('✅ MongoDB Connected');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Test server running on port ${PORT}`);
      console.log(`🔗 Test health: http://localhost:${PORT}/health`);
      console.log('🧪 Ready for testing');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });