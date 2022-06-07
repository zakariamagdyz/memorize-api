import catchAsync from './catchAsync';
import {
  TCreateOneHandler,
  TDeleteOneHandler,
  TGetAllHandler,
  TGetOneHandler,
  TUpdateOneHandler,
} from './types/utilites';

// to implement nested Route tecnique we need to know the pathVariableName and the parent name with it's id
export const getAllHandler: TGetAllHandler = (
  getAllService,
  { parentField, pathName } = {}
) =>
  catchAsync(async (req, res) => {
    const results = await getAllService({
      query: req.query,
      parentField,
      parentId: pathName && req.params[pathName],
    });

    res.status(200).json(results);
  });

export const getOneHandler: TGetOneHandler = (
  getOneService,
  { popOption } = {}
) =>
  catchAsync(async (req, res) => {
    const Document = await getOneService({
      elementId: req.params.id,
      popOption,
    });

    res.status(200).json(Document);
  });

// Create

export const createOneHandler: TCreateOneHandler = (
  createOneService,
  { selectedFields } = {}
) =>
  catchAsync(async (req, res) => {
    const Document = await createOneService({
      selectedFields,
      body: req.body,
    });

    res.status(201).json(Document);
  });

export const updateOneHandler: TUpdateOneHandler = (
  updateOneService,
  { selectedFields } = {}
) =>
  catchAsync(async (req, res) => {
    const Document = await updateOneService({
      selectedFields,
      body: req.body,
      elementId: req.params.id,
    });

    res.status(202).json(Document);
  });

export const deleteOneHandler: TDeleteOneHandler = (deleteOneService) =>
  catchAsync(async (req, res) => {
    await deleteOneService({ elementId: req.params.id });
    // sendStatus instead of status for sending status only
    res.sendStatus(204);
  });
