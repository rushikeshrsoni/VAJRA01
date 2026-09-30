import { app } from './app.js';
import { env } from './config/env.js';
import { runMigrations } from './db/migrate.js';

const startServer = async () => {
  try {
    // Ensure database schema is migrated
    await runMigrations();

    app.listen(env.PORT, () => {
      console.log(`🌾 CropPilot AI Server running on port ${env.PORT} [${env.NODE_ENV}]`);
      console.log(`📡 Health check: http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
