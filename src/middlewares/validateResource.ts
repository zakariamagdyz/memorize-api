import { AnyZodObject } from 'zod';
import { RequestHandler } from 'express';

const validate =
  (schema: AnyZodObject): RequestHandler =>
  (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      next(error);
    }
  };

export default validate;
