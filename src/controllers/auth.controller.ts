import { NextFunction, Request, Response } from 'express';
import { zodUserSchema } from '../schemas/auth.schema';
import {
  clearResetToken,
  clearRTsForHackedUser,
  createResetToken,
  createUser,
  deleteUserRT,
  findUserByResetToken,
  findUserByEmail,
  findUserByRT,
  replaceRTToken,
  updatePassword,
  activateUserAccount,
  deleteUserFromDB,
} from '../services/auth.service';
import catchAsync from '../utils/catchAsync';
import HttpError from '../utils/customErrors';
import { httpCode, selectFields } from '../utils/utlities';
import config from 'config';
import jwt from 'jsonwebtoken';
import Email from '../utils/Email';
import { IUserDocument, IUserInput } from '../utils/types/models';
import { HydratedDocument } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import WinstonLogger from '../utils/loggerService';

////////////////////////////////////////////////
// Sign-up
///////////////////////////////////////////////
export const signupHandler = catchAsync(
  async (req: Request<unknown, unknown, zodUserSchema>, res, next) => {
    // 1- Select some specific fields from request body
    const filterdUserinput = selectFields(req.body, [
      'name',
      'password',
      'email',
    ]);
    // 2- Create a new user with isEmailActive false
    let newUser: HydratedDocument<IUserDocument>;
    try {
      newUser = await createUser(filterdUserinput);
    } catch (error) {
      // throw specefic error insted of rely on global error middleware
      return next(new HttpError(res.locals.t['USER_EXIST'], 400));
    }

    // 4- if user not exist then send The email
    await sendWelcomeEmail(res, next, newUser);
  }
);

const sendWelcomeEmail = async (
  res: Response,
  next: NextFunction,
  user: IUserDocument
) => {
  // 4- Create active token
  const activateToken = jwt.sign(
    { userId: user._id },
    config.get('ACTIVE_TOKEN_SECRET'),
    {
      expiresIn: config.get('ACTIVE_TOKEN_TTL'),
    }
  );

  const emailUrl = `${config.get(
    'CLIENT_URL'
  )}/activate-account/${activateToken}`;
  // 5- send email with a token holding user data
  try {
    await new Email(
      {
        firstName: user.name.split(' ')[0],
        email: user.email,
      },
      emailUrl
    ).sendWelcomeMail();
    res.status(httpCode.OK).send(res.locals.t['EMAIL_SUCCESS']);
  } catch (error) {
    // if user didn't recieve the message, we must delete user from DB instead user will not able to signup again
    if (error instanceof Error) {
      await deleteUserFromDB(user._id as string);
      next(new HttpError(res.locals.t['EMAIL_FAILURE'], httpCode.SERVER_ERROR));
    }
  }
};

////////////////////////////////////////////////
// Activate-account
///////////////////////////////////////////////
export const activateAccountHanlder = catchAsync(async (req, res, next) => {
  // 1 - Check for activateToken
  const { activateToken } = req.body;
  // 2- Verify jwt token we handle errors globally
  const { userId } = jwt.verify(
    activateToken,
    config.get('ACTIVE_TOKEN_SECRET')
  ) as {
    userId: string;
  };
  // 3- Activate User Email
  const activeUser = await activateUserAccount(userId);
  // 4- if no User found with That Id throw an error
  if (!activeUser)
    return next(new HttpError(res.locals.t['USER_NOT_FOUND'], 404));

  // 4- Generate Tokens and send user data
  await createTokensByCredentials(req, res, activeUser);
});

////////////////////////////////////////////////
// Generate-Tokens
///////////////////////////////////////////////
export const generateTokens = async (
  res: Response,
  user: HydratedDocument<IUserDocument>,
  oldToken?: string
) => {
  // 1- Prepare user data to sent
  const userInfo = {
    _id: user._id,
    name: user.name,
    email: user.email,
    roles: Object.values(user.roles).filter(Boolean),
  };

  // 2 - Create RT & AT
  const RT = jwt.sign(userInfo, config.get('REFRESH_TOKEN_SECRET'), {
    expiresIn: config.get('REFRESH_TOKEN_TTL'),
  });

  const AT = jwt.sign(userInfo, config.get('ACCESS_TOKEN_SECRET'), {
    expiresIn: config.get('ACCESS_TOKEN_TTL'),
  });

  // 3- Replace the old token with the new one
  await replaceRTToken({
    user,
    newToken: RT,
    oldToken: oldToken,
  });

  // 4- Send Rt by cookie & AT, userData in json
  res.cookie('jwt', RT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: config.get<number>('COOKIE_TOKEN_TTL') * 24 * 60 * 60 * 1000,
  });
  res.status(httpCode.OK).json({ accessToken: AT, user: userInfo });
};

