require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();


// =========================
// ✅ ENV CHECK (IMPORTANT)
// =========================
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is missing in environment variables');
}


// =========================
// ✅ MIDDLEWARES
// =========================
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || '*', // allow all for now (fix later)
    credentials: true,
  })
);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// =========================
// ✅ HEALTH + ROOT ROUTES
// =========================
app.get('/', (req, res) => {
  res.send('🚀 TaskFlow API is running');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});


// =========================
// ✅ API ROUTES
// =========================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);


// =========================
// ✅ ERROR HANDLING
// =========================
app.use(notFound);
app.use(errorHandler);


// =========================
// ✅ DATABASE + SERVER START
// =========================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1); // stop app if DB fails
  }
};

startServer();


// =========================
// ✅ SAFE ERROR HANDLING
// =========================
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
});
