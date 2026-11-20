require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Inventory Management API is running',
    endpoints: {
      products: '/api/products',
      lowStock: '/api/products/low-stock',
      summary: '/api/products/summary',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

app.use('/api/products', productRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

  server.on('error', (error) => {
    console.error(`Server error: ${error.message}`);
    process.exit(1);
  });

  const closeServer = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => closeServer('SIGINT'));
  process.on('SIGTERM', () => closeServer('SIGTERM'));
};

startServer().catch((error) => {
  console.error(`Could not start the server: ${error.message}`);
  process.exit(1);
});
