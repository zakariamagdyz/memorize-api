import * as authService from '../../services/auth.service';
import {
  activateAccountHanlder,
  createTokensByCredentials,
  deleteRTFromDBAndCookie,
  fireReuseDetection,
  generateTokens,
  handleOldRT,
  loginHandler,
  refreshTokenHandler,
  sendResetPasswordMail,
  signupHandler,
} from '../auth.controller';
import config from 'config';
import HttpError from '../../utils/customErrors';
import Email from '../../utils/Email';
import jwt from 'jsonwebtoken';
import { httpCode, msgs } from '../../utils/utlities';
import bcrypt from 'bcrypt';

// mock auth service and Http error
jest.mock('bcrypt');
jest.mock('../../services/auth.service.ts');
jest.mock('../../utils/customErrors');
// Email mocked moudle
const mockedSendRT = jest.fn().mockRejectedValue(new Error('Async error'));
jest.mock('../../utils/Email.ts', () => {
  return jest.fn().mockImplementation(() => {
    return {
      sendWelcomeMail: jest.fn().mockRejectedValue(new Error('Async error')),
      sendResetPasswordMail: mockedSendRT,
    };
  });
});
// this is mocking for jsonweb token module
jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn().mockReturnValue('hash123'),
    verify: jest
      .fn()
      .mockReturnValue({ name: 'zakaria', email: 'zakaria@gmail.com' }),
  };
});

const mockedResJson = jest.fn();

const expressMiddlewareParams = {
  req: {
    cookies: {},
    body: {
      name: 'zakaria magdy',
      email: 'zakaria@gmail.com',
      role: 'admin',
      password: 'password',
      activateToken: 'activate',
    },
    protocol: 'http',
  },
  res: {
    status: jest.fn().mockReturnValue({ json: mockedResJson }),
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  },
  next: jest.fn(),
};
//////////////////////////////////////////////////////
// Signup Handler
//////////////////////////////////////////////////////

describe('signup handler', () => {
  // beforeEach(() => {
  //   //eslint-disable-next-line
  //   //@ts-ignore
  //   Email.mockReset();
  // });
  it('should send email if user does not exist', async () => {
    const { req, res, next } = expressMiddlewareParams;

    //eslint-disable-next-line
    //@ts-ignore
    Email.mockImplementation(() => ({
      sendWelcomeMail: jest.fn().mockReturnValue(2),
    }));

    //eslint-disable-next-line
    //@ts-ignore
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
    Email.mockImplementation(() => ({
      sendWelcomeMail: jest.fn().mockRejectedValue(new Error('Async error')),
    }));

    //eslint-disable-next-line
    //@ts-ignore
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
    //eslint-disable-next-line
    //@ts-ignore
    await signupHandler(req, res, next);
    expect(authService.findUserByEmail).toHaveBeenCalledTimes(1);
    expect(authService.findUserByEmail).toHaveBeenCalledWith(req.body.email);
    expect(HttpError).toHaveBeenCalledTimes(1);
    expect(HttpError).toHaveBeenCalledWith(msgs.USER_EXIST, 400);
  });
});

//////////////////////////////////////////////////////
// generateTokens
//////////////////////////////////////////////////////
describe('generateTokens', () => {
  describe('Development Env', () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should generate access Token and refreshToken', async () => {
      // arrange
      const { res } = expressMiddlewareParams;
      const oldToken = 'old';
      const userData = {
        _id: '123',
        name: 'zakaria',
        email: 'email@zakaria.com',
        roles: [123],
      };
      // Act
      // eslint-disable-next-line
      //@ts-ignore
      authService.replaceRTToken = jest.fn();
      // eslint-disable-next-line
      //@ts-ignore
      await generateTokens(res, userData, oldToken);

      // assert
      expect(res.cookie).toHaveBeenCalledTimes(1);
      expect(res.cookie).toHaveBeenCalledWith('jwt', expect.any(String), {
        httpOnly: true,
        secure: false,
        maxAge: expect.any(Number),
      });
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(httpCode.OK);
      expect(mockedResJson).toHaveBeenCalledTimes(1);
      expect(mockedResJson).toHaveBeenCalledWith({
        accessToken: expect.any(String),
        user: userData,
      });
    });
  });

  describe('Production Env', () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'production';
    });
    it('should generate access Token and refreshToken', async () => {
      // arrange
      const { res } = expressMiddlewareParams;
      const oldToken = 'old';
      const userData = {
        _id: '123',
        name: 'zakaria',
        email: 'email@zakaria.com',
        roles: [123],
      };
      // Act
      // eslint-disable-next-line
      //@ts-ignore
      authService.replaceRTToken = jest.fn();
      // eslint-disable-next-line
      //@ts-ignore
      await generateTokens(res, userData, oldToken);

      // assert
      expect(res.cookie).toHaveBeenCalledTimes(1);
      expect(res.cookie).toHaveBeenCalledWith('jwt', expect.any(String), {
        httpOnly: true,
        secure: true,
        maxAge: expect.any(Number),
      });
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(httpCode.OK);
      expect(mockedResJson).toHaveBeenCalledTimes(1);
      expect(mockedResJson).toHaveBeenCalledWith({
        accessToken: expect.any(String),
        user: userData,
      });
    });
  });
});

