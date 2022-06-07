import { NextFunction, Request, Response } from 'express';
import HttpError, { ServiceError } from '../../utils/customErrors';
import errorHandler from '../error.controller';

type TerrorParams = {
  err: unknown;
  req: Request;
  res: Response;
  next: NextFunction;
};

const errrorParams = {
  err: {},
  req: {},
  res: {
    status: jest.fn(),
    json: jest.fn(),
  },
  next: jest.fn(),
} as unknown as TerrorParams;

afterEach(() => {
  process.env.NODE_ENV = 'test';
});

describe('send error for development environment', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development';
  });
  it('should return status code with error message', () => {
    const { req, res, next } = errrorParams;
    errrorParams.err = new HttpError('dev Error', 400);

    // Act
    errorHandler(errrorParams.err, req, res, next);
    // assertions
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
  });
});

describe('send error for production environment', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'production';
  });
  it("should return status code with error message if it's an HttpError", () => {
    const { req, res, next } = errrorParams;
    errrorParams.err = new HttpError('dev Error', 400);

    // act
    errorHandler(errrorParams.err, req, res, next);
    // assert
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'dev Error',
    });
  });

  it("should return status code with generic error message if it's a generic error", () => {
    const { req, res, next } = errrorParams;
    errrorParams.err = new Error('generic error');

    // act
    errorHandler(errrorParams.err, req, res, next);
    // assert
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Something went wrong',
    });
  });

  it('should handle ZodErrors', () => {
    const { req, res, next } = errrorParams;
    errrorParams.err = new Error('error');
    const zodError = Object.assign(errrorParams.err, {
      name: 'ZodError',
      errors: [{ message: 'zodError_1' }, { message: 'zodError_2' }],
    });

    // act
    errorHandler(zodError, req, res, next);
    // assert
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'zodError_1, zodError_2',
    });
  });

  it('should handle ValidationErrorDB', () => {
    const { req, res, next } = errrorParams;
    errrorParams.err = new Error('error');
    const ValidationError = Object.assign(errrorParams.err, {
      name: 'ValidationError',
      errors: {
        err1: { message: 'validation_1' },
        err2: { message: 'validation_2' },
      },
    });

    // act
    errorHandler(ValidationError, req, res, next);
    // assert
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Invalid Data : validation_1. validation_2',
    });
  });

  it('should handle CastErrorDB', () => {
    const { req, res, next } = errrorParams;
    errrorParams.err = new Error('error');
    const CastErrorDB = Object.assign(errrorParams.err, {
      name: 'CastError',
      path: 'id',
      value: '123d',
    });

    // act
    errorHandler(CastErrorDB, req, res, next);
    // assert
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Invalid id : 123d',
    });
  });

  it('should handle DuplicateErrorDB', () => {
    const { req, res, next } = errrorParams;
    errrorParams.err = new Error('error');
    const DuplicateErrorDB = Object.assign(errrorParams.err, {
      code: 11000,
      keyValue: {
        name: 'email',
      },
    });

    // act
    errorHandler(DuplicateErrorDB, req, res, next);
    // assert
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Invalid Duplicate value: email, Please try anothre value',
    });
  });

  it('should handle serviceError', () => {
    const { req, res, next } = errrorParams;
    errrorParams.err = new ServiceError('Doc not found');

    // act
    errorHandler(errrorParams.err, req, res, next);
    // assert
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Doc not found',
    });
  });
});
