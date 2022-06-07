import HttpError, { ServiceError } from '../customErrors';
describe('HTTP ERROR', () => {
  it('should return status code of 500 with status error', () => {
    const error = new HttpError('server Error', 500);

    expect(error.message).toBe('server Error');
    expect(error.statusCode).toBe(500);
    expect(error.status).toBe('error');
  });

  it('should return status code of 400 with status fail', () => {
    const error = new HttpError('client Error', 400);

    expect(error.message).toBe('client Error');
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe('fail');
  });
});

describe('Service Errror', () => {
  it('should return a service error with name NotFound', () => {
    const msg = 'element not found';
    const result = new ServiceError(msg);

    expect(result.name).toBe('NotFoundError');
    expect(result.message).toBe(msg);
  });
});