////////////////////////////////////////////////
// Create tokens based on credentials (login-activeateAcc-resetPassword-updatePassword)
///////////////////////////////////////////////

export const createTokensByCredentials = async (
  req: Request,
  res: Response,
  user: HydratedDocument<IUserDocument>
) => {
  // 1- Check if there is an old RT token (user reLogin)
  const oldToken = req.cookies.jwt;
  // 2- if no token , thats default generate new ones
  if (!oldToken) {
    return generateTokens(res, user);
  }
  // 3- if there is an old RT for the user, then remove it from DB & Cookie
  await generateTokens(res, user, oldToken);
};

////////////////////////////////////////////////
// Refresh Token Handler
///////////////////////////////////////////////

export const refreshTokenHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const oldToken = req.cookies.jwt;
    // 1- Check if there's no token, set No credentials sent
    if (!oldToken)
      return next(
        new HttpError(res.locals.t['COOKIE_NOT_FOUND'], httpCode.UNAUTHORIZED)
      );
    // 2- Find user by RT
    const relatedUser = await findUserByRT(oldToken);

    // 1- If no user found , then that a reuse detection (Old removed token)
    if (!relatedUser) {
      return fireReuseDetection(res, next, oldToken);
    }
    // 2- If user found, then verify the token
    return handleOldRT(res, next, relatedUser, oldToken);
  }
);

export const fireReuseDetection = async (
  res: Response,
  next: NextFunction,
  oldToken: string
) => {
  try {
    // 1- Get user Data
    const decoded = jwt.verify(
      oldToken,
      config.get('REFRESH_TOKEN_SECRET')
    ) as IUserDocument;

    // 2- Clear all Rts if user exist
    await clearRTsForHackedUser(decoded.email);

    // 3- Clear Cookie to not go in reuse loop
    res.clearCookie('jwt');

    new WinstonLogger('dev-errors').error('HackedUser', decoded.email);
    // 4- return an error message
    return next(
      new HttpError(res.locals.t['COOKIE_NOT_FOUND'], httpCode.UNAUTHORIZED)
    );
  } catch (error) {
    if (!(error instanceof Error)) return;

    return next(new HttpError(error.message, httpCode.BAD_REQUEST));
  }
};

export const handleOldRT = async (
  res: Response,
  next: NextFunction,
  user: HydratedDocument<IUserDocument>,
  oldToken: string
) => {
  let userDecoded: IUserInput;
  try {
    // Check if token not expired to generate a new one
    userDecoded = jwt.verify(
      oldToken,
      config.get('REFRESH_TOKEN_SECRET')
    ) as IUserInput;

    //  generate new tokens
    if (userDecoded.name !== user.name) return;

    return await generateTokens(res, user, oldToken);
  } catch (error) {
    // Malformed Error or expiration Error
    // If token throw an error return http error for invalid credentals
    if (!(error instanceof Error)) return;
    // Delete the old token from Cookie and DB
    await deleteRTFromDBAndCookie(res, user, oldToken);

    return next(
      new HttpError(res.locals.t['COOKIE_NOT_VALID'], httpCode.UNAUTHORIZED)
    );
  }
};

export const deleteRTFromDBAndCookie = async (
  res: Response,
  user: HydratedDocument<IUserDocument>,
  oldToken: string
) => {
  await deleteUserRT(user, oldToken);
  res.clearCookie('jwt');
};

////////////////////////////////////////////////
// Login Handler
///////////////////////////////////////////////
export const loginHandler = catchAsync(async (req, res, next) => {
  // 1- get email and password in body
  const { email, password } = req.body;
  // 2- Check if user exist in DB by email
  const existedUser = await findUserByEmail(email);
  if (!existedUser)
    return next(
      new HttpError(res.locals.t['LOGIN_FAILURE'], httpCode.UNAUTHORIZED)
    );
  // 3- Check for password equality
  if (!(await bcrypt.compare(password, existedUser.password))) {
    return next(
      new HttpError(res.locals.t['LOGIN_FAILURE'], httpCode.UNAUTHORIZED)
    );
  }
  // 4- generate ans sent tokens
  await createTokensByCredentials(req, res, existedUser);
});

