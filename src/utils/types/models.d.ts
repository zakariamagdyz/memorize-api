import { ObjectId } from 'mongoose';

export interface IUserForTest {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: number;
  age: number;
}

export interface IUserDocument extends IUserInput {
  _id: ObjectId | string;
  isActive: boolean;
  isEmailActive: boolean;
  passwordResetToken?: string;
  passwordResetTokenExpiration?: Date;
  roles: { user: number; admin: number };
  refreshTokens: string[];
  updatedAt: Date;
  createdAt: Date;
  comparePassword(candidatePassword): Promise<boolean>;
  createPasswordResetToken(): string;
}
export interface IUserInput {
  name: string;
  email: string;
  password: string;
}

// Posts

export interface IPostDocument {
  title: string;
  message: string;
  creator: string;
  tags: string[];
  image: string;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}
