require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const stallRoutes = require('./routes/stalls');
const playerRoutes = require('./routes/players');
const userRoutes = require('./routes/users');
const giftCounterRoutes = require('./routes/giftCounter');
const itemRoutes = require('./routes/items');

const app = express();

app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectToMongo();
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', name: 'Harvest Fest Arcade API' }));

app.use('/api/auth', authRoutes);
app.use('/api/stalls', stallRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gift-counter', giftCounterRoutes);
app.use('/api/items', itemRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

let mongoConnection;

function connectToMongo() {
  if (!MONGO_URI) {
    return Promise.reject(new Error('MONGO_URI is not configured.'));
  }

  if (!mongoConnection) {
    mongoConnection = mongoose.connect(MONGO_URI).catch((err) => {
      mongoConnection = undefined;
      throw err;
    });
  }

  return mongoConnection;
}

app.use((err, req, res, next) => {
  console.error('MongoDB connection error:', err.message);
  res.status(500).json({ message: 'Database connection failed.' });
});

module.exports = app;

if (require.main === module) {
  connectToMongo()
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => console.log(`Harvest Fest Arcade API running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    });
}