////////////////////////////////////////////////
// Forgot Password Handler
///////////////////////////////////////////////
export const forgotPasswordHandler = catchAsync(async (req, res, next) => {
  // 1- Check for email in body
  const { email } = req.body;
  // 2- check if user exists in DB by email
  const user = await findUserByEmail(email);
  if (!user)
    return next(
      new HttpError(res.locals.t['EMAIL_NOT_FOUND'], httpCode.BAD_REQUEST)
    );
  // 3- create Reset token with expiration data and save hashed version in DB
  const resetToken = await createResetToken(user);

  // 4- send the plain Reset token in email
  await sendResetPasswordMail(res, next, user, resetToken);
});

export const sendResetPasswordMail = async (
  res: Response,
  next: NextFunction,
  user: HydratedDocument<IUserDocument>,
  resetToken: string
) => {
  const url = `${config.get('CLIENT_URL')}/reset-password/${resetToken}`;

  try {
    new Email(
      { firstName: user.name.split(' ')[0], email: user.email },
      url
    ).sendResetPasswordMail();

    res.status(httpCode.OK).send(res.locals.t['EMAIL_SUCCESS']);
  } catch (error) {
    if (!(error instanceof Error)) return;
    await clearResetToken(user);
    return next(
      new HttpError(res.locals.t['EMAIL_FAILURE'], httpCode.SERVER_ERROR)
    );
  }
};

////////////////////////////////////////////////
// Reset password Handler
///////////////////////////////////////////////
export const resetPasswordHandler = catchAsync(async (req, res, next) => {
  // 1- Check for resetToken in body
  const { password } = req.body;
  const resetToken = req.params.resetToken;
  // 2- Hash the reset token we've got (one way encryption)
  const hashedResetToekn = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // 3- Find hasedToken with expiration date in DB
  const user = await findUserByResetToken(hashedResetToekn);
  if (!user)
    return next(
      new HttpError(res.locals.t['RESET_TOKEN_FAILURE'], httpCode.BAD_REQUEST)
    );
  // 4-update password and remove resetToken and expiration date
  await updatePassword(user, password);
  // 5- generate Tokens and send to user
  await createTokensByCredentials(req, res, user);
});
////////////////////////////////////////////////
// Logout  Handler
///////////////////////////////////////////////
export const logoutHandler = catchAsync(async (req, res, next) => {
  // 1- Check for RT in cookie
  const RT = req.cookies.jwt;
  if (!RT)
    return next(
      new HttpError(res.locals.t['COOKIE_NOT_FOUND'], httpCode.UNAUTHORIZED)
    );
  // 2- Find user by RT
  const relatedUser = await findUserByRT(RT);

  if (!relatedUser) {
    res.clearCookie('jwt');
    return res.sendStatus(200);
  }
  // 2- remove it from DB and from cookie
  await deleteRTFromDBAndCookie(res, relatedUser, RT);
  // 3- return statusCode 200
  return res.sendStatus(200);
});

////////////////////////////////////////////////
// Update password  Handler
///////////////////////////////////////////////
export const updatePasswordHandler = catchAsync(async (req, res, next) => {
  // 1- Check for oldPassword in body
  const { currentPassword, newPassword } = req.body;
  // 2- get user by it's email
  const existedUser = await findUserByEmail(res.locals?.user?.email);
  if (!existedUser)
    return next(
      new HttpError(res.locals.t['EMAIL_NOT_FOUND'], httpCode.BAD_REQUEST)
    );
  // 3- compare two passwords
  if (!(await bcrypt.compare(currentPassword, existedUser.password))) {
    return next(
      new HttpError(res.locals.t['UPDATE_PASS_FAILURE'], httpCode.BAD_REQUEST)
    );
  }
  // 3- update passwords
  await updatePassword(existedUser, newPassword);
  // 4- generate tokens and sent it
  await createTokensByCredentials(req, res, existedUser);
});
////////////////////////////////////////////////
//
///////////////////////////////////////////////
