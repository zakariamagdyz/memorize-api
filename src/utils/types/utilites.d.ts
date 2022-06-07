import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Model, QueryWithHelpers, HydratedDocument } from 'mongoose';

// Custom Errors
export interface IHttpError extends Error {
  isOperational: boolean;
  statusCode: number;
  status: string;
  message: string;
  stack?: string;
}

export interface IServiceError extends Error {
  message: string;
  stack?: string;
  name: string;
}

// for catch-async utils
export type catchFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

// for API Features

export type IApiQuery<T> = QueryWithHelpers<Array<T>, T>;

export interface IAPIQueryString extends Record<string, unknown> {
  sort?: string;
  fields?: string;
  page?: string;
  limit?: string;
}

export interface IQueryState {
  filter?: object;
  sort?: string;
  skip?: number;
  limit?: number;
  select?: string;
}

// EMAIL

export interface IHTMLTemplate {
  welcome: string;
  resetPassword: string;
}

//////////// Services  //////////////////////

// ModelName =

export type TgetModelName = <TDocument>({
  Model,
  isPlural,
}: {
  Model: Model<TDocument>;
  isPlural?: boolean;
}) => string;

// pagination info

export type TPaginationInfo = ({
  query,
  docCounts,
  ModelName,
}: {
  query: IAPIQueryString;
  docCounts: number;
  ModelName: string;
}) => pagintationInfo;

export type pagintationInfo = {
  count: number;
  pages: number;
  limit: number;
  prev: string | null;
  next: string | null;
};

// GET ALL Service
type getAllControllersParams<TDocument> = {
  query: IAPIQueryString;
  parentField?: keyof TDocument;
  parentId?: string;
};

type getAllControllersReturn<TDocument> = {
  info: pagintationInfo;
  results: TDocument[];
};

type getAllControllers<TDocument> = ({
  query,
  parentField,
  parentId,
}: getAllControllersParams<TDocument>) => Promise<
  getAllControllersReturn<TDocument>
>;

export type TGetAllService = <TDocument>(
  Model: Model<TDocument>
) => getAllControllers<TDocument>;

export type TGetAllHandler = <TDocument>(
  getAllService: getAllControllers<TDocument>,
  { parentField, pathName } = {} as {
    parentField?: keyof TDocument;
    pathName?: string;
  }
) => RequestHandler;

// Get One services

type getOneControllerParams = {
  elementId: string;
  popOption?: string;
};

export type getOneController<TDocument> = ({
  elementId,
  popOption,
}: getOneControllerParams) => Promise<HydratedDocument<TDocument>>;

export type TGetOneService = <TDocument>(
  Model: Model<TDocument>
) => getOneController<TDocument>;

export type TGetOneHandler = <TDocument>(
  getOneService: getOneController<TDocument>,
  { popOption } = {} as { popOption?: string }
) => RequestHandler;

// create One Services
type createOneControllerParams<TDocument> = {
  selectedFields?: (keyof TDocument)[];
  body: TDocument;
};

export type createOneControll<TDocument> = ({
  selectedFields,
  body,
}: createOneControllerParams<TDocument>) => Promise<
  HydratedDocument<TDocument>
>;

export type TCreateOneService = <TDocument>(
  Model: Model<TDocument>
) => createOneControll<TDocument>;

export type TCreateOneHandler = <TDocument>(
  createOneService: createOneControll<TDocument>,
  { selectedFields } = {} as { selectedFields?: (keyof TDocument)[] }
) => RequestHandler;

// update One Service

type updateOneControllerParams<TDocument> = {
  selectedFields?: (keyof TDocument)[];
  body: TDocument;
  elementId: string;
};

export type updateOneControll<TDocument> = ({
  selectedFields,
  body,
  elementId,
}: updateOneControllerParams<TDocument>) => Promise<
  HydratedDocument<TDocument>
>;

export type TUpdateOneService = <TDocument>(
  Model: Model<TDocument>
) => updateOneControll<TDocument>;

export type TUpdateOneHandler = <TDocument>(
  updateOneService: updateOneControll<TDocument>,
  { selectedFields } = {} as { selectedFields?: (keyof TDocument)[] }
) => RequestHandler;

// Delete One Service

type deleteOneController<TDocument> = ({
  elementId,
}: {
  elementId: string;
}) => Promise<HydratedDocument<TDocument>>;

export type TDeleteOndeService = <TDocument>(
  Model: Model<TDocument>
) => deleteOneController<TDocument>;

export type TDeleteOneHandler = <TDocument>(
  deleteOneService: deleteOneController<TDocument>
) => RequestHandler;
