import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import handleGlobalError from './controllers/error.controller';
import cors from 'cors';
import HttpError from './utils/customErrors';
import config from 'config';
import productRouter from './routers/post.router';
import authRouter from './routers/auth.router';
import { swagger } from './utils/swagger';
import { localization } from './middlewares/localization';

const app = express();

app.use(express.json({ limit: '30mb' }));
//
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.static(__dirname + '/public'));

// Api Docs
swagger(app);
// localiztion
app.use(localization);

app.get('/api/healthcheck', (req, res) => {
  res.status(200).json('Hello from api');
});

// resources routes handler
app.use('/api/v1/posts', productRouter);
app.use('/api/v1/auth', authRouter);

// not-found route handler
app.all('*', (req, res, next) => {
  const NotFoundMsg = `Can't find ${
    req.originalUrl
  } on this server, Please look at documentation ${config.get<string>(
    'API_URL'
  )}/docs`;
  next(new HttpError(NotFoundMsg, 404));
});

// global error middleware handler
app.use(handleGlobalError);

export default app;
