import mongoose, { HydratedDocument } from 'mongoose';
import { IUserDocument } from '../utils/types/models';

import bcrypt from 'bcrypt';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    roles: {
      user: { type: Number, default: 2001 },
      editor: Number,
      admin: Number,
    },
    refreshTokens: [String],
    active: { type: Boolean, default: true },
    passwordResetToken: String,
    passwordResetTokenExpiration: Date,
  },
  {
    timestamps: true,
  }
);

//TODO:
// add index for RT
userSchema.index({ refreshTokens: 1 });

userSchema.pre(
  'save',
  async function (this: HydratedDocument<IUserDocument>, next) {
    // return when user update his data except password
    if (!this.isModified('password')) return next();
    const salt = 12;
    this.password = await bcrypt.hash(this.password, salt);
    // go to save function
    next();
  }
);

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.createPasswordResetToken = async function (
  this: HydratedDocument<IUserDocument>
) {
  // plan token to send by email
  const resetToken = crypto.randomBytes(32).toString('hex');
  // hashed token to verify when get plain token by user
  const HashedResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetToken = HashedResetToken;
  this.passwordResetTokenExpiration = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

export default mongoose.model<IUserDocument>('User', userSchema);
