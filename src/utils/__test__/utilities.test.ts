import { omitFields, selectFields } from '../utlities';

const testObj = {
  name: 'zakaria',
  email: 'zakaria@gmail.com',
  phone: '123-456-256',
  job: 'developer',
  password: '123',
};

describe('SelectFields', () => {
  it('should return the selected fields', () => {
    const result = selectFields(testObj, ['name', 'email', 'phone', 'job']);
    expect(result).toMatchObject({
      name: 'zakaria',
      email: 'zakaria@gmail.com',
      phone: '123-456-256',
      job: 'developer',
    });
  });

  it('should not return any value except name', () => {
    const result = selectFields(testObj, ['name']);
    expect(result).toMatchObject({
      name: 'zakaria',
    });
  });
});

describe('omitFields', () => {
  it('should return all fields except password', () => {
    const result = omitFields(testObj, ['password']);

    // assert
    expect(result).toMatchObject({
      name: 'zakaria',
      email: 'zakaria@gmail.com',
      phone: '123-456-256',
      job: 'developer',
    });
  });
});
