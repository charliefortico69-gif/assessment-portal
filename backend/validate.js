require('dotenv').config();

// Validate environment variables
console.log('🔍 Validating environment variables...');

const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  process.exit(1);
}

console.log('✅ Environment variables validated');
console.log('📊 JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
console.log('📊 MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Missing');
console.log('📊 PORT:', process.env.PORT || '5001');
console.log('📊 NODE_ENV:', process.env.NODE_ENV || 'development');

// Test MongoDB connection
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB connection...');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful');
    console.log('📊 Database:', mongoose.connection.name);
    mongoose.connection.close();
    console.log('✅ Startup validation complete - server should start successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });