const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🎉 Connected to MongoDB database!');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1); // Exit if we can't connect
  }
};

module.exports = connectDB;