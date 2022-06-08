import { RequestHandler } from 'express';
import HttpError from '../utils/customErrors';
import { httpCode, msgs } from '../utils/utlities';

const verifyRoles =
  (...roles: number[]): RequestHandler =>
  (req, res, next) => {
    const userRoles = res.locals?.user?.roles as number[];
    if (!roles.some((role) => userRoles.includes(role))) {
      return next(new HttpError(msgs.ROLE_ERROR, httpCode.FORBIDDEN));
    }
    return next();
  };

export default verifyRoles;
