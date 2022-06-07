import mongoose from 'mongoose';
import config from 'config';
import logger from './logger';

export default function connect() {
  const db_uri = config.get<string>('DB_URI');
  mongoose
    .connect(db_uri)
    .then(() => logger.info('DB connected successfully'))
    .catch((e) => {
      logger.error('DB faild to connect');
      logger.error(e);
      process.exit(1);
    });
}
