import User from '../models/user.model';
import { HydratedDocument } from 'mongoose';
import { IUserInput, IUserDocument } from '../utils/types/models';
import { TReplaceRTToken } from '../utils/types/service';
import crypto from 'crypto';

//////////////////////////////////////////
// Create a new User
//////////////////////////////////////////
export const createUser = async (
  user: IUserInput
): Promise<HydratedDocument<IUserDocument>> => {
  const newUser = await User.create(user);
  return newUser;
};

//////////////////////////////////////////
// Find user by email
//////////////////////////////////////////
export const findUserByEmail = async (
  email: string
): Promise<HydratedDocument<IUserDocument> | null> => {
  const user = await User.findOne({
    email,
    isActive: { $ne: false },
    isEmailActive: { $ne: false },
  });
  if (!user) return null;
  return user;
};
//////////////////////////////////////////
// Activate User
//////////////////////////////////////////
export const activateUserAccount = async (id: string) => {
  const user = await User.findByIdAndUpdate(
    id,
    { isEmailActive: true },
    { new: true }
  );

  if (!user) return null;
  return user;
};
//////////////////////////////////////////
// Delete User
//////////////////////////////////////////
export const deleteUserFromDB = async (id: string) => {
  await User.findByIdAndDelete(id);
};

//////////////////////////////////////////
// Find user by Refresh token
//////////////////////////////////////////
export const findUserByRT = async (
  RT: string
): Promise<HydratedDocument<IUserDocument> | null> => {
  return await User.findOne({ refreshTokens: RT });
};

//////////////////////////////////////////
// Replace Refresh Token with new one
//////////////////////////////////////////
export const replaceRTToken: TReplaceRTToken = async ({
  user,
  newToken,
  oldToken,
}) => {
  if (oldToken) {
    const newRTs = user.refreshTokens.filter((RT) => RT !== oldToken);
    user.refreshTokens = [...newRTs, newToken];
  } else {
    user.refreshTokens = [...user.refreshTokens, newToken];
  }

  await user.save();
};
//////////////////////////////////////////
// Clear all refresh tokens for hacked user
//////////////////////////////////////////

export const clearRTsForHackedUser = async (email: IUserDocument['email']) => {
  const hackedUser = await findUserByEmail(email);
  if (!hackedUser) return null;
  hackedUser.refreshTokens = [];
  await hackedUser.save();
};

//////////////////////////////////////////
// Delete Old refresh token from DB
//////////////////////////////////////////
export const deleteUserRT = async (
  user: HydratedDocument<IUserDocument>,
  oldToken: string
) => {
  // delete specefic token
  const tokens = user.refreshTokens.filter((RT) => RT !== oldToken);
  user.refreshTokens = tokens;
  // save
  await user.save();
};
//////////////////////////////////////////
// Create Reset Token
//////////////////////////////////////////
export const createResetToken = async (
  user: HydratedDocument<IUserDocument>
) => {
  // plan token to send by email
  const resetToken = crypto.randomBytes(32).toString('hex');
  // hashed token to verify when get plain token by user
  const HashedResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.passwordResetToken = HashedResetToken;
  user.passwordResetTokenExpiration = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  return resetToken;
};
//////////////////////////////////////////
// Clear Reset Token
//////////////////////////////////////////
export const clearResetToken = async (
  user: HydratedDocument<IUserDocument>
) => {
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiration = undefined;
  await user.save();
};
//////////////////////////////////////////
// Find user by reset token
//////////////////////////////////////////
export const findUserByResetToken = async (hashedToken: string) => {
  return await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiration: { $gte: Date.now() },
  });
};

//////////////////////////////////////////
// update password
//////////////////////////////////////////
export const updatePassword = async (
  user: HydratedDocument<IUserDocument>,
  newPassword: string
) => {
  user.password = newPassword;
  if (user.passwordResetToken) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiration = undefined;
  }

  await user.save();
};
