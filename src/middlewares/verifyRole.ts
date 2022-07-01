import { RequestHandler } from 'express';
import HttpError from '../utils/customErrors';
import { httpCode } from '../utils/utlities';

const verifyRoles =
  (...roles: number[]): RequestHandler =>
  (req, res, next) => {
    const userRoles = res.locals?.user?.roles as number[];
    if (!roles.some((role) => userRoles.includes(role))) {
      return next(
        new HttpError(res.locals.t['ROLE_ERROR'], httpCode.FORBIDDEN)
      );
    }
    return next();
  };

export default verifyRoles;
