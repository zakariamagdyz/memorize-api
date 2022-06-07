import productModel from '../models/product.model';
import {
  createOneService,
  deleteOneService,
  getAllService,
  getOneService,
  updateOneService,
} from '../utils/factoryServices';

export const getAllProductsHandler = getAllService(productModel);
export const getOneProductHandler = getOneService(productModel);
export const createAProductHandler = createOneService(productModel);
export const updateAProductHandler = updateOneService(productModel);
export const deleteOneProductHandler = deleteOneService(productModel);
