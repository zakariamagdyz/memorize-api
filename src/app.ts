import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import handleGlobalError from './controllers/error.controller';
import cors from 'cors';
import HttpError from './utils/customErrors';
import config from 'config';
import productRouter from './routers/product.router';
import authRouter from './routers/auth.router';
import { swagger } from './utils/swagger';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
//app.use(cors());
app.use(express.static(__dirname + '/public'));

// Api Docs
swagger(app);

app.get('/api/healthcheck', (req, res) => {
  res.status(200).json('Hello from api');
});

// resources routes handler
app.use('/api/v1/products', productRouter);
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
