import * as authService from '../../services/auth.service';
import { Request, Response, NextFunction } from 'express';
import { signupHandler } from '../auth.controller';
import HttpError from '../../utils/customErrors';
import Email from '../../utils/Email';

// mock auth service and Http error
jest.mock('../../services/auth.service.ts');
jest.mock('../../utils/customErrors');
jest.mock('../../utils/Email.ts');

jest.mock('jsonwebtoken');

const expressMiddlewareParams = {
  req: {
    body: {
      name: 'zakaria magdy',
      email: 'zakaria@gmail.com',
      role: 'admin',
      password: 'password',
    },
    protocol: 'http',
  },
  res: {},
  next: jest.fn(),
} as unknown as {
  req: Request;
  res: Response;
  next: NextFunction;
};

import jwt from 'jsonwebtoken';
import { msgs } from '../../utils/utlities';
describe('signup handler', () => {
  it('should send email if user does not exist', async () => {
    const { req, res, next } = expressMiddlewareParams;
    //eslint-disable-next-line
    //@ts-ignore
    jwt.sign.mockReturnValue('hash123');

    await signupHandler(req, res, next);

    expect(authService.findUserByEmail).toHaveBeenCalledTimes(1);
    expect(authService.findUserByEmail).toHaveBeenCalledWith(req.body.email);
    expect(jwt.sign).toHaveBeenCalledTimes(1);
    expect(Email).toHaveBeenCalledTimes(1);
    expect(Email).toHaveBeenCalledWith(
      {
        firstName: 'zakaria',
        email: req.body.email,
      },
      'http://localhost:3000/activate-account/hash123'
    );
  });

  it('should throw an error if email not sent', async () => {
    const { req, res, next } = expressMiddlewareParams;
    //eslint-disable-next-line
    //@ts-ignore
    Email.mockImplementation(() => {
      return {
        sendWelcomeMail: jest.fn().mockRejectedValue(new Error('Async error')),
      };
    });

    await signupHandler(req, res, next);

    expect(authService.findUserByEmail).toHaveBeenCalledTimes(1);
    expect(authService.findUserByEmail).toHaveBeenCalledWith(req.body.email);
    expect(jwt.sign).toHaveBeenCalledTimes(1);

    expect(HttpError).toHaveBeenCalledTimes(1);
    expect(HttpError).toHaveBeenCalledWith(msgs.EMAIL_FAILURE, 500);
  });

  it('should throw an error if user exists', async () => {
    const { req, res, next } = expressMiddlewareParams;
    //eslint-disable-next-line
    //@ts-ignore
    authService.findUserByEmail.mockReturnValue(req.body);

    await signupHandler(req, res, next);
    expect(authService.findUserByEmail).toHaveBeenCalledTimes(1);
    expect(authService.findUserByEmail).toHaveBeenCalledWith(req.body.email);
    expect(HttpError).toHaveBeenCalledTimes(1);
    expect(HttpError).toHaveBeenCalledWith(msgs.USER_EXIST, 400);
  });
});
