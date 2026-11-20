require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Product = require('../models/Product');
const sampleProducts = require('./sampleProducts');

const seedDatabase = async () => {
  try {
    await connectDB();

    const deleted = await Product.deleteMany({});
    console.log(`Cleared ${deleted.deletedCount} existing products.`);

    const products = await Product.insertMany(sampleProducts);
    const lowStockCount = products.filter((product) => product.quantity <= product.reorderLevel).length;

    console.log(`Inserted ${products.length} products.`);
    console.log(`Low-stock products in this data set: ${lowStockCount}`);
    console.log('Sample data is ready. Start the server with: npm run dev');
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedDatabase();
