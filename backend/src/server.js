import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

// Catch uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION! Shutting down...]', err.name, err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
async function startServer() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`\n============================================================`);
    console.log(`🚀 Baton Backend Server listening on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`============================================================\n`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('[UNHANDLED REJECTION! Shutting down gracefully...]', err);
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle termination signals
  process.on('SIGTERM', () => {
    console.log('[SIGTERM RECEIVED] Shutting down server gracefully');
    server.close(() => {
      console.log('[Process terminated]');
    });
  });
}

startServer();

