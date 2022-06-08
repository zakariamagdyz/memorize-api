/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { CastError } from 'mongoose';
import HttpError from '../utils/customErrors';
import logger from '../utils/logger';
import WinstonLogger from '../utils/loggerService';
import { IHttpError } from '../utils/types/utilites';
import { httpCode } from '../utils/utlities';

const genericErrorMsg = 'Something went wrong';

// DB ERRORS

const handleCastErrorDB = (err: any) => {
  const errorMsg = `Invalid ${err.path} : ${err.value}`;
  return new HttpError(errorMsg, httpCode.BAD_REQUEST);
};
const handleValidationErrorDB = (err: any) => {
  const errorsArray = Object.values(err.errors).map((err: any) => err.message);
  const errMsg = `Invalid Data : ${errorsArray.join('. ')}`;
  return new HttpError(errMsg, httpCode.BAD_REQUEST);
};
const handleDuplicateErrorDB = (err: any) => {
  const errMsg = `Invalid Duplicate value: ${err.keyValue.name}, Please try anothre value`;
  return new HttpError(errMsg, httpCode.BAD_REQUEST);
};
// ZOD ERROR
const handleZodError = (err: any) => {
  const errArr = err.errors.map((err: any) => err.message);
  const errMsg = errArr.join(', ');
  return new HttpError(errMsg, httpCode.BAD_REQUEST);
};

// NOT FOUND ERROR
const handleNotFoundError = (err: any) => {
  return new HttpError(err.message, httpCode.BAD_REQUEST);
};
// JWT ERRORS
const handleJwtError = () =>
  new HttpError('Invalid token. Please login again!', httpCode.UNAUTHORIZED);

const handleJWTExpired = () =>
  new HttpError(
    'Your token has expired. Please log in again!',
    httpCode.UNAUTHORIZED
  );

/////////////////////////////////////////

const sendErrorForDev = (HttpError: IHttpError, res: Response) => {
  res.status(HttpError.statusCode);
  res.json({
    status: HttpError.status,
    statuCode: HttpError.statusCode,
    message: HttpError.message,
    stack: HttpError.stack,
  });
};

const sendErrorForProd = (HttpError: IHttpError, res: Response) => {
  if (HttpError.isOperational) {
    res.status(HttpError.statusCode);
    return res.json({
      status: HttpError.status,
      message: HttpError.message,
    });
  }
  logger.error('Error💥💥', HttpError);
  res.status(HttpError.statusCode);
  return res.json({ status: HttpError.status, message: genericErrorMsg });
};

export default function (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let HttpError: any = {};
  if (err instanceof Error) {
    HttpError = Object.assign(err);
    HttpError.statusCode = HttpError.statusCode || 500;
    HttpError.status = HttpError.status || 'error';
  }

  if (process.env.NODE_ENV !== 'production') {
    new WinstonLogger('dev-errors').error(HttpError.message, HttpError);
    return sendErrorForDev(HttpError, res);
  }

  if (HttpError.name === 'ValidationError')
    HttpError = handleValidationErrorDB(HttpError);
  if (HttpError.name === 'CastError')
    HttpError = handleCastErrorDB(err as CastError);
  if (HttpError.name === 'NotFoundError')
    HttpError = handleNotFoundError(HttpError);
  if (HttpError.name === 'ZodError') HttpError = handleZodError(HttpError);
  if (HttpError.code === 11000) HttpError = handleDuplicateErrorDB(HttpError);
  if (HttpError.name === 'JsonWebTokenError') HttpError = handleJwtError();
  if (HttpError.name === 'TokenExpiredError') HttpError = handleJWTExpired();

  new WinstonLogger('prod-errors').error(HttpError.message, HttpError);

  return sendErrorForProd(HttpError, res);
}
