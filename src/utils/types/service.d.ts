import { HydratedDocument } from 'mongoose';
import { IUserDocument } from './models';

export type TReplaceRTToken = ({
  user,
  oldToken,
  refreshToken,
}: {
  user: HydratedDocument<IUserDocument>;
  oldToken?: string;
  newToken: string;
}) => Promise<void>;
