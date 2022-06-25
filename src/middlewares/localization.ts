import { RequestHandler } from 'express';
import ar from '../utils/localization/ar.json';
import en from '../utils/localization/en.json';

export const localization: RequestHandler = (req, res, next) => {
  let lang = req.headers['accept-language'] || req.headers['Accept-language'];
  lang = lang === 'ar-EG' ? 'ar' : 'en';

  res.locals.t = lang === 'ar' ? ar : en;

  next();
};
