import app from './app';
import config from 'config';
import connect from './utils/connect';
import logger from './utils/logger';

const port = config.get<number>('PORT');

process.on('uncaughtException', (err) => {
  logger.error(err.name, err.message);
  logger.error('uncaughtException');
  process.exit(1);
});

const server = app.listen(port, '0.0.0.0', () => {
  logger.info(`App running at http://localhost:${port}`);
  connect();
});

process.on('unhangledRejection', (err) => {
  logger.error(err.name, err.message);
  logger.error('unhangledRejection');
  server.close(() => {
    process.exit(1);
  });
});
