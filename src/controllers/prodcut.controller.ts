import {
  createAProductHandler,
  deleteOneProductHandler,
  getAllProductsHandler,
  getOneProductHandler,
  updateAProductHandler,
} from '../services/product.service';
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
