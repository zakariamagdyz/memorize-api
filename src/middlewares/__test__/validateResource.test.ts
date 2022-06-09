import { AnyZodObject } from 'zod';
import validate from '../validateResource';

const expressParams = {
  req: {},
  res: {},
  next: jest.fn(),
};
const schema = { parse: jest.fn() } as unknown as AnyZodObject;
describe('ValidateResource', () => {
  it('should goTo next middleware if schema parsed correctly', () => {
    const { req, res, next } = expressParams;
    //eslint-disable-next-line
    //@ts-ignore
    validate(schema)(req, res, next);

    expect(schema.parse).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should move the error to golbal error handler if parse fails', () => {
    schema.parse = jest.fn().mockImplementation(() => {
      throw { name: 'ZodError' };
    });
    const { req, res, next } = expressParams;
    //eslint-disable-next-line
    //@ts-ignore
    validate(schema)(req, res, next);

    expect(schema.parse).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({ name: 'ZodError' });
  });
});
