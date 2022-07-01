import User from '../../models/user.model';
import {
  clearResetToken,
  clearRTsForHackedUser,
  createResetToken,
  createUser,
  deleteUserRT,
  findUserByEmail,
  findUserByResetToken,
  findUserByRT,
  replaceRTToken,
  updatePassword,
} from '../auth.service';

jest.mock('../../models/user.model.ts');

const user = {
  name: 'zakaria',
  email: 'zakaria@gmail.com',
  password: 'password',
};

describe('Create User', () => {
  it('should create a new user', async () => {
    await createUser(user);

    expect(User.create).toHaveBeenCalledTimes(1);
    expect(User.create).toHaveBeenCalledWith(user);
  });
});

describe('findUserByEmail', () => {
  it('should find the user if it exist ', async () => {
    await findUserByEmail(user.email);

    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(User.findOne).toHaveBeenCalledWith({
      email: user.email,
      isActive: { $ne: false },
      isEmailActive: { $ne: false },
    });
  });

  it('should return null if user does not exist', async () => {
    //eslint-disable-next-line
    //@ts-ignore
    User.findOne.mockReturnValue(null);

    const result = await findUserByEmail(user.email);

    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(User.findOne).toHaveBeenCalledWith({
      email: user.email,
      isActive: { $ne: false },
      isEmailActive: { $ne: false },
    });
    expect(result).toBeNull();
  });
});

describe('findUserByRT', () => {
  it('should call find methods with rtToken', async () => {
    const rt = 'jwtToken223';
    await findUserByRT(rt);

    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(User.findOne).toHaveBeenCalledWith({ refreshTokens: rt });
  });
});

describe('replaceRTTOken', () => {
  let user: { save: () => void; refreshTokens: string[] },
    newToken: string,
    oldToken: string;

  beforeEach(() => {
    user = {
      refreshTokens: ['123', 'oldToken'],
      save: jest.fn(),
    };

    newToken = 'newJwt';
    oldToken = 'oldToken';
  });

  it('it should add new refresh token  then save in DB', async () => {
    //eslint-disable-next-line
    //@ts-ignore
    await replaceRTToken({ user, newToken });

    expect(user.refreshTokens).toEqual(['123', 'oldToken', 'newJwt']);
    expect(user.save).toHaveBeenCalledTimes(1);
  });

  it('it should replace old token if it exist then save in DB', async () => {
    //eslint-disable-next-line
    //@ts-ignore
    await replaceRTToken({ user, newToken, oldToken });

    expect(user.refreshTokens).toEqual(['123', 'newJwt']);
    expect(user.save).toHaveBeenCalledTimes(1);
  });
});

describe('ClearRTsForHackedUser', () => {
  it('Should clear all RTs for a hacked user', async () => {
    const user = {
      refreshTokens: ['one'],
      save: jest.fn(),
    };

    //eslint-disable-next-line
    //@ts-ignore
    findUserByEmail = jest.fn().mockReturnValue(user);
    await clearRTsForHackedUser('zakariaM@mmail.com');
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(user.refreshTokens).toEqual([]);
  });
  it('Should stop fn if no user exists', async () => {
    //eslint-disable-next-line
    //@ts-ignore
    findUserByEmail = jest.fn();

    const res = await clearRTsForHackedUser('email@mmail.com');
    expect(res).toBeNull();
  });
});

describe('deleteUserRT', () => {
  it('should delete user Rt and save to db', async () => {
    const user = {
      refreshTokens: ['123', 'oldToken'],
      save: jest.fn(),
    };

    const oldToken = 'oldToken';

    //eslint-disable-next-line
    //@ts-ignore
    await deleteUserRT(user, oldToken);

    expect(user.save).toHaveBeenCalledTimes(1);
    expect(user.refreshTokens).toEqual(['123']);
  });
});

describe('CreateResetToken', () => {
  it('should return plain token and save hashed token in DB', async () => {
    const user = {
      passwordResetToken: null,
      passwordResetTokenExpiration: null,
      save: jest.fn(),
    };

    // eslint-disable-next-line
    //@ts-ignore
    const plainToken = await createResetToken(user);

    expect(user.passwordResetToken).toEqual(expect.any(String));
    expect(user.passwordResetTokenExpiration).toEqual(expect.any(Date));
    expect(plainToken).not.toBe(user.passwordResetToken);
    expect(user.save).toHaveBeenCalledTimes(1);
  });
});

describe('clearResetToken', () => {
  it('should clear all data related to reset token', async () => {
    const user = {
      passwordResetToken: 'resetToken',
      passwordResetTokenExpiration: Date.now(),
      save: jest.fn(),
    };
    //eslint-disable-next-line
    //@ts-ignore
    await clearResetToken(user);

    expect(user.passwordResetToken).toBeUndefined();
    expect(user.passwordResetTokenExpiration).toBeUndefined();
    expect(user.save).toHaveBeenCalledTimes(1);
  });
});

describe('findUserByResetToken', () => {
  it('should call findOne with right parameters', async () => {
    const hashedToken = 'hashed';
    // eslint-disable-next-line
    //@ts-ignore
    await findUserByResetToken(hashedToken);

    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(User.findOne).toHaveBeenCalledWith({
      passwordResetTokenExpiration: { $gte: expect.any(Number) },
      passwordResetToken: hashedToken,
    });
  });
});

describe('updatePassword', () => {
  it('should update user password', async () => {
    const user = {
      password: null,
      save: jest.fn(),
    };
    const newPassword = 'new password';

    //eslint-disable-next-line
    //@ts-ignore
    await updatePassword(user, newPassword);
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(user.password).toMatch(newPassword);
  });
  it('should update user password and delete resetToken, expiration', async () => {
    const user = {
      password: null,
      passwordResetTokenExpiration: Date.now(),
      passwordResetToken: 'resetToken',
      save: jest.fn(),
    };
    const newPassword = 'new password';

    //eslint-disable-next-line
    //@ts-ignore
    await updatePassword(user, newPassword);

    expect(user.password).toMatch(newPassword);
    expect(user.passwordResetToken).toBeUndefined();
    expect(user.passwordResetTokenExpiration).toBeUndefined();
    expect(user.save).toHaveBeenCalledTimes(1);
  });
});