//////////////////////////////////////////////////////
// Create Token for credentials
//////////////////////////////////////////////////////
describe('createTokensByCredentials', () => {
  it('should create new tokens if no old token exists', async () => {
    const { req, res } = expressMiddlewareParams;
    const userData = {
      _id: '123',
      name: 'zakaria',
      email: 'email@zakaria.com',
      roles: [123],
    };
    //eslint-disable-next-line
    //@ts-ignore
    generateTokens = jest.fn();

    //eslint-disable-next-line
    //@ts-ignore
    await createTokensByCredentials(req, res, userData);

    expect(generateTokens).toHaveBeenCalledTimes(1);
    expect(generateTokens).toHaveBeenCalledWith(res, userData);
  });

  it('should replace an old token if exists', async () => {
    const { req, res } = expressMiddlewareParams;
    const userData = {
      _id: '123',
      name: 'zakaria',
      email: 'email@zakaria.com',
      roles: [123],
    };
    //eslint-disable-next-line
    //@ts-ignore
    generateTokens = jest.fn();
    //eslint-disable-next-line
    //@ts-ignore
    req.cookies.jwt = 123;

    //eslint-disable-next-line
    //@ts-ignore
    await createTokensByCredentials(req, res, userData);

    expect(generateTokens).toHaveBeenCalledTimes(1);
    expect(generateTokens).toHaveBeenCalledWith(res, userData, 123);
  });
});

//////////////////////////////////////////////////////
// Create Token for credentials
//////////////////////////////////////////////////////
describe('activateAccountHandler', () => {
  it('should return tokens', async () => {
    const { req, res, next } = expressMiddlewareParams;
    // eslint-disable-next-line
    //@ts-ignore
    authService.createUser = jest.fn().mockReturnValue({ name: 'zakaria' });
    // eslint-disable-next-line
    //@ts-ignore
    createTokensByCredentials = jest.fn();

    // eslint-disable-next-line
    //@ts-ignore
    await activateAccountHanlder(req, res, next);

    expect(jwt.verify).toHaveBeenCalledTimes(1);
    expect(jwt.verify).toHaveBeenCalledWith('activate', expect.any(String));
    expect(authService.createUser).toHaveBeenCalledTimes(1);
    expect(createTokensByCredentials).toHaveBeenCalledTimes(1);
    expect(createTokensByCredentials).toHaveBeenCalledWith(req, res, {
      name: 'zakaria',
    });
  });
});

//////////////////////////////////////////////////////
// Refresh Token Handler
//////////////////////////////////////////////////////
describe('fireReuseDetection', () => {
  it('should clear all RTs of hacked user and throw cookie error', async () => {
    // arrange
    // eslint-disable-next-line
    // @ts-ignore
    authService.clearRTsForHackedUser = jest.fn();
    const { res, next } = expressMiddlewareParams;
    const oldToken = 123;
    // act
    // eslint-disable-next-line
    // @ts-ignore
    await fireReuseDetection(res, next, oldToken);

    // assert
    expect(authService.clearRTsForHackedUser).toHaveBeenCalledTimes(1);
    expect(authService.clearRTsForHackedUser).toHaveBeenCalledWith(
      'zakaria@gmail.com'
    );
    expect(res.clearCookie).toHaveBeenCalledTimes(1);
    expect(HttpError).toHaveBeenCalledTimes(1);
    expect(HttpError).toHaveBeenCalledWith(
      msgs.COOKIE_NOT_FOUND,
      httpCode.UNAUTHORIZED
    );
  });
  it('should throw an error if token is invalid', async () => {
    // arrange
    jwt.verify = jest.fn(() => {
      throw new Error('error');
    });
    const { res, next } = expressMiddlewareParams;
    const oldToken = 123;
    // eslint-disable-next-line
    // @ts-ignore
    await fireReuseDetection(res, next, oldToken);

    expect(res.clearCookie).not.toHaveBeenCalled();
    expect(HttpError).toHaveBeenCalledTimes(1);
    expect(HttpError).toHaveBeenCalledWith('error', httpCode.BAD_REQUEST);
  });
});

