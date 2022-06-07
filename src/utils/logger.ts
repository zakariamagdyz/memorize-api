import pino from 'pino';
import pretty from 'pino-pretty';

const logger = pino(
  pretty({
    sync: true,
    translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
    ignore: 'pid,hostname',
  })
);

export default logger;
