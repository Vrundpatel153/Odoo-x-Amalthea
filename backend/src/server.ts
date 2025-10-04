import 'dotenv/config';
import { connectDB } from './config/db';
import logger from './config/logger';
import app from './app';

const PORT = parseInt(process.env.PORT || '4000', 10);

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server', { err });
    process.exit(1);
  }
}

start();