describe('HandleOldRt', () => {
  it('should generate token if oldToken is valid ', async () => {
    const user = { name: 'zakaria', email: 'zakaria@gmail.com' };
    jwt.verify = jest.fn().mockReturnValue(user);
    const { res, next } = expressMiddlewareParams;
    const oldToken = 123;
    // eslint-disable-next-line
    // @ts-ignore
    generateTokens = jest.fn();
    // eslint-disable-next-line
    // @ts-ignore
    await handleOldRT(res, next, user, oldToken);

    expect(generateTokens).toHaveBeenCalledTimes(1);
    expect(generateTokens).toHaveBeenCalledWith(res, user, oldToken);
  });
  it('should just return if thers is jwt manipulation ', async () => {
    const user = { name: 'zakaria', email: 'zakaria@gmail.com' };
    jwt.verify = jest.fn().mockReturnValue({ ...user, name: 'ahmed' });
    const { res, next } = expressMiddlewareParams;
    const oldToken = 123;
    // eslint-disable-next-line
    // @ts-ignore
    generateTokens = jest.fn();
    // eslint-disable-next-line
    // @ts-ignore
    await handleOldRT(res, next, user, oldToken);

    expect(generateTokens).not.toHaveBeenCalled();
  });
  it('should throw an error if cookieToken is invalid and delete it from cookie and db ', async () => {
    jwt.verify = jest.fn(() => {
      throw new Error('error');
    });
    const user = { name: 'zakaria', email: 'zakaria@gmail.com' };
    const { res, next } = expressMiddlewareParams;
    const oldToken = 123;
    // eslint-disable-next-line
    // @ts-ignore
    generateTokens = jest.fn();
    // eslint-disable-next-line
    // @ts-ignore
    await handleOldRT(res, next, user, oldToken);

    expect(generateTokens).not.toHaveBeenCalled();
    expect(HttpError).toHaveBeenCalledWith(
      msgs.COOKIE_NOT_VALID,
      httpCode.UNAUTHORIZED
    );
  });
});

describe('deleteRTFromDBAndCookie', () => {
  it('should delete rt from both', async () => {
    const { res } = expressMiddlewareParams;
    const user = { name: 'zakaria', email: 'zakaria@gmail.com' };
    const oldToken = 123;
    // eslint-disable-next-line
    //@ts-ignore
    await deleteRTFromDBAndCookie(res, user, oldToken);
    expect(res.clearCookie).toHaveBeenCalledTimes(1);
    expect(res.clearCookie).toHaveBeenCalledWith('jwt');
    expect(authService.deleteUserRT).toHaveBeenCalledWith(user, oldToken);
  });
});

