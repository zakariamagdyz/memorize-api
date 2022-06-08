import config from 'config';
import ApiFeatures from './ApiFeatures';
import { ServiceError } from './customErrors';
import { selectFields, pagination } from './utlities';
import {
  pagintationInfo,
  TCreateOneService,
  TDeleteOndeService,
  TGetAllService,
  TgetModelName,
  TGetOneService,
  TPaginationInfo,
  TUpdateOneService,
} from './types/utilites';
import WinstonLogger from './loggerService';

// Get Model Name
export const getModelName: TgetModelName = ({ Model, isPlural }) => {
  const modelName = Model.modelName;
  if (!isPlural) {
    return Model.modelName.toLowerCase();
  }
  if (!modelName.endsWith('y')) {
    return modelName.concat('s').toLowerCase();
  }
  return modelName.slice(0, -1).concat('ies').toLowerCase();
};

// Add pagination information
export const addPaginationInfo: TPaginationInfo = ({
  query,
  docCounts,
  ModelName,
}) => {
  const page = +(query.page || pagination.page);
  const limit = +(query.limit || pagination.limit);
  const startIndex = (page - 1) * limit;
  const lastIndex = page * limit;
  const state: pagintationInfo = {
    count: docCounts,
    pages: Math.ceil(docCounts / limit),
    limit,
    next: null,
    prev: null,
  };
  if (startIndex > 0) {
    state.prev = `${config.get<string>('API_URL')}/api/v1/${ModelName}?page=${
      page - 1
    }&limit=${limit}`;
  }

  if (lastIndex < docCounts) {
    state.next = `${config.get<string>('API_URL')}/api/v1/${ModelName}?page=${
      page + 1
    }&limit=${limit}`;
  }

  return state;
};

//////////////////////////////////// GET ALL //////////////////////////////////
export const getAllService: TGetAllService =
  (Model) =>
  async ({ query, parentField, parentId }) => {
    const ModelName = getModelName({ Model, isPlural: true });

    let filter = {};
    if (parentField && parentId) {
      filter = { [parentField]: parentId };
    }

    const features = new ApiFeatures(Model.find(filter), query)
      .filter()
      .limitingFields()
      .sorting()
      .pagination();

    const [results, docCounts] = await Promise.all([
      features.query,
      Model.countDocuments(),
    ]);

    // configure pagination
    const pageInfo = addPaginationInfo({ query, docCounts, ModelName });

    return { info: pageInfo, results };
  };

//////////////////////////////////// GET ONE //////////////////////////////////
export const getOneService: TGetOneService =
  (Model) =>
  async ({ elementId, popOption }) => {
    const query = Model.findById(elementId);

    if (popOption) query.populate(popOption);

    const document = await query.exec();

    if (!document)
      throw new ServiceError(
        `No ${getModelName({ Model })} found with that id `
      );

    return document;
  };

//////////////////////////////////// CREATE //////////////////////////////////

export const createOneService: TCreateOneService =
  (Model) =>
  async ({ selectedFields, body }) => {
    let filterdBody = body;
    if (selectedFields) {
      filterdBody = selectFields(filterdBody, selectedFields);
    }
    const Document = await Model.create(filterdBody);
    new WinstonLogger('Product').info('create new Product', Document);
    return Document;
  };

//////////////////////////////////// UPDATE //////////////////////////////////

export const updateOneService: TUpdateOneService =
  (Model) =>
  async ({ body, selectedFields, elementId }) => {
    let filterdBody = body;
    if (selectedFields) {
      filterdBody = selectFields(filterdBody, selectedFields);
    }

    const Document = await Model.findByIdAndUpdate(elementId, filterdBody, {
      new: true,
      runValidators: true,
    });

    if (!Document)
      throw new ServiceError(
        `No ${getModelName({ Model })} found with that id `
      );

    return Document;
  };

//////////////////////////////////// Delete //////////////////////////////////

export const deleteOneService: TDeleteOndeService =
  (Model) =>
  async ({ elementId }) => {
    const Document = await Model.findByIdAndDelete(elementId);
    if (!Document)
      throw new ServiceError(
        `No ${getModelName({ Model })} found with that id`
      );

    return Document;
  };
