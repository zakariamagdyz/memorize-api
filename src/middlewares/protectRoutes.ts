import catchAsync from '../utils/catchAsync';
import HttpError from '../utils/customErrors';
import { httpCode } from '../utils/utlities';
import config from 'config';
import jwt from 'jsonwebtoken';

const protectRoutes = catchAsync(async (req, res, next) => {
  // 1- Get AT from Headers
  const authHeader = req.headers.authorization || req.headers.Authorization;
  // 2- Check for AT validatiaon
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer')) {
    return next(
      new HttpError(res.locals.t['NOT_LOGGED_IN'], httpCode.UNAUTHORIZED)
    );
  }
  // 3- Verify AT
  try {
    const decoded = jwt.verify(
      authHeader.split(' ')[1],
      config.get('ACCESS_TOKEN_SECRET')
    );
    // 4- Move to next Middlware
    res.locals.user = decoded;
    next();
  } catch (error) {
    // throw other types of erros
    if (!(error instanceof Error) || error.name !== 'TokenExpiredError')
      throw error;
    // if AT expired return upgrade token error
    return next(new HttpError(res.locals.t['UPGRADE_AT'], httpCode.UPGRADE_AT));
  }
});

export default protectRoutes;
