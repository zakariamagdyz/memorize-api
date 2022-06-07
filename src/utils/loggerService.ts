import winston from 'winston';

const dateFormat = () => new Date(Date.now()).toLocaleString();

export default class WinstonLogger {
  private logger: winston.Logger;
  constructor(private route: string) {
    this.route = route;
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.printf((info) => {
        let message = `${dateFormat()} | ${info.level} | ${info.message}`;

        message = info.obj
          ? message.concat(` data: ${JSON.stringify(info.obj)}`)
          : message;

        return message;
      }),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: `./src/logs/${route}.log` }),
      ],
    });
  }

  info(msg: string, obj: unknown) {
    return obj
      ? this.logger.log('info', msg, { obj })
      : this.logger.log('info', msg);
  }

  error(msg: string, obj: unknown) {
    return obj
      ? this.logger.log('error', msg, { obj })
      : this.logger.log('error', msg);
  }
  debug(msg: string, obj: unknown) {
    return obj
      ? this.logger.log('debug', msg, { obj })
      : this.logger.log('debug', msg);
  }
}
