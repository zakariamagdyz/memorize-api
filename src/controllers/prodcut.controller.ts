import { Response } from 'express';
import {
  createAProductHandler,
  deleteOneProductHandler,
  getAllProductsHandler,
  getOneProductHandler,
  updateAProductHandler,
} from '../services/product.service';
import catchAsync from '../utils/catchAsync';
import {
  createOneHandler,
  deleteOneHandler,
  getAllHandler,
  getOneHandler,
  updateOneHandler,
} from '../utils/factoryControllers';

export const getAllProducts = getAllHandler(getAllProductsHandler);
export const getOneProduct = getOneHandler(getOneProductHandler);
export const createOneProduct = createOneHandler(createAProductHandler);
export const updateOneProduct = updateOneHandler(updateAProductHandler);
export const deleteOneproduct = deleteOneHandler(deleteOneProductHandler);

// SSE emplementation
export const streaming = catchAsync(async (req, res) => {
  console.log('hola');
  res.setHeader('Content-Type', 'text/event-stream');

  send(res);
});

function send(res: Response) {
  const facts = { hola: 'ddf' };
  const data = `data: ${JSON.stringify(facts)}\n\n`;

  res.write(data);

  setTimeout(() => send(res), 1000);
}
