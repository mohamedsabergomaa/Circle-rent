import app from './app';
import { config } from './common/config/env';

const start = () => {
  try {
    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
