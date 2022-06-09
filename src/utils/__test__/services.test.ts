import {
  addPaginationInfo,
  createOneService,
  deleteOneService,
  getAllService,
  getModelName,
  getOneService,
  updateOneService,
} from '../factoryServices';
import { Model } from 'mongoose';
import config from 'config';
import { IAPIQueryString } from '../types/utilites';
import { IUserForTest } from '../types/models';
import ApiFeatures from '../ApiFeatures';

//eslint-disable-next-line
let mockModel: Model<IUserForTest>;

jest.mock('../ApiFeatures', () => {
  return jest.fn().mockImplementation(() => {
    return {
      sorting: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      pagination: jest.fn().mockReturnThis(),
      limitingFields: jest.fn().mockReturnThis(),
    };
  });
});

beforeAll(() => {
  mockModel = {
    modelName: 'User',
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    page: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    exec: jest.fn().mockResolvedValue([]),
    countDocuments: jest.fn().mockReturnValue(3),
    create: jest.fn(),
  } as unknown as Model<IUserForTest>;
});

describe('ModlName', () => {
  afterEach(() => {
    mockModel.modelName = 'User';
  });
  it('should return plural Collection name', () => {
    const result = getModelName({
      Model: mockModel as unknown as Model<unknown>,
      isPlural: true,
    });

    expect(result).toBe('users');
  });

  it('should return singular Collection name', () => {
    const result = getModelName({
      Model: mockModel as unknown as Model<unknown>,
    });

    expect(result).toBe('user');
  });

  it('should return plural Collection', () => {
    mockModel.modelName = 'category';
    const result = getModelName({
      Model: mockModel as unknown as Model<unknown>,
      isPlural: true,
    });

    expect(result).toBe('categories');
  });
});

describe('Pagintation Info', () => {
  it("Should return default page and limit when query obj doen't have them", () => {
    const docCounts = 20;
    const ModelName = 'users';
    const query = {};

    const result = addPaginationInfo({ query, docCounts, ModelName });

    expect(result).toEqual({
      count: 20,
      pages: 1,
      limit: 20,
      next: null,
      prev: null,
    });
  });

  it('Should return page 1 if the docCounts is greater than the default limit', () => {
    const docCounts = 30;
    const ModelName = 'users';
    const query = {};

    const result = addPaginationInfo({ query, docCounts, ModelName });

    expect(result).toEqual({
      count: 30,
      pages: 2,
      limit: 20,
      next: `${config.get('API_URL')}/api/v1/users?page=2&limit=20`,
      prev: null,
    });
  });

  it('Should return page 2 with limit 8 in query object', () => {
    const docCounts = 30;
    const ModelName = 'users';
    const query = { page: 2, limit: 8 } as unknown as IAPIQueryString;

    const result = addPaginationInfo({ query, docCounts, ModelName });

    expect(result).toEqual({
      count: 30,
      pages: 4,
      limit: 8,
      next: `${config.get('API_URL')}/api/v1/users?page=3&limit=8`,
      prev: `${config.get('API_URL')}/api/v1/users?page=1&limit=8`,
    });
  });
});

describe('Get All Products Services', () => {
  it('should run successfully without parentField & parentId', async () => {
    const query = {};

    //eslint-disable-next-line
    //@ts-ignore
    addPaginationInfo = jest.fn();
    await getAllService(mockModel)({ query });
    expect(ApiFeatures).toHaveBeenCalledTimes(1);
    expect(mockModel.find).toHaveBeenCalledTimes(1);
    expect(mockModel.countDocuments).toHaveBeenCalledTimes(1);
    expect(addPaginationInfo).toHaveBeenCalledTimes(1);
  });

  it('should run successfully with parentField & parentId', async () => {
    const query = { tourId: '123' };

    //eslint-disable-next-line
    //@ts-ignore
    addPaginationInfo = jest.fn();
    await getAllService(mockModel)({
      query,
      parentField: 'name',
      parentId: '123',
    });
    expect(ApiFeatures).toHaveBeenCalledTimes(1);
    expect(mockModel.find).toHaveBeenCalledTimes(1);
    expect(mockModel.find).toHaveBeenCalledWith({ name: '123' });
    expect(mockModel.countDocuments).toHaveBeenCalledTimes(1);
    expect(addPaginationInfo).toHaveBeenCalledTimes(1);
  });
});

