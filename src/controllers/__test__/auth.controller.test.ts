import * as authService from '../../services/auth.service';
import {
  activateAccountHanlder,
  createTokensByCredentials,
  deleteRTFromDBAndCookie,
  fireReuseDetection,
  generateTokens,
  handleOldRT,
  signupHandler,
} from '../auth.controller';
import HttpError from '../../utils/customErrors';
import Email from '../../utils/Email';
import jwt from 'jsonwebtoken';
import { httpCode, msgs } from '../../utils/utlities';

// mock auth service and Http error
jest.mock('../../services/auth.service.ts');
jest.mock('../../utils/customErrors');
jest.mock('../../utils/Email.ts', () => {
  return jest.fn().mockImplementation(() => {
    return {
      sendWelcomeMail: jest.fn().mockRejectedValue(new Error('Async error')),
    };
  });
});

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
