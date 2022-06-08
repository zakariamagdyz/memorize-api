import express from 'express';
import {
  activateAccountHanlder,
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  resetPasswordHandler,
  signupHandler,
  updatePasswordHandler,
} from '../controllers/auth.controller';
import protectRoutes from '../middlewares/protectRoutes';
import validate from '../middlewares/validateResource';
import {
  activateAccountSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  userSchema,
} from '../schemas/auth.schema';

const Router = express.Router();

/////////////
// Routes
/////////////

Router.post('/signup', validate(userSchema), signupHandler);
Router.post(
  '/activate-account',
  validate(activateAccountSchema),
  activateAccountHanlder
);

Router.post('/login', validate(loginSchema), loginHandler);
Router.get('/refresh-token', refreshTokenHandler);
Router.get('/logout', logoutHandler);
Router.patch(
  '/forgot-password',
  validate(forgotPasswordSchema),
  forgotPasswordHandler
);
Router.patch(
  '/reset-password/:resetToken',
  validate(resetPasswordSchema),
  resetPasswordHandler
);
Router.patch(
  '/update-my-password',
  protectRoutes,
  validate(updatePasswordSchema),
  updatePasswordHandler
);

export default Router;
