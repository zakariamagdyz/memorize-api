import { IHttpError, IServiceError } from './types/utilites';

export default class HttpError extends Error implements IHttpError {
  public isOperational: boolean;
  public status: string;
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
  }
}

export class ServiceError extends Error implements IServiceError {
  public name: string;
  constructor(public message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
