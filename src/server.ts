import app from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
  console.log(`\n🚀 Bookshelf API running on http://localhost:${config.port}`);
  console.log(`📚 Environment: ${config.nodeEnv}`);
  console.log(`❤️  Health check: http://localhost:${config.port}/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
