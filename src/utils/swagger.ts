import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import logger from './logger';
import config from 'config';
import { Express, Request, Response } from 'express';

const options: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MY-Api',
      description: 'Moment Api with refreshToken and accessToken',
      version: 'v1',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
        },
      },
      // setup global auth
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
    },
  },

  apis: ['./src/routers/*.ts', './src/schemas/*.ts'],
};

const swaggerDoc = swaggerJsDoc(options);

export const swagger = (app: Express) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
  app.get('/docs.json', (req: Request, res: Response) => {
    res.send(swaggerDoc);
  });

  logger.info(`Doc avaliable at ${config.get('API_URL')}/docs`);
};