describe('GetOneService', () => {
  it('Should return a product with id 123', async () => {
    const elementId = '123';
    const product = {
      _id: elementId,
      name: 'product one',
      price: 30,
    };
    mockModel.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(product) });
    const result = await getOneService(mockModel)({ elementId });
    expect(mockModel.findById).toHaveBeenCalledTimes(1);
    expect(result).toEqual(product);
  });

  it('Should throw an error if no document returned', async () => {
    const elementId = '123';
    mockModel.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    expect.assertions(2);

    try {
      await getOneService(mockModel)({ elementId });
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toMatch('No user found with that id');
        expect(error.name).toMatch('NotFoundError');
      }
    }
  });

  it('should populate some fields when add popOption', async () => {
    const elementId = '123';
    const product = {
      _id: elementId,
      name: 'product one',
      price: 30,
    };

    const popOption = 'user tour';

    mockModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(product),
      populate: jest.fn(),
    });

    await getOneService(mockModel)({ elementId, popOption });

    expect(mockModel.findById(elementId).populate).toHaveBeenCalledTimes(1);
    expect(mockModel.findById(elementId).populate).toHaveBeenCalledWith(
      popOption
    );
  });
});

describe('createOneService', () => {
  it('should return the new doc with filterd fields', async () => {
    const user = {
      name: 'zakaria magdy',
      age: 28,
      email: 'zakaria@gmail.com',
      password: 'password',
      role: 'admin',
      phone: 123,
    };

    await createOneService(mockModel)({
      body: user,
      selectedFields: ['name', 'email', 'age', 'password', 'phone'],
    });

    expect(mockModel.create).toHaveBeenCalledTimes(1);
    expect(mockModel.create).toHaveBeenLastCalledWith({
      name: 'zakaria magdy',
      age: 28,
      email: 'zakaria@gmail.com',
      password: 'password',
      phone: 123,
    });
  });
});

describe('updateOneService', () => {
  it('should return updated Doc by filterd body', async () => {
    const elementId = '123';
    const selectedFields: ['name', 'email'] = ['name', 'email'];
    const body = {
      name: 'zakaria magdy',
      age: 82,
      email: 'zakaria@gmail.com',
      password: 'password',
    };
    mockModel.findByIdAndUpdate = jest.fn().mockResolvedValue(body);

    await updateOneService(mockModel)({ elementId, selectedFields, body });

    expect(mockModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
      elementId,
      {
        name: 'zakaria magdy',
        email: 'zakaria@gmail.com',
      },
      { new: true, runValidators: true }
    );
  });

  it('should throw an error if doc not exist', async () => {
    const elementId = '123';
    const selectedFields: ['name', 'email'] = ['name', 'email'];
    const body = {
      name: 'zakaria magdy',
      age: 27,
      email: 'zakaria@gmail.com',
      password: 'password',
    };
    mockModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

    expect.assertions(1);
    try {
      await updateOneService(mockModel)({ elementId, selectedFields, body });
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toMatch('No user found with that id');
      }
    }
  });
});

describe('deleteOneService', () => {
  it('should return the deleted document', async () => {
    const deletedDoc = { name: 'zakaria' };
    mockModel.findByIdAndDelete = jest.fn().mockResolvedValue(deletedDoc);

    const result = await deleteOneService(mockModel)({ elementId: '123' });

    expect(result).toEqual(deletedDoc);
  });
  it('should throw an error if no doc exists', async () => {
    mockModel.findByIdAndDelete = jest.fn().mockResolvedValue(null);

    expect.assertions(2);
    try {
      await deleteOneService(mockModel)({ elementId: '123' });
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toMatch('No user found with that id');
        expect(error.name).toMatch('NotFoundError');
      }
    }
  });
});
