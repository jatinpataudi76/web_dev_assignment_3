const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is missing. Add it to your .env file.');
  }

  const connection = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
};

module.exports = connectDB;
