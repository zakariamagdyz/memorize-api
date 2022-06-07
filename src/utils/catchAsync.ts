import { RequestHandler } from 'express';
import { catchFn } from './types/utilites';

export default function (fn: catchFn): RequestHandler {
  return function (req, res, next) {
    return fn(req, res, next).catch(next);
  };
}
