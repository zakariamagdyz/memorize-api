import User from '../../models/user.model';
import { createUser, findUserByEmail } from '../auth.service';

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
    expect(User.findOne).toHaveBeenCalledWith({ email: user.email });
  });

  it('should return null if user does not exist', async () => {
    //eslint-disable-next-line
    //@ts-ignore
    User.findOne.mockReturnValue(null);

    const result = await findUserByEmail(user.email);

    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(User.findOne).toHaveBeenCalledWith({ email: user.email });
    expect(result).toBeNull();
  });
});
