import { NextFunction, Request, Response } from 'express';
import {
  createOneHandler,
  deleteOneHandler,
  getAllHandler,
  getOneHandler,
  updateOneHandler,
} from '../factoryControllers';

type ExpressMiddleware = {
  req: Request;
  res: Response;
  next: NextFunction;
};

const mockeExpressMiddlewareParams = {
  req: {
    query: { page: 2 },
    params: {},
  },
  res: {
    status: jest.fn().mockReturnValue({ json: jest.fn() }),
    sendStatus: jest.fn(),
  },
  next: jest.fn(),
} as unknown as ExpressMiddleware;

describe('GetAllHandlers', () => {
  it('should send status 200 with the result ', async () => {
    const { req, res, next } = mockeExpressMiddlewareParams;
    res.status = jest.fn();
    const getAllService = jest.fn().mockResolvedValue([]);
    await getAllHandler(getAllService)(req, res, next);

    expect(getAllService).toHaveBeenCalledTimes(1);
    expect(getAllService).toHaveBeenCalledWith({ query: { page: 2 } });
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should send status 200 and implement parentId& parentField ', async () => {
    const { req, res, next } = mockeExpressMiddlewareParams;
    res.status = jest.fn();
    const getAllService = jest.fn().mockResolvedValue([]);
    req.params.tourId = '123';
    await getAllHandler(getAllService, {
      pathName: 'tourId',
      parentField: 'tour',
    })(req, res, next);

    expect(getAllService).toHaveBeenCalledTimes(1);
    expect(getAllService).toHaveBeenCalledWith({
      query: { page: 2 },
      parentField: 'tour',
      parentId: '123',
    });
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('GetOneHandler', () => {
  it('should send status 200 with the result ', async () => {
    const { req, res, next } = mockeExpressMiddlewareParams;
    res.status = jest.fn();
    const getOneService = jest.fn().mockResolvedValue([]);

    req.params.id = '123';
    // Act

    await getOneHandler(getOneService, { popOption: 'user' })(req, res, next);

    expect(getOneService).toHaveBeenCalledTimes(1);
    expect(getOneService).toHaveBeenCalledWith({
      elementId: '123',
      popOption: 'user',
    });
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('createOneHandler', () => {
  it('should send status 201 with the result ', async () => {
    const { req, res, next } = mockeExpressMiddlewareParams;
    res.status = jest.fn();
    const createOneService = jest.fn().mockResolvedValue([]);

    req.body = {};
    // Act

    await createOneHandler(createOneService, { selectedFields: ['user'] })(
      req,
      res,
      next
    );

    expect(createOneService).toHaveBeenCalledTimes(1);
    expect(createOneService).toHaveBeenCalledWith({
      selectedFields: ['user'],
      body: {},
    });
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('updateOneHandler', () => {
  it('should send status 202 with the result ', async () => {
    const { req, res, next } = mockeExpressMiddlewareParams;
    const updateOneService = jest.fn().mockResolvedValue([]);

    req.params.id = '123';
    req.body = {};
    // Act

    await updateOneHandler(updateOneService, { selectedFields: ['user'] })(
      req,
      res,
      next
    );

    expect(updateOneService).toHaveBeenCalledTimes(1);
    expect(updateOneService).toHaveBeenCalledWith({
      selectedFields: ['user'],
      body: {},
      elementId: '123',
    });
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(202);
  });
});

describe('DeleteOneHandler', () => {
  it('should send status 204  ', async () => {
    const { req, res, next } = mockeExpressMiddlewareParams;
    const deleteOneService = jest.fn().mockResolvedValue([]);

    req.params.id = '12345';

    // Act

    await deleteOneHandler(deleteOneService)(req, res, next);

    expect(deleteOneService).toHaveBeenCalledTimes(1);
    expect(deleteOneService).toHaveBeenCalledWith({
      elementId: '12345',
    });
    expect(res.sendStatus).toHaveBeenCalledTimes(1);
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });
});