describe('refreshTokenHandler', () => {
  it('should throw an error if there is no cookie token', async () => {
    const { req, res, next } = expressMiddlewareParams;
    //eslint-disable-next-line
    //@ts-ignore
    req.cookies = {};
    //eslint-disable-next-line
    //@ts-ignore
    await refreshTokenHandler(req, res, next);

    expect(HttpError).toHaveBeenCalledTimes(1);
    expect(HttpError).toHaveBeenCalledWith(
      msgs.COOKIE_NOT_FOUND,
      httpCode.UNAUTHORIZED
    );
  });

  it('should replace old RT with new One', async () => {
    const { req, res, next } = expressMiddlewareParams;
    const user = { name: 'John', email: 'email@example.com' };
    //eslint-disable-next-line
    //@ts-ignore
    authService.findUserByRT = jest.fn().mockReturnValue(user);

    //eslint-disable-next-line
    //@ts-ignore
    req.cookies = { jwt: '123' };
    //eslint-disable-next-line
    //@ts-ignore
    handleOldRT = jest.fn();
    //eslint-disable-next-line
    //@ts-ignore
    await refreshTokenHandler(req, res, next);

    expect(authService.findUserByRT).toHaveBeenCalledTimes(1);
    expect(authService.findUserByRT).toHaveBeenCalledWith('123');
    expect(handleOldRT).toHaveBeenCalledTimes(1);
    expect(handleOldRT).toHaveBeenCalledWith(res, next, user, '123');
  });

  it('should fire reuse detection if rt not belongs to a user', async () => {
    const { req, res, next } = expressMiddlewareParams;
    jest.mocked(authService.findUserByRT).mockReset();
    //eslint-disable-next-line
    //@ts-ignore
    fireReuseDetection = jest.fn();
    //eslint-disable-next-line
    //@ts-ignore
    req.cookies = { jwt: '123' };

    //eslint-disable-next-line
    //@ts-ignore
    await refreshTokenHandler(req, res, next);

    expect(fireReuseDetection).toHaveBeenCalledTimes(1);
    expect(fireReuseDetection).toHaveBeenCalledWith(res, next, '123');
  });
});
////////////////////////////////////////////////
// login  Handler
///////////////////////////////////////////////
describe('loginHandler', () => {
  it('should throw an error if no user found in DB', async () => {
    const { req, res, next } = expressMiddlewareParams;
    //eslint-disable-next-line
    //@ts-ignore
    await loginHandler(req, res, next);

    expect(HttpError).toHaveBeenCalledTimes(1);
    expect(HttpError).toHaveBeenCalledWith(
      msgs.LOGIN_FAILURE,
      httpCode.UNAUTHORIZED
    );
  });
  it("should throw an error if passwords doen't match", async () => {
    const { req, res, next } = expressMiddlewareParams;
    //eslint-disable-next-line
    //@ts-ignore
    authService.findUserByEmail = jest
      .fn()
      .mockReturnValue({ name: 'zakaria', password: 'password' });
    //eslint-disable-next-line
    //@ts-ignore
    await loginHandler(req, res, next);

    expect(bcrypt.compare).toHaveBeenCalled();
    expect(HttpError).toHaveBeenCalled();
    expect(HttpError).toHaveBeenCalledWith(
      msgs.LOGIN_FAILURE,
      httpCode.UNAUTHORIZED
    );
  });

  it('should generate tokens if all is good', async () => {
    const { req, res, next } = expressMiddlewareParams;
    const mocked = jest.mocked(bcrypt);
    //eslint-disable-next-line
    //@ts-ignore
    mocked.compare.mockReturnValue(true);
    //eslint-disable-next-line
    //@ts-ignore
    authService.findUserByEmail = jest
      .fn()
      .mockReturnValue({ name: 'zakaria', password: 'password' });

    //eslint-disable-next-line
    //@ts-ignore
    createTokensByCredentials = jest.fn();
    //eslint-disable-next-line
    //@ts-ignore
    await loginHandler(req, res, next);

    expect(bcrypt.compare).toHaveBeenCalled();
    expect(createTokensByCredentials).toHaveBeenCalled();
  });
});
////////////////////////////////////////////////
// forgot password Handler
///////////////////////////////////////////////
describe('sendResetPasswordMail', () => {
  it('should send mail if no error happend', async () => {
    const { res, next } = expressMiddlewareParams;
    const user = { name: 'John', email: 'mail@example.com' };
    const url = `${config.get('CLIENT_URL')}/resetPassword/resetToken`;
    //eslint-disable-next-line
    //@ts-ignore
    Email.mockImplementation(() => {
      return {
        sendResetPasswordMail: jest.fn(),
      };
    });
    const resetToken = 'resetToken';
    //eslint-disable-next-line
    //@ts-ignore
    await sendResetPasswordMail(res, next, user, resetToken);

    expect(Email).toHaveBeenCalledTimes(1);
    expect(Email).toHaveBeenCalledWith(
      {
        firstName: user.name,
        email: user.email,
      },
      url
    );
    expect(res.status).toHaveBeenCalledWith(httpCode.OK);
  });

  it('should throw an error if email not sent', async () => {
    const { res, next } = expressMiddlewareParams;
    const user = { name: 'John', email: 'mail@example.com' };
    const resetToken = 'resetToken';

    //eslint-disable-next-line
    //@ts-ignore
    Email.mockImplementation(() => {
      return jest.fn().mockReturnValue({
        sendResetPasswordMail: jest.fn(() => {
          throw new Error('email not sent');
        }),
      });
    });

    //eslint-disable-next-line
    //@ts-ignore
    await sendResetPasswordMail(res, next, user, resetToken);

    expect(res.status).not.toHaveBeenCalled();
    expect(HttpError).toHaveBeenCalled();
    expect(HttpError).toHaveBeenCalledWith(
      msgs.EMAIL_FAILURE,
      httpCode.SERVER_ERROR
    );
  });
});
